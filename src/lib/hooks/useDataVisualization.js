import { useState, useEffect, useCallback, useRef } from 'react';

const useDataVisualization = (options = {}) => {
  const {
    data = [],
    type = 'line',
    width = '100%',
    height = '400px',
    options = {},
    onChartUpdate = null,
    onError = null,
    responsive = true,
    animation = true,
    theme = 'light',
  } = options;

  const [chartInstance, setChartInstance] = useState(null);
  const [chartData, setChartData] = useState(data);
  const [chartOptions, setChartOptions] = useState(options);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Initialize chart
  useEffect(() => {
    const initializeChart = () => {
      try {
        if (!chartRef.current) return;

        // Initialize your charting library here
        // Example: Chart.js, D3.js, etc.
        const chart = createChart(chartRef.current, {
          type,
          data: chartData,
          options: {
            ...chartOptions,
            responsive,
            animation,
            maintainAspectRatio: false,
          },
        });

        setChartInstance(chart);

        if (onChartUpdate) {
          onChartUpdate(chart);
        }
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    };

    initializeChart();

    // Set up resize observer for responsive updates
    if (responsive) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (chartInstance) {
          chartInstance.resize();
        }
      });

      resizeObserverRef.current.observe(chartRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [type, chartData, chartOptions, responsive, animation, onChartUpdate, onError]);

  // Update chart data
  const updateData = useCallback(
    (newData) => {
      try {
        setChartData(newData);
        if (chartInstance) {
          chartInstance.data = newData;
          chartInstance.update();
        }
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    },
    [chartInstance, onError]
  );

  // Update chart options
  const updateOptions = useCallback(
    (newOptions) => {
      try {
        setChartOptions(newOptions);
        if (chartInstance) {
          chartInstance.options = {
            ...chartInstance.options,
            ...newOptions,
          };
          chartInstance.update();
        }
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    },
    [chartInstance, onError]
  );

  // Add data point
  const addDataPoint = useCallback(
    (point) => {
      try {
        const newData = [...chartData, point];
        updateData(newData);
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    },
    [chartData, updateData, onError]
  );

  // Remove data point
  const removeDataPoint = useCallback(
    (index) => {
      try {
        const newData = chartData.filter((_, i) => i !== index);
        updateData(newData);
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    },
    [chartData, updateData, onError]
  );

  // Clear chart data
  const clearData = useCallback(() => {
    try {
      updateData([]);
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    }
  }, [updateData, onError]);

  // Export chart as image
  const exportChart = useCallback(
    (format = 'png') => {
      try {
        if (!chartInstance) return null;
        return chartInstance.toBase64Image(format);
      } catch (err) {
        setError(err);
        if (onError) {
          onError(err);
        }
        return null;
      }
    },
    [chartInstance, onError]
  );

  // Get chart data
  const getChartData = useCallback(() => {
    return {
      data: chartData,
      options: chartOptions,
      type,
      error,
      instance: chartInstance,
    };
  }, [chartData, chartOptions, type, error, chartInstance]);

  return {
    chartRef,
    updateData,
    updateOptions,
    addDataPoint,
    removeDataPoint,
    clearData,
    exportChart,
    getChartData,
    error,
  };
};

export default useDataVisualization; 