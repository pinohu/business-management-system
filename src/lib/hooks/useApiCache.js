import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import useApi from './useApi';

const useApiCache = (endpoint, options = {}) => {
  const {
    params = {},
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval = 0,
    dedupingInterval = 2000,
    errorRetryCount = 3,
    onSuccess = null,
    onError = null,
  } = options;

  const api = useApi();

  const fetcher = useCallback(
    async (url) => {
      try {
        const response = await api.get(url, params);
        if (onSuccess) {
          onSuccess(response);
        }
        return response;
      } catch (error) {
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [api, params, onSuccess, onError]
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateData,
  } = useSWR(endpoint, fetcher, {
    revalidateOnFocus,
    revalidateOnReconnect,
    refreshInterval,
    dedupingInterval,
    errorRetryCount,
  });

  const optimisticUpdate = useCallback(
    async (optimisticData, revalidate = true) => {
      // Optimistically update the cache
      await mutateData(optimisticData, false);

      try {
        // Perform the actual update
        const response = await api.put(endpoint, optimisticData);
        
        // Update the cache with the actual response
        if (revalidate) {
          await mutateData(response);
        }
        
        return response;
      } catch (error) {
        // Revert optimistic update on error
        await mutateData();
        throw error;
      }
    },
    [endpoint, api, mutateData]
  );

  const invalidateCache = useCallback(() => {
    return mutateData();
  }, [mutateData]);

  const clearCache = useCallback(() => {
    return mutate(endpoint, null, false);
  }, [endpoint]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateData,
    optimisticUpdate,
    invalidateCache,
    clearCache,
  };
};

export default useApiCache; 