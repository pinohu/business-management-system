import { jest } from '@jest/globals';
import { VisionService } from '../../../frontend/services/visionService';
import axios from 'axios';
import config from '../../../frontend/config';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../frontend/config');

describe('VisionService', () => {
  let service;
  let mockAxios;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    };
    axios.create.mockReturnValue(mockAxios);

    // Create service instance
    service = new VisionService();
  });

  describe('Initialization', () => {
    it('should initialize with correct base URL', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: config.api.baseURL,
        timeout: config.api.timeout,
      });
    });

    it('should set up request interceptor', () => {
      expect(mockAxios.interceptors.request.use).toHaveBeenCalled();
    });

    it('should set up response interceptor', () => {
      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Image Processing', () => {
    it('should detect objects successfully', async () => {
      const mockResponse = { data: { objects: [{ class: 'person', confidence: 0.95 }] } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.detectObjects('image-data', {
        model: 'yolov5',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/vision/detect-objects', {
        image: 'image-data',
        model: 'yolov5',
      });
    });

    it('should detect faces successfully', async () => {
      const mockResponse = { data: { faces: [{ box: { x: 0, y: 0, width: 100, height: 100 } }] } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.detectFaces('image-data', {
        model: 'ssd-mobilenet-v1',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/vision/detect-faces', {
        image: 'image-data',
        model: 'ssd-mobilenet-v1',
      });
    });

    it('should classify scene successfully', async () => {
      const mockResponse = { data: { scene: 'beach', confidence: 0.95 } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.classifyScene('image-data', {
        model: 'resnet50',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/vision/classify-scene', {
        image: 'image-data',
        model: 'resnet50',
      });
    });

    it('should handle image processing errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Image processing failed'));

      await expect(service.detectObjects('test')).rejects.toThrow('Image processing failed');
    });
  });

  describe('Video Processing', () => {
    it('should process video successfully', async () => {
      const mockResponse = { data: { frames: [{ objects: [] }] } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.processVideo('video-data', {
        model: 'yolov5',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/vision/process-video', {
        video: 'video-data',
        model: 'yolov5',
      });
    });

    it('should handle video processing errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Video processing failed'));

      await expect(service.processVideo('test')).rejects.toThrow('Video processing failed');
    });
  });

  describe('OCR Processing', () => {
    it('should recognize text successfully', async () => {
      const mockResponse = { data: { text: 'Recognized text' } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.recognizeText('image-data', {
        language: 'eng',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/vision/recognize-text', {
        image: 'image-data',
        language: 'eng',
      });
    });

    it('should handle OCR errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('OCR failed'));

      await expect(service.recognizeText('test')).rejects.toThrow('OCR failed');
    });
  });

  describe('Model Management', () => {
    it('should get available models successfully', async () => {
      const mockResponse = { data: { models: ['model1', 'model2'] } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getAvailableModels();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/vision/models');
    });

    it('should get model status successfully', async () => {
      const mockResponse = { data: { status: 'active' } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getModelStatus('test-model');

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/vision/models/test-model/status');
    });

    it('should update model successfully', async () => {
      const mockResponse = { data: { success: true } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await service.updateModel('test-model', {
        config: { new: 'config' },
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.put).toHaveBeenCalledWith('/api/vision/models/test-model', {
        config: { new: 'config' },
      });
    });

    it('should handle model management errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Model management failed'));

      await expect(service.getAvailableModels()).rejects.toThrow('Model management failed');
    });
  });

  describe('Analytics', () => {
    it('should get processing stats successfully', async () => {
      const mockResponse = { data: { total: 100, success: 95 } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getProcessingStats();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/vision/stats');
    });

    it('should get model performance successfully', async () => {
      const mockResponse = { data: { accuracy: 0.95, latency: 100 } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getModelPerformance('test-model');

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/vision/models/test-model/performance');
    });

    it('should handle analytics errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Analytics failed'));

      await expect(service.getProcessingStats()).rejects.toThrow('Analytics failed');
    });
  });

  describe('Batch Processing', () => {
    it('should process batch successfully', async () => {
      const mockResponse = { data: { results: ['result1', 'result2'] } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.processBatch(['image1', 'image2'], {
        type: 'object-detection',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/vision/batch', {
        images: ['image1', 'image2'],
        type: 'object-detection',
      });
    });

    it('should handle batch processing errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Batch processing failed'));

      await expect(service.processBatch(['test'])).rejects.toThrow('Batch processing failed');
    });
  });

  describe('Model Training', () => {
    it('should train model successfully', async () => {
      const mockResponse = { data: { success: true } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.trainModel('test-model', {
        data: ['training-data'],
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/vision/models/test-model/train', {
        data: ['training-data'],
      });
    });

    it('should evaluate model successfully', async () => {
      const mockResponse = { data: { metrics: { accuracy: 0.95 } } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.evaluateModel('test-model', {
        data: ['test-data'],
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/vision/models/test-model/evaluate', {
        data: ['test-data'],
      });
    });

    it('should handle model training errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Model training failed'));

      await expect(service.trainModel('test-model', {})).rejects.toThrow('Model training failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(service.detectObjects('test')).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      mockAxios.post.mockRejectedValue({
        response: { data: { error: 'API error' } },
      });

      await expect(service.detectObjects('test')).rejects.toThrow('API error');
    });

    it('should handle timeout errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('timeout'));

      await expect(service.detectObjects('test')).rejects.toThrow('timeout');
    });
  });
}); 