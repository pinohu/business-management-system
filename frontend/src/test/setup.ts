import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { vi } from 'vitest';
import { worker } from './mocks/browser';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.ResizeObserver = mockResizeObserver;

// Start MSW
beforeAll(() => {
  worker.start({ onUnhandledRequest: 'error' });
});

// Cleanup MSW
afterEach(() => {
  worker.resetHandlers();
});
