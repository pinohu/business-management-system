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
  Table,
  Pagination,
  TextFilter,
  Modal,
  Form,
  FormField,
  Input,
  Select,
  DatePicker,
  Alert,
  ProgressBar,
  BarChart,
  PieChart,
  Spinner
} from '@cloudscape-design/components';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate: string;
  notes?: string;
}

interface BudgetFormData {
  name: string;
  amount: string;
  category: string;
  period: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const CATEGORIES = [
  { label: 'Marketing', value: 'marketing' },
  { label: 'Operations', value: 'operations' },
  { label: 'Software', value: 'software' },
  { label: 'Hardware', value: 'hardware' },
  { label: 'Office Supplies', value: 'office_supplies' },
  { label: 'Travel', value: 'travel' },
  { label: 'Salaries', value: 'salaries' },
  { label: 'Rent', value: 'rent' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Other', value: 'other' }
];

const PERIODS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annual', value: 'annual' }
];

const Budgeting: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    amount: '',
    category: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    notes: ''
  });

  // For demo purposes, we'll use mock data
  useEffect(() => {
    // In a real app, this would be an API call
    // api.get('/finance/budgets')
    setTimeout(() => {
      const mockBudgets: Budget[] = [
        {
          id: '1',
          name: 'Marketing Budget',
          amount: 5000,
          spent: 2500,
          category: 'marketing',
          period: 'monthly',
          startDate: '2025-04-01',
          endDate: '2025-04-30'
        },
        {
          id: '2',
          name: 'Software Subscriptions',
          amount: 2000,
          spent: 1800,
          category: 'software',
          period: 'monthly',
          startDate: '2025-04-01',
          endDate: '2025-04-30'
        },
        {
          id: '3',
          name: 'Office Supplies',
          amount: 1000,
          spent: 300,
          category: 'office_supplies',
          period: 'monthly',
          startDate: '2025-04-01',
          endDate: '2025-04-30'
        },
        {
          id: '4',
          name: 'Annual Conference',
          amount: 10000,
          spent: 0,
          category: 'travel',
          period: 'annual',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          notes: 'Budget for annual industry conference'
        }
      ];
      setBudgets(mockBudgets);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateBudget = () => {
    setSelectedBudget(null);
    setFormData({
      name: '',
      amount: '',
      category: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      name: budget.name,
      amount: budget.amount.toString(),
      category: budget.category,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
      notes: budget.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof BudgetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.amount || !formData.category || !formData.period || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    // In a real app, this would be an API call
    // const endpoint = selectedBudget ? `/finance/budgets/${selectedBudget.id}` : '/finance/budgets';
    // const method = selectedBudget ? 'put' : 'post';
    // api[method](endpoint, formData)

    // For demo purposes, we'll just update the state
    const newBudget: Budget = {
      id: selectedBudget ? selectedBudget.id : Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      spent: selectedBudget ? selectedBudget.spent : 0,
      category: formData.category,
      period: formData.period as 'monthly' | 'quarterly' | 'annual',
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes
    };

    if (selectedBudget) {
      setBudgets(prev => prev.map(b => b.id === selectedBudget.id ? newBudget : b));
    } else {
      setBudgets(prev => [...prev, newBudget]);
    }

    setIsModalOpen(false);
    setError(null);
  };

  const handleDeleteBudget = (budget: Budget) => {
    // In a real app, this would be an API call
    // api.delete(`/finance/budgets/${budget.id}`)

    // For demo purposes, we'll just update the state
    setBudgets(prev => prev.filter(b => b.id !== budget.id));
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(filterText.toLowerCase()) ||
    budget.category.toLowerCase().includes(filterText.toLowerCase()) ||
    budget.period.toLowerCase().includes(filterText.toLowerCase())
  );

  // Calculate budget statistics
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Prepare chart data
  const categoryData = CATEGORIES.map(category => {
    const budgetsInCategory = budgets.filter(b => b.category === category.value);
    const totalAmount = budgetsInCategory.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetsInCategory.reduce((sum, b) => sum + b.spent, 0);

    return {
      title: category.label,
      value: totalAmount,
      spent: totalSpent
    };
  }).filter(item => item.value > 0);

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading budgets...
        </Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description="Manage your budgets and track spending"
          actions={
            <Button
              variant="primary"
              onClick={handleCreateBudget}
            >
              Create Budget
            </Button>
          }
        >
          Budgeting
        </Header>

        {/* Budget Summary */}
        <ColumnLayout columns={3} variant="text-grid">
          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${totalBudgeted.toLocaleString()}</Box>
              <Box variant="h3">Total Budgeted</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${totalSpent.toLocaleString()}</Box>
              <Box variant="h3">Total Spent</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${remainingBudget.toLocaleString()}</Box>
              <Box variant="h3">Remaining Budget</Box>
            </SpaceBetween>
          </Box>
        </ColumnLayout>

        {/* Budget Utilization */}
        <Container
          header={
            <Header variant="h2">Budget Utilization</Header>
          }
        >
          <ProgressBar
            value={budgetUtilization}
            label="Overall Budget Utilization"
            description={`${budgetUtilization.toFixed(1)}% of total budget spent`}
            status={budgetUtilization > 90 ? 'error' : budgetUtilization > 75 ? 'in-progress' : 'success'}
          />
        </Container>

        {/* Budget Breakdown */}
        <ColumnLayout columns={2} variant="text-grid">
          <Container
            header={
              <Header variant="h2">Budget by Category</Header>
            }
          >
            <PieChart
              data={categoryData}
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
              ariaDescription="Pie chart showing budget allocation by category"
              ariaLabel="Budget by Category Pie Chart"
              hideFilter
              size="medium"
              variant="donut"
            />
          </Container>

          <Container
            header={
              <Header variant="h2">Budget vs. Spent by Category</Header>
            }
          >
            <BarChart
              series={[
                {
                  title: 'Budgeted',
                  type: 'bar',
                  data: categoryData.map(item => ({ x: item.title, y: item.value })),
                  valueFormatter: e => `$${e.toLocaleString()}`
                },
                {
                  title: 'Spent',
                  type: 'bar',
                  data: categoryData.map(item => ({ x: item.title, y: item.spent })),
                  valueFormatter: e => `$${e.toLocaleString()}`
                }
              ]}
              xDomain={categoryData.map(item => item.title)}
              yDomain={[0, Math.max(...categoryData.map(item => item.value)) * 1.2]}
              i18nStrings={{
                xTickFormatter: e => e,
                yTickFormatter: e => `$${e.toLocaleString()}`
              }}
              ariaLabel="Budget vs. Spent by Category Bar Chart"
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
        </ColumnLayout>

        {/* Budget List */}
        <Container
          header={
            <Header
              variant="h2"
              description="View and manage your budgets"
            >
              Budget List
            </Header>
          }
        >
          <SpaceBetween size="m">
            <TextFilter
              filteringText={filterText}
              filteringPlaceholder="Find budgets"
              filteringAriaLabel="Filter budgets"
              onChange={({ detail }) => setFilterText(detail.filteringText)}
            />

            <Table
              columnDefinitions={[
                {
                  id: 'name',
                  header: 'Budget Name',
                  cell: item => item.name,
                  sortingField: 'name'
                },
                {
                  id: 'category',
                  header: 'Category',
                  cell: item => CATEGORIES.find(c => c.value === item.category)?.label || item.category,
                  sortingField: 'category'
                },
                {
                  id: 'period',
                  header: 'Period',
                  cell: item => item.period.charAt(0).toUpperCase() + item.period.slice(1),
                  sortingField: 'period'
                },
                {
                  id: 'amount',
                  header: 'Amount',
                  cell: item => `$${item.amount.toLocaleString()}`,
                  sortingField: 'amount'
                },
                {
                  id: 'spent',
                  header: 'Spent',
                  cell: item => `$${item.spent.toLocaleString()}`,
                  sortingField: 'spent'
                },
                {
                  id: 'remaining',
                  header: 'Remaining',
                  cell: item => `$${(item.amount - item.spent).toLocaleString()}`,
                  sortingField: 'remaining'
                },
                {
                  id: 'utilization',
                  header: 'Utilization',
                  cell: item => {
                    const utilization = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
                    return (
                      <ProgressBar
                        value={utilization}
                        status={utilization > 90 ? 'error' : utilization > 75 ? 'in-progress' : 'success'}
                        description={`${utilization.toFixed(1)}%`}
                      />
                    );
                  }
                },
                {
                  id: 'actions',
                  header: 'Actions',
                  cell: item => (
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={() => handleEditBudget(item)}>Edit</Button>
                      <Button variant="link" onClick={() => handleDeleteBudget(item)}>Delete</Button>
                    </SpaceBetween>
                  )
                }
              ]}
              items={filteredBudgets}
              pagination={
                <Pagination
                  currentPageIndex={currentPage}
                  onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                  pagesCount={Math.ceil(filteredBudgets.length / 10)}
                  ariaLabels={{
                    nextPageLabel: 'Next page',
                    previousPageLabel: 'Previous page',
                    pageLabel: pageNumber => `Page ${pageNumber} of ${Math.ceil(filteredBudgets.length / 10)}`
                  }}
                />
              }
              loadingText="Loading budgets"
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No budgets</b>
                  <Box variant="p" color="inherit">
                    No budgets to display. Create your first budget to get started.
                  </Box>
                </Box>
              }
            />
          </SpaceBetween>
        </Container>
      </SpaceBetween>

      {/* Create/Edit Budget Modal */}
      <Modal
        visible={isModalOpen}
        header={<Header variant="h2">{selectedBudget ? 'Edit Budget' : 'Create Budget'}</Header>}
        onDismiss={() => setIsModalOpen(false)}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
              >
                {selectedBudget ? 'Save Changes' : 'Create Budget'}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            {error && (
              <Alert type="error">
                {error}
              </Alert>
            )}

            <FormField
              label="Budget Name"
              description="Enter a descriptive name for this budget"
              constraintText="Required"
            >
              <Input
                value={formData.name}
                onChange={({ detail }) => handleFormChange('name', detail.value)}
                placeholder="e.g., Marketing Budget Q2 2025"
              />
            </FormField>

            <FormField
              label="Amount"
              description="Enter the total budget amount"
              constraintText="Required"
            >
              <Input
                value={formData.amount}
                onChange={({ detail }) => handleFormChange('amount', detail.value)}
                placeholder="e.g., 5000"
                type="number"
              />
            </FormField>

            <FormField
              label="Category"
              description="Select a category for this budget"
              constraintText="Required"
            >
              <Select
                selectedOption={CATEGORIES.find(c => c.value === formData.category) || null}
                onChange={({ detail }) => handleFormChange('category', detail.selectedOption?.value || '')}
                options={CATEGORIES}
                placeholder="Select a category"
              />
            </FormField>

            <FormField
              label="Period"
              description="Select the budget period"
              constraintText="Required"
            >
              <Select
                selectedOption={PERIODS.find(p => p.value === formData.period) || null}
                onChange={({ detail }) => handleFormChange('period', detail.selectedOption?.value || '')}
                options={PERIODS}
                placeholder="Select a period"
              />
            </FormField>

            <FormField
              label="Start Date"
              description="Select the start date for this budget"
              constraintText="Required"
            >
              <DatePicker
                value={formData.startDate}
                onChange={({ detail }) => handleFormChange('startDate', detail.value)}
                placeholder="YYYY-MM-DD"
              />
            </FormField>

            <FormField
              label="End Date"
              description="Select the end date for this budget"
              constraintText="Required"
            >
              <DatePicker
                value={formData.endDate}
                onChange={({ detail }) => handleFormChange('endDate', detail.value)}
                placeholder="YYYY-MM-DD"
              />
            </FormField>

            <FormField
              label="Notes"
              description="Optional notes about this budget"
            >
              <Input
                value={formData.notes}
                onChange={({ detail }) => handleFormChange('notes', detail.value)}
                placeholder="Add any additional notes here"
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </Container>
  );
};

export default Budgeting;
