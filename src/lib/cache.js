import { logger } from './logger';
import Redis from 'ioredis';

class CacheService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.defaultTTL = 3600; // 1 hour
    this.prefix = 'cache:';
  }

  async initialize() {
    try {
      await this.redis.ping();
      logger.info('Cache service initialized successfully');
    } catch (error) {
      logger.error('Error initializing cache service:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      const value = await this.redis.get(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.set(this.getKey(key), serializedValue, 'EX', ttl);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      await this.redis.del(this.getKey(key));
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.redis.exists(this.getKey(key)) === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async getTTL(key) {
    try {
      return await this.redis.ttl(this.getKey(key));
    } catch (error) {
      logger.error('Cache TTL error:', error);
      return -1;
    }
  }

  async increment(key, amount = 1) {
    try {
      return await this.redis.incrby(this.getKey(key), amount);
    } catch (error) {
      logger.error('Cache increment error:', error);
      return null;
    }
  }

  async decrement(key, amount = 1) {
    try {
      return await this.redis.decrby(this.getKey(key), amount);
    } catch (error) {
      logger.error('Cache decrement error:', error);
      return null;
    }
  }

  async getMultiple(keys) {
    try {
      const values = await this.redis.mget(keys.map(key => this.getKey(key)));
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache get multiple error:', error);
      return keys.map(() => null);
    }
  }

  async setMultiple(items, ttl = this.defaultTTL) {
    try {
      const pipeline = this.redis.pipeline();
      items.forEach(({ key, value }) => {
        pipeline.set(
          this.getKey(key),
          JSON.stringify(value),
          'EX',
          ttl
        );
      });
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache set multiple error:', error);
      return false;
    }
  }

  async deleteMultiple(keys) {
    try {
      await this.redis.del(keys.map(key => this.getKey(key)));
      return true;
    } catch (error) {
      logger.error('Cache delete multiple error:', error);
      return false;
    }
  }

  async clear() {
    try {
      const keys = await this.redis.keys(this.getKey('*'));
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  async getKeys(pattern = '*') {
    try {
      const keys = await this.redis.keys(this.getKey(pattern));
      return keys.map(key => this.removeKeyPrefix(key));
    } catch (error) {
      logger.error('Cache get keys error:', error);
      return [];
    }
  }

  async getValues(pattern = '*') {
    try {
      const keys = await this.getKeys(pattern);
      return await this.getMultiple(keys);
    } catch (error) {
      logger.error('Cache get values error:', error);
      return [];
    }
  }

  async getSize() {
    try {
      const keys = await this.getKeys();
      return keys.length;
    } catch (error) {
      logger.error('Cache get size error:', error);
      return 0;
    }
  }

  async getStats() {
    try {
      const info = await this.redis.info();
      const stats = {
        hits: 0,
        misses: 0,
        keyspace: {},
        memory: {},
      };

      // Parse Redis INFO output
      const lines = info.split('\r\n');
      for (const line of lines) {
        if (line.startsWith('keyspace_hits:')) {
          stats.hits = parseInt(line.split(':')[1]);
        } else if (line.startsWith('keyspace_misses:')) {
          stats.misses = parseInt(line.split(':')[1]);
        } else if (line.startsWith('db')) {
          const [db, keys, expires] = line.split(':')[1].split(',');
          stats.keyspace[db] = {
            keys: parseInt(keys.split('=')[1]),
            expires: parseInt(expires.split('=')[1]),
          };
        } else if (line.startsWith('used_memory:')) {
          stats.memory.used = parseInt(line.split(':')[1]);
        } else if (line.startsWith('used_memory_peak:')) {
          stats.memory.peak = parseInt(line.split(':')[1]);
        }
      }

      return stats;
    } catch (error) {
      logger.error('Cache get stats error:', error);
      return null;
    }
  }

  getKey(key) {
    return `${this.prefix}${key}`;
  }

  removeKeyPrefix(key) {
    return key.replace(this.prefix, '');
  }

  async healthCheck() {
    try {
      await this.redis.ping();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const cacheService = new CacheService(); 