import winston from 'winston';
import 'winston-daily-rotate-file';
import { format } from 'winston';
import { loggingConfig } from '../config/logging';

const { combine, timestamp, json, errors } = format;

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    [key: string]: any;
}

// Define log format
const logFormat = printf(({ level, message, timestamp, ...metadata }: LogEntry) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
    }
    return msg;
});

const transports: winston.transport[] = [];

// Add console transport if enabled
if (loggingConfig.transports.console.enabled) {
    transports.push(
        new winston.transports.Console({
            level: loggingConfig.transports.console.level,
            format: combine(
                format.colorize({ all: true }),
                format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}`
                )
            )
        })
    );
}

// Add file transports if enabled
if (loggingConfig.transports.file.enabled) {
    if (loggingConfig.transports.file.error) {
        transports.push(
            new winston.transports.DailyRotateFile({
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
                level: 'error',
            })
        );
    }

    if (loggingConfig.transports.file.combined) {
        transports.push(
            new winston.transports.DailyRotateFile({
                filename: 'logs/combined-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            })
        );
    }
}

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        errors({ stack: true }),
        json()
    ),
    transports
});

// Create a stream object with a 'write' function that will be used by Morgan
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    }
};

// Create request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
    // Skip logging for excluded paths
    if (loggingConfig.request.exclude.includes(req.path)) {
        return next();
    }

    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });
    next();
};

// Create error logging middleware
export const errorLogger = (err: any, req: any, res: any, next: any) => {
    logger.error({
        error: err.message,
        stack: loggingConfig.error.stack ? err.stack : undefined,
        method: req.method,
        url: req.url,
        ip: req.ip
    });
    next(err);
};

// Export the logger
export default logger;
