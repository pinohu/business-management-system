import { logger } from './logger';
import { cacheService } from './cache';
import { dataProcessingService } from './dataProcessing';
import { OpenTelemetry } from '@opentelemetry/api';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MatomoTracker } from 'matomo-tracker';

class AnalyticsService {
  constructor() {
    this.cache = cacheService;
    this.dataProcessing = dataProcessingService;

    this.cacheKey = 'analytics:';
    this.cacheTTL = 3600; // 1 hour
    this.maxRetries = 3;
    this.retryDelay = 1000;

    // Initialize analytics services
    this.initializeServices();
  }

  async initializeServices() {
    try {
      // Initialize Matomo
      this.matomo = new MatomoTracker({
        url: process.env.MATOMO_URL || 'http://localhost:8080',
        siteId: process.env.MATOMO_SITE_ID || '1',
      });

      // Initialize OpenTelemetry
      const exporter = new PrometheusExporter({
        port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
      });

      this.tracer = OpenTelemetry.trace.getTracer('business-management');
      this.meter = OpenTelemetry.metrics.getMeter('business-management');

      // Create metrics
      this.requestCounter = this.meter.createCounter('http_requests_total', {
        description: 'Total number of HTTP requests',
      });

      this.errorCounter = this.meter.createCounter('http_errors_total', {
        description: 'Total number of HTTP errors',
      });

      this.responseTime = this.meter.createHistogram('http_response_time_seconds', {
        description: 'HTTP response time in seconds',
      });

      logger.info('Analytics services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize analytics services:', error);
      throw error;
    }
  }

  async trackPageView(data) {
    try {
      const { path, title, referrer, duration } = data;

      // Track in Matomo
      await this.matomo.track({
        url: path,
        action_name: title,
        urlref: referrer,
        generation_time: duration,
      });

      // Track in OpenTelemetry
      const span = this.tracer.startSpan('page_view');
      span.setAttribute('path', path);
      span.setAttribute('title', title);
      span.setAttribute('duration', duration);
      span.end();

      // Update metrics
      this.requestCounter.add(1);
    } catch (error) {
      logger.error('Error tracking page view:', error);
      throw error;
    }
  }

  async trackEvent(data) {
    try {
      const { category, action, name, value } = data;

      // Track in Matomo
      await this.matomo.track({
        e_c: category,
        e_a: action,
        e_n: name,
        e_v: value,
      });

      // Track in OpenTelemetry
      const span = this.tracer.startSpan('event');
      span.setAttribute('category', category);
      span.setAttribute('action', action);
      span.setAttribute('name', name);
      span.setAttribute('value', value);
      span.end();

      // Update metrics
      this.requestCounter.add(1);
    } catch (error) {
      logger.error('Error tracking event:', error);
      throw error;
    }
  }

  async trackError(data) {
    try {
      const { message, stack, context } = data;

      // Track in Matomo
      await this.matomo.track({
        e_c: 'error',
        e_a: 'error',
        e_n: message,
        e_v: JSON.stringify(context),
      });

      // Track in OpenTelemetry
      const span = this.tracer.startSpan('error');
      span.setAttribute('message', message);
      span.setAttribute('stack', stack);
      span.setAttribute('context', JSON.stringify(context));
      span.end();

      // Update metrics
      this.errorCounter.add(1);
    } catch (error) {
      logger.error('Error tracking error:', error);
      throw error;
    }
  }

  async getMetrics() {
    try {
      const metrics = {
        requests: await this.getRequestMetrics(),
        errors: await this.getErrorMetrics(),
        performance: await this.getPerformanceMetrics(),
        users: await this.getUserMetrics(),
      };

      return metrics;
    } catch (error) {
      logger.error('Error getting metrics:', error);
      throw error;
    }
  }

  async getRequestMetrics() {
    // Get request metrics from OpenTelemetry
    return {
      total: this.requestCounter.get(),
      rate: this.requestCounter.getRate(),
      byEndpoint: await this.getRequestsByEndpoint(),
    };
  }

  async getErrorMetrics() {
    // Get error metrics from OpenTelemetry
    return {
      total: this.errorCounter.get(),
      rate: this.errorCounter.getRate(),
      byType: await this.getErrorsByType(),
    };
  }

  async getPerformanceMetrics() {
    // Get performance metrics from OpenTelemetry
    return {
      responseTime: this.responseTime.get(),
      throughput: await this.getThroughput(),
      latency: await this.getLatency(),
    };
  }

  async getUserMetrics() {
    // Get user metrics from Matomo
    return {
      total: await this.matomo.getTotalVisitors(),
      active: await this.matomo.getActiveVisitors(),
      byCountry: await this.matomo.getVisitorsByCountry(),
      byDevice: await this.matomo.getVisitorsByDevice(),
    };
  }

  // ... existing code ...
}
