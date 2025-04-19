import { jest } from '@jest/globals';
import { aiService } from '../lib/aiService';
import { logger } from '../lib/logger';
import { cacheService } from '../lib/cache';
import { dataProcessingService } from '../lib/dataProcessing';
import { analyticsService } from '../lib/analyticsService';
import { transformers } from '@xenova/transformers';
import { spacy } from '@spacy/core';

// Mock dependencies
jest.mock('../lib/logger');
jest.mock('../lib/cache');
jest.mock('../lib/dataProcessing');
jest.mock('../lib/analyticsService');
jest.mock('@xenova/transformers');
jest.mock('@spacy/core');

describe('AIService', () => {
  let service;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create service instance
    service = new aiService();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should validate required services', async () => {
      const mockCache = { get: jest.fn(), set: jest.fn() };
      const mockDataProcessing = { preprocessText: jest.fn() };
      const mockAnalytics = { trackModelMetrics: jest.fn() };

      service.cache = mockCache;
      service.dataProcessing = mockDataProcessing;
      service.analytics = mockAnalytics;

      await expect(service.validateServices()).resolves.not.toThrow();
    });

    it('should throw error if services are not properly initialized', async () => {
      service.cache = null;
      await expect(service.validateServices()).rejects.toThrow();
    });
  });

  describe('Model Loading', () => {
    it('should load transformer model successfully', async () => {
      const mockPipeline = { predict: jest.fn() };
      transformers.pipeline.mockResolvedValue(mockPipeline);

      const config = {
        model: 'test-model',
        type: 'text-classification',
      };

      const result = await service.loadTransformerModel(config);
      expect(result).toBe(mockPipeline);
      expect(transformers.pipeline).toHaveBeenCalledWith('text-classification', 'test-model');
    });

    it('should load SpaCy model successfully', async () => {
      const mockNlp = { process: jest.fn() };
      spacy.load.mockResolvedValue(mockNlp);

      const config = {
        model: 'test-model',
      };

      const result = await service.loadSpacyModel(config);
      expect(result).toBe(mockNlp);
      expect(spacy.load).toHaveBeenCalledWith('test-model');
    });

    it('should handle model loading errors', async () => {
      transformers.pipeline.mockRejectedValue(new Error('Loading failed'));

      const config = {
        model: 'test-model',
        type: 'text-classification',
      };

      await expect(service.loadTransformerModel(config)).rejects.toThrow('Loading failed');
    });
  });

  describe('Text Processing', () => {
    it('should process text successfully', async () => {
      const mockModel = { predict: jest.fn().mockResolvedValue({ label: 'positive', score: 0.9 }) };
      const mockProcessedText = 'processed text';
      
      dataProcessingService.preprocessText.mockResolvedValue(mockProcessedText);
      service.getModel = jest.fn().mockResolvedValue(mockModel);

      const result = await service.processText('test text', {
        type: 'text-classification',
        model: 'test-model',
      });

      expect(result).toEqual({ label: 'positive', score: 0.9 });
      expect(dataProcessingService.preprocessText).toHaveBeenCalled();
      expect(mockModel.predict).toHaveBeenCalledWith(mockProcessedText);
    });

    it('should handle text processing errors', async () => {
      dataProcessingService.preprocessText.mockRejectedValue(new Error('Processing failed'));

      await expect(service.processText('test text')).rejects.toThrow('Processing failed');
    });

    it('should validate text input', async () => {
      await expect(service.processText(null)).rejects.toThrow('Invalid text input');
      await expect(service.processText(undefined)).rejects.toThrow('Invalid text input');
      await expect(service.processText(123)).rejects.toThrow('Invalid text input');
    });
  });

  describe('Model Management', () => {
    it('should save model successfully', async () => {
      const mockModel = { predict: jest.fn() };
      const mockConfig = { name: 'test-model' };

      await expect(service.saveModel(mockModel, mockConfig)).resolves.not.toThrow();
    });

    it('should validate model state before saving', async () => {
      await expect(service.saveModel(null, {})).rejects.toThrow('Invalid model state');
      await expect(service.saveModel(undefined, {})).rejects.toThrow('Invalid model state');
    });
  });

  describe('Analytics and Monitoring', () => {
    it('should track model metrics successfully', async () => {
      const metrics = { accuracy: 0.95, latency: 100 };
      analyticsService.trackModelMetrics.mockResolvedValue(true);

      await expect(service.trackModelMetrics('test-model', metrics)).resolves.not.toThrow();
      expect(analyticsService.trackModelMetrics).toHaveBeenCalledWith('test-model', metrics);
    });

    it('should get model performance successfully', async () => {
      const mockPerformance = { accuracy: 0.95, latency: 100 };
      analyticsService.getModelPerformance.mockResolvedValue(mockPerformance);

      const result = await service.getModelPerformance('test-model');
      expect(result).toEqual(mockPerformance);
      expect(analyticsService.getModelPerformance).toHaveBeenCalledWith('test-model');
    });
  });

  describe('Event Handling', () => {
    it('should register event listeners', () => {
      const callback = jest.fn();
      service.on('test:event', callback);
      expect(service.eventListeners.get('test:event')).toContain(callback);
    });

    it('should emit events', () => {
      const callback = jest.fn();
      service.on('test:event', callback);
      service.emit('test:event', { data: 'test' });
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should remove event listeners', () => {
      const callback = jest.fn();
      service.on('test:event', callback);
      service.off('test:event', callback);
      expect(service.eventListeners.get('test:event')).not.toContain(callback);
    });
  });

  describe('Error Handling', () => {
    it('should handle service initialization errors', async () => {
      service.setupAIHandlers = jest.fn().mockRejectedValue(new Error('Setup failed'));
      await expect(service.initialize()).rejects.toThrow('AI Service initialization failed');
    });

    it('should handle model loading errors', async () => {
      transformers.pipeline.mockRejectedValue(new Error('Model loading failed'));
      await expect(service.loadTransformerModel({ model: 'test', type: 'test' }))
        .rejects.toThrow('Model loading failed');
    });

    it('should handle processing errors', async () => {
      service.getModel = jest.fn().mockRejectedValue(new Error('Processing failed'));
      await expect(service.processText('test'))
        .rejects.toThrow('Processing failed');
    });
  });
}); 