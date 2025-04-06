import { Request, Response, NextFunction } from 'express';
import {
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    DatabaseError
} from '../types';

interface ErrorResponse {
    success: false;
    message: string;
    error?: {
        type: string;
        details?: any;
    };
}

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
    });

    const response: ErrorResponse = {
        success: false,
        message: 'An unexpected error occurred'
    };

    if (error instanceof ValidationError) {
        response.message = error.message;
        response.error = {
            type: 'ValidationError'
        };
        return res.status(400).json(response);
    }

    if (error instanceof AuthenticationError) {
        response.message = error.message;
        response.error = {
            type: 'AuthenticationError'
        };
        return res.status(401).json(response);
    }

    if (error instanceof AuthorizationError) {
        response.message = error.message;
        response.error = {
            type: 'AuthorizationError'
        };
        return res.status(403).json(response);
    }

    if (error instanceof DatabaseError) {
        response.message = 'Database operation failed';
        response.error = {
            type: 'DatabaseError',
            details: error.message
        };
        return res.status(500).json(response);
    }

    // Handle Razorpay errors
    if (error.name === 'RazorpayError') {
        response.message = 'Payment processing failed';
        response.error = {
            type: 'PaymentError',
            details: error.message
        };
        return res.status(400).json(response);
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        response.message = 'Invalid token';
        response.error = {
            type: 'AuthenticationError'
        };
        return res.status(401).json(response);
    }

    if (error.name === 'TokenExpiredError') {
        response.message = 'Token has expired';
        response.error = {
            type: 'AuthenticationError'
        };
        return res.status(401).json(response);
    }

    // Default server error
    response.error = {
        type: 'ServerError',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
    return res.status(500).json(response);
};

// Handle 404 errors
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const response: ErrorResponse = {
        success: false,
        message: 'Resource not found',
        error: {
            type: 'NotFoundError',
            details: `${req.method} ${req.originalUrl} not found`
        }
    };
    res.status(404).json(response);
};

// Handle validation middleware
export const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                const { error } = schema.body.validate(req.body);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }
            }

            if (schema.query) {
                const { error } = schema.query.validate(req.query);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }
            }

            if (schema.params) {
                const { error } = schema.params.validate(req.params);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};