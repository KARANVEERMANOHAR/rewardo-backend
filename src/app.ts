import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

class App {
    private app: Express;

    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();

    }

    private setupMiddleware(): void {
        // Body parser middleware
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // CORS middleware
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }));

        // Request logging
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
            next();
        });
    }

    private setupRoutes(): void {
        // Health check route
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV
            });
        });

        // API routes
        this.app.use('/api', routes);

        // API documentation route
        this.app.get('/api/docs', (req: Request, res: Response) => {
            res.json({
                version: '1.0.0',
                description: 'QR Code Generation and Payment System API',
                basePath: '/api',
                endpoints: {
                    auth: {
                        base: '/auth',
                        routes: [
                            { path: '/login', method: 'POST', description: 'User login' },
                            { path: '/profile', method: 'GET', description: 'Get user profile' },
                            { path: '/profile', method: 'PUT', description: 'Update user profile' },
                            { path: '/password', method: 'PUT', description: 'Update password' },
                            { path: '/create-admin', method: 'POST', description: 'Create new admin (Super Admin only)' }
                        ]
                    },
                    qr: {
                        base: '/qr',
                        routes: [
                            { path: '/generate', method: 'POST', description: 'Generate QR code' },
                            { path: '/verify', method: 'POST', description: 'Verify QR code' },
                            { path: '/:id/deactivate', method: 'PUT', description: 'Deactivate QR code' },
                            { path: '/transactions', method: 'GET', description: 'Get QR transactions' },
                            { path: '/active', method: 'GET', description: 'Get active QR codes' },
                            { path: '/stats', method: 'GET', description: 'Get QR statistics' }
                        ]
                    },
                    payments: {
                        base: '/payments',
                        routes: [
                            { path: '/create-order', method: 'POST', description: 'Create payment order' },
                            { path: '/verify', method: 'POST', description: 'Verify payment' },
                            { path: '/failure', method: 'POST', description: 'Handle payment failure' },
                            { path: '/history', method: 'GET', description: 'Get payment history' },
                            { path: '/stats', method: 'GET', description: 'Get payment statistics' },
                            { path: '/pending', method: 'GET', description: 'Get pending payments' }
                        ]
                    }
                }
            });
        });
    }

    private setupErrorHandling(): void {
        // 404 handler for undefined routes
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            notFoundHandler(req, res, next);
        });

        // Global error handler
        this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            errorHandler(err, req, res, next);
        });
    }

    public getApp(): Express {
        return this.app;
    }

    public start(): void {
        const port = process.env.PORT || 3000;
        this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`API Documentation: http://localhost:${port}/api/docs`);
        });
    }
}

// Create app instance
const app = new App();

// Start the server if we're running directly
if (require.main === module) {
    app.start();
}

// Export for testing
export default app.getApp();