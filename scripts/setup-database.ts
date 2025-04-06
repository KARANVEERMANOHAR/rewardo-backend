import { Pool } from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'rewardo'
});

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('Starting database setup...');

        // Begin transaction
        await client.query('BEGIN');

        // Check if database exists (will throw error if not)
        await client.query('SELECT NOW()');
        console.log('Database connection successful');

        // Read and execute schema.sql
        const schemaPath = join(__dirname, '..', 'src', 'database', 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');
        await client.query(schema);
        console.log('Schema created successfully');

        // Create default super admin if not exists
        const superAdminExists = await client.query(
            'SELECT * FROM superadmin WHERE email = $1',
            ['admin@rewardo.com']
        );

        if (superAdminExists.rows.length === 0) {
            const password = 'Admin@123';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await client.query(
                `INSERT INTO superadmin (name, email, password, created_at)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
                ['Super Admin', 'admin@rewardo.com', hashedPassword]
            );
            console.log('Default super admin created:');
            console.log('Email: admin@rewardo.com');
            console.log('Password: Admin@123');
            console.log('Please change the password after first login!');
        } else {
            console.log('Super admin already exists');
        }

        // Create triggers for updated_at
        const triggerFunction = `
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `;

        await client.query(triggerFunction);
        console.log('Created updated_at trigger function');

        // Create triggers for each table with updated_at
        const tables = ['admin', 'wallet', 'qr'];
        for (const table of tables) {
            await client.query(`
                DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
                CREATE TRIGGER update_${table}_updated_at
                    BEFORE UPDATE ON ${table}
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `);
            console.log(`Created trigger for ${table} table`);
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('Database setup completed successfully');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error setting up database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run setup if this script is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('Setup completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

export default setupDatabase;