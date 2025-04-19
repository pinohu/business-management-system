import { jest } from '@jest/globals';
import { VisionService } from '../lib/visionService';
import { logger } from '../lib/logger';
import { cacheService } from '../lib/cache';
import { dataProcessingService } from '../lib/dataProcessing';
import { analyticsService } from '../lib/analyticsService';
import * as tf from '@tensorflow/tfjs-node';
import * as faceapi from 'face-api.js';
import * as tesseract from 'tesseract.js';

// Mock dependencies
jest.mock('../lib/logger');
jest.mock('../lib/cache');
jest.mock('../lib/dataProcessing');
jest.mock('../lib/analyticsService');
jest.mock('@tensorflow/tfjs-node');
jest.mock('face-api.js');
jest.mock('tesseract.js');

describe('VisionService', () => {
  let service;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create service instance
    service = new VisionService();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('should validate required services', async () => {
      const mockCache = { get: jest.fn(), set: jest.fn() };
      const mockDataProcessing = { preprocessImage: jest.fn() };
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
    it('should load YOLO model successfully', async () => {
      const mockModel = { predict: jest.fn() };
      tf.loadLayersModel.mockResolvedValue(mockModel);

      const config = {
        model: 'yolov5',
        type: 'object-detection',
      };

      const result = await service.loadModel(config);
      expect(result).toBe(mockModel);
      expect(tf.loadLayersModel).toHaveBeenCalledWith(expect.any(String));
    });

    it('should load FaceAPI model successfully', async () => {
      const mockModel = { detectAllFaces: jest.fn() };
      faceapi.nets.ssdMobilenetv1.loadFromUri.mockResolvedValue(mockModel);

      const config = {
        model: 'ssd-mobilenet-v1',
        type: 'face-detection',
      };

      const result = await service.loadModel(config);
      expect(result).toBe(mockModel);
      expect(faceapi.nets.ssdMobilenetv1.loadFromUri).toHaveBeenCalledWith(expect.any(String));
    });

    it('should handle model loading errors', async () => {
      tf.loadLayersModel.mockRejectedValue(new Error('Loading failed'));

      const config = {
        model: 'yolov5',
        type: 'object-detection',
      };

      await expect(service.loadModel(config)).rejects.toThrow('Loading failed');
    });
  });

  describe('Image Processing', () => {
    it('should process image successfully', async () => {
      const mockModel = { predict: jest.fn().mockResolvedValue([{ class: 'person', confidence: 0.95 }]) };
      const mockProcessedImage = 'processed_image_data';
      
      dataProcessingService.preprocessImage.mockResolvedValue(mockProcessedImage);
      service.getModel = jest.fn().mockResolvedValue(mockModel);

      const result = await service.processImage('test_image.jpg', {
        type: 'object-detection',
        model: 'yolov5',
      });

      expect(result).toEqual([{ class: 'person', confidence: 0.95 }]);
      expect(dataProcessingService.preprocessImage).toHaveBeenCalled();
      expect(mockModel.predict).toHaveBeenCalledWith(mockProcessedImage);
    });

    it('should handle image processing errors', async () => {
      dataProcessingService.preprocessImage.mockRejectedValue(new Error('Processing failed'));

      await expect(service.processImage('test_image.jpg')).rejects.toThrow('Processing failed');
    });

    it('should validate image input', async () => {
      await expect(service.processImage(null)).rejects.toThrow('Invalid image input');
      await expect(service.processImage(undefined)).rejects.toThrow('Invalid image input');
      await expect(service.processImage(123)).rejects.toThrow('Invalid image input');
    });
  });

  describe('Video Processing', () => {
    it('should process video successfully', async () => {
      const mockModel = { predict: jest.fn().mockResolvedValue([{ class: 'person', confidence: 0.95 }]) };
      const mockFrames = ['frame1.jpg', 'frame2.jpg'];
      
      dataProcessingService.extractFrames.mockResolvedValue(mockFrames);
      service.processImage = jest.fn().mockResolvedValue([{ class: 'person', confidence: 0.95 }]);

      const result = await service.processVideo('test_video.mp4', {
        type: 'object-detection',
        model: 'yolov5',
      });

      expect(result).toEqual([
        [{ class: 'person', confidence: 0.95 }],
        [{ class: 'person', confidence: 0.95 }],
      ]);
      expect(dataProcessingService.extractFrames).toHaveBeenCalled();
      expect(service.processImage).toHaveBeenCalledTimes(2);
    });

    it('should handle video processing errors', async () => {
      dataProcessingService.extractFrames.mockRejectedValue(new Error('Frame extraction failed'));

      await expect(service.processVideo('test_video.mp4')).rejects.toThrow('Frame extraction failed');
    });

    it('should validate video input', async () => {
      await expect(service.processVideo(null)).rejects.toThrow('Invalid video input');
      await expect(service.processVideo(undefined)).rejects.toThrow('Invalid video input');
      await expect(service.processVideo(123)).rejects.toThrow('Invalid video input');
    });
  });

  describe('Face Detection', () => {
    it('should detect faces successfully', async () => {
      const mockModel = { detectAllFaces: jest.fn().mockResolvedValue([{ box: { x: 0, y: 0, width: 100, height: 100 } }]) };
      const mockProcessedImage = 'processed_image_data';
      
      dataProcessingService.preprocessImage.mockResolvedValue(mockProcessedImage);
      service.getModel = jest.fn().mockResolvedValue(mockModel);

      const result = await service.detectFaces('test_image.jpg');

      expect(result).toEqual([{ box: { x: 0, y: 0, width: 100, height: 100 } }]);
      expect(dataProcessingService.preprocessImage).toHaveBeenCalled();
      expect(mockModel.detectAllFaces).toHaveBeenCalledWith(mockProcessedImage);
    });

    it('should handle face detection errors', async () => {
      dataProcessingService.preprocessImage.mockRejectedValue(new Error('Face detection failed'));

      await expect(service.detectFaces('test_image.jpg')).rejects.toThrow('Face detection failed');
    });
  });

  describe('OCR Processing', () => {
    it('should perform OCR successfully', async () => {
      const mockResult = { data: { text: 'Hello World' } };
      tesseract.recognize.mockResolvedValue(mockResult);

      const result = await service.recognizeText('test_image.jpg');

      expect(result).toEqual('Hello World');
      expect(tesseract.recognize).toHaveBeenCalledWith('test_image.jpg');
    });

    it('should handle OCR errors', async () => {
      tesseract.recognize.mockRejectedValue(new Error('OCR failed'));

      await expect(service.recognizeText('test_image.jpg')).rejects.toThrow('OCR failed');
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

  describe('Error Handling', () => {
    it('should handle service initialization errors', async () => {
      service.setupVisionHandlers = jest.fn().mockRejectedValue(new Error('Setup failed'));
      await expect(service.initialize()).rejects.toThrow('Vision Service initialization failed');
    });

    it('should handle model loading errors', async () => {
      tf.loadLayersModel.mockRejectedValue(new Error('Model loading failed'));
      await expect(service.loadModel({ model: 'test', type: 'test' }))
        .rejects.toThrow('Model loading failed');
    });

    it('should handle processing errors', async () => {
      service.getModel = jest.fn().mockRejectedValue(new Error('Processing failed'));
      await expect(service.processImage('test'))
        .rejects.toThrow('Processing failed');
    });
  });
}); 