import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock database connection
jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

// Mock Razorpay
jest.mock('razorpay', () => {
    return jest.fn().mockImplementation(() => ({
        orders: {
            create: jest.fn(),
            fetch: jest.fn(),
        },
        payments: {
            fetch: jest.fn(),
            capture: jest.fn(),
        },
    }));
});

// Global test setup
beforeAll(() => {
    // Clear all mocks before tests
    jest.clearAllMocks();
});

// Global test teardown
afterAll(async () => {
    // Close any open connections
    const pool = new Pool();
    await pool.end();
});