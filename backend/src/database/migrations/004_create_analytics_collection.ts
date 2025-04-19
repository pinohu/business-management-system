import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export async function createAnalyticsCollection(): Promise<void> {
  try {
    // Create analytics collection
    await mongoose.connection.createCollection('analytics');

    // Create indexes
    await mongoose.connection.collection('analytics').createIndexes([
      { key: { type: 1 } },
      { key: { timestamp: 1 } },
      { key: { userId: 1 } },
      { key: { sessionId: 1 } }
    ]);

    logger.info('Analytics collection created successfully');
  } catch (error) {
    logger.error('Failed to create analytics collection:', error);
    throw error;
  }
}
