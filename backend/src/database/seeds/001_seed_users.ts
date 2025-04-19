import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export async function seedUsers(): Promise<void> {
  try {
    const users = [
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Regular User',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.collection('users').insertMany(users);
    logger.info('Users seeded successfully');
  } catch (error) {
    logger.error('Failed to seed users:', error);
    throw error;
  }
}
