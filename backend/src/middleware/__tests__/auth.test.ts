import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth';
import { db } from '../../db';
import { User } from '../../models/User';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(async () => {
    await db.sync({ force: true });
    const hashedPassword = await hash('password123', 10);
    await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    });

    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(async () => {
    await db.close();
    jest.clearAllMocks();
  });

  it('successfully authenticates valid token', async () => {
    const token = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await verifyToken(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('handles missing token', async () => {
    mockReq.headers = {};

    await verifyToken(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'No token provided',
    });
  });

  it('handles invalid token format', async () => {
    mockReq.headers = {
      authorization: 'InvalidFormat',
    };

    await verifyToken(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid token format',
    });
  });

  it('handles expired token', async () => {
    const token = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '0s' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await verifyToken(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Token expired',
    });
  });

  it('handles invalid token signature', async () => {
    const token = jwt.sign(
      { userId: 1 },
      'wrong-secret-key',
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await verifyToken(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid token',
    });
  });

  it('handles non-existent user', async () => {
    const token = jwt.sign(
      { userId: 999 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await verifyToken(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'User not found',
    });
  });

  it('adds user to request object', async () => {
    const token = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await verifyToken(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.id).toBe(1);
    expect(mockReq.user?.email).toBe('test@example.com');
    expect(mockReq.user?.name).toBe('Test User');
  });
});
