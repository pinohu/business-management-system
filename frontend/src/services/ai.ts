import api from './api';
import config from '../config';

// AI response interfaces
interface TextAnalysisResponse {
  sentiment: string;
  entities: string[];
  keywords: string[];
  summary: string;
}

interface CodeAnalysisResponse {
  complexity: number;
  issues: {
    type: string;
    message: string;
    line: number;
  }[];
  suggestions: string[];
}

interface SpeechRecognitionResponse {
  text: string;
  confidence: number;
  segments: {
    text: string;
    start: number;
    end: number;
    confidence: number;
  }[];
}

// AI service class
class AIService {
  // Text processing
  async analyzeText(text: string, options: {
    model?: string;
    language?: string;
    maxLength?: number;
  } = {}): Promise<TextAnalysisResponse> {
    const response = await api.post<TextAnalysisResponse>('/ai/text/analyze', {
      text,
      model: options.model || config.ai.models.text[0],
      language: options.language || 'en',
      maxLength: options.maxLength || 1000,
    });
    return response;
  }

  async generateText(prompt: string, options: {
    model?: string;
    maxLength?: number;
    temperature?: number;
    topP?: number;
  } = {}): Promise<string> {
    const response = await api.post<{ text: string }>('/ai/text/generate', {
      prompt,
      model: options.model || config.ai.models.text[0],
      maxLength: options.maxLength || 1000,
      temperature: options.temperature || 0.7,
      topP: options.topP || 0.9,
    });
    return response.text;
  }

  // Code processing
  async analyzeCode(code: string, options: {
    model?: string;
    language?: string;
    maxLength?: number;
  } = {}): Promise<CodeAnalysisResponse> {
    const response = await api.post<CodeAnalysisResponse>('/ai/code/analyze', {
      code,
      model: options.model || config.ai.models.code[0],
      language: options.language || 'javascript',
      maxLength: options.maxLength || 1000,
    });
    return response;
  }

  async generateCode(prompt: string, options: {
    model?: string;
    language?: string;
    maxLength?: number;
    temperature?: number;
  } = {}): Promise<string> {
    const response = await api.post<{ code: string }>('/ai/code/generate', {
      prompt,
      model: options.model || config.ai.models.code[0],
      language: options.language || 'javascript',
      maxLength: options.maxLength || 1000,
      temperature: options.temperature || 0.7,
    });
    return response.code;
  }

  // Speech processing
  async transcribeAudio(audioFile: File, options: {
    model?: string;
    language?: string;
    maxDuration?: number;
  } = {}): Promise<SpeechRecognitionResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await api.post<SpeechRecognitionResponse>('/ai/speech/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        model: options.model || config.ai.models.speech[0],
        language: options.language || 'en',
        maxDuration: options.maxDuration || 300,
      },
    });
    return response;
  }

  async synthesizeSpeech(text: string, options: {
    model?: string;
    language?: string;
    voice?: string;
    speed?: number;
  } = {}): Promise<Blob> {
    const response = await api.post('/ai/speech/synthesize', {
      text,
      model: options.model || config.ai.models.speech[0],
      language: options.language || 'en',
      voice: options.voice || 'default',
      speed: options.speed || 1.0,
    }, {
      responseType: 'blob',
    });
    return response;
  }

  // Model management
  async getAvailableModels(): Promise<{
    text: string[];
    code: string[];
    speech: string[];
  }> {
    const response = await api.get<{
      text: string[];
      code: string[];
      speech: string[];
    }>('/ai/models');
    return response;
  }

  async getModelStatus(modelId: string): Promise<{
    status: string;
    progress?: number;
    error?: string;
  }> {
    const response = await api.get<{
      status: string;
      progress?: number;
      error?: string;
    }>(`/ai/models/${modelId}/status`);
    return response;
  }

  async updateModel(modelId: string, options: {
    version?: string;
    parameters?: Record<string, any>;
  } = {}): Promise<void> {
    await api.patch(`/ai/models/${modelId}`, options);
  }

  // Analytics
  async getProcessingStats(): Promise<{
    totalRequests: number;
    successRate: number;
    averageLatency: number;
    modelUsage: Record<string, number>;
  }> {
    const response = await api.get<{
      totalRequests: number;
      successRate: number;
      averageLatency: number;
      modelUsage: Record<string, number>;
    }>('/ai/analytics/stats');
    return response;
  }

  async getModelPerformance(modelId: string): Promise<{
    accuracy: number;
    latency: number;
    throughput: number;
    errorRate: number;
  }> {
    const response = await api.get<{
      accuracy: number;
      latency: number;
      throughput: number;
      errorRate: number;
    }>(`/ai/analytics/models/${modelId}`);
    return response;
  }

  // Batch processing
  async processBatch(items: string[], options: {
    type: 'text' | 'code' | 'speech';
    model?: string;
    maxBatchSize?: number;
  }): Promise<any[]> {
    const response = await api.post<any[]>('/ai/batch/process', {
      items,
      type: options.type,
      model: options.model,
      maxBatchSize: options.maxBatchSize || config.ai.batchSize,
    });
    return response;
  }

  // Model training
  async trainModel(modelId: string, data: any[], options: {
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
  } = {}): Promise<{
    status: string;
    progress: number;
    metrics: Record<string, number>;
  }> {
    const response = await api.post<{
      status: string;
      progress: number;
      metrics: Record<string, number>;
    }>(`/ai/models/${modelId}/train`, {
      data,
      epochs: options.epochs || 10,
      batchSize: options.batchSize || 32,
      learningRate: options.learningRate || 0.001,
    });
    return response;
  }

  async evaluateModel(modelId: string, data: any[]): Promise<{
    accuracy: number;
    loss: number;
    metrics: Record<string, number>;
  }> {
    const response = await api.post<{
      accuracy: number;
      loss: number;
      metrics: Record<string, number>;
    }>(`/ai/models/${modelId}/evaluate`, { data });
    return response;
  }
}

// Export AI service instance
export default new AIService(); 