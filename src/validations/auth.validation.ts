import Joi from 'joi';

export const loginSchema = {
    body: Joi.object({
        email: Joi.string().email().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Invalid email format',
            'any.required': 'Email is required'
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
    })
};

export const createAdminSchema = {
    body: Joi.object({
        name: Joi.string()
            .min(3)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 3 characters long',
                'string.max': 'Name cannot exceed 100 characters',
                'any.required': 'Name is required'
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Invalid email format',
                'any.required': 'Email is required'
            }),
        phone: Joi.string()
            .length(10)
            .pattern(/^[0-9]+$/)
            .required()
            .messages({
                'string.empty': 'Phone number is required',
                'string.length': 'Phone number must be exactly 10 digits',
                'string.pattern.base': 'Phone number must contain only digits',
                'any.required': 'Phone number is required'
            }),
        company_name: Joi.string()
            .min(2)
            .max(255)
            .required()
            .messages({
                'string.empty': 'Company name is required',
                'string.min': 'Company name must be at least 2 characters long',
                'string.max': 'Company name cannot exceed 255 characters',
                'any.required': 'Company name is required'
            }),
        password: Joi.string()
            .min(8)
            .required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
            .messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 8 characters long',
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
                'any.required': 'Password is required'
            })
    })
};