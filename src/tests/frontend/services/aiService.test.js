import { jest } from '@jest/globals';
import { AIService } from '../../../frontend/services/aiService';
import axios from 'axios';
import config from '../../../frontend/config';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../frontend/config');

describe('AIService', () => {
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
    service = new AIService();
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

  describe('Text Processing', () => {
    it('should analyze text successfully', async () => {
      const mockResponse = { data: { sentiment: 'positive', confidence: 0.95 } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.analyzeText('Hello world', {
        type: 'sentiment-analysis',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/analyze', {
        text: 'Hello world',
        type: 'sentiment-analysis',
      });
    });

    it('should generate text successfully', async () => {
      const mockResponse = { data: { generatedText: 'Generated content' } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.generateText('Write a story about', {
        maxLength: 100,
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/generate', {
        prompt: 'Write a story about',
        maxLength: 100,
      });
    });

    it('should handle text processing errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Processing failed'));

      await expect(service.analyzeText('test')).rejects.toThrow('Processing failed');
    });
  });

  describe('Code Intelligence', () => {
    it('should analyze code successfully', async () => {
      const mockResponse = { data: { issues: [], suggestions: [] } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.analyzeCode('function test() {}', {
        language: 'javascript',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/analyze-code', {
        code: 'function test() {}',
        language: 'javascript',
      });
    });

    it('should generate code successfully', async () => {
      const mockResponse = { data: { code: 'function test() {}' } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.generateCode('Write a function to sort array', {
        language: 'javascript',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/generate-code', {
        prompt: 'Write a function to sort array',
        language: 'javascript',
      });
    });

    it('should handle code processing errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Code analysis failed'));

      await expect(service.analyzeCode('test')).rejects.toThrow('Code analysis failed');
    });
  });

  describe('Speech Processing', () => {
    it('should transcribe audio successfully', async () => {
      const mockResponse = { data: { text: 'Transcribed text' } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.transcribeAudio('audio-data', {
        language: 'en',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/transcribe', {
        audio: 'audio-data',
        language: 'en',
      });
    });

    it('should synthesize speech successfully', async () => {
      const mockResponse = { data: { audio: 'synthesized-audio' } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await service.synthesizeSpeech('Text to speak', {
        voice: 'en-US',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/synthesize', {
        text: 'Text to speak',
        voice: 'en-US',
      });
    });

    it('should handle speech processing errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('Speech processing failed'));

      await expect(service.transcribeAudio('test')).rejects.toThrow('Speech processing failed');
    });
  });

  describe('Model Management', () => {
    it('should get available models successfully', async () => {
      const mockResponse = { data: { models: ['model1', 'model2'] } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getAvailableModels();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/ai/models');
    });

    it('should get model status successfully', async () => {
      const mockResponse = { data: { status: 'active' } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getModelStatus('test-model');

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/ai/models/test-model/status');
    });

    it('should update model successfully', async () => {
      const mockResponse = { data: { success: true } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await service.updateModel('test-model', {
        config: { new: 'config' },
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.put).toHaveBeenCalledWith('/api/ai/models/test-model', {
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
      expect(mockAxios.get).toHaveBeenCalledWith('/api/ai/stats');
    });

    it('should get model performance successfully', async () => {
      const mockResponse = { data: { accuracy: 0.95, latency: 100 } };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getModelPerformance('test-model');

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/ai/models/test-model/performance');
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

      const result = await service.processBatch(['item1', 'item2'], {
        type: 'text-classification',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/batch', {
        items: ['item1', 'item2'],
        type: 'text-classification',
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
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/models/test-model/train', {
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
      expect(mockAxios.post).toHaveBeenCalledWith('/api/ai/models/test-model/evaluate', {
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

      await expect(service.analyzeText('test')).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      mockAxios.post.mockRejectedValue({
        response: { data: { error: 'API error' } },
      });

      await expect(service.analyzeText('test')).rejects.toThrow('API error');
    });

    it('should handle timeout errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('timeout'));

      await expect(service.analyzeText('test')).rejects.toThrow('timeout');
    });
  });
}); 