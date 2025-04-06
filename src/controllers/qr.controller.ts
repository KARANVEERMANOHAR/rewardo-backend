import { Request, Response, NextFunction } from 'express';
import { qrTransactionRepository } from '../repositories/qr-transaction.repository';
import { ValidationError } from '../types';

interface AuthRequest extends Request {
    user?: {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'super_admin';
    };
}

export class QRController {
    async generateQR(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: adminId } = (req as AuthRequest).user!;
            const { amount } = req.body;

            const { transaction, qrImage } = await qrTransactionRepository.generateQR(
                adminId,
                Number(amount)
            );

            res.json({
                success: true,
                message: 'QR code generated successfully',
                data: {
                    qr_id: transaction.id,
                    qr_image: qrImage,
                    amount: transaction.amount,
                    generated_at: transaction.created_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async processQRScan(req: Request, res: Response, next: NextFunction) {
        try {
            const { qrId, customerId, encryptedData } = req.body;

            const customerTransaction = await qrTransactionRepository.processQRScan(
                Number(qrId),
                Number(customerId),
                encryptedData
            );

            res.json({
                success: true,
                message: 'QR code scanned successfully',
                data: customerTransaction
            });
        } catch (error) {
            next(error);
        }
    }

    async getAdminTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: adminId } = (req as AuthRequest).user!;
            const transactions = await qrTransactionRepository.getAdminTransactions(adminId);

            res.json({
                success: true,
                data: transactions.map(t => ({
                    id: t.id,
                    amount: t.amount,
                    is_active: t.is_active,
                    created_at: t.created_at
                }))
            });
        } catch (error) {
            next(error);
        }
    }

    async getActiveTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: adminId } = (req as AuthRequest).user!;
            const transactions = await qrTransactionRepository.getActiveTransactions(adminId);

            res.json({
                success: true,
                data: transactions.map(t => ({
                    id: t.id,
                    amount: t.amount,
                    created_at: t.created_at
                }))
            });
        } catch (error) {
            next(error);
        }
    }

    async deactivateQR(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: adminId } = (req as AuthRequest).user!;
            const { id: qrId } = req.params;

            // Verify ownership
            const transaction = await qrTransactionRepository.findById(Number(qrId));
            if (!transaction) {
                throw new ValidationError('QR code not found');
            }

            if (transaction.admin_id !== adminId) {
                throw new ValidationError('Unauthorized access to QR code');
            }

            await qrTransactionRepository.update(Number(qrId), { is_active: false });

            res.json({
                success: true,
                message: 'QR code deactivated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getTransactionStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: adminId } = (req as AuthRequest).user!;
            const totalAmount = await qrTransactionRepository.getTotalAmountGenerated(adminId);

            const transactions = await qrTransactionRepository.getAdminTransactions(adminId);
            const totalTransactions = transactions.length;
            const activeTransactions = transactions.filter(t => t.is_active).length;

            res.json({
                success: true,
                data: {
                    total_amount_generated: totalAmount,
                    total_transactions: totalTransactions,
                    active_transactions: activeTransactions,
                    inactive_transactions: totalTransactions - activeTransactions
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export const qrController = new QRController();