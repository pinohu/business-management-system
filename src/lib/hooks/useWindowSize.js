import { useState, useEffect, useCallback } from 'react';

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

const useWindowSize = (options = {}) => {
  const {
    debounceMs = 100,
    breakpointValues = breakpoints,
  } = options;

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [breakpoint, setBreakpoint] = useState('xs');

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Determine breakpoint
    const width = window.innerWidth;
    let currentBreakpoint = 'xs';

    Object.entries(breakpointValues)
      .sort(([, a], [, b]) => b - a)
      .forEach(([key, value]) => {
        if (width >= value) {
          currentBreakpoint = key;
        }
      });

    setBreakpoint(currentBreakpoint);
  }, [breakpointValues]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Debounce resize handler
    let timeoutId;
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, debounceMs);
    };

    window.addEventListener('resize', debouncedHandler);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', debouncedHandler);
      clearTimeout(timeoutId);
    };
  }, [handleResize, debounceMs]);

  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl';

  return {
    width: windowSize.width,
    height: windowSize.height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints: breakpointValues,
  };
};

export default useWindowSize; 