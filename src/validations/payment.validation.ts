import Joi from 'joi';
import { TransactionStatus } from '../types';

export const createPaymentOrderSchema = {
    body: Joi.object({
        amount: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Amount must be a number',
                'number.positive': 'Amount must be a positive number',
                'any.required': 'Amount is required'
            })
    })
};

export const verifyPaymentSchema = {
    body: Joi.object({
        orderId: Joi.string()
            .required()
            .messages({
                'string.empty': 'Order ID is required',
                'any.required': 'Order ID is required'
            })
    })
};

export const paymentHistorySchema = {
    query: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .messages({
                'number.base': 'Page must be a number',
                'number.integer': 'Page must be an integer',
                'number.min': 'Page must be greater than 0'
            }),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10)
            .messages({
                'number.base': 'Limit must be a number',
                'number.integer': 'Limit must be an integer',
                'number.min': 'Limit must be greater than 0',
                'number.max': 'Limit cannot exceed 100'
            }),
        status: Joi.string()
            .valid(...Object.values(TransactionStatus))
            .messages({
                'any.only': 'Invalid transaction status'
            }),
        startDate: Joi.date()
            .iso()
            .messages({
                'date.base': 'Start date must be a valid date',
                'date.format': 'Start date must be in ISO format'
            }),
        endDate: Joi.date()
            .iso()
            .min(Joi.ref('startDate'))
            .messages({
                'date.base': 'End date must be a valid date',
                'date.format': 'End date must be in ISO format',
                'date.min': 'End date must be after start date'
            })
    })
};

export const failureSchema = {
    body: Joi.object({
        orderId: Joi.string()
            .required()
            .messages({
                'string.empty': 'Order ID is required',
                'any.required': 'Order ID is required'
            })
    })
};