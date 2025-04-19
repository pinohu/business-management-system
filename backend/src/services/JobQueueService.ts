import { RedisClient } from '../utils/redis';
import { logger } from '../utils/logger';
import { ProcessingJob } from '../models/ProcessingJob';
import { Analytics } from '../models/Analytics';

export class JobQueueService {
  private static instance: JobQueueService;
  private redis: RedisClient;
  private isProcessing: boolean = false;
  private readonly QUEUE_KEY = 'processing_queue';
  private readonly PROCESSING_LOCK_KEY = 'processing_lock';
  private readonly LOCK_TTL = 30; // seconds

  private constructor() {
    this.redis = RedisClient.getInstance();
  }

  public static getInstance(): JobQueueService {
    if (!JobQueueService.instance) {
      JobQueueService.instance = new JobQueueService();
    }
    return JobQueueService.instance;
  }

  public async addJob(job: any): Promise<void> {
    try {
      await this.redis.pushToQueue(this.QUEUE_KEY, job);
      logger.info(`Added job to queue: ${job.id}`);
    } catch (error) {
      logger.error('Failed to add job to queue:', error);
      throw error;
    }
  }

  public async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      logger.info('Job processing is already running');
      return;
    }

    this.isProcessing = true;
    logger.info('Starting job processing');

    while (this.isProcessing) {
      try {
        // Try to acquire lock
        const lockAcquired = await this.acquireLock();
        if (!lockAcquired) {
          await this.sleep(1000); // Wait 1 second before retrying
          continue;
        }

        // Process jobs
        await this.processJobs();

        // Release lock
        await this.releaseLock();
      } catch (error) {
        logger.error('Error in job processing loop:', error);
        await this.sleep(5000); // Wait 5 seconds on error
      }
    }
  }

  public async stopProcessing(): Promise<void> {
    this.isProcessing = false;
    await this.releaseLock();
    logger.info('Stopped job processing');
  }

  private async acquireLock(): Promise<boolean> {
    try {
      const result = await this.redis.set(
        this.PROCESSING_LOCK_KEY,
        'locked',
        this.LOCK_TTL
      );
      return result === 'OK';
    } catch (error) {
      logger.error('Failed to acquire processing lock:', error);
      return false;
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      await this.redis.del(this.PROCESSING_LOCK_KEY);
    } catch (error) {
      logger.error('Failed to release processing lock:', error);
    }
  }

  private async processJobs(): Promise<void> {
    while (true) {
      const job = await this.redis.popFromQueue(this.QUEUE_KEY);
      if (!job) {
        break;
      }

      try {
        await this.processJob(job);
      } catch (error) {
        logger.error(`Failed to process job ${job.id}:`, error);
        await this.handleJobFailure(job, error);
      }
    }
  }

  private async processJob(job: any): Promise<void> {
    const startTime = Date.now();
    logger.info(`Processing job: ${job.id}`);

    // Update job status
    const processingJob = await ProcessingJob.findById(job.id);
    if (!processingJob) {
      throw new Error(`Job ${job.id} not found`);
    }

    await processingJob.startProcessing();

    try {
      // Process the job based on its type
      const result = await this.executeJob(job);
      
      // Update job status and metrics
      await processingJob.complete(result);
      
      // Record analytics
      await this.recordJobMetrics(job, startTime, true);
      
      logger.info(`Successfully processed job: ${job.id}`);
    } catch (error) {
      await processingJob.fail({
        message: error.message,
        code: 'PROCESSING_ERROR',
        details: error
      });
      
      await this.recordJobMetrics(job, startTime, false);
      
      throw error;
    }
  }

  private async executeJob(job: any): Promise<any> {
    // Implement job execution logic based on job type
    switch (job.type) {
      case 'text':
        return await this.processTextJob(job);
      case 'vision':
        return await this.processVisionJob(job);
      case 'code':
        return await this.processCodeJob(job);
      case 'speech':
        return await this.processSpeechJob(job);
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  private async handleJobFailure(job: any, error: Error): Promise<void> {
    const processingJob = await ProcessingJob.findById(job.id);
    if (processingJob) {
      const canRetry = await processingJob.retry();
      if (canRetry) {
        await this.addJob(job);
        logger.info(`Retrying job: ${job.id}`);
      } else {
        logger.error(`Job ${job.id} failed permanently`);
      }
    }
  }

  private async recordJobMetrics(job: any, startTime: number, success: boolean): Promise<void> {
    const duration = Date.now() - startTime;
    await Analytics.create({
      timestamp: new Date(),
      type: 'job',
      metrics: {
        duration,
        success,
        jobType: job.type
      },
      tags: {
        jobId: job.id,
        userId: job.userId
      }
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Job type specific processing methods
  private async processTextJob(job: any): Promise<any> {
    // Implement text processing logic
    throw new Error('Text processing not implemented');
  }

  private async processVisionJob(job: any): Promise<any> {
    // Implement vision processing logic
    throw new Error('Vision processing not implemented');
  }

  private async processCodeJob(job: any): Promise<any> {
    // Implement code processing logic
    throw new Error('Code processing not implemented');
  }

  private async processSpeechJob(job: any): Promise<any> {
    // Implement speech processing logic
    throw new Error('Speech processing not implemented');
  }
} 