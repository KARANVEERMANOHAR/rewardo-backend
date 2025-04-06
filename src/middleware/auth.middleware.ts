import { Request, Response, NextFunction } from 'express';
import { JWT } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from '../types';

interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
        role: 'admin' | 'super_admin';
    };
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AuthenticationError('No authorization header provided');
        }

        const token = JWT.extractTokenFromHeader(authHeader);
        const decodedToken = JWT.verifyToken(token);

        req.user = decodedToken;
        next();
    } catch (error) {
        next(new AuthenticationError('Authentication failed'));
    }
};

export const requireSuperAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user || req.user.role !== 'super_admin') {
            throw new AuthorizationError('Super admin access required');
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            throw new AuthorizationError('Admin access required');
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const requireAnyAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
            throw new AuthorizationError('Admin access required');
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const requireOwnership = (paramName: string = 'id') => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const resourceId = req.params[paramName];
            if (!req.user) {
                throw new AuthenticationError('Authentication required');
            }

            if (req.user.role === 'super_admin') {
                next();
                return;
            }

            if (resourceId !== req.user.id) {
                throw new AuthorizationError('Unauthorized access to resource');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};