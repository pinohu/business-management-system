import { config } from 'dotenv';

config();

export const loggingConfig = {
    level: process.env.LOG_LEVEL || 'info',
    format: {
        timestamp: true,
        colorize: true,
        json: false
    },
    transports: {
        console: {
            enabled: true,
            level: process.env.LOG_LEVEL || 'info'
        },
        file: {
            enabled: true,
            error: {
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5
            },
            combined: {
                filename: 'logs/combined.log',
                maxsize: 5242880, // 5MB
                maxFiles: 5
            }
        }
    },
    request: {
        enabled: true,
        exclude: [
            '/health',
            '/metrics',
            '/favicon.ico'
        ]
    },
    error: {
        enabled: true,
        stack: true
    },
    rotation: {
        enabled: true,
        maxSize: '5m',
        maxFiles: 5,
        compress: true,
        interval: '1d'
    }
};
