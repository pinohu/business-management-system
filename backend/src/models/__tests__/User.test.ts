import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../db';
import { User } from '../User';
import { hash } from 'bcryptjs';

describe('User Model', () => {
  beforeEach(async () => {
    await db.sync({ force: true });
  });

  afterEach(async () => {
    await db.close();
  });

  describe('create', () => {
    it('successfully creates a new user', async () => {
      const hashedPassword = await hash('password123', 10);
      const user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.password).toBe(hashedPassword);
    });

    it('enforces unique email constraint', async () => {
      const hashedPassword = await hash('password123', 10);
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });

      await expect(
        User.create({
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Another User',
        })
      ).rejects.toThrow();
    });

    it('validates email format', async () => {
      const hashedPassword = await hash('password123', 10);
      await expect(
        User.create({
          email: 'invalid-email',
          password: hashedPassword,
          name: 'Test User',
        })
      ).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    beforeEach(async () => {
      const hashedPassword = await hash('password123', 10);
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });
    });

    it('successfully finds a user by email', async () => {
      const user = await User.findOne({ where: { email: 'test@example.com' } });
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
      expect(user?.name).toBe('Test User');
    });

    it('returns null for non-existent user', async () => {
      const user = await User.findOne({ where: { email: 'nonexistent@example.com' } });
      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    let user: User;

    beforeEach(async () => {
      const hashedPassword = await hash('password123', 10);
      user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });
    });

    it('successfully updates user name', async () => {
      await user.update({ name: 'Updated Name' });
      expect(user.name).toBe('Updated Name');
    });

    it('successfully updates user password', async () => {
      const newHashedPassword = await hash('newpassword123', 10);
      await user.update({ password: newHashedPassword });
      expect(user.password).toBe(newHashedPassword);
    });

    it('validates email format on update', async () => {
      await expect(user.update({ email: 'invalid-email' })).rejects.toThrow();
    });

    it('enforces unique email constraint on update', async () => {
      const hashedPassword = await hash('password123', 10);
      await User.create({
        email: 'another@example.com',
        password: hashedPassword,
        name: 'Another User',
      });

      await expect(user.update({ email: 'another@example.com' })).rejects.toThrow();
    });
  });

  describe('delete', () => {
    let user: User;

    beforeEach(async () => {
      const hashedPassword = await hash('password123', 10);
      user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });
    });

    it('successfully deletes a user', async () => {
      await user.destroy();
      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('associations', () => {
    it('can have multiple posts', async () => {
      const hashedPassword = await hash('password123', 10);
      const user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });

      // Create posts for the user
      await user.createPost({
        title: 'Test Post 1',
        content: 'Content 1',
      });

      await user.createPost({
        title: 'Test Post 2',
        content: 'Content 2',
      });

      const posts = await user.getPosts();
      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe('Test Post 1');
      expect(posts[1].title).toBe('Test Post 2');
    });
  });
});
