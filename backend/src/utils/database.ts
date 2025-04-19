import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from './logger';

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database is already connected');
      return;
    }

    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
        retryWrites: true,
        w: 'majority',
        readPreference: 'primary',
        ssl: config.mongodb.ssl,
        authSource: config.mongodb.authSource,
        user: config.mongodb.user,
        pass: config.mongodb.password
      };

      await mongoose.connect(config.mongodb.uri, options);
      this.isConnected = true;

      logger.info('Successfully connected to MongoDB');

      // Set up event listeners
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info('Database is already disconnected');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Successfully disconnected from MongoDB');
    } catch (error) {
      logger.error('Failed to disconnect from MongoDB:', error);
      throw error;
    }
  }

  public async clearCollections(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Database is not connected');
    }

    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      logger.info('Successfully cleared all collections');
    } catch (error) {
      logger.error('Failed to clear collections:', error);
      throw error;
    }
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }
} 