import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { db } from '../../db';
import { User } from '../../models/User';
import { hash } from 'bcryptjs';

describe('User Routes', () => {
  let token: string;

  beforeEach(async () => {
    await db.sync({ force: true });
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

  afterEach(async () => {
    await db.close();
  });

  describe('GET /api/users', () => {
    it('successfully fetches all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0].email).toBe('test@example.com');
      expect(response.body[0].name).toBe('Test User');
    });

    it('handles unauthorized access', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /api/users/:id', () => {
    it('successfully fetches a user by ID', async () => {
      const user = await User.findOne({ where: { email: 'test@example.com' } });
      const response = await request(app)
        .get(`/api/users/${user?.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
    });

    it('handles non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });

    it('handles unauthorized access', async () => {
      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('successfully updates a user', async () => {
      const user = await User.findOne({ where: { email: 'test@example.com' } });
      const response = await request(app)
        .patch(`/api/users/${user?.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Updated Name');
    });

    it('handles updating non-existent user', async () => {
      const response = await request(app)
        .patch('/api/users/999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });

    it('handles unauthorized access', async () => {
      const response = await request(app)
        .patch('/api/users/1')
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });

    it('validates update data', async () => {
      const user = await User.findOne({ where: { email: 'test@example.com' } });
      const response = await request(app)
        .patch(`/api/users/${user?.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('successfully deletes a user', async () => {
      const user = await User.findOne({ where: { email: 'test@example.com' } });
      const response = await request(app)
        .delete(`/api/users/${user?.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      const deletedUser = await User.findByPk(user?.id);
      expect(deletedUser).toBeNull();
    });

    it('handles deleting non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });

    it('handles unauthorized access', async () => {
      const response = await request(app).delete('/api/users/1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });
  });
});
