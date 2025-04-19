import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { db } from '../../db';
import { User } from '../../models/User';
import { hash } from 'bcryptjs';

describe('Main Router', () => {
  beforeEach(async () => {
    await db.sync({ force: true });
  });

  afterEach(async () => {
    await db.close();
  });

  describe('GET /', () => {
    it('returns welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Welcome to the API');
    });
  });

  describe('GET /api/health', () => {
    it('returns health check status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('404 Handler', () => {
    it('handles non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Route not found');
    });
  });

  describe('Error Handler', () => {
    it('handles validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email format');
      expect(response.body.error).toContain('Password must be at least 8 characters long');
    });

    it('handles authentication errors', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('handles database errors', async () => {
      // Force a database error by closing the connection
      await db.close();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('Rate Limiting', () => {
    it('limits requests per IP', async () => {
      const requests = Array(100).fill(null).map(() => request(app).get('/'));
      const responses = await Promise.all(requests);

      const successCount = responses.filter((r) => r.status === 200).length;
      const rateLimitCount = responses.filter((r) => r.status === 429).length;

      expect(successCount).toBeLessThan(100);
      expect(rateLimitCount).toBeGreaterThan(0);
    });
  });

  describe('CORS', () => {
    it('allows requests from allowed origins', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('blocks requests from disallowed origins', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://malicious-site.com');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Request Logging', () => {
    it('logs request details', async () => {
      const response = await request(app)
        .get('/')
        .set('User-Agent', 'Test Browser');

      expect(response.status).toBe(200);
      // Note: Actual logging verification would require mocking the logger
    });
  });

  describe('Security Headers', () => {
    it('sets security headers', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });
  });
});
