import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment type
type Environment = 'development' | 'production' | 'test';

// Configuration interface
interface Config {
  env: Environment;
  port: number;
  mongodb: {
    uri: string;
    ssl: boolean;
    authSource: string;
    user?: string;
    password?: string;
  };
  redis: {
    url: string;
    password?: string;
    db: number;
    keyPrefix: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  ai: {
    models: {
      text: string[];
      vision: string[];
      code: string[];
      speech: string[];
    };
    batchSize: number;
    maxConcurrent: number;
    timeout: number;
  };
  vision: {
    maxImageSize: number;
    supportedFormats: string[];
    maxConcurrent: number;
    timeout: number;
  };
  logging: {
    level: string;
    format: string;
    file?: {
      path: string;
      maxSize: string;
      maxFiles: number;
    };
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    retention: number;
    alertThresholds: {
      cpu: number;
      memory: number;
      disk: number;
      errorRate: number;
      latency: number;
    };
  };
  security: {
    bcryptRounds: number;
    sessionSecret: string;
    csrfEnabled: boolean;
    rateLimitEnabled: boolean;
    corsEnabled: boolean;
    helmetEnabled: boolean;
  };
}

// Default configuration
const defaultConfig: Config = {
  env: (process.env.NODE_ENV as Environment) || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-service',
    ssl: process.env.MONGODB_SSL === 'true',
    authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'ai-service:'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  },
  ai: {
    models: {
      text: (process.env.AI_TEXT_MODELS || 'gpt-3.5-turbo,gpt-4').split(','),
      vision: (process.env.AI_VISION_MODELS || 'resnet50,yolo').split(','),
      code: (process.env.AI_CODE_MODELS || 'codex,codegen').split(','),
      speech: (process.env.AI_SPEECH_MODELS || 'whisper,tacotron').split(',')
    },
    batchSize: parseInt(process.env.AI_BATCH_SIZE || '10', 10),
    maxConcurrent: parseInt(process.env.AI_MAX_CONCURRENT || '5', 10),
    timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10)
  },
  vision: {
    maxImageSize: parseInt(process.env.VISION_MAX_IMAGE_SIZE || '10485760', 10), // 10MB
    supportedFormats: (process.env.VISION_SUPPORTED_FORMATS || 'jpg,jpeg,png,gif').split(','),
    maxConcurrent: parseInt(process.env.VISION_MAX_CONCURRENT || '5', 10),
    timeout: parseInt(process.env.VISION_TIMEOUT || '30000', 10)
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE ? {
      path: process.env.LOG_FILE,
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10)
    } : undefined
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    interval: parseInt(process.env.MONITORING_INTERVAL || '60000', 10),
    retention: parseInt(process.env.MONITORING_RETENTION || '30', 10),
    alertThresholds: {
      cpu: parseInt(process.env.MONITORING_CPU_THRESHOLD || '80', 10),
      memory: parseInt(process.env.MONITORING_MEMORY_THRESHOLD || '85', 10),
      disk: parseInt(process.env.MONITORING_DISK_THRESHOLD || '90', 10),
      errorRate: parseInt(process.env.MONITORING_ERROR_RATE_THRESHOLD || '5', 10),
      latency: parseInt(process.env.MONITORING_LATENCY_THRESHOLD || '1000', 10)
    }
  },
  security: {
    bcryptRounds: parseInt(process.env.SECURITY_BCRYPT_ROUNDS || '10', 10),
    sessionSecret: process.env.SECURITY_SESSION_SECRET || 'your-session-secret',
    csrfEnabled: process.env.SECURITY_CSRF_ENABLED === 'true',
    rateLimitEnabled: process.env.SECURITY_RATE_LIMIT_ENABLED === 'true',
    corsEnabled: process.env.SECURITY_CORS_ENABLED === 'true',
    helmetEnabled: process.env.SECURITY_HELMET_ENABLED === 'true'
  }
};

// Validate configuration
function validateConfig(config: Config): void {
  // Validate required environment variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });

  // Validate numeric values
  if (config.port < 1 || config.port > 65535) {
    throw new Error('Invalid port number');
  }

  if (config.mongodb.db < 0) {
    throw new Error('Invalid MongoDB database number');
  }

  if (config.rateLimit.windowMs < 1000) {
    throw new Error('Rate limit window must be at least 1 second');
  }

  if (config.rateLimit.max < 1) {
    throw new Error('Rate limit max must be at least 1');
  }

  // Validate AI configuration
  if (config.ai.batchSize < 1) {
    throw new Error('AI batch size must be at least 1');
  }

  if (config.ai.maxConcurrent < 1) {
    throw new Error('AI max concurrent must be at least 1');
  }

  if (config.ai.timeout < 1000) {
    throw new Error('AI timeout must be at least 1 second');
  }

  // Validate vision configuration
  if (config.vision.maxImageSize < 1024) {
    throw new Error('Vision max image size must be at least 1KB');
  }

  if (config.vision.maxConcurrent < 1) {
    throw new Error('Vision max concurrent must be at least 1');
  }

  if (config.vision.timeout < 1000) {
    throw new Error('Vision timeout must be at least 1 second');
  }

  // Validate monitoring configuration
  if (config.monitoring.enabled) {
    if (config.monitoring.interval < 1000) {
      throw new Error('Monitoring interval must be at least 1 second');
    }

    if (config.monitoring.retention < 1) {
      throw new Error('Monitoring retention must be at least 1 day');
    }

    if (config.monitoring.alertThresholds.cpu < 0 || config.monitoring.alertThresholds.cpu > 100) {
      throw new Error('CPU threshold must be between 0 and 100');
    }

    if (config.monitoring.alertThresholds.memory < 0 || config.monitoring.alertThresholds.memory > 100) {
      throw new Error('Memory threshold must be between 0 and 100');
    }

    if (config.monitoring.alertThresholds.disk < 0 || config.monitoring.alertThresholds.disk > 100) {
      throw new Error('Disk threshold must be between 0 and 100');
    }

    if (config.monitoring.alertThresholds.errorRate < 0 || config.monitoring.alertThresholds.errorRate > 100) {
      throw new Error('Error rate threshold must be between 0 and 100');
    }

    if (config.monitoring.alertThresholds.latency < 0) {
      throw new Error('Latency threshold must be positive');
    }
  }

  // Validate security configuration
  if (config.security.bcryptRounds < 1) {
    throw new Error('BCrypt rounds must be at least 1');
  }
}

// Validate and export configuration
validateConfig(defaultConfig);
export const config = defaultConfig; 