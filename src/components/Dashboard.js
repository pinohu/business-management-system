// Example React component file
// Cursor will replace this with actual UI logic and props

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import InvoiceGenerator from './InvoiceGenerator';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newIncome, setNewIncome] = useState({ description: '', amount: '', category: 'Other' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Other' });
  const [taxEstimate, setTaxEstimate] = useState(0);
  const [dateFilter, setDateFilter] = useState('all');
  const [categories, setCategories] = useState({
    income: ['Freelance', 'Consulting', 'Other'],
    expenses: ['Office', 'Software', 'Marketing', 'Travel', 'Other'],
  });
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedIncome = localStorage.getItem('income');
    const savedExpenses = localStorage.getItem('expenses');
    if (savedIncome) setIncome(JSON.parse(savedIncome));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const calculateTaxEstimate = () => {
    const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const netIncome = totalIncome - totalExpenses;
    // Simple tax calculation (20% of net income)
    setTaxEstimate(netIncome * 0.2);
  };

  const addIncome = () => {
    if (newIncome.description && newIncome.amount) {
      setIncome([...income, { ...newIncome, date: new Date().toISOString() }]);
      setNewIncome({ description: '', amount: '', category: 'Other' });
      calculateTaxEstimate();
    }
  };

  const addExpense = () => {
    if (newExpense.description && newExpense.amount) {
      setExpenses([...expenses, { ...newExpense, date: new Date().toISOString() }]);
      setNewExpense({ description: '', amount: '', category: 'Other' });
      calculateTaxEstimate();
    }
  };

  const deleteIncome = (index) => {
    const newIncome = [...income];
    newIncome.splice(index, 1);
    setIncome(newIncome);
    calculateTaxEstimate();
  };

  const deleteExpense = (index) => {
    const newExpenses = [...expenses];
    newExpenses.splice(index, 1);
    setExpenses(newExpenses);
    calculateTaxEstimate();
  };

  const generateInvoice = () => {
    setInvoiceDialogOpen(true);
  };

  const getFilteredData = (data) => {
    if (dateFilter === 'all') return data;
    const now = new Date();
    const filterDate = new Date();
    switch (dateFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    return data.filter(item => new Date(item.date) >= filterDate);
  };

  const getChartData = (data, type) => {
    const filteredData = getFilteredData(data);
    const categoryTotals = filteredData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {});
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Total Income</Typography>
            <Typography variant="h4">
              ${getFilteredData(income).reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2)}
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Total Expenses</Typography>
            <Typography variant="h4">
              ${getFilteredData(expenses).reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2)}
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Tax Estimate</Typography>
            <Typography variant="h4">${taxEstimate.toFixed(2)}</Typography>
          </StyledPaper>
        </Grid>

        {/* Date Filter */}
        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FilterListIcon />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={dateFilter}
                  label="Time Period"
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Income by Category</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getChartData(income, 'income')}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {getChartData(income, 'income').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Expenses by Category</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData(expenses, 'expenses')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Income Form */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Add Income</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Description"
                value={newIncome.description}
                onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                fullWidth
              />
              <TextField
                label="Amount"
                type="number"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                fullWidth
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newIncome.category}
                  label="Category"
                  onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })}
                >
                  {categories.income.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={addIncome}>Add</Button>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Expense Form */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Add Expense</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                fullWidth
              />
              <TextField
                label="Amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                fullWidth
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newExpense.category}
                  label="Category"
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  {categories.expenses.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={addExpense}>Add</Button>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Income Table */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Income History</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData(income).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">${Number(item.amount).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete">
                          <IconButton onClick={() => deleteIncome(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
        </Grid>

        {/* Expense Table */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Expense History</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData(expenses).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">${Number(item.amount).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete">
                          <IconButton onClick={() => deleteExpense(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
        </Grid>

        {/* Invoice Generation */}
        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={generateInvoice}
                disabled={income.length === 0}
              >
                Generate Invoice
              </Button>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      <InvoiceGenerator
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        income={income}
      />
    </Box>
  );
}
