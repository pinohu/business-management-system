import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const handleResponse = useCallback(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'An error occurred');
    }
    return response.json();
  }, []);

  const get = useCallback(async (endpoint, params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryString = new URLSearchParams(params).toString();
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleResponse]);

  const post = useCallback(async (endpoint, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleResponse]);

  const put = useCallback(async (endpoint, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleResponse]);

  const del = useCallback(async (endpoint) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleResponse]);

  const uploadFile = useCallback(async (endpoint, file, onProgress) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          // Remove Content-Type to let browser set it with boundary
        },
        body: formData,
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      });

      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleResponse]);

  return {
    loading,
    error,
    get,
    post,
    put,
    del,
    uploadFile,
  };
};

export default useApi; 