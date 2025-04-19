import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { checkRole } from '../authorization';
import { db } from '../../db';
import { User } from '../../models/User';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authorization Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(async () => {
    await db.sync({ force: true });
    const hashedPassword = await hash('password123', 10);
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    });

    await User.create({
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
      role: 'user',
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

  it('allows admin access to admin routes', async () => {
    const token = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await checkRole(['admin'])(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('denies user access to admin routes', async () => {
    const token = jwt.sign(
      { userId: 2 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await checkRole(['admin'])(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Access denied',
    });
  });

  it('allows access to multiple roles', async () => {
    const token = jwt.sign(
      { userId: 2 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await checkRole(['admin', 'user'])(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('handles missing user role', async () => {
    const token = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    // Update user to remove role
    await User.update({ role: null }, { where: { id: 1 } });

    await checkRole(['admin'])(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Access denied',
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

    await checkRole(['admin'])(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Access denied',
    });
  });

  it('handles missing authorization header', async () => {
    mockReq.headers = {};

    await checkRole(['admin'])(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'No token provided',
    });
  });

  it('handles invalid token', async () => {
    mockReq.headers = {
      authorization: 'Bearer invalid-token',
    };

    await checkRole(['admin'])(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid token',
    });
  });
});
