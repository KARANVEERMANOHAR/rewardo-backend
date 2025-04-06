import request from 'supertest';
import app from '../app';
import { superAdminRepository } from '../repositories/superadmin.repository';
import { adminRepository } from '../repositories/admin.repository';
import { JWT } from '../utils/jwt';
import { SuperAdmin, Admin } from '../types';

// Mock repositories
jest.mock('../repositories/superadmin.repository');
jest.mock('../repositories/admin.repository');
jest.mock('../utils/jwt');

describe('Authentication', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        it('should authenticate super admin successfully', async () => {
            const mockSuperAdmin: SuperAdmin = {
                id: '1',
                username: 'superadmin',
                email: 'super@admin.com',
                password: 'hashedPassword',
                created_at: new Date(),
                updated_at: new Date(),
            };

            const mockToken = 'mock-jwt-token';

            (superAdminRepository.findByUsername as jest.Mock).mockResolvedValue(mockSuperAdmin);
            (superAdminRepository.validatePassword as jest.Mock).mockResolvedValue(true);
            (JWT.generateToken as jest.Mock).mockReturnValue(mockToken);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'superadmin',
                    password: 'Password123!',
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'Login successful',
                data: {
                    token: mockToken,
                    user: {
                        id: mockSuperAdmin.id,
                        username: mockSuperAdmin.username,
                        email: mockSuperAdmin.email,
                        role: 'super_admin',
                    },
                },
            });
        });

        it('should authenticate admin successfully', async () => {
            const mockAdmin: Admin = {
                id: '2',
                username: 'admin',
                email: 'admin@test.com',
                password: 'hashedPassword',
                wallet_balance: 0,
                is_active: true,
                created_by: '1',
                created_at: new Date(),
                updated_at: new Date(),
            };

            const mockToken = 'mock-jwt-token';

            (superAdminRepository.findByUsername as jest.Mock).mockResolvedValue(null);
            (adminRepository.findByUsername as jest.Mock).mockResolvedValue(mockAdmin);
            (adminRepository.validatePassword as jest.Mock).mockResolvedValue(true);
            (JWT.generateToken as jest.Mock).mockReturnValue(mockToken);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'Password123!',
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'Login successful',
                data: {
                    token: mockToken,
                    user: {
                        id: mockAdmin.id,
                        username: mockAdmin.username,
                        email: mockAdmin.email,
                        role: 'admin',
                    },
                },
            });
        });

        it('should reject invalid credentials', async () => {
            (superAdminRepository.findByUsername as jest.Mock).mockResolvedValue(null);
            (adminRepository.findByUsername as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'wrong',
                });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: 'Invalid username or password',
                error: {
                    type: 'AuthenticationError',
                },
            });
        });
    });

    describe('POST /api/auth/create-admin', () => {
        const mockToken = 'mock-jwt-token';
        const mockSuperAdmin = {
            id: '1',
            role: 'super_admin',
        };

        it('should create a new admin successfully', async () => {
            const newAdmin: Admin = {
                id: '3',
                username: 'newadmin',
                email: 'new@admin.com',
                password: 'hashedPassword',
                wallet_balance: 0,
                is_active: true,
                created_by: '1',
                created_at: new Date(),
                updated_at: new Date(),
            };

            (JWT.verifyToken as jest.Mock).mockReturnValue(mockSuperAdmin);
            (adminRepository.createAdmin as jest.Mock).mockResolvedValue(newAdmin);

            const response = await request(app)
                .post('/api/auth/create-admin')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    username: 'newadmin',
                    email: 'new@admin.com',
                    password: 'Password123!',
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: 'Admin created successfully',
                data: {
                    id: newAdmin.id,
                    username: newAdmin.username,
                    email: newAdmin.email,
                },
            });
        });

        it('should reject creation without super admin privileges', async () => {
            const mockAdmin = {
                id: '2',
                role: 'admin',
            };

            (JWT.verifyToken as jest.Mock).mockReturnValue(mockAdmin);

            const response = await request(app)
                .post('/api/auth/create-admin')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    username: 'newadmin',
                    email: 'new@admin.com',
                    password: 'Password123!',
                });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({
                success: false,
                message: 'Super admin access required',
                error: {
                    type: 'AuthorizationError',
                },
            });
        });
    });
});