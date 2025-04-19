import { createWorker } from 'tesseract.js';
import * as faceapi from 'face-api.js';
import { Canvas, Image } from 'canvas';
import { logger } from '../../utils/logger';
import { Redis } from 'ioredis';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export class VisionService {
  private static instance: VisionService;
  private worker: Tesseract.Worker | null = null;
  private modelsLoaded = false;

  private constructor() {}

  public static getInstance(): VisionService {
    if (!VisionService.instance) {
      VisionService.instance = new VisionService();
    }
    return VisionService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize Tesseract worker
      this.worker = await createWorker('eng');

      // Load face-api models
      await faceapi.nets.ssdMobilenetv1.loadFromDisk('/models');
      await faceapi.nets.faceLandmark68Net.loadFromDisk('/models');
      await faceapi.nets.faceRecognitionNet.loadFromDisk('/models');

      this.modelsLoaded = true;
      logger.info('AI vision models loaded successfully');
    } catch (error) {
      logger.error('Failed to initialize AI vision service:', error);
      throw error;
    }
  }

  public async detectObjects(imageBuffer: Buffer): Promise<{
    objects: Array<{ label: string; confidence: number; bbox: number[] }>;
    processingTime: number;
  }> {
    try {
      const startTime = Date.now();

      // Convert buffer to canvas
      const image = new Image();
      image.src = imageBuffer;
      const canvas = new Canvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      // Detect objects using face-api
      const detections = await faceapi.detectAllFaces(canvas as any)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const objects = detections.map(detection => ({
        label: 'face',
        confidence: detection.detection.score,
        bbox: [
          detection.detection.box.x,
          detection.detection.box.y,
          detection.detection.box.width,
          detection.detection.box.height
        ]
      }));

      const processingTime = Date.now() - startTime;

      // Cache results
      await redis.setex(
        `vision:objects:${imageBuffer.toString('base64')}`,
        3600, // 1 hour cache
        JSON.stringify({ objects, processingTime })
      );

      return { objects, processingTime };
    } catch (error) {
      logger.error('Error in object detection:', error);
      throw error;
    }
  }

  public async recognizeFaces(imageBuffer: Buffer): Promise<{
    faces: Array<{
      descriptor: Float32Array;
      landmarks: faceapi.FaceLandmarks68;
      confidence: number;
    }>;
    processingTime: number;
  }> {
    try {
      const startTime = Date.now();

      // Convert buffer to canvas
      const image = new Image();
      image.src = imageBuffer;
      const canvas = new Canvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      // Detect and recognize faces
      const detections = await faceapi.detectAllFaces(canvas as any)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const faces = detections.map(detection => ({
        descriptor: detection.descriptor,
        landmarks: detection.landmarks,
        confidence: detection.detection.score
      }));

      const processingTime = Date.now() - startTime;

      // Cache results
      await redis.setex(
        `vision:faces:${imageBuffer.toString('base64')}`,
        3600, // 1 hour cache
        JSON.stringify({ faces, processingTime })
      );

      return { faces, processingTime };
    } catch (error) {
      logger.error('Error in face recognition:', error);
      throw error;
    }
  }

  public async extractText(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
    processingTime: number;
  }> {
    try {
      const startTime = Date.now();

      // Perform OCR
      const { data: { text, confidence } } = await this.worker!.recognize(imageBuffer);

      const processingTime = Date.now() - startTime;

      // Cache results
      await redis.setex(
        `vision:text:${imageBuffer.toString('base64')}`,
        3600, // 1 hour cache
        JSON.stringify({ text, confidence, processingTime })
      );

      return { text, confidence, processingTime };
    } catch (error) {
      logger.error('Error in text extraction:', error);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    try {
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }
      this.modelsLoaded = false;
      logger.info('AI vision service cleaned up successfully');
    } catch (error) {
      logger.error('Error cleaning up AI vision service:', error);
      throw error;
    }
  }
}
