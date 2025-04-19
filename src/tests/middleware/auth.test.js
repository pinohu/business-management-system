import { jest } from '@jest/globals';
import { AuthMiddleware } from '../../lib/middleware/auth';
import { logger } from '../../lib/logger';
import { cacheService } from '../../lib/cache';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../lib/logger');
jest.mock('../../lib/cache');
jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let middleware;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create middleware instance
    middleware = new AuthMiddleware();

    // Create mock request, response, and next function
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      method: 'GET',
      path: '/api/test',
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('Authentication', () => {
    it('should authenticate valid JWT token', async () => {
      const mockToken = 'valid.token.here';
      const mockDecoded = { userId: '123', role: 'user' };
      
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockReturnValue(mockDecoded);
      cacheService.get.mockResolvedValue(mockToken);

      await middleware.authenticate(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
      expect(mockReq.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid JWT token', async () => {
      const mockToken = 'invalid.token.here';
      
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await middleware.authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication failed',
        message: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject missing token', async () => {
      await middleware.authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication failed',
        message: 'No token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Authorization', () => {
    beforeEach(() => {
      mockReq.user = { role: 'user' };
    });

    it('should authorize user with required role', async () => {
      await middleware.authorize(['user'])(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without required role', async () => {
      await middleware.authorize(['admin'])(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authorization failed',
        message: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle multiple required roles', async () => {
      mockReq.user.role = 'admin';
      await middleware.authorize(['admin', 'superadmin'])(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const mockKey = 'rate_limit:127.0.0.1';
      cacheService.get.mockResolvedValue(5);
      cacheService.set.mockResolvedValue(true);

      await middleware.rateLimit(100, 60)(mockReq, mockRes, mockNext);

      expect(cacheService.get).toHaveBeenCalledWith(mockKey);
      expect(cacheService.set).toHaveBeenCalledWith(mockKey, 6, 60);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject requests exceeding rate limit', async () => {
      const mockKey = 'rate_limit:127.0.0.1';
      cacheService.get.mockResolvedValue(100);

      await middleware.rateLimit(100, 60)(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Rate limit exceeded',
        message: 'Too many requests',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF token', async () => {
      const mockToken = 'valid.csrf.token';
      mockReq.headers['x-csrf-token'] = mockToken;
      cacheService.get.mockResolvedValue(mockToken);

      await middleware.csrfProtection(mockReq, mockRes, mockNext);

      expect(cacheService.get).toHaveBeenCalledWith('csrf_token');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid CSRF token', async () => {
      const mockToken = 'invalid.csrf.token';
      mockReq.headers['x-csrf-token'] = mockToken;
      cacheService.get.mockResolvedValue('different.token');

      await middleware.csrfProtection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'CSRF validation failed',
        message: 'Invalid CSRF token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing CSRF token', async () => {
      await middleware.csrfProtection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'CSRF validation failed',
        message: 'No CSRF token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      await middleware.securityHeaders(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const error = new Error('Auth error');
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      mockReq.headers.authorization = 'Bearer token';

      await middleware.authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication failed',
        message: 'Auth error',
      });
    });

    it('should handle rate limiting errors', async () => {
      const error = new Error('Rate limit error');
      cacheService.get.mockRejectedValue(error);

      await middleware.rateLimit(100, 60)(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Rate limiting error',
        message: 'Rate limit error',
      });
    });

    it('should handle CSRF validation errors', async () => {
      const error = new Error('CSRF error');
      cacheService.get.mockRejectedValue(error);

      mockReq.headers['x-csrf-token'] = 'token';

      await middleware.csrfProtection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'CSRF validation error',
        message: 'CSRF error',
      });
    });
  });
}); 