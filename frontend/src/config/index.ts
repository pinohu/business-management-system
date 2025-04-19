import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

// Environment type
type Environment = 'development' | 'production' | 'test';

// Configuration interface
interface Config {
  // Environment
  env: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // API
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
  };

  // Authentication
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpiry: number;
    refreshTokenExpiry: number;
  };

  // AI Services
  ai: {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    batchSize: number;
    models: {
      text: string[];
      code: string[];
      speech: string[];
    };
  };

  // Vision Services
  vision: {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    batchSize: number;
    models: {
      object: string[];
      face: string[];
      scene: string[];
    };
    image: {
      maxSize: number;
      allowedTypes: string[];
      maxWidth: number;
      maxHeight: number;
    };
    video: {
      maxSize: number;
      allowedTypes: string[];
      maxDuration: number;
      maxFps: number;
    };
  };

  // Analytics
  analytics: {
    enabled: boolean;
    trackingId: string;
    debug: boolean;
    matomoUrl: string;
  };

  // Logging
  logging: {
    level: string;
    format: string;
    transports: string[];
    filename: string;
    maxSize: number;
    maxFiles: number;
  };

  // Monitoring
  monitoring: {
    enabled: boolean;
    endpoint: string;
    interval: number;
    timeout: number;
  };

  // Security
  security: {
    csrfEnabled: boolean;
    xssEnabled: boolean;
    corsEnabled: boolean;
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
    };
  };
}

// Default configuration
const defaultConfig: Config = {
  // Environment
  env: (process.env.NODE_ENV as Environment) || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // API
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.API_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000', 10),
  },

  // Authentication
  auth: {
    tokenKey: process.env.AUTH_TOKEN_KEY || 'auth_token',
    refreshTokenKey: process.env.AUTH_REFRESH_TOKEN_KEY || 'auth_refresh_token',
    tokenExpiry: parseInt(process.env.AUTH_TOKEN_EXPIRY || '3600', 10),
    refreshTokenExpiry: parseInt(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '86400', 10),
  },

  // AI Services
  ai: {
    baseUrl: process.env.AI_BASE_URL || 'http://localhost:3000/api/ai',
    timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
    batchSize: parseInt(process.env.AI_BATCH_SIZE || '10', 10),
    models: {
      text: ['t5-base', 'bert-base-uncased', 'roberta-base'],
      code: ['codebert', 'codegen'],
      speech: ['whisper', 'fastspeech2'],
    },
  },

  // Vision Services
  vision: {
    baseUrl: process.env.VISION_BASE_URL || 'http://localhost:3000/api/vision',
    timeout: parseInt(process.env.VISION_TIMEOUT || '60000', 10),
    maxRetries: parseInt(process.env.VISION_MAX_RETRIES || '3', 10),
    batchSize: parseInt(process.env.VISION_BATCH_SIZE || '10', 10),
    models: {
      object: ['yolov5', 'yolov8'],
      face: ['facenet', 'arcface'],
      scene: ['resnet50', 'efficientnet'],
    },
    image: {
      maxSize: parseInt(process.env.MAX_IMAGE_SIZE || '10485760', 10), // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxWidth: parseInt(process.env.MAX_IMAGE_WIDTH || '4096', 10),
      maxHeight: parseInt(process.env.MAX_IMAGE_HEIGHT || '4096', 10),
    },
    video: {
      maxSize: parseInt(process.env.MAX_VIDEO_SIZE || '104857600', 10), // 100MB
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
      maxDuration: parseInt(process.env.MAX_VIDEO_DURATION || '300', 10), // 5 minutes
      maxFps: parseInt(process.env.MAX_VIDEO_FPS || '30', 10),
    },
  },

  // Analytics
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    trackingId: process.env.MATOMO_SITE_ID || '1',
    debug: process.env.ANALYTICS_DEBUG === 'true',
    matomoUrl: process.env.MATOMO_URL || 'http://localhost:8080',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    transports: (process.env.LOG_TRANSPORTS || 'console').split(','),
    filename: process.env.LOG_FILENAME || 'app.log',
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '5242880', 10),
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
  },

  // Monitoring
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    endpoint: process.env.MONITORING_ENDPOINT || 'http://localhost:9090',
    interval: parseInt(process.env.MONITORING_INTERVAL || '60000', 10),
    timeout: parseInt(process.env.MONITORING_TIMEOUT || '5000', 10),
  },

  // Security
  security: {
    csrfEnabled: process.env.SECURITY_CSRF_ENABLED === 'true',
    xssEnabled: process.env.SECURITY_XSS_ENABLED === 'true',
    corsEnabled: process.env.SECURITY_CORS_ENABLED === 'true',
    rateLimit: {
      enabled: process.env.SECURITY_RATE_LIMIT_ENABLED === 'true',
      windowMs: parseInt(process.env.SECURITY_RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.SECURITY_RATE_LIMIT_MAX || '100', 10),
    },
  },
};

