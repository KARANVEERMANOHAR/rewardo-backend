import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { validateRequest } from '../middleware/error.middleware';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
    createPaymentOrderSchema,
    verifyPaymentSchema,
    failureSchema,
    paymentHistorySchema
} from '../validations/payment.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Payment operations (Admin only)
router.post(
    '/create-order',
    requireAdmin,
    validateRequest(createPaymentOrderSchema),
    paymentController.createPaymentOrder
);

router.post(
    '/verify',
    requireAdmin,
    validateRequest(verifyPaymentSchema),
    paymentController.verifyPayment
);

router.post(
    '/failure',
    requireAdmin,
    validateRequest(failureSchema),
    paymentController.handlePaymentFailure
);

// Payment history and statistics
router.get(
    '/history',
    requireAdmin,
    validateRequest(paymentHistorySchema),
    paymentController.getPaymentHistory
);

router.get(
    '/stats',
    requireAdmin,
    paymentController.getPaymentStats
);

export default router;