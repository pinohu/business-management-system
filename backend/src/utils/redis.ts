import Redis from 'ioredis';
import { config } from '../config';
import { logger } from './logger';

export class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Redis(config.redis.url, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      password: config.redis.password,
      db: config.redis.db,
      keyPrefix: config.redis.keyPrefix
    });

    this.setupEventListeners();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Successfully connected to Redis');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Redis is already connected');
      return;
    }

    try {
      await this.client.ping();
      this.isConnected = true;
      logger.info('Successfully connected to Redis');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info('Redis is already disconnected');
      return;
    }

    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Successfully disconnected from Redis');
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
      throw error;
    }
  }

  // Cache methods
  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error(`Failed to set Redis key ${key}:`, error);
      throw error;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Failed to get Redis key ${key}:`, error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Failed to delete Redis key ${key}:`, error);
      throw error;
    }
  }

  // Queue methods
  public async pushToQueue(queue: string, data: any): Promise<void> {
    try {
      await this.client.rpush(queue, JSON.stringify(data));
    } catch (error) {
      logger.error(`Failed to push to queue ${queue}:`, error);
      throw error;
    }
  }

  public async popFromQueue(queue: string): Promise<any | null> {
    try {
      const data = await this.client.lpop(queue);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Failed to pop from queue ${queue}:`, error);
      throw error;
    }
  }

  // Pub/Sub methods
  public async publish(channel: string, message: any): Promise<void> {
    try {
      await this.client.publish(channel, JSON.stringify(message));
    } catch (error) {
      logger.error(`Failed to publish to channel ${channel}:`, error);
      throw error;
    }
  }

  public async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.subscribe(channel);
      subscriber.on('message', (channel, message) => {
        callback(JSON.parse(message));
      });
    } catch (error) {
      logger.error(`Failed to subscribe to channel ${channel}:`, error);
      throw error;
    }
  }

  // Utility methods
  public async clear(): Promise<void> {
    try {
      await this.client.flushdb();
      logger.info('Successfully cleared Redis database');
    } catch (error) {
      logger.error('Failed to clear Redis database:', error);
      throw error;
    }
  }

  public isConnectedToRedis(): boolean {
    return this.isConnected;
  }
} 