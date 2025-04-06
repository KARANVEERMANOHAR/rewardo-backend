import bcrypt from 'bcrypt';
import { BaseRepository } from './base.repository';
import { Admin, CreateAdminRequest, DatabaseError } from '../types';
import database from '../config/database';

export class AdminRepository extends BaseRepository<Admin> {
    constructor() {
        super('admin');
    }

    async findByEmail(email: string): Promise<Admin | null> {
        return this.findOne({ email });
    }

    async createAdmin(data: CreateAdminRequest, superadminId: number): Promise<Admin> {
        try {
            // Check if email already exists
            const existingUser = await this.findOne({
                email: data.email
            } as Partial<Admin>);

            if (existingUser) {
                throw new DatabaseError('Email already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);

            // Create admin
            const admin = await this.create({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: hashedPassword,
                company_name: data.company_name,
                superadmin_id: superadminId
            });

            // Create wallet entry for the admin
            await database.query(
                'INSERT INTO wallet (admin_id, balance) VALUES ($1, $2)',
                [admin.id, 0]
            );

            return admin;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError(`Error creating admin: ${error}`);
        }
    }

    async validatePassword(admin: Admin, password: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, admin.password);
        } catch (error) {
            throw new DatabaseError('Error validating password');
        }
    }

    async getAdminsByCreator(superadminId: number): Promise<Admin[]> {
        return this.findAll({ superadmin_id: superadminId } as Partial<Admin>);
    }
}

export const adminRepository = new AdminRepository();