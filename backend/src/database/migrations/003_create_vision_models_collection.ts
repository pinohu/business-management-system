import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export async function createVisionModelsCollection(): Promise<void> {
  try {
    // Create vision_models collection
    await mongoose.connection.createCollection('vision_models');

    // Create indexes
    await mongoose.connection.collection('vision_models').createIndexes([
      { key: { name: 1 }, unique: true },
      { key: { type: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: 1 } }
    ]);

    logger.info('Vision models collection created successfully');
  } catch (error) {
    logger.error('Failed to create vision models collection:', error);
    throw error;
  }
}
