import { Request, Response, NextFunction } from 'express';
import { paymentRepository } from '../repositories/payment.repository';
import { adminRepository } from '../repositories/admin.repository';
import { ValidationError, TransactionStatus } from '../types';

interface AuthRequest extends Request {
    user?: {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'super_admin';
    };
}

export class PaymentController {
    async createPaymentOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: adminId } = (req as AuthRequest).user!;
            const { amount } = req.body;

            const order = await paymentRepository.createPaymentOrder(
                adminId,
                Number(amount)
            );

            res.json({
                success: true,
                message: 'Payment order created successfully',
                data: {
                    order_id: order.orderId,
                    amount: order.amount,
                    currency: order.currency
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.body;

            const payment = await paymentRepository.verifyPayment(orderId);

            // Get updated wallet balance
            const walletBalance = await adminRepository.getAdminWalletBalance(payment.admin_id);

            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    transaction_id: payment.transaction_id,
                    amount: payment.transaction_amount,
                    status: payment.transaction_status,
                    wallet_balance: walletBalance
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async handlePaymentFailure(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.body;

            const payment = await paymentRepository.markPaymentFailed(orderId);

            res.json({
                success: true,
                message: 'Payment failure recorded',
                data: {
                    transaction_id: payment.transaction_id,
                    status: payment.transaction_status
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getPaymentHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: adminId } = (req as AuthRequest).user!;
            const payments = await paymentRepository.getAdminPayments(adminId);

            res.json({
                success: true,
                data: payments.map(p => ({
                    id: p.id,
                    transaction_id: p.transaction_id,
                    amount: p.transaction_amount,
                    status: p.transaction_status,
                    created_at: p.created_at
                }))
            });
        } catch (error) {
            next(error);
        }
    }

    async getPaymentStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: adminId } = (req as AuthRequest).user!;

            // Get admin details for wallet balance
            const walletBalance = await adminRepository.getAdminWalletBalance(adminId);

            // Get payment statistics
            const stats = await paymentRepository.getTotalPayments(adminId);

            // Calculate total amount from successful payments
            const payments = await paymentRepository.getPaymentsByStatus(TransactionStatus.SUCCESS);
            const totalAmount = payments
                .filter(p => p.admin_id === adminId)
                .reduce((sum, p) => sum + p.transaction_amount, 0);

            res.json({
                success: true,
                data: {
                    wallet_balance: walletBalance,
                    total_payments: stats.total,
                    successful_payments: stats.successful,
                    failed_payments: stats.failed,
                    pending_payments: stats.pending,
                    total_amount_added: totalAmount
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export const paymentController = new PaymentController();