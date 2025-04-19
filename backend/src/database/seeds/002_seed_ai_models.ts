import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export async function seedAIModels(): Promise<void> {
  try {
    const aiModels = [
      {
        name: 'gpt-4',
        type: 'text',
        description: 'OpenAI GPT-4 model for text generation and analysis',
        status: 'active',
        parameters: {
          maxTokens: 8192,
          temperature: 0.7,
          topP: 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'gpt-3.5-turbo',
        type: 'text',
        description: 'OpenAI GPT-3.5 Turbo model for text generation and analysis',
        status: 'active',
        parameters: {
          maxTokens: 4096,
          temperature: 0.7,
          topP: 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.collection('ai_models').insertMany(aiModels);
    logger.info('AI models seeded successfully');
  } catch (error) {
    logger.error('Failed to seed AI models:', error);
    throw error;
  }
}
