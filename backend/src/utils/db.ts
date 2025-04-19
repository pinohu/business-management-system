import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { config } from 'dotenv';

config();

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds
const POOL_SIZE = parseInt(process.env.DB_POOL_SIZE || '10');
const CONNECTION_TIMEOUT = parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000');

class DatabaseConnection {
    private static instance: PrismaClient;
    private static isConnected = false;
    private static connectionPool: PrismaClient[] = [];
    private static poolIndex = 0;

    private constructor() {}

    public static getInstance(): PrismaClient {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new PrismaClient({
                log: ['query', 'error', 'warn'],
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL
                    }
                },
                connection: {
                    pool: {
                        min: 2,
                        max: POOL_SIZE
                    }
                }
            });
        }
        return DatabaseConnection.instance;
    }

    public static async connect(): Promise<void> {
        if (DatabaseConnection.isConnected) {
            return;
        }

        try {
            await DatabaseConnection.withRetry(async () => {
                await DatabaseConnection.instance.$connect();
                DatabaseConnection.isConnected = true;
                logger.info('Database connected successfully');
            });
        } catch (error) {
            logger.error('Failed to connect to database:', error);
            throw error;
        }
    }

    public static async disconnect(): Promise<void> {
        if (!DatabaseConnection.isConnected) {
            return;
        }

        try {
            await DatabaseConnection.instance.$disconnect();
            DatabaseConnection.isConnected = false;
            logger.info('Database disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting from database:', error);
            throw error;
        }
    }

    public static async healthCheck(): Promise<boolean> {
        try {
            await DatabaseConnection.instance.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }

    public static async getConnection(): Promise<PrismaClient> {
        if (!DatabaseConnection.isConnected) {
            await DatabaseConnection.connect();
        }

        // Round-robin connection pool
        const connection = DatabaseConnection.connectionPool[DatabaseConnection.poolIndex];
        DatabaseConnection.poolIndex = (DatabaseConnection.poolIndex + 1) % POOL_SIZE;

        return connection;
    }

    private static async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                logger.warn(`Database operation failed (attempt ${attempt}/${MAX_RETRIES}):`, error);

                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                }
            }
        }

        throw lastError;
    }

    // Monitor database metrics
    public static async getMetrics() {
        try {
            const [activeConnections, slowQueries, errors] = await Promise.all([
                DatabaseConnection.instance.$queryRaw`SELECT count(*) as count FROM pg_stat_activity`,
                DatabaseConnection.instance.$queryRaw`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes'`,
                DatabaseConnection.instance.$queryRaw`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'idle in transaction' AND query_start < NOW() - INTERVAL '1 hour'`
            ]);

            return {
                activeConnections: activeConnections[0].count,
                slowQueries: slowQueries[0].count,
                idleConnections: errors[0].count,
                poolSize: POOL_SIZE,
                isConnected: DatabaseConnection.isConnected
            };
        } catch (error) {
            logger.error('Failed to get database metrics:', error);
            return null;
        }
    }
}

export { DatabaseConnection };
