import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export async function seedVisionModels(): Promise<void> {
  try {
    const visionModels = [
      {
        name: 'yolo-v8',
        type: 'object-detection',
        description: 'YOLOv8 model for object detection',
        status: 'active',
        parameters: {
          confidence: 0.5,
          maxObjects: 100
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'face-api',
        type: 'face-detection',
        description: 'Face-API model for face detection and recognition',
        status: 'active',
        parameters: {
          confidence: 0.5,
          maxFaces: 10
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.collection('vision_models').insertMany(visionModels);
    logger.info('Vision models seeded successfully');
  } catch (error) {
    logger.error('Failed to seed vision models:', error);
    throw error;
  }
}
