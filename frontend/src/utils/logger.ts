import winston from 'winston';
import config from '../config';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Add file transports if configured
if (config.logging.transports.includes('file')) {
  // Regular log file
  logger.add(
    new winston.transports.File({
      filename: config.logging.filename,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    })
  );

  // Error log file
  logger.add(
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    })
  );
}

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};

// Error logging middleware
export const errorLogger = (err: any, req: any, res: any, next: any) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  next(err);
};

// Export logger instance
export default logger; 