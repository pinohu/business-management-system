import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';
import { logger } from '../utils/logger';

// CSRF protection middleware
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// Error handler for CSRF errors
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === 'EBADCSRFTOKEN') {
        logger.warn('CSRF token validation failed:', {
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        return res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'Form submission failed. Please try again.'
        });
    }
    next(err);
};

// Generate CSRF token
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    next();
};

export default csrfProtection;
