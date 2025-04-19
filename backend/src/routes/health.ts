import { Router, Request, Response } from 'express';
import { DatabaseConnection } from '../utils/db';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

const router = Router();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Basic health check
router.get('/', async (req: Request, res: Response) => {
    try {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed'
        });
    }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
    try {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                database: await checkDatabase(),
                redis: await checkRedis(),
                memory: checkMemory(),
                disk: checkDisk()
            }
        };

        const allServicesHealthy = Object.values(health.services).every(service => service.status === 'ok');
        res.status(allServicesHealthy ? 200 : 503).json(health);
    } catch (error) {
        logger.error('Detailed health check failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Detailed health check failed'
        });
    }
});

// Database health check
async function checkDatabase() {
    try {
        const isHealthy = await DatabaseConnection.healthCheck();
        return {
            status: isHealthy ? 'ok' : 'error',
            message: isHealthy ? 'Database connection is healthy' : 'Database connection failed'
        };
    } catch (error) {
        logger.error('Database health check failed:', error);
        return {
            status: 'error',
            message: 'Database health check failed'
        };
    }
}

// Redis health check
async function checkRedis() {
    try {
        await redis.ping();
        return {
            status: 'ok',
            message: 'Redis connection is healthy'
        };
    } catch (error) {
        logger.error('Redis health check failed:', error);
        return {
            status: 'error',
            message: 'Redis connection failed'
        };
    }
}

// Memory health check
function checkMemory() {
    const used = process.memoryUsage();
    const total = 1024 * 1024 * 1024; // 1GB
    const memoryUsage = (used.heapUsed / total) * 100;

    return {
        status: memoryUsage < 90 ? 'ok' : 'warning',
        message: `Memory usage: ${memoryUsage.toFixed(2)}%`,
        details: {
            heapUsed: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            rss: `${(used.rss / 1024 / 1024).toFixed(2)} MB`
        }
    };
}

// Disk health check
function checkDisk() {
    try {
        const disk = require('diskusage');
        const path = process.cwd();
        const info = disk.sync(path);

        const total = info.total;
        const free = info.free;
        const used = total - free;
        const usagePercent = (used / total) * 100;

        return {
            status: usagePercent < 90 ? 'ok' : 'warning',
            message: `Disk usage: ${usagePercent.toFixed(2)}%`,
            details: {
                total: `${(total / 1024 / 1024 / 1024).toFixed(2)} GB`,
                free: `${(free / 1024 / 1024 / 1024).toFixed(2)} GB`,
                used: `${(used / 1024 / 1024 / 1024).toFixed(2)} GB`
            }
        };
    } catch (error) {
        logger.error('Disk health check failed:', error);
        return {
            status: 'error',
            message: 'Disk health check failed'
        };
    }
}

export default router;
