import Joi from 'joi';

export const generateQRSchema = {
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

export const processQRSchema = {
    body: Joi.object({
        qrId: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'QR ID must be a number',
                'number.positive': 'QR ID must be a positive number',
                'any.required': 'QR ID is required'
            }),
        customerId: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Customer ID must be a number',
                'number.positive': 'Customer ID must be a positive number',
                'any.required': 'Customer ID is required'
            }),
        encryptedData: Joi.string()
            .required()
            .messages({
                'string.empty': 'Encrypted QR data is required',
                'any.required': 'Encrypted QR data is required'
            })
    })
};

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
            }),
        paymentId: Joi.string()
            .required()
            .messages({
                'string.empty': 'Payment ID is required',
                'any.required': 'Payment ID is required'
            }),
        signature: Joi.string()
            .required()
            .messages({
                'string.empty': 'Signature is required',
                'any.required': 'Signature is required'
            })
    })
};

export const paginationSchema = {
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
        sortBy: Joi.string()
            .valid('created_at', 'amount', 'status')
            .default('created_at')
            .messages({
                'any.only': 'Invalid sort field'
            }),
        order: Joi.string()
            .valid('asc', 'desc')
            .default('desc')
            .messages({
                'any.only': 'Order must be either asc or desc'
            })
    })
};

export const dateRangeSchema = {
    query: Joi.object({
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
    }).and('startDate', 'endDate')
};

export const idParamSchema = {
    params: Joi.object({
        id: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'ID must be a number',
                'number.positive': 'ID must be a positive number',
                'any.required': 'ID is required'
            })
    })
};