import { EventEmitter } from 'events';
import { Redis } from 'ioredis';
import { logger } from '../../utils/logger';
import { config } from '../../config';
import { VisionService } from '../ai/vision';

interface ProcessingEvent {
  type: 'object_detection' | 'face_recognition' | 'text_extraction';
  data: any;
  timestamp: number;
}

export class RealTimeProcessor extends EventEmitter {
  private static instance: RealTimeProcessor;
  private redis: Redis;
  private visionService: VisionService;
  private processingQueue: ProcessingEvent[] = [];
  private isProcessing: boolean = false;
  private batchSize: number = 10;
  private processingInterval: number = 100; // ms

  private constructor() {
    super();
    this.redis = new Redis(config.redis.url);
    this.visionService = VisionService.getInstance();
    this.initialize();
  }

  public static getInstance(): RealTimeProcessor {
    if (!RealTimeProcessor.instance) {
      RealTimeProcessor.instance = new RealTimeProcessor();
    }
    return RealTimeProcessor.instance;
  }

  private async initialize(): Promise<void> {
    try {
      await this.visionService.initialize();
      this.startProcessing();
      logger.info('Real-time processor initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize real-time processor:', error);
      throw error;
    }
  }

  public async addToQueue(event: ProcessingEvent): Promise<void> {
    try {
      this.processingQueue.push(event);
      await this.redis.lpush('processing:queue', JSON.stringify(event));
      logger.debug(`Added event to processing queue: ${event.type}`);
    } catch (error) {
      logger.error('Error adding event to queue:', error);
      throw error;
    }
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.isProcessing) {
      try {
        await this.processBatch();
      } catch (error) {
        logger.error('Error processing batch:', error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async processBatch(): Promise<void> {
    const batch = await this.getBatch();
    if (batch.length === 0) {
      await new Promise(resolve => setTimeout(resolve, this.processingInterval));
      return;
    }

    const results = await Promise.all(
      batch.map(event => this.processEvent(event))
    );

    // Emit results
    results.forEach(result => {
      if (result) {
        this.emit('processing_result', result);
      }
    });

    // Update analytics
    await this.updateAnalytics(results);
  }

  private async getBatch(): Promise<ProcessingEvent[]> {
    const batch: ProcessingEvent[] = [];

    for (let i = 0; i < this.batchSize; i++) {
      const eventStr = await this.redis.rpop('processing:queue');
      if (!eventStr) break;

      try {
        const event = JSON.parse(eventStr);
        batch.push(event);
      } catch (error) {
        logger.error('Error parsing event from queue:', error);
      }
    }

    return batch;
  }

  private async processEvent(event: ProcessingEvent): Promise<any> {
    try {
      switch (event.type) {
        case 'object_detection':
          return await this.visionService.detectObjects(event.data);
        case 'face_recognition':
          return await this.visionService.recognizeFaces(event.data);
        case 'text_extraction':
          return await this.visionService.extractText(event.data);
        default:
          logger.warn(`Unknown event type: ${event.type}`);
          return null;
      }
    } catch (error) {
      logger.error(`Error processing event ${event.type}:`, error);
      return null;
    }
  }

  private async updateAnalytics(results: any[]): Promise<void> {
    try {
      const analytics = {
        totalObjects: 0,
        totalFaces: 0,
        avgProcessingTime: 0,
        avgConfidence: 0,
        timestamp: Date.now(),
      };

      results.forEach(result => {
        if (!result) return;

        if (result.objects) {
          analytics.totalObjects += result.objects.length;
        }
        if (result.faces) {
          analytics.totalFaces += result.faces.length;
        }
        if (result.processingTime) {
          analytics.avgProcessingTime += result.processingTime;
        }
        if (result.confidence) {
          analytics.avgConfidence += result.confidence;
        }
      });

      // Calculate averages
      const count = results.length;
      if (count > 0) {
        analytics.avgProcessingTime /= count;
        analytics.avgConfidence /= count;
      }

      // Store analytics
      await this.redis.set(
        'analytics:current',
        JSON.stringify(analytics)
      );

      // Add to time series
      await this.redis.lpush(
        'analytics:history',
        JSON.stringify(analytics)
      );
      await this.redis.ltrim('analytics:history', 0, 999); // Keep last 1000 records

      // Emit analytics update
      this.emit('analytics_update', analytics);
    } catch (error) {
      logger.error('Error updating analytics:', error);
    }
  }

  public async stop(): Promise<void> {
    this.isProcessing = false;
    await this.visionService.cleanup();
    logger.info('Real-time processor stopped');
  }
}
