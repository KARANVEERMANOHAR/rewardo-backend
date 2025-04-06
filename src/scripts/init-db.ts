import database from '../config/database';
import { superAdminRepository } from '../repositories/superadmin.repository';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

async function initializeDatabase(): Promise<void> {
    try {
        console.log('Starting database initialization...');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Creating database schema...');
        await database.query(schema);
        console.log('Schema created successfully');

        // Create default super admin if not exists
        const defaultSuperAdmin = {
            username: 'superadmin',
            email: 'admin@example.com',
            password: 'Admin123!' // This should be changed immediately after first login
        };

        console.log('Checking for existing super admin...');
        const existingSuperAdmin = await superAdminRepository.findByUsername(defaultSuperAdmin.username);

        if (!existingSuperAdmin) {
            console.log('Creating default super admin...');
            await superAdminRepository.createSuperAdmin(defaultSuperAdmin);
            console.log('Default super admin created successfully');
            console.log('Username:', defaultSuperAdmin.username);
            console.log('Password:', defaultSuperAdmin.password);
            console.log('Please change the password after first login!');
        } else {
            console.log('Super admin already exists, skipping creation');
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await database.close();
    }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database initialization script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database initialization failed:', error);
            process.exit(1);
        });
}

export default initializeDatabase;