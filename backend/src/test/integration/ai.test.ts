import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { VisionService } from '../../services/ai/vision';
import { RealTimeProcessor } from '../../services/processing/RealTimeProcessor';
import { Redis } from 'ioredis';
import { config } from '../../config';
import * as fs from 'fs';
import * as path from 'path';

const redis = new Redis(config.redis.url);
const visionService = VisionService.getInstance();
const processor = RealTimeProcessor.getInstance();

describe('AI Vision Integration Tests', () => {
  beforeAll(async () => {
    await visionService.initialize();
    await redis.flushall(); // Clear Redis before tests
  });

  afterAll(async () => {
    await visionService.cleanup();
    await processor.stop();
    await redis.quit();
  });

  describe('Object Detection', () => {
    it('should detect objects in an image', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/test-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      const result = await visionService.detectObjects(imageBuffer);

      expect(result).toBeDefined();
      expect(result.objects).toBeInstanceOf(Array);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle invalid image data', async () => {
      const invalidBuffer = Buffer.from('invalid image data');

      await expect(visionService.detectObjects(invalidBuffer))
        .rejects
        .toThrow();
    });
  });

  describe('Face Recognition', () => {
    it('should recognize faces in an image', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/face-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      const result = await visionService.recognizeFaces(imageBuffer);

      expect(result).toBeDefined();
      expect(result.faces).toBeInstanceOf(Array);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle images with no faces', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/no-face-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      const result = await visionService.recognizeFaces(imageBuffer);

      expect(result.faces).toHaveLength(0);
    });
  });

  describe('Text Extraction', () => {
    it('should extract text from an image', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/text-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      const result = await visionService.extractText(imageBuffer);

      expect(result).toBeDefined();
      expect(typeof result.text).toBe('string');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle images with no text', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/no-text-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      const result = await visionService.extractText(imageBuffer);

      expect(result.text).toBe('');
      expect(result.confidence).toBe(0);
    });
  });

  describe('Real-time Processing', () => {
    it('should process events in real-time', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/test-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      // Add event to queue
      await processor.addToQueue({
        type: 'object_detection',
        data: imageBuffer,
        timestamp: Date.now()
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check Redis for results
      const result = await redis.get('vision:objects:' + imageBuffer.toString('base64'));
      expect(result).toBeDefined();
    });

    it('should handle multiple events in batch', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/test-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      // Add multiple events
      for (let i = 0; i < 5; i++) {
        await processor.addToQueue({
          type: 'object_detection',
          data: imageBuffer,
          timestamp: Date.now()
        });
      }

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check analytics
      const analytics = await redis.get('analytics:current');
      expect(analytics).toBeDefined();
      const parsedAnalytics = JSON.parse(analytics!);
      expect(parsedAnalytics.totalObjects).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should process events within acceptable time', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/test-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      const startTime = Date.now();
      await processor.addToQueue({
        type: 'object_detection',
        data: imageBuffer,
        timestamp: Date.now()
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(2000); // Should process within 2 seconds
    });

    it('should handle concurrent requests', async () => {
      const imagePath = path.join(__dirname, '../../../test/fixtures/test-image.jpg');
      const imageBuffer = fs.readFileSync(imagePath);

      // Send multiple concurrent requests
      const requests = Array(10).fill(null).map(() =>
        processor.addToQueue({
          type: 'object_detection',
          data: imageBuffer,
          timestamp: Date.now()
        })
      );

      await Promise.all(requests);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check analytics
      const analytics = await redis.get('analytics:current');
      expect(analytics).toBeDefined();
      const parsedAnalytics = JSON.parse(analytics!);
      expect(parsedAnalytics.totalObjects).toBeGreaterThanOrEqual(10);
    });
  });
});
