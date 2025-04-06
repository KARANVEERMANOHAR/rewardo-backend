import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool(poolConfig);
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private async testConnection(): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('SELECT NOW()');
            console.log('Database connection established successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
            // Don't exit process, just log the error
            console.error('Please ensure PostgreSQL is running and credentials are correct');
        } finally {
            client.release();
        }
    }

    public async initialize(): Promise<void> {
        await this.testConnection();
    }

    public getPool(): Pool {
        return this.pool;
    }

    public async query(text: string, params?: any[]) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }

    public async close(): Promise<void> {
        await this.pool.end();
    }
}

// Create and initialize database instance
const database = Database.getInstance();

// Initialize database connection when imported
database.initialize().catch(console.error);

export default database;