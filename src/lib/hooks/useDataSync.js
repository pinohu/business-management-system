import { useState, useEffect, useCallback, useRef } from 'react';
import useApi from './useApi';
import useDataCache from './useDataCache';

const useDataSync = (options = {}) => {
  const {
    endpoint,
    syncInterval = 30000, // 30 seconds
    onSyncStart = null,
    onSyncComplete = null,
    onSyncError = null,
    onConflict = null,
    conflictResolution = 'server', // 'server' | 'client' | 'manual'
    cacheKey = null,
  } = options;

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  const syncTimeoutRef = useRef(null);
  const api = useApi();

  // Initialize cache if cacheKey is provided
  const cache = cacheKey
    ? useDataCache({
        key: cacheKey,
        onCacheUpdate: (data) => {
          // Handle cache updates
          if (data && !isSyncing) {
            syncData(data);
          }
        },
      })
    : null;

  // Sync data with server
  const syncData = useCallback(
    async (localData = null) => {
      try {
        setIsSyncing(true);
        setSyncError(null);

        if (onSyncStart) {
          onSyncStart();
        }

        // Get server data
        const serverResponse = await api.get(endpoint);
        const serverData = serverResponse.data;

        // Handle conflicts if they exist
        if (localData && serverData) {
          const conflicts = detectConflicts(localData, serverData);
          if (conflicts.length > 0) {
            const resolvedData = await resolveConflicts(conflicts);
            await updateServer(resolvedData);
            if (cache) {
              cache.updateCache(resolvedData);
            }
          } else {
            // No conflicts, update local data with server data
            if (cache) {
              cache.updateCache(serverData);
            }
          }
        } else {
          // No local data, just update with server data
          if (cache) {
            cache.updateCache(serverData);
          }
        }

        setLastSync(Date.now());
        if (onSyncComplete) {
          onSyncComplete(serverData);
        }
      } catch (error) {
        setSyncError(error);
        if (onSyncError) {
          onSyncError(error);
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [endpoint, api, cache, onSyncStart, onSyncComplete, onSyncError]
  );

  // Detect conflicts between local and server data
  const detectConflicts = useCallback((localData, serverData) => {
    const conflicts = [];
    const compareFields = (local, server) => {
      return Object.keys(local).some((key) => {
        if (typeof local[key] === 'object' && local[key] !== null) {
          return compareFields(local[key], server[key]);
        }
        return local[key] !== server[key];
      });
    };

    if (Array.isArray(localData) && Array.isArray(serverData)) {
      localData.forEach((localItem, index) => {
        if (serverData[index] && compareFields(localItem, serverData[index])) {
          conflicts.push({
            type: 'array',
            index,
            local: localItem,
            server: serverData[index],
          });
        }
      });
    } else if (typeof localData === 'object' && localData !== null) {
      Object.keys(localData).forEach((key) => {
        if (compareFields(localData[key], serverData[key])) {
          conflicts.push({
            type: 'object',
            key,
            local: localData[key],
            server: serverData[key],
          });
        }
      });
    }

    return conflicts;
  }, []);

  // Resolve conflicts based on resolution strategy
  const resolveConflicts = useCallback(async (conflicts) => {
    if (conflicts.length === 0) return null;

    if (conflictResolution === 'server') {
      return conflicts.map((conflict) => conflict.server);
    } else if (conflictResolution === 'client') {
      return conflicts.map((conflict) => conflict.local);
    } else if (conflictResolution === 'manual' && onConflict) {
      const resolvedData = await onConflict(conflicts);
      return resolvedData;
    }

    return null;
  }, [conflictResolution, onConflict]);

  // Update server with resolved data
  const updateServer = useCallback(
    async (data) => {
      try {
        await api.put(endpoint, data);
      } catch (error) {
        console.error('Error updating server:', error);
        throw error;
      }
    },
    [endpoint, api]
  );

  // Set up periodic sync
  useEffect(() => {
    const startSync = () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncData(cache?.data);
      }, syncInterval);
    };

    startSync();

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncInterval, syncData, cache]);

  // Handle offline/online status
  useEffect(() => {
    const handleOnline = () => {
      syncData(cache?.data);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncData, cache]);

  // Queue changes for offline mode
  const queueChange = useCallback((change) => {
    setPendingChanges((prev) => [...prev, change]);
  }, []);

  // Process pending changes when back online
  const processPendingChanges = useCallback(async () => {
    if (pendingChanges.length === 0) return;

    try {
      for (const change of pendingChanges) {
        await api.post(`${endpoint}/sync`, change);
      }
      setPendingChanges([]);
      syncData(cache?.data);
    } catch (error) {
      console.error('Error processing pending changes:', error);
      setSyncError(error);
    }
  }, [pendingChanges, endpoint, api, syncData, cache]);

  return {
    isSyncing,
    lastSync,
    syncError,
    pendingChanges,
    syncData,
    queueChange,
    processPendingChanges,
  };
};

export default useDataSync; 