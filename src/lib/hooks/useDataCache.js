import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY_PREFIX = 'app_cache_';

const useDataCache = (options = {}) => {
  const {
    key,
    initialData = null,
    cacheDuration = DEFAULT_CACHE_DURATION,
    storage = localStorage,
    onCacheUpdate = null,
    onCacheInvalidate = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const cacheKey = `${STORAGE_KEY_PREFIX}${key}`;
  const cacheTimeoutRef = useRef(null);

  // Load data from cache on mount
  useEffect(() => {
    const loadFromCache = () => {
      try {
        const cachedData = storage.getItem(cacheKey);
        if (cachedData) {
          const { data: cachedValue, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > cacheDuration;

          if (!isExpired) {
            setData(cachedValue);
            setLastUpdated(timestamp);
            if (onCacheUpdate) {
              onCacheUpdate(cachedValue);
            }
          } else {
            invalidateCache();
          }
        }
      } catch (err) {
        console.error('Error loading from cache:', err);
        setError(err);
      }
    };

    loadFromCache();
  }, [cacheKey, cacheDuration, storage, onCacheUpdate]);

  // Set up cache expiration
  useEffect(() => {
    if (lastUpdated) {
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }

      cacheTimeoutRef.current = setTimeout(() => {
        invalidateCache();
      }, cacheDuration);
    }

    return () => {
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, [lastUpdated, cacheDuration]);

  // Update cache with new data
  const updateCache = useCallback(
    (newData) => {
      try {
        const timestamp = Date.now();
        const cacheData = {
          data: newData,
          timestamp,
        };

        storage.setItem(cacheKey, JSON.stringify(cacheData));
        setData(newData);
        setLastUpdated(timestamp);
        setError(null);

        if (onCacheUpdate) {
          onCacheUpdate(newData);
        }
      } catch (err) {
        console.error('Error updating cache:', err);
        setError(err);
      }
    },
    [cacheKey, storage, onCacheUpdate]
  );

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    try {
      storage.removeItem(cacheKey);
      setData(initialData);
      setLastUpdated(null);
      setError(null);

      if (onCacheInvalidate) {
        onCacheInvalidate();
      }
    } catch (err) {
      console.error('Error invalidating cache:', err);
      setError(err);
    }
  }, [cacheKey, storage, initialData, onCacheInvalidate]);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    try {
      const keys = Object.keys(storage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          storage.removeItem(key);
        }
      });
      setData(initialData);
      setLastUpdated(null);
      setError(null);

      if (onCacheInvalidate) {
        onCacheInvalidate();
      }
    } catch (err) {
      console.error('Error clearing cache:', err);
      setError(err);
    }
  }, [storage, initialData, onCacheInvalidate]);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!lastUpdated) return false;
    return Date.now() - lastUpdated <= cacheDuration;
  }, [lastUpdated, cacheDuration]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    updateCache,
    invalidateCache,
    clearAllCache,
    isCacheValid,
  };
};

export default useDataCache; 