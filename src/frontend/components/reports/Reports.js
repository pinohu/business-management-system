import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
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

const revenueData = [
  { name: 'Jan', value: 40000 },
  { name: 'Feb', value: 35000 },
  { name: 'Mar', value: 60000 },
  { name: 'Apr', value: 80000 },
  { name: 'May', value: 70000 },
  { name: 'Jun', value: 90000 },
];

const clientData = [
  { name: 'Enterprise', value: 45 },
  { name: 'SMB', value: 30 },
  { name: 'Startup', value: 25 },
];

const projectData = [
  { name: 'In Progress', value: 35 },
  { name: 'Completed', value: 45 },
  { name: 'On Hold', value: 20 },
];

const insights = [
  {
    icon: <TrendingUpIcon color="success" />,
    title: 'Revenue Growth',
    description: 'Revenue has increased by 25% compared to last month',
  },
  {
    icon: <PeopleIcon color="primary" />,
    title: 'Client Acquisition',
    description: '5 new clients acquired this month',
  },
  {
    icon: <AssignmentIcon color="warning" />,
    title: 'Project Completion',
    description: '3 projects completed ahead of schedule',
  },
  {
    icon: <ReceiptIcon color="error" />,
    title: 'Payment Delays',
    description: '2 invoices are overdue by more than 30 days',
  },
];

const Reports = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleExportDialogOpen = () => {
    setOpenExportDialog(true);
  };

  const handleExportDialogClose = () => {
    setOpenExportDialog(false);
  };

  const handleExport = () => {
    // Implement export logic
    handleExportDialogClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Reports & Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Report">
            <IconButton onClick={handleExportDialogOpen}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Report">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email Report">
            <IconButton>
              <EmailIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <StyledPaper>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="Overview" />
          <Tab label="Financial" />
          <Tab label="Projects" />
          <Tab label="Clients" />
        </Tabs>

        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={3}>
            <MetricCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h4">$375,000</Typography>
                <Typography variant="body2" color="text.secondary">
                  +25% from last month
                </Typography>
              </CardContent>
            </MetricCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Active Clients</Typography>
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
                  <AssignmentIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">Active Projects</Typography>
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
                  <ReceiptIcon sx={{ mr: 1, color: 'error.main' }} />
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
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Client Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    />
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </StyledPaper>
          </Grid>

          {/* Insights */}
          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Key Insights
              </Typography>
              <Grid container spacing={2}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {insight.icon}
                          <Typography variant="h6" sx={{ ml: 1 }}>
                            {insight.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {insight.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>
          </Grid>
        </Grid>
      </StyledPaper>

      <Dialog
        open={openExportDialog}
        onClose={handleExportDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Report Format"
              select
              fullWidth
              defaultValue="pdf"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportDialogClose}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 