import { DatabaseConnection } from '../../utils/db';
import { logger } from '../../utils/logger';
import { config } from 'dotenv';

config();

const ALERT_THRESHOLD = {
    slowQueries: 5,
    idleConnections: 10,
    poolUtilization: 0.8 // 80%
};

export class DatabaseMonitor {
    private static instance: DatabaseMonitor;
    private isMonitoring = false;
    private checkInterval: NodeJS.Timeout | null = null;

    private constructor() {}

    public static getInstance(): DatabaseMonitor {
        if (!DatabaseMonitor.instance) {
            DatabaseMonitor.instance = new DatabaseMonitor();
        }
        return DatabaseMonitor.instance;
    }

    public async startMonitoring(interval: number = 60000): Promise<void> {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;
        this.checkInterval = setInterval(async () => {
            await this.checkDatabaseHealth();
        }, interval);

        logger.info('Database monitoring started');
    }

    public stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.isMonitoring = false;
        logger.info('Database monitoring stopped');
    }

    private async checkDatabaseHealth(): Promise<void> {
        try {
            const metrics = await DatabaseConnection.getMetrics();
            if (!metrics) {
                return;
            }

            // Check for slow queries
            if (metrics.slowQueries > ALERT_THRESHOLD.slowQueries) {
                logger.warn('High number of slow queries detected:', {
                    count: metrics.slowQueries,
                    threshold: ALERT_THRESHOLD.slowQueries
                });
            }

            // Check for idle connections
            if (metrics.idleConnections > ALERT_THRESHOLD.idleConnections) {
                logger.warn('High number of idle connections detected:', {
                    count: metrics.idleConnections,
                    threshold: ALERT_THRESHOLD.idleConnections
                });
            }

            // Check pool utilization
            const poolUtilization = metrics.activeConnections / metrics.poolSize;
            if (poolUtilization > ALERT_THRESHOLD.poolUtilization) {
                logger.warn('High connection pool utilization:', {
                    utilization: poolUtilization,
                    threshold: ALERT_THRESHOLD.poolUtilization,
                    activeConnections: metrics.activeConnections,
                    poolSize: metrics.poolSize
                });
            }

            // Log metrics for monitoring
            logger.info('Database metrics:', {
                activeConnections: metrics.activeConnections,
                slowQueries: metrics.slowQueries,
                idleConnections: metrics.idleConnections,
                poolSize: metrics.poolSize,
                isConnected: metrics.isConnected
            });
        } catch (error) {
            logger.error('Error checking database health:', error);
        }
    }

    public async getCurrentMetrics() {
        return await DatabaseConnection.getMetrics();
    }
}
