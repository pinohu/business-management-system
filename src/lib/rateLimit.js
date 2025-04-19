import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch(console.error);

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'auth-limit:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed login attempts per hour
  message: 'Too many failed login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const formLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'form-limit:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 form submissions per minute
  message: 'Too many form submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}); 