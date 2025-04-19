import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export async function createUsersCollection(): Promise<void> {
  try {
    // Create users collection
    await mongoose.connection.createCollection('users');

    // Create indexes
    await mongoose.connection.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { createdAt: 1 } }
    ]);

    logger.info('Users collection created successfully');
  } catch (error) {
    logger.error('Failed to create users collection:', error);
    throw error;
  }
}
