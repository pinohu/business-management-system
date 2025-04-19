const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    security: {
      requireAuth: true,
      tokenHeader: 'Authorization',
      tokenPrefix: 'Bearer',
      refreshTokenEnabled: true,
      tokenExpiry: 3600, // 1 hour
    },
  },

  // Vision Service Configuration
  vision: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    supportedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxVideoDuration: 300, // 5 minutes
    confidenceThreshold: 0.7,
    batchSize: 10,
    cacheEnabled: true,
    cacheTTL: 3600, // 1 hour
    security: {
      maxConcurrentRequests: 5,
      rateLimit: {
        requests: 100,
        window: 60000, // 1 minute
      },
    },
  },

  // Model Configuration
  models: {
    defaultModels: {
      objectDetection: 'yolo',
      faceRecognition: 'facenet',
      sceneUnderstanding: 'resnet',
      textRecognition: 'tesseract',
      textClassification: 'bert',
      namedEntityRecognition: 'spacy',
      textGeneration: 'gpt2',
      codeIntelligence: 'codebert',
      speechProcessing: 'whisper',
    },
    thresholds: {
      confidence: 0.7,
      accuracy: 0.8,
      latency: 1000, // 1 second
    },
    security: {
      modelValidation: true,
      inputSanitization: true,
      outputValidation: true,
      maxInputLength: 10000,
      maxOutputLength: 5000,
    },
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#1976d2',
      secondary: '#dc004e',
      background: '#f5f5f5',
      surface: '#ffffff',
      error: '#f44336',
      success: '#4caf50',
      warning: '#ff9800',
      info: '#2196f3',
    },
    layout: {
      maxWidth: 1200,
      padding: 24,
      spacing: 8,
    },
    components: {
      button: {
        borderRadius: 4,
        padding: '8px 16px',
        fontSize: 14,
      },
      card: {
        borderRadius: 8,
        elevation: 2,
        padding: 16,
      },
      input: {
        borderRadius: 4,
        padding: '8px 12px',
        fontSize: 14,
      },
    },
    animations: {
      duration: {
        short: 200,
        medium: 300,
        long: 500,
      },
      easing: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
        decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
    security: {
      inputValidation: true,
      xssPrevention: true,
      csrfProtection: true,
    },
  },

  // Analytics Configuration
  analytics: {
    trackingId: process.env.REACT_APP_ANALYTICS_ID,
    events: {
      pageView: true,
      userAction: true,
      error: true,
      performance: true,
    },
    security: {
      anonymizeData: true,
      respectDoNotTrack: true,
      dataRetention: 30, // days
    },
  },

  // Error Messages
  errors: {
    messages: {
      fileUpload: 'Failed to upload file. Please try again.',
      processing: 'Failed to process input. Please try again.',
      modelLoad: 'Failed to load model. Please try again.',
      network: 'Network error. Please check your connection.',
      server: 'Server error. Please try again later.',
      validation: 'Invalid input data. Please check your input.',
      security: 'Security check failed. Please try again.',
      rateLimit: 'Too many requests. Please wait a moment.',
    },
  },

  // Success Messages
  success: {
    messages: {
      fileUpload: 'File uploaded successfully.',
      processing: 'Processing completed successfully.',
      modelUpdate: 'Model updated successfully.',
    },
  },

  // Loading States
  loading: {
    states: {
      uploading: 'Uploading...',
      processing: 'Processing...',
      training: 'Training...',
      evaluating: 'Evaluating...',
    },
    timeout: 30000, // 30 seconds
  },

  // Cache Keys
  cache: {
    keys: {
      models: 'ai:models',
      results: 'ai:results',
      stats: 'ai:stats',
    },
    security: {
      encryption: true,
      maxSize: 100 * 1024 * 1024, // 100MB
      cleanupInterval: 3600000, // 1 hour
    },
  },

  // API Endpoints
  endpoints: {
    vision: {
      detect: '/vision/detect',
      recognize: '/vision/recognize',
      classify: '/vision/classify',
      ocr: '/vision/ocr',
    },
    models: {
      list: '/ai/models',
      status: '/ai/models/:id/status',
      update: '/ai/models/:id',
      train: '/ai/models/:id/train',
      evaluate: '/ai/models/:id/evaluate',
    },
    analytics: {
      stats: '/ai/stats',
      performance: '/ai/models/:id/performance',
    },
    security: {
      auth: '/auth',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
    },
  },

  // Feature Flags
  features: {
    videoProcessing: true,
    batchProcessing: true,
    modelTraining: true,
    errorReporting: true,
    analytics: true,
    caching: true,
    security: {
      authentication: true,
      authorization: true,
      rateLimiting: true,
      inputValidation: true,
      outputValidation: true,
      encryption: true,
    },
  },

  // Security Configuration
  security: {
    authentication: {
      enabled: true,
      method: 'jwt',
      tokenExpiry: 3600,
      refreshTokenExpiry: 604800, // 7 days
    },
    authorization: {
      enabled: true,
      roles: ['user', 'admin', 'developer'],
      permissions: ['read', 'write', 'execute', 'manage'],
    },
    rateLimiting: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000,
    },
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: 86400, // 24 hours
    },
    logging: {
      enabled: true,
      level: 'info',
      retention: 30, // days
    },
  },
};

// Validate configuration
const validateConfig = (config) => {
  const requiredFields = [
    'api.baseURL',
    'api.timeout',
    'api.retries',
    'api.retryDelay',
    'vision.maxFileSize',
    'models.defaultModels',
    'ui.theme',
    'security.authentication',
  ];

  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    if (value === undefined) {
      throw new Error(`Missing required configuration field: ${field}`);
    }
  }

  // Validate numeric values
  if (config.api.timeout <= 0) {
    throw new Error('API timeout must be positive');
  }
  if (config.api.retries < 0) {
    throw new Error('API retries must be non-negative');
  }
  if (config.vision.maxFileSize <= 0) {
    throw new Error('Max file size must be positive');
  }

  // Validate security settings
  if (config.security.authentication.enabled && !config.security.authentication.method) {
    throw new Error('Authentication method must be specified when enabled');
  }

  return true;
};

// Validate configuration on import
validateConfig(config);

export default config; 