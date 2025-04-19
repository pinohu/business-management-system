import axios from 'axios';
import { API_BASE_URL } from '../config';

class VisionService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/vision`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Object Detection
  async detectObjects(image, options = {}) {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('options', JSON.stringify(options));

      const response = await this.api.post('/detect-objects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error detecting objects:', error);
      throw error;
    }
  }

  // Face Recognition
  async recognizeFaces(image, options = {}) {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('options', JSON.stringify(options));

      const response = await this.api.post('/recognize-faces', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error recognizing faces:', error);
      throw error;
    }
  }

  // Scene Understanding
  async analyzeScene(image, options = {}) {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('options', JSON.stringify(options));

      const response = await this.api.post('/analyze-scene', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error analyzing scene:', error);
      throw error;
    }
  }

  // OCR
  async extractText(image, options = {}) {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('options', JSON.stringify(options));

      const response = await this.api.post('/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  }

  // Video Processing
  async processVideo(video, options = {}) {
    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('options', JSON.stringify(options));

      const response = await this.api.post('/process-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }

  // Model Management
  async getAvailableModels() {
    try {
      const response = await this.api.get('/models');
      return response.data;
    } catch (error) {
      console.error('Error getting available models:', error);
      throw error;
    }
  }

  async getModelStatus(modelId) {
    try {
      const response = await this.api.get(`/models/${modelId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting model status:', error);
      throw error;
    }
  }

  async updateModel(modelId, options = {}) {
    try {
      const response = await this.api.put(`/models/${modelId}`, options);
      return response.data;
    } catch (error) {
      console.error('Error updating model:', error);
      throw error;
    }
  }

  // Analytics
  async getProcessingStats() {
    try {
      const response = await this.api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting processing stats:', error);
      throw error;
    }
  }

  async getModelPerformance(modelId) {
    try {
      const response = await this.api.get(`/models/${modelId}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error getting model performance:', error);
      throw error;
    }
  }

  // Error Handling
  handleError(error) {
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data);
      throw new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response
      console.error('No response:', error.request);
      throw new Error('No response from server');
    } else {
      // Request setup error
      console.error('Request error:', error.message);
      throw new Error('Error setting up request');
    }
  }
}

export default new VisionService(); 