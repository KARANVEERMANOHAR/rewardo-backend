import { Request, Response, NextFunction } from 'express';
import { superAdminRepository } from '../repositories/superadmin.repository';
import { adminRepository } from '../repositories/admin.repository';
import { JWT } from '../utils/jwt';
import {
    AuthenticationError,
    CreateAdminRequest,
    LoginRequest,
    SuperAdmin,
    Admin
} from '../types';

interface AuthRequest extends Request {
    user?: {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'super_admin';
    };
}

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body as LoginRequest;

            // Try super admin login first
            let superAdmin: SuperAdmin | null = await superAdminRepository.findByEmail(email);
            let admin: Admin | null = null;
            let isValidPassword = false;
            let role: 'admin' | 'super_admin' = 'admin';

            if (superAdmin) {
                isValidPassword = await superAdminRepository.validatePassword(superAdmin, password);
                role = 'super_admin';
            } else {
                // Try admin login
                admin = await adminRepository.findByEmail(email);
                if (admin) {
                    isValidPassword = await adminRepository.validatePassword(admin, password);
                }
            }

            const user = superAdmin || admin;
            if (!user || !isValidPassword) {
                throw new AuthenticationError('Invalid email or password');
            }

            const token = JWT.generateToken({
                id: user.id,
                name: user.name,
                email: user.email,
                role
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async createAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const adminData = req.body as CreateAdminRequest;
            const { id } = (req as AuthRequest).user!;

            const admin = await adminRepository.createAdmin(adminData, id);

            res.status(201).json({
                success: true,
                message: 'Admin created successfully',
                data: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    company_name: admin.company_name
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();