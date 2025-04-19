import { config } from 'dotenv';
config();

export const telemetryConfig = {
  serviceName: process.env.OTEL_SERVICE_NAME || 'business-management',
  version: '1.0.0',
  exporter: {
    otlp: {
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
      headers: {},
    },
    console: {
      enabled: process.env.NODE_ENV === 'development',
    },
  },
  resource: {
    attributes: {
      'service.name': process.env.OTEL_SERVICE_NAME || 'business-management',
      'service.version': '1.0.0',
      'deployment.environment': process.env.NODE_ENV || 'development',
    },
  },
  instrumentation: {
    http: {
      enabled: true,
      ignoreIncomingPaths: ['/health', '/metrics'],
    },
    express: {
      enabled: true,
    },
    mysql: {
      enabled: true,
    },
    redis: {
      enabled: true,
    },
  },
  sampling: {
    type: 'parentbased_always_on',
    ratio: 1,
  },
  propagation: {
    type: 'w3c',
  },
};
