import { useState, useCallback } from 'react';

const useOptimisticUpdate = (updateCallback, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    onRollback = null,
    delay = 0,
  } = options;

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [rollbackData, setRollbackData] = useState(null);

  const update = useCallback(async (optimisticData, actualData) => {
    setIsUpdating(true);
    setError(null);
    setRollbackData(actualData);

    try {
      // Apply optimistic update
      if (onSuccess) {
        onSuccess(optimisticData);
      }

      // Simulate network delay if specified
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Perform actual update
      const result = await updateCallback(actualData);

      // Clear rollback data on success
      setRollbackData(null);
      return result;
    } catch (err) {
      setError(err.message);
      
      // Rollback on error
      if (rollbackData && onRollback) {
        onRollback(rollbackData);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [updateCallback, onSuccess, onError, onRollback, delay, rollbackData]);

  const rollback = useCallback(() => {
    if (rollbackData && onRollback) {
      onRollback(rollbackData);
      setRollbackData(null);
    }
  }, [rollbackData, onRollback]);

  return {
    update,
    rollback,
    isUpdating,
    error,
    hasRollbackData: !!rollbackData,
  };
};

export default useOptimisticUpdate; 