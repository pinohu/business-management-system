import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Cloudscape Design System components
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  ColumnLayout,
  Button,
  BarChart,
  PieChart,
  Alert,
  Spinner,
  Table,
  DateRangePicker,
  FormField,
  ButtonDropdown,
  Modal,
  Form
} from '@cloudscape-design/components';

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  taxEstimate: number;
  pendingInvoices: number;
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
  }>;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  expensesByCategory: Array<{
    title: string;
    value: number;
  }>;
}

interface DateRangeValue {
  startDate: string;
  endDate: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1 of current year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a call to your API
      // const response = await api.get('/api/v1/finance/dashboard');
      // setData(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setData({
          totalIncome: 15000,
          totalExpenses: 8500,
          netIncome: 6500,
          taxEstimate: 1300,
          pendingInvoices: 3,
          recentTransactions: [
            { id: '1', date: '2025-04-15', description: 'Client Payment', amount: 3000, type: 'income' },
            { id: '2', date: '2025-04-12', description: 'Office Supplies', amount: 150, type: 'expense' },
            { id: '3', date: '2025-04-10', description: 'Consulting Fee', amount: 2500, type: 'income' },
            { id: '4', date: '2025-04-05', description: 'Software Subscription', amount: 99, type: 'expense' }
          ],
          monthlyData: [
            { month: 'Jan', income: 12000, expenses: 7500 },
            { month: 'Feb', income: 13500, expenses: 8000 },
            { month: 'Mar', income: 14000, expenses: 8200 },
            { month: 'Apr', income: 15000, expenses: 8500 }
          ],
          expensesByCategory: [
            { title: 'Office', value: 2500 },
            { title: 'Software', value: 1800 },
            { title: 'Marketing', value: 1500 },
            { title: 'Travel', value: 1200 },
            { title: 'Utilities', value: 1000 },
            { title: 'Other', value: 500 }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
      console.error(err);
    }
  };

  const handleDateRangeChange = (detail: any) => {
    if (detail.value) {
      setDateRange({
        startDate: detail.value.startDate || dateRange.startDate,
        endDate: detail.value.endDate || dateRange.endDate
      });
    }
  };

  const handleExportData = () => {
    alert(`Data would be exported in ${exportFormat.toUpperCase()} format for date range: ${dateRange.startDate} to ${dateRange.endDate}`);
    setIsExportModalOpen(false);
  };

  const handleIntegrationClick = (serviceId: string) => {
    alert(`Integration with ${serviceId} would be implemented here`);
  };

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading dashboard data...
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert type="error">
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert type="warning">
        No dashboard data available
      </Alert>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description="Overview of your business finances"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <ButtonDropdown
                items={[
                  { text: 'Connect to QuickBooks', id: 'quickbooks' },
                  { text: 'Connect to Xero', id: 'xero' },
                  { text: 'Connect to Stripe', id: 'stripe' },
                  { text: 'Connect to PayPal', id: 'paypal' }
                ]}
                onItemClick={({ detail }) => handleIntegrationClick(detail.id)}
              >
                Connect Services
              </ButtonDropdown>
              <Button
                variant="primary"
                onClick={() => setIsExportModalOpen(true)}
              >
                Export Data
              </Button>
            </SpaceBetween>
          }
        >
          Dashboard
        </Header>

        {/* Date Range Selector */}
        <FormField label="Date Range">
          <DateRangePicker
            onChange={handleDateRangeChange}
            value={{
              type: 'absolute',
              startDate: dateRange.startDate,
              endDate: dateRange.endDate
            }}
            i18nStrings={{
              todayAriaLabel: 'Today',
              nextMonthAriaLabel: 'Next month',
              previousMonthAriaLabel: 'Previous month',
              startDateLabel: 'Start date',
              endDateLabel: 'End date',
              clearButtonLabel: 'Clear',
              cancelButtonLabel: 'Cancel',
              applyButtonLabel: 'Apply'
            }}
            placeholder="Filter by date range"
          />
        </FormField>

        {/* Summary Cards */}
        <ColumnLayout columns={4} variant="text-grid">
          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${data.totalIncome.toLocaleString()}</Box>
              <Box variant="h3">Total Income</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${data.totalExpenses.toLocaleString()}</Box>
              <Box variant="h3">Total Expenses</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${data.netIncome.toLocaleString()}</Box>
              <Box variant="h3">Net Income</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${data.taxEstimate.toLocaleString()}</Box>
              <Box variant="h3">Estimated Tax</Box>
            </SpaceBetween>
          </Box>
        </ColumnLayout>

        {/* Income vs Expenses Chart */}
        <Container
          header={
            <Header variant="h2">Income vs Expenses</Header>
          }
        >
          <BarChart
            series={[
              {
                title: 'Income',
                type: 'bar',
                data: data.monthlyData.map(item => ({ x: item.month, y: item.income })),
                valueFormatter: e => `$${e.toLocaleString()}`
              },
              {
                title: 'Expenses',
                type: 'bar',
                data: data.monthlyData.map(item => ({ x: item.month, y: item.expenses })),
                valueFormatter: e => `$${e.toLocaleString()}`
              }
            ]}
            xDomain={data.monthlyData.map(item => item.month)}
            yDomain={[0, Math.max(...data.monthlyData.map(item => item.income)) * 1.2]}
            i18nStrings={{
              xTickFormatter: e => e,
              yTickFormatter: e => `$${e.toLocaleString()}`
            }}
            ariaLabel="Income vs Expenses Bar Chart"
            height={300}
            hideFilter
            hideLegend={false}
            empty={
              <Box textAlign="center" color="inherit">
                <b>No data available</b>
                <Box variant="p" color="inherit">
                  There is no data available
                </Box>
              </Box>
            }
            noMatch={
              <Box textAlign="center" color="inherit">
                <b>No matching data</b>
                <Box variant="p" color="inherit">
                  There is no matching data to display
                </Box>
              </Box>
            }
          />
        </Container>

        {/* Expenses by Category and Recent Transactions */}
        <ColumnLayout columns={2} variant="text-grid">
          <Container
            header={
              <Header variant="h2">Expenses by Category</Header>
            }
          >
            <PieChart
              data={data.expensesByCategory}
              detailPopoverContent={(datum, sum) => [
                { key: 'Category', value: datum.title },
                { key: 'Amount', value: `$${datum.value.toLocaleString()}` },
                { key: 'Percentage', value: `${((datum.value / sum) * 100).toFixed(1)}%` }
              ]}
              segmentDescription={(datum, sum) =>
                `${datum.title}: ${((datum.value / sum) * 100).toFixed(1)}%`
              }
              i18nStrings={{
                filterLabel: 'Filter',
                filterPlaceholder: 'Filter categories',
                filterSelectedAriaLabel: '(selected)',
                legendAriaLabel: 'Legend',
                chartAriaRoleDescription: 'pie chart',
                segmentAriaRoleDescription: 'segment'
              }}
              ariaDescription="Pie chart showing expenses by category"
              ariaLabel="Expenses by Category Pie Chart"
              hideFilter
              size="medium"
              variant="donut"
            />
          </Container>

          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <Button>View All</Button>
                }
              >
                Recent Transactions
              </Header>
            }
          >
            <Table
              columnDefinitions={[
                {
                  id: 'date',
                  header: 'Date',
                  cell: item => new Date(item.date).toLocaleDateString()
                },
                {
                  id: 'description',
                  header: 'Description',
                  cell: item => item.description
                },
                {
                  id: 'amount',
                  header: 'Amount',
                  cell: item => (
                    <Box color={item.type === 'income' ? 'text-status-success' : 'text-status-error'}>
                      {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                    </Box>
                  )
                }
              ]}
              items={data.recentTransactions}
              loadingText="Loading transactions"
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No transactions</b>
                  <Box variant="p" color="inherit">
                    No recent transactions to display
                  </Box>
                </Box>
              }
            />
          </Container>
        </ColumnLayout>
      </SpaceBetween>

      {/* Export Modal */}
      <Modal
        visible={isExportModalOpen}
        header={<Header variant="h2">Export Financial Data</Header>}
        onDismiss={() => setIsExportModalOpen(false)}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsExportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExportData}
              >
                Export
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField
              label="Export Format"
              description="Choose the format for your exported data"
            >
              <ButtonDropdown
                items={[
                  { text: 'CSV', id: 'csv' },
                  { text: 'Excel', id: 'excel' },
                  { text: 'PDF', id: 'pdf' }
                ]}
                onItemClick={({ detail }) => setExportFormat(detail.id)}
              >
                {exportFormat.toUpperCase()}
              </ButtonDropdown>
            </FormField>

            <FormField
              label="Data to Export"
              description="Select what data you want to include in the export"
            >
              <SpaceBetween direction="vertical" size="xs">
                <Box>
                  <input type="checkbox" id="income" defaultChecked />
                  <label htmlFor="income"> Income</label>
                </Box>
                <Box>
                  <input type="checkbox" id="expenses" defaultChecked />
                  <label htmlFor="expenses"> Expenses</label>
                </Box>
                <Box>
                  <input type="checkbox" id="invoices" defaultChecked />
                  <label htmlFor="invoices"> Invoices</label>
                </Box>
                <Box>
                  <input type="checkbox" id="taxes" defaultChecked />
                  <label htmlFor="taxes"> Tax Estimates</label>
                </Box>
              </SpaceBetween>
            </FormField>

            <FormField
              label="Date Range"
              description="Data will be exported for the selected date range"
            >
              <DateRangePicker
                onChange={handleDateRangeChange}
                value={{
                  type: 'absolute',
                  startDate: dateRange.startDate,
                  endDate: dateRange.endDate
                }}
                i18nStrings={{
                  todayAriaLabel: 'Today',
                  nextMonthAriaLabel: 'Next month',
                  previousMonthAriaLabel: 'Previous month',
                  startDateLabel: 'Start date',
                  endDateLabel: 'End date',
                  clearButtonLabel: 'Clear',
                  cancelButtonLabel: 'Cancel',
                  applyButtonLabel: 'Apply'
                }}
                placeholder="Select date range for export"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </Container>
  );
};

export default Dashboard;
