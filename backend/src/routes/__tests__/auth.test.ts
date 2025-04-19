import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { db } from '../../db';
import { User } from '../../models/User';
import { hash } from 'bcryptjs';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await db.sync({ force: true });
  });

  afterEach(async () => {
    await db.close();
  });

  describe('POST /api/auth/register', () => {
    it('successfully registers a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('Test User');
    });

    it('handles registration with existing email', async () => {
      const hashedPassword = await hash('password123', 10);
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Existing User',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email already exists');
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('password');
      expect(response.body.error).toContain('name');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await hash('password123', 10);
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });
    });

    it('successfully logs in a user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('Test User');
    });

    it('handles invalid credentials', async () => {
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

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('password');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token: string;

    beforeEach(async () => {
      const hashedPassword = await hash('password123', 10);
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      token = loginResponse.body.token;
    });

    it('successfully fetches user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
    });

    it('handles invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid token');
    });

    it('handles missing token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });
  });
});
