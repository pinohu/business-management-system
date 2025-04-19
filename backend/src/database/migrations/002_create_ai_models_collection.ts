import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export async function createAIModelsCollection(): Promise<void> {
  try {
    // Create ai_models collection
    await mongoose.connection.createCollection('ai_models');

    // Create indexes
    await mongoose.connection.collection('ai_models').createIndexes([
      { key: { name: 1 }, unique: true },
      { key: { type: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: 1 } }
    ]);

    logger.info('AI models collection created successfully');
  } catch (error) {
    logger.error('Failed to create AI models collection:', error);
    throw error;
  }
}
