import { describe, it, expect, vi } from 'vitest';
import {
  debounce,
  throttle,
  memoize,
  lazyLoad,
  batchUpdate,
  virtualize,
} from '../performance';

describe('Performance Utils', () => {
  describe('debounce', () => {
    it('delays function execution', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toBeCalled();

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(mockFn).toBeCalledTimes(1);
    });

    it('cancels previous execution on new call', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(mockFn).toBeCalledTimes(1);
    });

    it('maintains function context', async () => {
      const context = { value: 42 };
      const mockFn = vi.fn(function(this: any) {
        expect(this).toBe(context);
      });

      const debouncedFn = debounce(mockFn.bind(context), 100);
      debouncedFn();

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(mockFn).toBeCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('limits function execution rate', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toBeCalledTimes(1);

      await new Promise((resolve) => setTimeout(resolve, 150));
      throttledFn();
      expect(mockFn).toBeCalledTimes(2);
    });

    it('executes immediately on first call', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      expect(mockFn).toBeCalledTimes(1);
    });

    it('maintains function context', () => {
      const context = { value: 42 };
      const mockFn = vi.fn(function(this: any) {
        expect(this).toBe(context);
      });

      const throttledFn = throttle(mockFn.bind(context), 100);
      throttledFn();

      expect(mockFn).toBeCalledTimes(1);
    });
  });

  describe('memoize', () => {
    it('caches function results', () => {
      const mockFn = vi.fn((n: number) => n * 2);
      const memoizedFn = memoize(mockFn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(mockFn).toBeCalledTimes(1);
    });

    it('handles multiple arguments', () => {
      const mockFn = vi.fn((a: number, b: number) => a + b);
      const memoizedFn = memoize(mockFn);

      const result1 = memoizedFn(2, 3);
      const result2 = memoizedFn(2, 3);

      expect(result1).toBe(5);
      expect(result2).toBe(5);
      expect(mockFn).toBeCalledTimes(1);
    });

    it('handles object arguments', () => {
      const mockFn = vi.fn((obj: { id: number; name: string }) => `${obj.id}-${obj.name}`);
      const memoizedFn = memoize(mockFn);

      const obj = { id: 1, name: 'test' };
      const result1 = memoizedFn(obj);
      const result2 = memoizedFn({ ...obj });

      expect(result1).toBe('1-test');
      expect(result2).toBe('1-test');
      expect(mockFn).toBeCalledTimes(1);
    });
  });

  describe('lazyLoad', () => {
    it('loads component only when needed', async () => {
      const mockComponent = vi.fn(() => <div>Test</div>);
      const lazyComponent = lazyLoad(mockComponent);

      expect(mockComponent).not.toBeCalled();

      await lazyComponent();
      expect(mockComponent).toBeCalledTimes(1);
    });

    it('caches loaded component', async () => {
      const mockComponent = vi.fn(() => <div>Test</div>);
      const lazyComponent = lazyLoad(mockComponent);

      await lazyComponent();
      await lazyComponent();

      expect(mockComponent).toBeCalledTimes(1);
    });
  });

  describe('batchUpdate', () => {
    it('batches multiple state updates', async () => {
      const mockSetState = vi.fn();
      const batchedSetState = batchUpdate(mockSetState);

      batchedSetState({ count: 1 });
      batchedSetState({ count: 2 });
      batchedSetState({ count: 3 });

      expect(mockSetState).not.toBeCalled();

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockSetState).toBeCalledTimes(1);
      expect(mockSetState).toBeCalledWith({ count: 3 });
    });

    it('merges multiple updates', async () => {
      const mockSetState = vi.fn();
      const batchedSetState = batchUpdate(mockSetState);

      batchedSetState({ count: 1 });
      batchedSetState((prev: any) => ({ count: prev.count + 1 }));
      batchedSetState({ count: 3 });

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockSetState).toBeCalledTimes(1);
      expect(mockSetState).toBeCalledWith({ count: 3 });
    });
  });

  describe('virtualize', () => {
    it('renders only visible items', () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Item ${i}` }));
      const { getVisibleItems, getTotalHeight } = virtualize(items, 50, 100);

      const visibleItems = getVisibleItems(0);
      expect(visibleItems.length).toBeLessThan(1000);
      expect(visibleItems[0].id).toBe(0);
      expect(visibleItems[visibleItems.length - 1].id).toBeLessThan(1000);

      const totalHeight = getTotalHeight();
      expect(totalHeight).toBe(50000); // 1000 items * 50px height
    });

    it('handles scroll position changes', () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Item ${i}` }));
      const { getVisibleItems } = virtualize(items, 50, 100);

      const items1 = getVisibleItems(0);
      const items2 = getVisibleItems(1000);

      expect(items1[0].id).toBe(0);
      expect(items2[0].id).toBe(20); // 1000px / 50px per item
    });

    it('handles window size changes', () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Item ${i}` }));
      const { getVisibleItems } = virtualize(items, 50, 100);

      const items1 = getVisibleItems(0);
      const items2 = getVisibleItems(0, 200); // Increased window height

      expect(items2.length).toBeGreaterThan(items1.length);
    });
  });
});
