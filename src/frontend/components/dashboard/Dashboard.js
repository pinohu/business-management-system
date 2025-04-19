import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  Receipt,
  CheckCircle,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 900 },
];

const projectData = [
  { name: 'In Progress', value: 35 },
  { name: 'Completed', value: 45 },
  { name: 'On Hold', value: 20 },
];

const recentActivities = [
  {
    type: 'success',
    icon: <CheckCircle color="success" />,
    text: 'Project "Website Redesign" completed successfully',
    time: '2 hours ago',
  },
  {
    type: 'warning',
    icon: <Warning color="warning" />,
    text: 'Invoice #1234 is pending payment',
    time: '4 hours ago',
  },
  {
    type: 'info',
    icon: <Info color="info" />,
    text: 'New client "Tech Solutions" added',
    time: '1 day ago',
  },
  {
    type: 'error',
    icon: <Error color="error" />,
    text: 'Document processing failed for "Contract.pdf"',
    time: '2 days ago',
  },
];

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={3}>
          <MetricCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Revenue</Typography>
              </Box>
              <Typography variant="h4">$45,678</Typography>
              <Typography variant="body2" color="text.secondary">
                +12% from last month
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Clients</Typography>
              </Box>
              <Typography variant="h4">156</Typography>
              <Typography variant="body2" color="text.secondary">
                +5 new this month
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Projects</Typography>
              </Box>
              <Typography variant="h4">24</Typography>
              <Typography variant="body2" color="text.secondary">
                8 in progress
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Receipt sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Pending Invoices</Typography>
              </Box>
              <Typography variant="h4">12</Typography>
              <Typography variant="body2" color="text.secondary">
                $23,456 total
              </Typography>
            </CardContent>
          </MetricCard>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Project Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>{activity.icon}</ListItemIcon>
                    <ListItemText
                      primary={activity.text}
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 