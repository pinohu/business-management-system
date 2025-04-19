import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  CSRF_ERROR = 'CSRF_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Error messages
export const ErrorMessages = {
  [ErrorType.VALIDATION_ERROR]: 'Invalid input data',
  [ErrorType.AUTHENTICATION_ERROR]: 'Authentication failed',
  [ErrorType.AUTHORIZATION_ERROR]: 'Not authorized to perform this action',
  [ErrorType.NOT_FOUND_ERROR]: 'Resource not found',
  [ErrorType.RATE_LIMIT_ERROR]: 'Too many requests',
  [ErrorType.CSRF_ERROR]: 'Invalid CSRF token',
  [ErrorType.PROCESSING_ERROR]: 'Error processing request',
  [ErrorType.DATABASE_ERROR]: 'Database operation failed',
  [ErrorType.CACHE_ERROR]: 'Cache operation failed',
  [ErrorType.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ErrorType.INTERNAL_SERVER_ERROR]: 'Internal server error'
};

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    // Handle operational errors
    logger.error('Operational error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.statusCode
    });
  }

  // Handle programming or unknown errors
  logger.error('Programming error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 500
  });
};

// Async error handler wrapper
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const handleValidationError = (err: any): AppError => {
  const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  return new AppError(message, 400);
};

// Database error handler
export const handleDatabaseError = (err: any): AppError => {
  if (err.code === 11000) {
    return new AppError('Duplicate field value', 400);
  }
  return new AppError('Database operation failed', 500);
};

// JWT error handler
export const handleJWTError = (err: any): AppError => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401);
  }
  return new AppError('Authentication failed', 401);
};

// File upload error handler
export const handleFileUploadError = (err: any): AppError => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file type', 400);
  }
  return new AppError('File upload failed', 500);
};

// Rate limit error handler
export const handleRateLimitError = (): AppError => {
  return new AppError('Too many requests', 429);
};

// CSRF error handler
export const handleCSRFError = (): AppError => {
  return new AppError('Invalid CSRF token', 403);
};

// External service error handler
export const handleExternalServiceError = (err: any): AppError => {
  if (err.response) {
    return new AppError(err.response.data.message || 'External service error', err.response.status);
  }
  if (err.request) {
    return new AppError('No response from external service', 503);
  }
  return new AppError('External service error', 500);
}; 