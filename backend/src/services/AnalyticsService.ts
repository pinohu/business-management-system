import { Analytics } from '../models/Analytics';
import { logger } from '../utils/logger';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private readonly METRICS_RETENTION_DAYS = 30;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // System metrics
  public async recordSystemMetrics(metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: {
      bytesIn: number;
      bytesOut: number;
    };
  }): Promise<void> {
    try {
      await Analytics.create({
        timestamp: new Date(),
        type: 'system',
        metrics: {
          ...metrics,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      logger.error('Failed to record system metrics:', error);
      throw error;
    }
  }

  public async getSystemMetrics(startTime: Date, endTime: Date): Promise<any[]> {
    try {
      return await Analytics.getSystemMetrics(startTime, endTime);
    } catch (error) {
      logger.error('Failed to get system metrics:', error);
      throw error;
    }
  }

  // Model metrics
  public async recordModelMetrics(modelId: string, metrics: {
    accuracy: number;
    latency: number;
    throughput: number;
    resourceUsage: {
      cpu: number;
      memory: number;
      gpu?: number;
    };
  }): Promise<void> {
    try {
      await Analytics.create({
        timestamp: new Date(),
        type: 'model',
        metrics: {
          ...metrics,
          timestamp: Date.now()
        },
        tags: {
          modelId
        }
      });
    } catch (error) {
      logger.error('Failed to record model metrics:', error);
      throw error;
    }
  }

  public async getModelMetrics(modelId: string, startTime: Date, endTime: Date): Promise<any[]> {
    try {
      return await Analytics.getModelMetrics(modelId, startTime, endTime);
    } catch (error) {
      logger.error('Failed to get model metrics:', error);
      throw error;
    }
  }

  // User metrics
  public async recordUserMetrics(userId: string, metrics: {
    requests: number;
    processingTime: number;
    successRate: number;
    errorRate: number;
  }): Promise<void> {
    try {
      await Analytics.create({
        timestamp: new Date(),
        type: 'user',
        metrics: {
          ...metrics,
          timestamp: Date.now()
        },
        tags: {
          userId
        }
      });
    } catch (error) {
      logger.error('Failed to record user metrics:', error);
      throw error;
    }
  }

  public async getUserMetrics(userId: string, startTime: Date, endTime: Date): Promise<any[]> {
    try {
      return await Analytics.getUserMetrics(userId, startTime, endTime);
    } catch (error) {
      logger.error('Failed to get user metrics:', error);
      throw error;
    }
  }

  // Job metrics
  public async recordJobMetrics(jobId: string, metrics: {
    duration: number;
    success: boolean;
    resourceUsage: {
      cpu: number;
      memory: number;
      gpu?: number;
    };
  }): Promise<void> {
    try {
      await Analytics.create({
        timestamp: new Date(),
        type: 'job',
        metrics: {
          ...metrics,
          timestamp: Date.now()
        },
        tags: {
          jobId
        }
      });
    } catch (error) {
      logger.error('Failed to record job metrics:', error);
      throw error;
    }
  }

  public async getJobMetrics(jobId: string, startTime: Date, endTime: Date): Promise<any[]> {
    try {
      return await Analytics.getJobMetrics(jobId, startTime, endTime);
    } catch (error) {
      logger.error('Failed to get job metrics:', error);
      throw error;
    }
  }

  // Aggregation methods
  public async getAggregatedMetrics(type: 'system' | 'model' | 'user' | 'job', startTime: Date, endTime: Date): Promise<any> {
    try {
      const metrics = await Analytics.find({
        type,
        timestamp: { $gte: startTime, $lte: endTime }
      });

      return this.aggregateMetrics(metrics);
    } catch (error) {
      logger.error(`Failed to get aggregated ${type} metrics:`, error);
      throw error;
    }
  }

  private aggregateMetrics(metrics: any[]): any {
    const aggregated: any = {};

    metrics.forEach(metric => {
      Object.entries(metric.metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          if (!aggregated[key]) {
            aggregated[key] = {
              sum: 0,
              count: 0,
              min: Infinity,
              max: -Infinity
            };
          }
          aggregated[key].sum += value;
          aggregated[key].count += 1;
          aggregated[key].min = Math.min(aggregated[key].min, value);
          aggregated[key].max = Math.max(aggregated[key].max, value);
        }
      });
    });

    // Calculate averages
    Object.keys(aggregated).forEach(key => {
      aggregated[key].average = aggregated[key].sum / aggregated[key].count;
    });

    return aggregated;
  }

  // Cleanup methods
  public async cleanupOldMetrics(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.METRICS_RETENTION_DAYS);

      await Analytics.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up metrics older than ${this.METRICS_RETENTION_DAYS} days`);
    } catch (error) {
      logger.error('Failed to cleanup old metrics:', error);
      throw error;
    }
  }

  // Export methods
  public async exportMetrics(type: 'system' | 'model' | 'user' | 'job', startTime: Date, endTime: Date): Promise<any[]> {
    try {
      return await Analytics.find({
        type,
        timestamp: { $gte: startTime, $lte: endTime }
      }).sort({ timestamp: 1 });
    } catch (error) {
      logger.error(`Failed to export ${type} metrics:`, error);
      throw error;
    }
  }
} 