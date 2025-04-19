import mongoose from 'mongoose';
import { config } from '../../config';
import logger from '../../utils/logger';

// Import all seeders
import { seedUsers } from './001_seed_users';
import { seedAIModels } from './002_seed_ai_models';
import { seedVisionModels } from './003_seed_vision_models';

const seeders = [
  seedUsers,
  seedAIModels,
  seedVisionModels,
];

async function runSeeds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.uri, {
      user: config.database.user,
      pass: config.database.password,
      dbName: config.database.dbName,
    });

    logger.info('Connected to MongoDB');

    // Run seeders in sequence
    for (const seeder of seeders) {
      try {
        await seeder();
        logger.info(`Seeder ${seeder.name} completed successfully`);
      } catch (error) {
        logger.error(`Seeder ${seeder.name} failed:`, error);
        throw error;
      }
    }

    logger.info('All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds(); 