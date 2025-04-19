import api from './api';
import config from '../config';

// Analytics interfaces
interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: number;
  duration?: number;
}

interface UserEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

interface UserSession {
  id: string;
  startTime: number;
  endTime?: number;
  pageViews: PageView[];
  events: UserEvent[];
  userAgent: string;
  ip?: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
}

// Analytics service class
class AnalyticsService {
  private session: UserSession | null = null;

  // Initialize analytics
  async initialize(): Promise<void> {
    if (config.analytics.enabled) {
      // Initialize session
      this.session = {
        id: this.generateSessionId(),
        startTime: Date.now(),
        pageViews: [],
        events: [],
        userAgent: navigator.userAgent,
      };

      // Track initial page view
      await this.trackPageView();
    }
  }

  // Track page view
  async trackPageView(): Promise<void> {
    if (!this.session || !config.analytics.enabled) return;

    const pageView: PageView = {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    };

    this.session.pageViews.push(pageView);
    await this.sendAnalytics('pageview', pageView);
  }

  // Track user event
  async trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number
  ): Promise<void> {
    if (!this.session || !config.analytics.enabled) return;

    const event: UserEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
    };

    this.session.events.push(event);
    await this.sendAnalytics('event', event);
  }

  // Track user timing
  async trackTiming(
    category: string,
    variable: string,
    value: number,
    label?: string
  ): Promise<void> {
    if (!this.session || !config.analytics.enabled) return;

    const timing: UserEvent = {
      category,
      action: variable,
      label,
      value,
      timestamp: Date.now(),
    };

    this.session.events.push(timing);
    await this.sendAnalytics('timing', timing);
  }

  // Track user error
  async trackError(
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    if (!this.session || !config.analytics.enabled) return;

    const errorEvent: UserEvent = {
      category: 'error',
      action: error.name,
      label: error.message,
      timestamp: Date.now(),
    };

    this.session.events.push(errorEvent);
    await this.sendAnalytics('error', { ...errorEvent, context });
  }

  // Track user interaction
  async trackInteraction(
    element: string,
    action: string,
    value?: number
  ): Promise<void> {
    if (!this.session || !config.analytics.enabled) return;

    const interaction: UserEvent = {
      category: 'interaction',
      action: `${element}:${action}`,
      value,
      timestamp: Date.now(),
    };

    this.session.events.push(interaction);
    await this.sendAnalytics('interaction', interaction);
  }

  // Track user performance
  async trackPerformance(
    metric: string,
    value: number,
    context?: Record<string, any>
  ): Promise<void> {
    if (!this.session || !config.analytics.enabled) return;

    const performance: UserEvent = {
      category: 'performance',
      action: metric,
      value,
      timestamp: Date.now(),
    };

    this.session.events.push(performance);
    await this.sendAnalytics('performance', { ...performance, context });
  }

  // Track user engagement
  async trackEngagement(
    type: string,
    duration: number,
    context?: Record<string, any>
  ): Promise<void> {
    if (!this.session || !config.analytics.enabled) return;

    const engagement: UserEvent = {
      category: 'engagement',
      action: type,
      value: duration,
      timestamp: Date.now(),
    };

    this.session.events.push(engagement);
    await this.sendAnalytics('engagement', { ...engagement, context });
  }

  // Get analytics data
  async getAnalyticsData(options: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    category?: string;
  } = {}): Promise<{
    pageViews: PageView[];
    events: UserEvent[];
    sessions: UserSession[];
  }> {
    const response = await api.get<{
      pageViews: PageView[];
      events: UserEvent[];
      sessions: UserSession[];
    }>('/analytics/data', { params: options });
    return response;
  }

  // Get analytics metrics
  async getAnalyticsMetrics(options: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
  } = {}): Promise<{
    totalUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    topPages: Array<{ path: string; views: number }>;
    topEvents: Array<{ category: string; action: string; count: number }>;
  }> {
    const response = await api.get<{
      totalUsers: number;
      totalSessions: number;
      averageSessionDuration: number;
      bounceRate: number;
      conversionRate: number;
      topPages: Array<{ path: string; views: number }>;
      topEvents: Array<{ category: string; action: string; count: number }>;
    }>('/analytics/metrics', { params: options });
    return response;
  }

  // Get user analytics
  async getUserAnalytics(userId: string): Promise<{
    sessions: UserSession[];
    pageViews: PageView[];
    events: UserEvent[];
    metrics: {
      totalSessions: number;
      averageSessionDuration: number;
      topPages: Array<{ path: string; views: number }>;
      topEvents: Array<{ category: string; action: string; count: number }>;
    };
  }> {
    const response = await api.get<{
      sessions: UserSession[];
      pageViews: PageView[];
      events: UserEvent[];
      metrics: {
        totalSessions: number;
        averageSessionDuration: number;
        topPages: Array<{ path: string; views: number }>;
        topEvents: Array<{ category: string; action: string; count: number }>;
      };
    }>(`/analytics/users/${userId}`);
    return response;
  }

  // End session
  async endSession(): Promise<void> {
    if (!this.session || !config.analytics.enabled) return;

    this.session.endTime = Date.now();
    await this.sendAnalytics('session', this.session);
    this.session = null;
  }

  // Private methods
  private async sendAnalytics(type: string, data: any): Promise<void> {
    try {
      await api.post('/analytics/track', {
        type,
        data,
        timestamp: Date.now(),
        sessionId: this.session?.id,
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Export analytics service instance
export default new AnalyticsService(); 