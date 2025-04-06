import { Router } from 'express';
import authRoutes from './auth.routes';
import qrRoutes from './qr.routes';
import paymentRoutes from './payment.routes';

const router = Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/qr', qrRoutes);
router.use('/payments', paymentRoutes);

// Export the base router
export default router;