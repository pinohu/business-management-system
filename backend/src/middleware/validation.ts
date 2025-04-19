import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

// Validation middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation failed:', { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Common validation rules
export const commonValidations = {
    email: body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),

    password: body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter'),

    apiKey: body('apiKey')
        .isLength({ min: 32, max: 64 })
        .withMessage('API key must be between 32 and 64 characters')
        .matches(/^[a-zA-Z0-9-_]+$/)
        .withMessage('API key can only contain alphanumeric characters, hyphens, and underscores'),

    userId: body('userId')
        .isUUID()
        .withMessage('Invalid user ID format'),

    limit: body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    offset: body('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer')
};
