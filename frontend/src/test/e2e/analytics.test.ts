import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalyticsDashboard } from '../../components/dashboard/AnalyticsDashboard';
import { WebSocketProvider } from '../../contexts/WebSocketContext';
import { AnalyticsProvider } from '../../contexts/AnalyticsContext';

describe('Analytics Dashboard E2E', () => {
  beforeAll(() => {
    // Mock WebSocket
    global.WebSocket = class MockWebSocket {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onopen: (() => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onclose: (() => void) | null = null;

      constructor(url: string) {
        setTimeout(() => {
          this.onopen?.();
        }, 0);
      }

      send(data: string) {
        // Simulate receiving analytics data
        setTimeout(() => {
          this.onmessage?.(new MessageEvent('message', {
            data: JSON.stringify({
              timestamp: new Date().toISOString(),
              objectCount: 5,
              faceCount: 2,
              processingTime: 150,
              confidence: 0.95
            })
          }));
        }, 100);
      }

      close() {
        this.onclose?.();
      }
    };
  });

  it('should display analytics dashboard', async () => {
    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    // Check for summary cards
    expect(screen.getByText('Total Objects Detected')).toBeInTheDocument();
    expect(screen.getByText('Total Faces Recognized')).toBeInTheDocument();
    expect(screen.getByText('Average Processing Time')).toBeInTheDocument();
    expect(screen.getByText('Average Confidence')).toBeInTheDocument();

    // Wait for real-time data
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('150ms')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  it('should update charts in real-time', async () => {
    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('Object Detection Over Time')).toBeInTheDocument();
      expect(screen.getByText('Processing Performance')).toBeInTheDocument();
      expect(screen.getByText('Confidence Trend')).toBeInTheDocument();
    });

    // Simulate new data points
    const ws = new WebSocket('ws://localhost:8000/ws/analytics');
    ws.send(JSON.stringify({
      timestamp: new Date().toISOString(),
      objectCount: 8,
      faceCount: 3,
      processingTime: 180,
      confidence: 0.92
    }));

    // Wait for chart updates
    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('180ms')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });

  it('should handle WebSocket connection errors', async () => {
    // Mock WebSocket error
    const originalWebSocket = global.WebSocket;
    global.WebSocket = class MockWebSocket {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onopen: (() => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onclose: (() => void) | null = null;

      constructor(url: string) {
        setTimeout(() => {
          this.onerror?.(new Event('error'));
        }, 0);
      }

      send(data: string) {}
      close() {}
    };

    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Error loading analytics data/i)).toBeInTheDocument();
    });

    // Restore original WebSocket
    global.WebSocket = originalWebSocket;
  });

  it('should handle data loading state', async () => {
    // Mock slow WebSocket connection
    const originalWebSocket = global.WebSocket;
    global.WebSocket = class MockWebSocket {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onopen: (() => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onclose: (() => void) | null = null;

      constructor(url: string) {
        setTimeout(() => {
          this.onopen?.();
        }, 1000);
      }

      send(data: string) {}
      close() {}
    };

    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    // Check for loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Restore original WebSocket
    global.WebSocket = originalWebSocket;
  });

  it('should handle data refresh', async () => {
    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    // Simulate data refresh
    const ws = new WebSocket('ws://localhost:8000/ws/analytics');
    ws.send(JSON.stringify({
      timestamp: new Date().toISOString(),
      objectCount: 10,
      faceCount: 4,
      processingTime: 200,
      confidence: 0.98
    }));

    // Wait for updated data
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('200ms')).toBeInTheDocument();
      expect(screen.getByText('98%')).toBeInTheDocument();
    });
  });
});
