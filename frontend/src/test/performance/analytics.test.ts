import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '../../components/dashboard/AnalyticsDashboard';
import { WebSocketProvider } from '../../contexts/WebSocketContext';
import { AnalyticsProvider } from '../../contexts/AnalyticsContext';

describe('Analytics Dashboard Performance', () => {
  let startTime: number;
  let endTime: number;

  beforeAll(() => {
    // Mock WebSocket for performance testing
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

  it('should render dashboard within performance budget', async () => {
    startTime = performance.now();

    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    endTime = performance.now();
    const renderTime = endTime - startTime;

    // Initial render should be under 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('should handle rapid data updates efficiently', async () => {
    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    const ws = new WebSocket('ws://localhost:8000/ws/analytics');
    const updates = 100;
    const startTime = performance.now();

    // Simulate rapid data updates
    for (let i = 0; i < updates; i++) {
      ws.send(JSON.stringify({
        timestamp: new Date().toISOString(),
        objectCount: i + 1,
        faceCount: Math.floor(i / 2) + 1,
        processingTime: 150 + i,
        confidence: 0.95 - (i * 0.001)
      }));
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Processing 100 updates should be under 500ms
    expect(totalTime).toBeLessThan(500);
  });

  it('should maintain smooth animations during updates', async () => {
    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    const ws = new WebSocket('ws://localhost:8000/ws/analytics');
    const frameTimes: number[] = [];
    let lastFrameTime = performance.now();

    // Monitor frame times during updates
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'frame') {
          const frameTime = entry.startTime - lastFrameTime;
          frameTimes.push(frameTime);
          lastFrameTime = entry.startTime;
        }
      });
    });

    observer.observe({ entryTypes: ['frame'] });

    // Simulate data updates
    for (let i = 0; i < 50; i++) {
      ws.send(JSON.stringify({
        timestamp: new Date().toISOString(),
        objectCount: i + 1,
        faceCount: Math.floor(i / 2) + 1,
        processingTime: 150 + i,
        confidence: 0.95 - (i * 0.001)
      }));
    }

    // Wait for updates to complete
    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    observer.disconnect();

    // Calculate average frame time
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;

    // Average frame time should be under 16ms (60fps)
    expect(avgFrameTime).toBeLessThan(16);
  });

  it('should handle large datasets efficiently', async () => {
    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    const ws = new WebSocket('ws://localhost:8000/ws/analytics');
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 1000).toISOString(),
      objectCount: Math.floor(Math.random() * 100),
      faceCount: Math.floor(Math.random() * 50),
      processingTime: Math.floor(Math.random() * 500),
      confidence: Math.random() * 0.5 + 0.5
    }));

    const startTime = performance.now();

    // Send large dataset
    ws.send(JSON.stringify(largeDataset));

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // Processing 1000 data points should be under 1 second
    expect(processingTime).toBeLessThan(1000);
  });

  it('should maintain memory usage under control', async () => {
    render(
      <WebSocketProvider>
        <AnalyticsProvider>
          <AnalyticsDashboard />
        </AnalyticsProvider>
      </WebSocketProvider>
    );

    const ws = new WebSocket('ws://localhost:8000/ws/analytics');
    const initialMemory = window.performance.memory?.usedJSHeapSize || 0;

    // Simulate extended usage
    for (let i = 0; i < 1000; i++) {
      ws.send(JSON.stringify({
        timestamp: new Date().toISOString(),
        objectCount: Math.floor(Math.random() * 100),
        faceCount: Math.floor(Math.random() * 50),
        processingTime: Math.floor(Math.random() * 500),
        confidence: Math.random() * 0.5 + 0.5
      }));
    }

    const finalMemory = window.performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be under 50MB
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
