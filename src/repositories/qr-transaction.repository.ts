import { BaseRepository } from './base.repository';
import { QR, DatabaseError, Customer, CustomerTransaction } from '../types';
import { Encryption } from '../utils/encryption';
import QRCode from 'qrcode';
import { adminRepository } from './admin.repository';
import database from '../config/database';

export class QRTransactionRepository extends BaseRepository<QR> {
    constructor() {
        super('qr');
    }

    async generateQR(adminId: number, amount: number): Promise<{
        transaction: QR;
        qrImage: string;
    }> {
        const client = await database.getPool().connect();
        try {
            await client.query('BEGIN');

            // Check admin exists and has sufficient balance
            const walletBalance = await adminRepository.getAdminWalletBalance(adminId);
            if (walletBalance < amount) {
                throw new DatabaseError('Insufficient wallet balance');
            }

            // Generate encrypted QR data
            const qrData = {
                adminId,
                amount,
                timestamp: new Date().toISOString()
            };

            const encryptedData = Encryption.encrypt(JSON.stringify(qrData));

            // Create QR transaction record with automatic timestamps
            const result = await client.query(
                `INSERT INTO ${this.tableName} 
                (admin_id, qr_data, encrypted_data, amount, is_active) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [
                    adminId,
                    JSON.stringify(qrData),
                    JSON.stringify(encryptedData),
                    amount,
                    true
                ]
            );

            const qrTransaction = result.rows[0];

            // Deduct amount from admin's wallet
            await adminRepository.updateWalletBalance(adminId, -amount);

            // Generate QR code image
            const qrImage = await QRCode.toDataURL(JSON.stringify({
                ...encryptedData,
                id: qrTransaction.id
            }));

            await client.query('COMMIT');

            return {
                transaction: qrTransaction,
                qrImage
            };
        } catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError(`Error generating QR code: ${error}`);
        } finally {
            client.release();
        }
    }

    async processQRScan(
        qrId: number,
        customerId: number,
        encryptedData: string
    ): Promise<CustomerTransaction> {
        const client = await database.getPool().connect();
        try {
            await client.query('BEGIN');

            // Verify transaction exists and is active
            const qrTransaction = await this.findById(qrId);
            if (!qrTransaction || !qrTransaction.is_active) {
                throw new DatabaseError('Invalid or inactive QR code');
            }

            // Create customer transaction
            const customerTransaction = await client.query(
                `INSERT INTO customer_transaction (customer_id, qr_id, amount)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [customerId, qrId, qrTransaction.amount]
            );

            // Deactivate QR code
            await this.update(qrId, { is_active: false });

            await client.query('COMMIT');
            return customerTransaction.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new DatabaseError(`Error processing QR scan: ${error}`);
        } finally {
            client.release();
        }
    }

    async verifyQR(encryptedData: string): Promise<{
        adminId: number;
        amount: number;
        timestamp: string;
        transactionId: number;
    }> {
        try {
            const { id, ...data } = JSON.parse(encryptedData);
            const decryptedData = JSON.parse(Encryption.decrypt(data));

            // Verify transaction exists and is active
            const transaction = await this.findById(id);
            if (!transaction || !transaction.is_active) {
                throw new DatabaseError('Invalid or inactive QR code');
            }

            return {
                ...decryptedData,
                transactionId: id
            };
        } catch (error) {
            throw new DatabaseError('Invalid QR code data');
        }
    }

    async getAdminTransactions(adminId: number): Promise<QR[]> {
        return this.findAll({ admin_id: adminId } as Partial<QR>);
    }

    async getActiveTransactions(adminId: number): Promise<QR[]> {
        return this.findAll({
            admin_id: adminId,
            is_active: true
        } as Partial<QR>);
    }

    async getTotalAmountGenerated(adminId: number): Promise<number> {
        try {
            const query = `
                SELECT COALESCE(SUM(amount), 0) as total
                FROM ${this.tableName}
                WHERE admin_id = $1
            `;
            const result = await database.query(query, [adminId]);
            return parseFloat(result.rows[0].total);
        } catch (error) {
            throw new DatabaseError(`Error calculating total amount: ${error}`);
        }
    }
}

export const qrTransactionRepository = new QRTransactionRepository();