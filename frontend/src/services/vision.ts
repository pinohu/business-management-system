import api from './api';
import config from '../config';

// Vision response interfaces
interface ObjectDetectionResponse {
  objects: {
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
  }[];
  image: string;
}

interface FaceDetectionResponse {
  faces: {
    landmarks: {
      eyes: [number, number][];
      nose: [number, number];
      mouth: [number, number][];
    };
    attributes: {
      age: number;
      gender: string;
      emotion: string;
    };
    confidence: number;
    bbox: [number, number, number, number];
  }[];
  image: string;
}

interface SceneClassificationResponse {
  scenes: {
    label: string;
    confidence: number;
  }[];
  image: string;
}

interface OCRResponse {
  text: string;
  confidence: number;
  words: {
    text: string;
    confidence: number;
    bbox: [number, number, number, number];
  }[];
  image: string;
}

// Vision service class
class VisionService {
  // Image processing
  async detectObjects(imageFile: File, options: {
    model?: string;
    confidence?: number;
    maxObjects?: number;
  } = {}): Promise<ObjectDetectionResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<ObjectDetectionResponse>('/vision/objects/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        model: options.model || config.vision.models.object[0],
        confidence: options.confidence || 0.5,
        maxObjects: options.maxObjects || 10,
      },
    });
    return response;
  }

  async detectFaces(imageFile: File, options: {
    model?: string;
    confidence?: number;
    maxFaces?: number;
    attributes?: string[];
  } = {}): Promise<FaceDetectionResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<FaceDetectionResponse>('/vision/faces/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        model: options.model || config.vision.models.face[0],
        confidence: options.confidence || 0.5,
        maxFaces: options.maxFaces || 10,
        attributes: options.attributes || ['age', 'gender', 'emotion'],
      },
    });
    return response;
  }

  async classifyScene(imageFile: File, options: {
    model?: string;
    confidence?: number;
    maxScenes?: number;
  } = {}): Promise<SceneClassificationResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<SceneClassificationResponse>('/vision/scenes/classify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        model: options.model || config.vision.models.scene[0],
        confidence: options.confidence || 0.5,
        maxScenes: options.maxScenes || 5,
      },
    });
    return response;
  }

  // Video processing
  async processVideo(videoFile: File, options: {
    model?: string;
    confidence?: number;
    maxFrames?: number;
    fps?: number;
  } = {}): Promise<{
    frames: {
      timestamp: number;
      objects: ObjectDetectionResponse['objects'];
      faces: FaceDetectionResponse['faces'];
      scenes: SceneClassificationResponse['scenes'];
    }[];
    video: string;
  }> {
    const formData = new FormData();
    formData.append('video', videoFile);

    const response = await api.post<{
      frames: {
        timestamp: number;
        objects: ObjectDetectionResponse['objects'];
        faces: FaceDetectionResponse['faces'];
        scenes: SceneClassificationResponse['scenes'];
      }[];
      video: string;
    }>('/vision/video/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        model: options.model || config.vision.models.object[0],
        confidence: options.confidence || 0.5,
        maxFrames: options.maxFrames || 30,
        fps: options.fps || 1,
      },
    });
    return response;
  }

  // OCR processing
  async recognizeText(imageFile: File, options: {
    model?: string;
    language?: string;
    confidence?: number;
  } = {}): Promise<OCRResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<OCRResponse>('/vision/ocr/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        model: options.model || 'tesseract',
        language: options.language || 'eng',
        confidence: options.confidence || 0.5,
      },
    });
    return response;
  }

  // Model management
  async getAvailableModels(): Promise<{
    object: string[];
    face: string[];
    scene: string[];
  }> {
    const response = await api.get<{
      object: string[];
      face: string[];
      scene: string[];
    }>('/vision/models');
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
    }>(`/vision/models/${modelId}/status`);
    return response;
  }

  async updateModel(modelId: string, options: {
    version?: string;
    parameters?: Record<string, any>;
  } = {}): Promise<void> {
    await api.patch(`/vision/models/${modelId}`, options);
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
    }>('/vision/analytics/stats');
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
    }>(`/vision/analytics/models/${modelId}`);
    return response;
  }

  // Batch processing
  async processBatch(images: File[], options: {
    type: 'object' | 'face' | 'scene' | 'ocr';
    model?: string;
    maxBatchSize?: number;
  }): Promise<any[]> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    const response = await api.post<any[]>(`/vision/batch/${options.type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        model: options.model,
        maxBatchSize: options.maxBatchSize || config.vision.batchSize,
      },
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
    }>(`/vision/models/${modelId}/train`, {
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
    }>(`/vision/models/${modelId}/evaluate`, { data });
    return response;
  }
}

// Export vision service instance
export default new VisionService(); 