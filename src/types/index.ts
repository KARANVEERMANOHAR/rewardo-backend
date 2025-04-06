export interface BaseEntity {
    id: number;
    created_at: Date;
}

export interface SuperAdmin extends BaseEntity {
    name: string;
    email: string;
    password: string;
    password_updated_at?: Date;
}

export interface Admin extends BaseEntity {
    superadmin_id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    company_name: string;
    password_updated_at?: Date;
}

// Request and Response interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface CreateAdminRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    company_name: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'super_admin';
    };
}

// Custom error types
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}