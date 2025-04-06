import { Router } from 'express';
import { qrController } from '../controllers/qr.controller';
import { validateRequest } from '../middleware/error.middleware';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
    generateQRSchema,
    processQRSchema,
    idParamSchema,
    paginationSchema,
    dateRangeSchema
} from '../validations/operations.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// QR code generation and management (Admin only)
router.post(
    '/generate',
    requireAdmin,
    validateRequest(generateQRSchema),
    qrController.generateQR
);

router.post(
    '/scan',
    requireAdmin,
    validateRequest(processQRSchema),
    qrController.processQRScan
);

router.put(
    '/:id/deactivate',
    requireAdmin,
    validateRequest(idParamSchema),
    qrController.deactivateQR
);

// QR transactions and statistics
router.get(
    '/transactions',
    requireAdmin,
    validateRequest(paginationSchema),
    qrController.getAdminTransactions
);

router.get(
    '/active',
    requireAdmin,
    validateRequest(paginationSchema),
    qrController.getActiveTransactions
);

router.get(
    '/stats',
    requireAdmin,
    validateRequest(dateRangeSchema),
    qrController.getTransactionStats
);

export default router;