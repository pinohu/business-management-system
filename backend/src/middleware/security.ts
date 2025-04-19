import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { logger } from '../utils/logger';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  maxAge: 86400, // 24 hours
};

// Security headers configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
};

// Security middleware setup
export const setupSecurityMiddleware = (app: any) => {
  // Basic security headers
  app.use(helmet(helmetConfig));

  // Rate limiting
  app.use(limiter);

  // CORS
  app.use(cors(corsOptions));

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info({
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Error handling
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error({
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    logger.warn({
      message: '404 Not Found',
      method: req.method,
      url: req.url,
      ip: req.ip,
    });

    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found',
    });
  });
};
