import axios from 'axios';
import config from '../config';

class AIService {
  constructor() {
    this.baseURL = config.api.baseURL;
    this.maxRetries = config.api.retries;
    this.retryDelay = config.api.retryDelay;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup request interceptor for retry logic
    this.setupRequestInterceptor();
    // Setup response interceptor for error handling
    this.setupResponseInterceptor();
  }

  setupRequestInterceptor() {
    this.client.interceptors.request.use(
      config => {
        // Add request timestamp for tracking
        config.metadata = { startTime: new Date() };
        return config;
      },
      error => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );
  }

  setupResponseInterceptor() {
    this.client.interceptors.response.use(
      response => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime;
        console.debug(`Request completed in ${duration}ms`);
        return response;
      },
      async error => {
        const { config, response } = error;
        
        // Handle network errors
        if (!response) {
          console.error('Network error:', error);
          return Promise.reject(new Error('Network error occurred'));
        }

        // Handle specific HTTP errors
        switch (response.status) {
          case 400:
            return Promise.reject(new Error('Invalid request'));
          case 401:
            return Promise.reject(new Error('Unauthorized'));
          case 403:
            return Promise.reject(new Error('Forbidden'));
          case 404:
            return Promise.reject(new Error('Resource not found'));
          case 429:
            return Promise.reject(new Error('Rate limit exceeded'));
          case 500:
            return Promise.reject(new Error('Server error'));
          default:
            return Promise.reject(new Error('An unexpected error occurred'));
        }
      }
    );
  }

  // Helper method for making API calls with retry logic
  async makeRequest(method, url, data = null, options = {}) {
    let lastError;
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await this.client[method](url, data, options);
        return response.data;
      } catch (error) {
        lastError = error;
        if (i < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          continue;
        }
      }
    }
    throw lastError;
  }

  // Text Processing with validation
  async analyzeText(text, options = {}) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }

    try {
      return await this.makeRequest('post', '/ai/analyze-text', {
        text,
        ...options,
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  async generateText(prompt, options = {}) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt input');
    }

    try {
      return await this.makeRequest('post', '/ai/generate-text', {
        prompt,
        ...options,
      });
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  // Code Intelligence with validation
  async analyzeCode(code, options = {}) {
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid code input');
    }

    try {
      return await this.makeRequest('post', '/ai/analyze-code', {
        code,
        ...options,
      });
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw error;
    }
  }

  async generateCode(prompt, options = {}) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt input');
    }

    try {
      return await this.makeRequest('post', '/ai/generate-code', {
        prompt,
        ...options,
      });
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  }

  // Speech Processing with validation
  async transcribeAudio(audioFile, options = {}) {
    if (!audioFile || !(audioFile instanceof File || audioFile instanceof Blob)) {
      throw new Error('Invalid audio file');
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      return await this.makeRequest('post', '/ai/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...options,
      });
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  async synthesizeSpeech(text, options = {}) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }

    try {
      return await this.makeRequest('post', '/ai/synthesize', {
        text,
        ...options,
      });
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  // Model Management with validation
  async getAvailableModels() {
    try {
      return await this.makeRequest('get', '/ai/models');
    } catch (error) {
      console.error('Error getting available models:', error);
      throw error;
    }
  }

  async getModelStatus(modelId) {
    if (!modelId || typeof modelId !== 'string') {
      throw new Error('Invalid model ID');
    }

    try {
      return await this.makeRequest('get', `/ai/models/${modelId}/status`);
    } catch (error) {
      console.error('Error getting model status:', error);
      throw error;
    }
  }

  async updateModel(modelId, config) {
    if (!modelId || typeof modelId !== 'string') {
      throw new Error('Invalid model ID');
    }
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid model configuration');
    }

    try {
      return await this.makeRequest('put', `/ai/models/${modelId}`, config);
    } catch (error) {
      console.error('Error updating model:', error);
      throw error;
    }
  }

  // Analytics with validation
  async getProcessingStats() {
    try {
      return await this.makeRequest('get', '/ai/stats');
    } catch (error) {
      console.error('Error getting processing stats:', error);
      throw error;
    }
  }

  async getModelPerformance(modelId) {
    if (!modelId || typeof modelId !== 'string') {
      throw new Error('Invalid model ID');
    }

    try {
      return await this.makeRequest('get', `/ai/models/${modelId}/performance`);
    } catch (error) {
      console.error('Error getting model performance:', error);
      throw error;
    }
  }

  // Batch Processing with validation
  async processBatch(items, options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid batch items');
    }

    try {
      return await this.makeRequest('post', '/ai/batch', {
        items,
        ...options,
      });
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    }
  }

  // Model Training with validation
  async trainModel(modelId, trainingData, options = {}) {
    if (!modelId || typeof modelId !== 'string') {
      throw new Error('Invalid model ID');
    }
    if (!trainingData || typeof trainingData !== 'object') {
      throw new Error('Invalid training data');
    }

    try {
      return await this.makeRequest('post', `/ai/models/${modelId}/train`, {
        trainingData,
        ...options,
      });
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }

  async evaluateModel(modelId, evaluationData, options = {}) {
    if (!modelId || typeof modelId !== 'string') {
      throw new Error('Invalid model ID');
    }
    if (!evaluationData || typeof evaluationData !== 'object') {
      throw new Error('Invalid evaluation data');
    }

    try {
      return await this.makeRequest('post', `/ai/models/${modelId}/evaluate`, {
        evaluationData,
        ...options,
      });
    } catch (error) {
      console.error('Error evaluating model:', error);
      throw error;
    }
  }
}

export const aiService = new AIService(); 