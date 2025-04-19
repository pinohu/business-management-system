import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    next(new AppError('Invalid token', 401));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

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

    // TODO: Implement API key validation against database
    // For now, we'll just check if it exists
    next();
  } catch (error) {
    logger.error('API key validation error:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    next(new AppError('Invalid API key', 401));
  }
};

export const rateLimit = (limit: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip;
    const now = Date.now();

    const userRequests = requests.get(key);
    if (!userRequests) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > userRequests.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userRequests.count >= limit) {
      return next(new AppError('Too many requests', 429));
    }

    userRequests.count++;
    next();
  };
}; 