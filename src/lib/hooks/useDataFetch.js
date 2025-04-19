import { useState, useEffect, useCallback, useRef } from 'react';
import useApi from './useApi';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useDataFetch = (endpoint, options = {}) => {
  const {
    params = {},
    cacheKey = endpoint,
    cacheDuration = CACHE_DURATION,
    refetchInterval = null,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const api = useApi();
  const cacheTimeoutRef = useRef(null);

  const isCacheValid = useCallback(() => {
    if (!lastFetched) return false;
    return Date.now() - lastFetched < cacheDuration;
  }, [lastFetched, cacheDuration]);

  const fetchData = useCallback(async (force = false) => {
    try {
      if (!force && isCacheValid()) {
        return;
      }

      setLoading(true);
      setError(null);

      const response = await api.get(endpoint, params);
      setData(response);
      setLastFetched(Date.now());

      if (onSuccess) {
        onSuccess(response);
      }

      // Set up cache invalidation
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
      cacheTimeoutRef.current = setTimeout(() => {
        setData(null);
        setLastFetched(null);
      }, cacheDuration);
    } catch (err) {
      setError(err.message);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, cacheDuration, isCacheValid, api, onSuccess, onError]);

  useEffect(() => {
    fetchData();

    if (refetchInterval) {
      const interval = setInterval(() => {
        fetchData(true);
      }, refetchInterval);

      return () => {
        clearInterval(interval);
        if (cacheTimeoutRef.current) {
          clearTimeout(cacheTimeoutRef.current);
        }
      };
    }
  }, [fetchData, refetchInterval]);

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    setData(null);
    setLastFetched(null);
    if (cacheTimeoutRef.current) {
      clearTimeout(cacheTimeoutRef.current);
      cacheTimeoutRef.current = null;
    }
  }, []);

  return {
    data,
    loading,
    error,
    lastFetched,
    refetch,
    clearCache,
  };
};

export default useDataFetch; 