// Validate configuration
const validateConfig = (config: Config): void => {
  // Validate environment
  if (!['development', 'production', 'test'].includes(config.env)) {
    throw new Error('Invalid environment');
  }

  // Validate API configuration
  if (!config.api.baseUrl) {
    throw new Error('API base URL is required');
  }
  if (config.api.timeout < 1000) {
    throw new Error('API timeout must be at least 1000ms');
  }
  if (config.api.retries < 0) {
    throw new Error('API retries must be non-negative');
  }
  if (config.api.retryDelay < 0) {
    throw new Error('API retry delay must be non-negative');
  }

  // Validate authentication configuration
  if (!config.auth.tokenKey) {
    throw new Error('Auth token key is required');
  }
  if (!config.auth.refreshTokenKey) {
    throw new Error('Auth refresh token key is required');
  }
  if (config.auth.tokenExpiry < 60) {
    throw new Error('Auth token expiry must be at least 60 seconds');
  }
  if (config.auth.refreshTokenExpiry < 3600) {
    throw new Error('Auth refresh token expiry must be at least 3600 seconds');
  }

  // Validate AI services configuration
  if (!config.ai.baseUrl) {
    throw new Error('AI base URL is required');
  }
  if (config.ai.timeout < 1000) {
    throw new Error('AI timeout must be at least 1000ms');
  }
  if (config.ai.maxRetries < 0) {
    throw new Error('AI max retries must be non-negative');
  }
  if (config.ai.batchSize < 1) {
    throw new Error('AI batch size must be at least 1');
  }

  // Validate vision services configuration
  if (!config.vision.baseUrl) {
    throw new Error('Vision base URL is required');
  }
  if (config.vision.timeout < 1000) {
    throw new Error('Vision timeout must be at least 1000ms');
  }
  if (config.vision.maxRetries < 0) {
    throw new Error('Vision max retries must be non-negative');
  }
  if (config.vision.batchSize < 1) {
    throw new Error('Vision batch size must be at least 1');
  }

  // Validate image configuration
  if (config.vision.image.maxSize < 1024) {
    throw new Error('Vision image max size must be at least 1KB');
  }
  if (config.vision.image.maxWidth < 100) {
    throw new Error('Vision image max width must be at least 100px');
  }
  if (config.vision.image.maxHeight < 100) {
    throw new Error('Vision image max height must be at least 100px');
  }

  // Validate video configuration
  if (config.vision.video.maxSize < 1024 * 1024) {
    throw new Error('Vision video max size must be at least 1MB');
  }
  if (config.vision.video.maxDuration < 1) {
    throw new Error('Vision video max duration must be at least 1 second');
  }
  if (config.vision.video.maxFps < 1) {
    throw new Error('Vision video max FPS must be at least 1');
  }

  // Validate logging configuration
  if (!['error', 'warn', 'info', 'debug'].includes(config.logging.level)) {
    throw new Error('Invalid log level');
  }
  if (!['json', 'text'].includes(config.logging.format)) {
    throw new Error('Invalid log format');
  }
  if (config.logging.maxSize < 1024) {
    throw new Error('Log max size must be at least 1KB');
  }
  if (config.logging.maxFiles < 1) {
    throw new Error('Log max files must be at least 1');
  }

  // Validate monitoring configuration
  if (config.monitoring.enabled && !config.monitoring.endpoint) {
    throw new Error('Monitoring endpoint is required when monitoring is enabled');
  }
  if (config.monitoring.interval < 1000) {
    throw new Error('Monitoring interval must be at least 1000ms');
  }
  if (config.monitoring.timeout < 1000) {
    throw new Error('Monitoring timeout must be at least 1000ms');
  }

  // Validate security configuration
  if (config.security.rateLimit.enabled) {
    if (config.security.rateLimit.windowMs < 1000) {
      throw new Error('Rate limit window must be at least 1000ms');
    }
    if (config.security.rateLimit.max < 1) {
      throw new Error('Rate limit max must be at least 1');
    }
  }
};

// Validate and export configuration
validateConfig(defaultConfig);
export default defaultConfig;
