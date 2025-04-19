import { config } from 'dotenv';
config();

export const analyticsConfig = {
  matomo: {
    url: process.env.MATOMO_URL || 'http://localhost:8080',
    siteId: parseInt(process.env.MATOMO_SITE_ID || '1'),
    tokenAuth: process.env.MATOMO_TOKEN_AUTH,
    tracking: {
      pageView: true,
      events: true,
      goals: true,
      ecommerce: true,
      siteSearch: true,
      contentTracking: true,
      customVariables: true,
      customDimensions: true,
    },
  },
  prometheus: {
    port: parseInt(process.env.PROMETHEUS_PORT || '9090'),
    path: '/metrics',
    defaultLabels: {
      service: 'business-management',
      environment: process.env.NODE_ENV || 'development',
    },
  },
  metrics: {
    http: {
      requests: {
        total: 'http_requests_total',
        duration: 'http_request_duration_seconds',
        size: 'http_request_size_bytes',
      },
      responses: {
        status: 'http_response_status',
        size: 'http_response_size_bytes',
      },
    },
    system: {
      memory: 'process_memory_bytes',
      cpu: 'process_cpu_seconds_total',
      uptime: 'process_uptime_seconds',
    },
    business: {
      users: 'business_users_total',
      documents: 'business_documents_total',
      processing: {
        time: 'document_processing_seconds',
        success: 'document_processing_success_total',
        failure: 'document_processing_failure_total',
      },
    },
  },
};
