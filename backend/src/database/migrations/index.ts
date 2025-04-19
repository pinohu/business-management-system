import mongoose from 'mongoose';
import { config } from '../../config';
import logger from '../../utils/logger';

// Import all migrations
import { createUsersCollection } from './001_create_users_collection';
import { createAIModelsCollection } from './002_create_ai_models_collection';
import { createVisionModelsCollection } from './003_create_vision_models_collection';
import { createAnalyticsCollection } from './004_create_analytics_collection';

const migrations = [
  createUsersCollection,
  createAIModelsCollection,
  createVisionModelsCollection,
  createAnalyticsCollection,
];

async function runMigrations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.uri, {
      user: config.database.user,
      pass: config.database.password,
      dbName: config.database.dbName,
    });

    logger.info('Connected to MongoDB');

    // Run migrations in sequence
    for (const migration of migrations) {
      try {
        await migration();
        logger.info(`Migration ${migration.name} completed successfully`);
      } catch (error) {
        logger.error(`Migration ${migration.name} failed:`, error);
        throw error;
      }
    }

    logger.info('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 