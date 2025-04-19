import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  activeProjects: number;
  pendingInvoices: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Typography>Loading dashboard data...</Typography>;
  }

  if (!data) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Income</Typography>
            <Typography variant="h4">${data.totalIncome.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Expenses</Typography>
            <Typography variant="h4">${data.totalExpenses.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Net Income</Typography>
            <Typography variant="h4">${data.netIncome.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Projects</Typography>
            <Typography variant="h4">{data.activeProjects}</Typography>
          </Paper>
        </Grid>

        {/* Income vs Expenses Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Income vs Expenses
            </Typography>
            <LineChart
              width={800}
              height={300}
              data={data.monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#8884d8" name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
            </LineChart>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {/* Add recent activity list here */}
          </Paper>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Deadlines
            </Typography>
            {/* Add upcoming deadlines list here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
