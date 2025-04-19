import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config';
import { AppError } from '../utils/errorHandler';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Get API key from localStorage
    const apiKey = localStorage.getItem('api_key');
    if (apiKey) {
      config.headers = {
        ...config.headers,
        'X-API-Key': apiKey,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('api_key');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service class
class ApiService {
  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload file
  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download file
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle error
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.message || 'An error occurred';
      const statusCode = error.response.status;
      throw new AppError(message, statusCode);
    } else if (error.request) {
      // Request made but no response
      throw new AppError('No response from server', 503);
    } else {
      // Error in request setup
      throw new AppError('Request failed', 500);
    }
  }
}

// Export API service instance
export default new ApiService();
