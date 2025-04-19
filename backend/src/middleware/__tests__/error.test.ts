import { describe, it, expect } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../error';
import { ValidationError, DatabaseError, AuthenticationError, AuthorizationError } from '../../utils/errors';

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('handles validation errors', () => {
    const error = new ValidationError('Invalid input');
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid input',
    });
  });

  it('handles database errors', () => {
    const error = new DatabaseError('Database connection failed');
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Database connection failed',
    });
  });

  it('handles authentication errors', () => {
    const error = new AuthenticationError('Invalid credentials');
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid credentials',
    });
  });

  it('handles authorization errors', () => {
    const error = new AuthorizationError('Access denied');
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Access denied',
    });
  });

  it('handles unknown errors', () => {
    const error = new Error('Unknown error');
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('handles errors with custom status codes', () => {
    const error = new Error('Custom error');
    (error as any).statusCode = 418;
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(418);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Custom error',
    });
  });

  it('handles errors with stack traces in development', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Development error');
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Development error',
      stack: expect.any(String),
    });
  });

  it('handles errors without stack traces in production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Production error');
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Production error',
    });
  });

  it('handles Sequelize validation errors', () => {
    const error = new Error('Sequelize validation error');
    (error as any).name = 'SequelizeValidationError';
    (error as any).errors = [
      { message: 'Email is required' },
      { message: 'Password is required' },
    ];
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Validation error',
      details: ['Email is required', 'Password is required'],
    });
  });

  it('handles Sequelize unique constraint errors', () => {
    const error = new Error('Sequelize unique constraint error');
    (error as any).name = 'SequelizeUniqueConstraintError';
    (error as any).errors = [
      { message: 'Email must be unique' },
    ];
    errorHandler(error, mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unique constraint error',
      details: ['Email must be unique'],
    });
  });
});
