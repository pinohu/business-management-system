import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatDate, formatNumber } from '../../utils/formatters';

interface AnalyticsData {
  timestamp: string;
  objectCount: number;
  faceCount: number;
  processingTime: number;
  confidence: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<AnalyticsData[]>([]);
  const { analytics, loading, error } = useAnalytics();
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/analytics');

  useEffect(() => {
    if (lastMessage) {
      const newData = JSON.parse(lastMessage.data);
      setData(prev => [...prev, newData].slice(-50)); // Keep last 50 data points
    }
  }, [lastMessage]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error loading analytics data: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Objects Detected</Typography>
            <Typography variant="h4">{analytics.totalObjects}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Faces Recognized</Typography>
            <Typography variant="h4">{analytics.totalFaces}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Average Processing Time</Typography>
            <Typography variant="h4">{formatNumber(analytics.avgProcessingTime)}ms</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Average Confidence</Typography>
            <Typography variant="h4">{formatNumber(analytics.avgConfidence * 100)}%</Typography>
          </Paper>
        </Grid>

        {/* Real-time Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Object Detection Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value) => [value, 'Count']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="objectCount"
                  stroke={theme.palette.primary.main}
                  name="Objects"
                />
                <Line
                  type="monotone"
                  dataKey="faceCount"
                  stroke={theme.palette.secondary.main}
                  name="Faces"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Processing Performance</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value) => [value, 'Time (ms)']}
                />
                <Legend />
                <Bar
                  dataKey="processingTime"
                  fill={theme.palette.primary.main}
                  name="Processing Time"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Confidence Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Confidence Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatDate}
                />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value) => [formatNumber(value * 100), 'Confidence (%)']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke={theme.palette.success.main}
                  name="Confidence"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
