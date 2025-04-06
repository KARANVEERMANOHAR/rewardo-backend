import Razorpay from 'razorpay';
import { BaseRepository } from './base.repository';
import { AdminTransaction, TransactionStatus, DatabaseError } from '../types';
import { adminRepository } from './admin.repository';
import database from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export class PaymentRepository extends BaseRepository<AdminTransaction> {
    constructor() {
        super('admin_transaction');
    }

    async createPaymentOrder(adminId: number, amount: number): Promise<{
        orderId: string;
        amount: number;
        currency: string;
    }> {
        const client = await database.getPool().connect();
        try {
            await client.query('BEGIN');

            // Create Razorpay order
            const order = await razorpay.orders.create({
                amount: amount * 100, // Convert to paise
                currency: 'INR',
                receipt: `rcpt_${Date.now()}`
            });

            // Create transaction record
            await client.query(
                `INSERT INTO ${this.tableName} 
                (admin_id, transaction_id, transaction_amount, transaction_status, created_at) 
                VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
                [
                    adminId,
                    order.id,
                    amount,
                    TransactionStatus.PENDING
                ]
            );

            await client.query('COMMIT');

            return {
                orderId: order.id,
                amount: amount,
                currency: 'INR'
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw new DatabaseError(`Error creating payment order: ${error}`);
        } finally {
            client.release();
        }
    }

    async verifyPayment(orderId: string): Promise<AdminTransaction> {
        const client = await database.getPool().connect();
        try {
            await client.query('BEGIN');

            // Update transaction status
            const result = await client.query(
                `UPDATE ${this.tableName}
                SET transaction_status = $1
                WHERE transaction_id = $2 
                AND transaction_status = $3
                RETURNING *`,
                [TransactionStatus.SUCCESS, orderId, TransactionStatus.PENDING]
            );

            if (result.rows.length === 0) {
                throw new DatabaseError('Transaction record not found or already processed');
            }

            const transaction = result.rows[0];

            // Add amount to admin's wallet
            await adminRepository.updateWalletBalance(
                transaction.admin_id,
                transaction.transaction_amount
            );

            await client.query('COMMIT');
            return transaction;
        } catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError(`Error verifying payment: ${error}`);
        } finally {
            client.release();
        }
    }

    async markPaymentFailed(orderId: string): Promise<AdminTransaction> {
        const client = await database.getPool().connect();
        try {
            const result = await client.query(
                `UPDATE ${this.tableName}
                SET transaction_status = $1
                WHERE transaction_id = $2 
                AND transaction_status = $3
                RETURNING *`,
                [TransactionStatus.FAILED, orderId, TransactionStatus.PENDING]
            );

            if (result.rows.length === 0) {
                throw new DatabaseError('Transaction record not found or already processed');
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError(`Error marking payment as failed: ${error}`);
        } finally {
            client.release();
        }
    }

    async getAdminPayments(adminId: number): Promise<AdminTransaction[]> {
        return this.findAll({ admin_id: adminId } as Partial<AdminTransaction>);
    }

    async getPaymentsByStatus(status: TransactionStatus): Promise<AdminTransaction[]> {
        return this.findAll({
            transaction_status: status
        } as Partial<AdminTransaction>);
    }

    async getTotalPayments(adminId: number): Promise<{
        total: number;
        successful: number;
        failed: number;
        pending: number;
    }> {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN transaction_status = $1 THEN 1 END) as successful,
                    COUNT(CASE WHEN transaction_status = $2 THEN 1 END) as failed,
                    COUNT(CASE WHEN transaction_status = $3 THEN 1 END) as pending
                FROM ${this.tableName}
                WHERE admin_id = $4
            `;

            const result = await database.query(query, [
                TransactionStatus.SUCCESS,
                TransactionStatus.FAILED,
                TransactionStatus.PENDING,
                adminId
            ]);

            return {
                total: parseInt(result.rows[0].total),
                successful: parseInt(result.rows[0].successful),
                failed: parseInt(result.rows[0].failed),
                pending: parseInt(result.rows[0].pending)
            };
        } catch (error) {
            throw new DatabaseError(`Error getting payment statistics: ${error}`);
        }
    }
}

export const paymentRepository = new PaymentRepository();