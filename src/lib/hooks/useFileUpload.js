import { useState, useCallback } from 'react';
import useApi from './useApi';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

const useFileUpload = (options = {}) => {
  const {
    endpoint,
    chunkSize = CHUNK_SIZE,
    onProgress = null,
    onSuccess = null,
    onError = null,
    onCancel = null,
  } = options;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedChunks, setUploadedChunks] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const api = useApi();

  const uploadChunk = useCallback(
    async (file, chunk, chunkIndex, totalChunks) => {
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);
      formData.append('fileSize', file.size);

      return api.post(endpoint, formData, {
        onUploadProgress: (progressEvent) => {
          const chunkProgress =
            (progressEvent.loaded / progressEvent.total) * 100;
          const totalProgress =
            ((chunkIndex * 100 + chunkProgress) / totalChunks);
          setUploadProgress(totalProgress);
          if (onProgress) {
            onProgress(totalProgress);
          }
        },
      });
    },
    [endpoint, api, onProgress]
  );

  const uploadFile = useCallback(
    async (file) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadedChunks(0);

        const chunks = [];
        const totalChunks = Math.ceil(file.size / chunkSize);
        setTotalChunks(totalChunks);

        // Split file into chunks
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);
          chunks.push(chunk);
        }

        // Upload chunks sequentially
        for (let i = 0; i < chunks.length; i++) {
          await uploadChunk(file, chunks[i], i, totalChunks);
          setUploadedChunks((prev) => prev + 1);
        }

        // Complete upload
        const response = await api.post(`${endpoint}/complete`, {
          fileName: file.name,
          totalChunks,
        });

        if (onSuccess) {
          onSuccess(response);
        }

        return response;
      } catch (error) {
        if (onError) {
          onError(error);
        }
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadedChunks(0);
        setTotalChunks(0);
      }
    },
    [chunkSize, endpoint, api, uploadChunk, onSuccess, onError]
  );

  const cancelUpload = useCallback(async () => {
    try {
      await api.post(`${endpoint}/cancel`);
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error canceling upload:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedChunks(0);
      setTotalChunks(0);
    }
  }, [endpoint, api, onCancel]);

  return {
    uploadFile,
    cancelUpload,
    uploadProgress,
    isUploading,
    uploadedChunks,
    totalChunks,
  };
};

export default useFileUpload; 