import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions, JwtPayload, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface TokenPayload extends JwtPayload {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'super_admin';
}

interface AuthRequest extends Request {
    user?: TokenPayload;
}

export class JWT {
    private static validateSecret(): void {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
    }

    static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
        this.validateSecret();
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: parseInt(JWT_EXPIRES_IN) || '24h'
        });
    }

    static verifyToken(token: string): TokenPayload {
        this.validateSecret();
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token has expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    static extractTokenFromHeader(authHeader?: string): string {
        if (!authHeader) {
            throw new Error('No authorization header provided');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new Error('Invalid authorization header format');
        }

        return parts[1];
    }

    static middleware(allowedRoles?: ('admin' | 'super_admin')[]) {
        return (req: AuthRequest, res: Response, next: NextFunction) => {
            try {
                const token = this.extractTokenFromHeader(req.headers.authorization);
                const decoded = this.verifyToken(token);

                if (allowedRoles && !allowedRoles.includes(decoded.role)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions'
                    });
                }

                req.user = decoded;
                next();
            } catch (error: any) {
                res.status(401).json({
                    success: false,
                    message: error.message || 'Authentication failed'
                });
            }
        };
    }
}