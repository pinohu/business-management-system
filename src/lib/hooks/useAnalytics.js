import { useState, useEffect, useCallback, useRef } from 'react';

const useAnalytics = (options = {}) => {
  const {
    trackingId = null,
    userId = null,
    sessionId = null,
    customDimensions = {},
    onEventTracked = null,
    onError = null,
    debug = false,
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [error, setError] = useState(null);
  const eventQueueRef = useRef([]);
  const isOnlineRef = useRef(true);

  // Initialize analytics
  useEffect(() => {
    const initializeAnalytics = () => {
      try {
        // Initialize your analytics service here
        // Example: Google Analytics, Mixpanel, etc.
        setIsInitialized(true);
        processEventQueue();
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    };

    initializeAnalytics();

    // Handle online/offline status
    const handleOnline = () => {
      isOnlineRef.current = true;
      processEventQueue();
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onError]);

  // Track page view
  const trackPageView = useCallback(
    (pageData = {}) => {
      const event = {
        type: 'pageview',
        timestamp: Date.now(),
        data: {
          page: window.location.pathname,
          title: document.title,
          referrer: document.referrer,
          ...pageData,
        },
      };

      trackEvent(event);
    },
    []
  );

  // Track custom event
  const trackEvent = useCallback(
    (event) => {
      try {
        const enrichedEvent = {
          ...event,
          timestamp: event.timestamp || Date.now(),
          userId,
          sessionId,
          trackingId,
          customDimensions,
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        if (debug) {
          console.log('Analytics Event:', enrichedEvent);
        }

        if (!isOnlineRef.current) {
          eventQueueRef.current.push(enrichedEvent);
        } else {
          sendEvent(enrichedEvent);
        }

        setLastEvent(enrichedEvent);
        if (onEventTracked) {
          onEventTracked(enrichedEvent);
        }
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    },
    [userId, sessionId, trackingId, customDimensions, debug, onEventTracked, onError]
  );

  // Track user interaction
  const trackInteraction = useCallback(
    (interactionData) => {
      const event = {
        type: 'interaction',
        timestamp: Date.now(),
        data: interactionData,
      };

      trackEvent(event);
    },
    [trackEvent]
  );

  // Track error
  const trackError = useCallback(
    (errorData) => {
      const event = {
        type: 'error',
        timestamp: Date.now(),
        data: {
          message: errorData.message,
          stack: errorData.stack,
          component: errorData.component,
          ...errorData,
        },
      };

      trackEvent(event);
    },
    [trackEvent]
  );

  // Track performance metric
  const trackPerformance = useCallback(
    (metricData) => {
      const event = {
        type: 'performance',
        timestamp: Date.now(),
        data: metricData,
      };

      trackEvent(event);
    },
    [trackEvent]
  );

  // Send event to analytics service
  const sendEvent = useCallback(async (event) => {
    try {
      // Implement your analytics service API call here
      // Example: Google Analytics, Mixpanel, etc.
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
      eventQueueRef.current.push(event);
    }
  }, [onError]);

  // Process queued events
  const processEventQueue = useCallback(async () => {
    if (!isOnlineRef.current || eventQueueRef.current.length === 0) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    for (const event of events) {
      await sendEvent(event);
    }
  }, [sendEvent]);

  // Set custom dimension
  const setCustomDimension = useCallback((key, value) => {
    customDimensions[key] = value;
  }, [customDimensions]);

  // Get analytics data
  const getAnalyticsData = useCallback(() => {
    return {
      userId,
      sessionId,
      trackingId,
      customDimensions,
      lastEvent,
      error,
      isInitialized,
      eventQueueLength: eventQueueRef.current.length,
    };
  }, [userId, sessionId, trackingId, customDimensions, lastEvent, error, isInitialized]);

  return {
    trackPageView,
    trackEvent,
    trackInteraction,
    trackError,
    trackPerformance,
    setCustomDimension,
    getAnalyticsData,
    isInitialized,
    error,
  };
};

export default useAnalytics; 