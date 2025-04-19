import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { AppError } from '../utils/errorHandler';

// JWT payload interface
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Verify JWT token
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.auth.tokenKey) as JwtPayload;

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized', 403));
    }

    next();
  };
};

// API key authentication
export const requireApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      throw new AppError('API key required', 401);
    }

    // TODO: Validate API key against database
    // For now, we'll just check if it exists
    next();
  } catch (error) {
    next(error);
  }
};

// Rate limiting
export const rateLimit = (windowMs: number, max: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();

    // Get or create request record
    let record = requests.get(ip);
    if (!record) {
      record = { count: 0, resetTime: now + windowMs };
      requests.set(ip, record);
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (record.count >= max) {
      return next(new AppError('Too many requests', 429));
    }

    // Increment count
    record.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', (max - record.count).toString());
    res.setHeader('X-RateLimit-Reset', record.resetTime.toString());

    next();
  };
};

// Example usage:
/*
// Protect route with JWT authentication
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Protected route', user: req.user });
});

// Protect route with role-based access
router.get('/admin', verifyToken, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Admin route' });
});

// Protect route with API key
router.get('/api', requireApiKey, (req, res) => {
  res.json({ message: 'API route' });
});

// Apply rate limiting
router.get('/rate-limited', rateLimit(15 * 60 * 1000, 100), (req, res) => {
  res.json({ message: 'Rate limited route' });
});
*/ 