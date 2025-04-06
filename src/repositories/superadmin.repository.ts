import bcrypt from 'bcrypt';
import { BaseRepository } from './base.repository';
import { SuperAdmin, DatabaseError } from '../types';

export class SuperAdminRepository extends BaseRepository<SuperAdmin> {
    constructor() {
        super('superadmin');
    }

    async findByEmail(email: string): Promise<SuperAdmin | null> {
        return this.findOne({ email });
    }

    async validatePassword(
        superAdmin: SuperAdmin,
        password: string
    ): Promise<boolean> {
        try {
            return await bcrypt.compare(password, superAdmin.password);
        } catch (error) {
            throw new DatabaseError('Error validating password');
        }
    }
}

export const superAdminRepository = new SuperAdminRepository();