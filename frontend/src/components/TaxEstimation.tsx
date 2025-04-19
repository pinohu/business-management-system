import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface TaxData {
  totalIncome: number;
  totalExpenses: number;
  totalTax: number;
  quarterlyBreakdown: Array<{
    quarter: number;
    income: number;
    expenses: number;
    tax: number;
  }>;
}

export const TaxEstimation: React.FC = () => {
  const { user } = useAuth();
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchTaxData();
  }, [selectedYear]);

  const fetchTaxData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/taxes/summary/${selectedYear}`);
      setTaxData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tax data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaxEstimate = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
      await api.post('/taxes/estimate', {
        year: currentDate.getFullYear(),
        quarter,
      });
      await fetchTaxData();
    } catch (err) {
      setError('Failed to calculate tax estimate');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!taxData) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h6" gutterBottom>
          No tax data available
        </Typography>
        <Button variant="contained" color="primary" onClick={calculateTaxEstimate}>
          Calculate Tax Estimate
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4">
              ${taxData.totalIncome.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4">
              ${taxData.totalExpenses.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estimated Tax
            </Typography>
            <Typography variant="h4">
              ${taxData.totalTax.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quarterly Breakdown
            </Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taxData.quarterlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#8884d8" name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
                  <Line type="monotone" dataKey="tax" stroke="#ffc658" name="Tax" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={calculateTaxEstimate}>
          Recalculate Tax Estimate
        </Button>
      </Box>
    </Box>
  );
};
