import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VisionDashboard from '../../../../frontend/components/vision/VisionDashboard';
import { VisionService } from '../../../../frontend/services/visionService';

// Mock dependencies
jest.mock('../../../../frontend/services/visionService');

describe('VisionDashboard', () => {
  let mockVisionService;
  const theme = createTheme();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock vision service
    mockVisionService = {
      detectObjects: jest.fn(),
      detectFaces: jest.fn(),
      classifyScene: jest.fn(),
      recognizeText: jest.fn(),
      getAvailableModels: jest.fn(),
      getModelStatus: jest.fn(),
      getProcessingStats: jest.fn(),
      getModelPerformance: jest.fn(),
    };

    // Mock VisionService class
    VisionService.mockImplementation(() => mockVisionService);
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <VisionDashboard />
      </ThemeProvider>
    );
  };

  describe('Initialization', () => {
    it('should render successfully', () => {
      renderComponent();
      expect(screen.getByText('Vision Dashboard')).toBeInTheDocument();
    });

    it('should load available models on mount', async () => {
      mockVisionService.getAvailableModels.mockResolvedValue({
        models: ['yolov5', 'ssd-mobilenet-v1'],
      });

      renderComponent();

      await waitFor(() => {
        expect(mockVisionService.getAvailableModels).toHaveBeenCalled();
      });
    });

    it('should load processing stats on mount', async () => {
      mockVisionService.getProcessingStats.mockResolvedValue({
        total: 100,
        success: 95,
      });

      renderComponent();

      await waitFor(() => {
        expect(mockVisionService.getProcessingStats).toHaveBeenCalled();
      });
    });
  });

  describe('File Upload', () => {
    it('should handle file upload successfully', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockVisionService.detectObjects.mockResolvedValue({
        objects: [{ class: 'person', confidence: 0.95 }],
      });

      renderComponent();

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockVisionService.detectObjects).toHaveBeenCalled();
      });
    });

    it('should handle invalid file type', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      renderComponent();

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });
    });

    it('should handle file upload errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockVisionService.detectObjects.mockRejectedValue(new Error('Upload failed'));

      renderComponent();

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Model Selection', () => {
    it('should update selected model', async () => {
      mockVisionService.getAvailableModels.mockResolvedValue({
        models: ['yolov5', 'ssd-mobilenet-v1'],
      });

      renderComponent();

      await waitFor(() => {
        const select = screen.getByLabelText(/model/i);
        fireEvent.mouseDown(select);
        fireEvent.click(screen.getByText('yolov5'));
      });

      expect(screen.getByText('yolov5')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', () => {
      renderComponent();

      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[1]); // Click on Face Recognition tab

      expect(screen.getByText(/face recognition/i)).toBeInTheDocument();
    });
  });

  describe('Object Detection', () => {
    it('should display detection results', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockVisionService.detectObjects.mockResolvedValue({
        objects: [{ class: 'person', confidence: 0.95 }],
      });

      renderComponent();

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/person/i)).toBeInTheDocument();
        expect(screen.getByText(/95%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Face Recognition', () => {
    it('should display face detection results', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockVisionService.detectFaces.mockResolvedValue({
        faces: [{ box: { x: 0, y: 0, width: 100, height: 100 } }],
      });

      renderComponent();

      // Switch to Face Recognition tab
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[1]);

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockVisionService.detectFaces).toHaveBeenCalled();
      });
    });
  });

  describe('Scene Understanding', () => {
    it('should display scene classification results', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockVisionService.classifyScene.mockResolvedValue({
        scene: 'beach',
        confidence: 0.95,
      });

      renderComponent();

      // Switch to Scene Understanding tab
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[2]);

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/beach/i)).toBeInTheDocument();
        expect(screen.getByText(/95%/i)).toBeInTheDocument();
      });
    });
  });

  describe('OCR Processing', () => {
    it('should display OCR results', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockVisionService.recognizeText.mockResolvedValue({
        text: 'Hello World',
      });

      renderComponent();

      // Switch to OCR tab
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[3]);

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should display performance metrics', async () => {
      mockVisionService.getModelPerformance.mockResolvedValue({
        accuracy: 0.95,
        latency: 100,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/95%/i)).toBeInTheDocument();
        expect(screen.getByText(/100ms/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error messages', async () => {
      mockVisionService.getAvailableModels.mockRejectedValue(new Error('Failed to load models'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/failed to load models/i)).toBeInTheDocument();
      });
    });

    it('should handle processing errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockVisionService.detectObjects.mockRejectedValue(new Error('Processing failed'));

      renderComponent();

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/processing failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator during processing', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockVisionService.detectObjects.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderComponent();

      const input = screen.getByLabelText(/upload/i);
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });
}); 