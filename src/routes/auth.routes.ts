import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/error.middleware';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware';
import {
    loginSchema,
    createAdminSchema
} from '../validations/auth.validation';

const router = Router();

// Public routes
router.post('/login', validateRequest(loginSchema), authController.login);

// Super admin routes
router.post(
    '/create-admin',
    authenticate,
    requireSuperAdmin,
    validateRequest(createAdminSchema),
    authController.createAdmin
);

export default router;