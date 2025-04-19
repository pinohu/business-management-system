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
  Spinner,
  Tabs,
  Toggle
} from '@cloudscape-design/components';

interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  nextDue?: string;
  description?: string;
  active: boolean;
}

interface TransactionFormData {
  name: string;
  amount: string;
  type: string;
  category: string;
  frequency: string;
  startDate: string;
  endDate: string;
  description: string;
  active: boolean;
}

const CATEGORIES_INCOME = [
  { label: 'Salary', value: 'salary' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'Investments', value: 'investments' },
  { label: 'Rental Income', value: 'rental' },
  { label: 'Other', value: 'other' }
];

const CATEGORIES_EXPENSE = [
  { label: 'Rent/Mortgage', value: 'rent' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Subscriptions', value: 'subscriptions' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Software', value: 'software' },
  { label: 'Office Supplies', value: 'office_supplies' },
  { label: 'Other', value: 'other' }
];

const FREQUENCIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annually', value: 'annually' }
];

const RecurringTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);
  const [activeTabId, setActiveTabId] = useState('income');
  const [formData, setFormData] = useState<TransactionFormData>({
    name: '',
    amount: '',
    type: 'income',
    category: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    active: true
  });

  // For demo purposes, we'll use mock data
  useEffect(() => {
    // In a real app, this would be an API call
    // api.get('/finance/recurring-transactions')
    setTimeout(() => {
      const mockTransactions: RecurringTransaction[] = [
        {
          id: '1',
          name: 'Monthly Salary',
          amount: 5000,
          type: 'income',
          category: 'salary',
          frequency: 'monthly',
          startDate: '2025-01-01',
          lastProcessed: '2025-04-01',
          nextDue: '2025-05-01',
          description: 'Regular monthly salary',
          active: true
        },
        {
          id: '2',
          name: 'Freelance Client Retainer',
          amount: 2000,
          type: 'income',
          category: 'freelance',
          frequency: 'monthly',
          startDate: '2025-02-15',
          lastProcessed: '2025-04-15',
          nextDue: '2025-05-15',
          description: 'Monthly retainer for ongoing work',
          active: true
        },
        {
          id: '3',
          name: 'Office Rent',
          amount: 1500,
          type: 'expense',
          category: 'rent',
          frequency: 'monthly',
          startDate: '2025-01-01',
          lastProcessed: '2025-04-01',
          nextDue: '2025-05-01',
          description: 'Monthly office space rent',
          active: true
        },
        {
          id: '4',
          name: 'Software Subscriptions',
          amount: 200,
          type: 'expense',
          category: 'subscriptions',
          frequency: 'monthly',
          startDate: '2025-01-05',
          lastProcessed: '2025-04-05',
          nextDue: '2025-05-05',
          description: 'Various SaaS subscriptions',
          active: true
        },
        {
          id: '5',
          name: 'Quarterly Tax Payment',
          amount: 3000,
          type: 'expense',
          category: 'other',
          frequency: 'quarterly',
          startDate: '2025-01-15',
          lastProcessed: '2025-04-15',
          nextDue: '2025-07-15',
          description: 'Estimated quarterly tax payment',
          active: true
        }
      ];
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateTransaction = () => {
    setSelectedTransaction(null);
    setFormData({
      name: '',
      amount: '',
      type: activeTabId,
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      name: transaction.name,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      frequency: transaction.frequency,
      startDate: transaction.startDate,
      endDate: transaction.endDate || '',
      description: transaction.description || '',
      active: transaction.active
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.amount || !formData.category || !formData.frequency || !formData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    // In a real app, this would be an API call
    // const endpoint = selectedTransaction ? `/finance/recurring-transactions/${selectedTransaction.id}` : '/finance/recurring-transactions';
    // const method = selectedTransaction ? 'put' : 'post';
    // api[method](endpoint, formData)

    // Calculate next due date based on frequency and start date
    const startDate = new Date(formData.startDate);
    let nextDue = new Date(startDate);

    switch (formData.frequency) {
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'annually':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
    }

    // For demo purposes, we'll just update the state
    const newTransaction: RecurringTransaction = {
      id: selectedTransaction ? selectedTransaction.id : Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type as 'income' | 'expense',
      category: formData.category,
      frequency: formData.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      lastProcessed: selectedTransaction?.lastProcessed,
      nextDue: nextDue.toISOString().split('T')[0],
      description: formData.description || undefined,
      active: formData.active
    };

    if (selectedTransaction) {
      setTransactions(prev => prev.map(t => t.id === selectedTransaction.id ? newTransaction : t));
    } else {
      setTransactions(prev => [...prev, newTransaction]);
    }

    setIsModalOpen(false);
    setError(null);
  };

  const handleDeleteTransaction = (transaction: RecurringTransaction) => {
    // In a real app, this would be an API call
    // api.delete(`/finance/recurring-transactions/${transaction.id}`)

    // For demo purposes, we'll just update the state
    setTransactions(prev => prev.filter(t => t.id !== transaction.id));
  };

  const handleToggleActive = (transaction: RecurringTransaction) => {
    // In a real app, this would be an API call
    // api.patch(`/finance/recurring-transactions/${transaction.id}`, { active: !transaction.active })

    // For demo purposes, we'll just update the state
    setTransactions(prev =>
      prev.map(t => t.id === transaction.id ? { ...t, active: !t.active } : t)
    );
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.type === activeTabId &&
    (transaction.name.toLowerCase().includes(filterText.toLowerCase()) ||
     transaction.category.toLowerCase().includes(filterText.toLowerCase()) ||
     transaction.frequency.toLowerCase().includes(filterText.toLowerCase()))
  );

  // Calculate statistics
  const totalMonthlyIncome = transactions
    .filter(t => t.type === 'income' && t.active)
    .reduce((sum, t) => {
      let monthlyAmount = t.amount;
      switch (t.frequency) {
        case 'daily': monthlyAmount *= 30; break;
        case 'weekly': monthlyAmount *= 4.33; break;
        case 'quarterly': monthlyAmount /= 3; break;
        case 'annually': monthlyAmount /= 12; break;
      }
      return sum + monthlyAmount;
    }, 0);

  const totalMonthlyExpenses = transactions
    .filter(t => t.type === 'expense' && t.active)
    .reduce((sum, t) => {
      let monthlyAmount = t.amount;
      switch (t.frequency) {
        case 'daily': monthlyAmount *= 30; break;
        case 'weekly': monthlyAmount *= 4.33; break;
        case 'quarterly': monthlyAmount /= 3; break;
        case 'annually': monthlyAmount /= 12; break;
      }
      return sum + monthlyAmount;
    }, 0);

  const netMonthlyRecurring = totalMonthlyIncome - totalMonthlyExpenses;

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading recurring transactions...
        </Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description="Manage your recurring income and expenses"
          actions={
            <Button
              variant="primary"
              onClick={handleCreateTransaction}
            >
              Create Recurring Transaction
            </Button>
          }
        >
          Recurring Transactions
        </Header>

        {/* Summary Cards */}
        <ColumnLayout columns={3} variant="text-grid">
          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${totalMonthlyIncome.toLocaleString()}</Box>
              <Box variant="h3">Monthly Recurring Income</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${totalMonthlyExpenses.toLocaleString()}</Box>
              <Box variant="h3">Monthly Recurring Expenses</Box>
            </SpaceBetween>
          </Box>

          <Box
            padding="l"
            variant="awsui-key-label"
            textAlign="center"
          >
            <SpaceBetween size="s">
              <Box variant="h2">${netMonthlyRecurring.toLocaleString()}</Box>
              <Box variant="h3">Net Monthly Recurring</Box>
            </SpaceBetween>
          </Box>
        </ColumnLayout>

        {/* Tabs for Income/Expense */}
        <Tabs
          tabs={[
            {
              id: 'income',
              label: 'Recurring Income',
              content: (
                <SpaceBetween size="l">
                  <TextFilter
                    filteringText={filterText}
                    filteringPlaceholder="Find recurring income"
                    filteringAriaLabel="Filter recurring income"
                    onChange={({ detail }) => setFilterText(detail.filteringText)}
                  />

                  <Table
                    columnDefinitions={[
                      {
                        id: 'name',
                        header: 'Name',
                        cell: item => item.name,
                        sortingField: 'name'
                      },
                      {
                        id: 'amount',
                        header: 'Amount',
                        cell: item => `$${item.amount.toLocaleString()}`,
                        sortingField: 'amount'
                      },
                      {
                        id: 'frequency',
                        header: 'Frequency',
                        cell: item => item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1),
                        sortingField: 'frequency'
                      },
                      {
                        id: 'category',
                        header: 'Category',
                        cell: item => CATEGORIES_INCOME.find(c => c.value === item.category)?.label || item.category,
                        sortingField: 'category'
                      },
                      {
                        id: 'nextDue',
                        header: 'Next Due',
                        cell: item => item.nextDue ? new Date(item.nextDue).toLocaleDateString() : 'N/A',
                        sortingField: 'nextDue'
                      },
                      {
                        id: 'active',
                        header: 'Status',
                        cell: item => (
                          <Toggle
                            checked={item.active}
                            onChange={() => handleToggleActive(item)}
                          >
                            {item.active ? 'Active' : 'Inactive'}
                          </Toggle>
                        )
                      },
                      {
                        id: 'actions',
                        header: 'Actions',
                        cell: item => (
                          <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => handleEditTransaction(item)}>Edit</Button>
                            <Button variant="link" onClick={() => handleDeleteTransaction(item)}>Delete</Button>
                          </SpaceBetween>
                        )
                      }
                    ]}
                    items={filteredTransactions}
                    pagination={
                      <Pagination
                        currentPageIndex={currentPage}
                        onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                        pagesCount={Math.ceil(filteredTransactions.length / 10)}
                        ariaLabels={{
                          nextPageLabel: 'Next page',
                          previousPageLabel: 'Previous page',
                          pageLabel: pageNumber => `Page ${pageNumber} of ${Math.ceil(filteredTransactions.length / 10)}`
                        }}
                      />
                    }
                    loadingText="Loading recurring income"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No recurring income</b>
                        <Box variant="p" color="inherit">
                          No recurring income to display. Create your first recurring income to get started.
                        </Box>
                      </Box>
                    }
                  />
                </SpaceBetween>
              )
            },
            {
              id: 'expense',
              label: 'Recurring Expenses',
              content: (
                <SpaceBetween size="l">
                  <TextFilter
                    filteringText={filterText}
                    filteringPlaceholder="Find recurring expenses"
                    filteringAriaLabel="Filter recurring expenses"
                    onChange={({ detail }) => setFilterText(detail.filteringText)}
                  />

                  <Table
                    columnDefinitions={[
                      {
                        id: 'name',
                        header: 'Name',
                        cell: item => item.name,
                        sortingField: 'name'
                      },
                      {
                        id: 'amount',
                        header: 'Amount',
                        cell: item => `$${item.amount.toLocaleString()}`,
                        sortingField: 'amount'
                      },
                      {
                        id: 'frequency',
                        header: 'Frequency',
                        cell: item => item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1),
                        sortingField: 'frequency'
                      },
                      {
                        id: 'category',
                        header: 'Category',
                        cell: item => CATEGORIES_EXPENSE.find(c => c.value === item.category)?.label || item.category,
                        sortingField: 'category'
                      },
                      {
                        id: 'nextDue',
                        header: 'Next Due',
                        cell: item => item.nextDue ? new Date(item.nextDue).toLocaleDateString() : 'N/A',
                        sortingField: 'nextDue'
                      },
                      {
                        id: 'active',
                        header: 'Status',
                        cell: item => (
                          <Toggle
                            checked={item.active}
                            onChange={() => handleToggleActive(item)}
                          >
                            {item.active ? 'Active' : 'Inactive'}
                          </Toggle>
                        )
                      },
                      {
                        id: 'actions',
                        header: 'Actions',
                        cell: item => (
                          <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => handleEditTransaction(item)}>Edit</Button>
                            <Button variant="link" onClick={() => handleDeleteTransaction(item)}>Delete</Button>
                          </SpaceBetween>
                        )
                      }
                    ]}
                    items={filteredTransactions}
                    pagination={
                      <Pagination
                        currentPageIndex={currentPage}
                        onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                        pagesCount={Math.ceil(filteredTransactions.length / 10)}
                        ariaLabels={{
                          nextPageLabel: 'Next page',
                          previousPageLabel: 'Previous page',
                          pageLabel: pageNumber => `Page ${pageNumber} of ${Math.ceil(filteredTransactions.length / 10)}`
                        }}
                      />
                    }
                    loadingText="Loading recurring expenses"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No recurring expenses</b>
                        <Box variant="p" color="inherit">
                          No recurring expenses to display. Create your first recurring expense to get started.
                        </Box>
                      </Box>
                    }
                  />
                </SpaceBetween>
              )
            }
          ]}
          activeTabId={activeTabId}
          onChange={({ detail }) => {
            setActiveTabId(detail.activeTabId);
            setFilterText('');
          }}
        />
      </SpaceBetween>

      {/* Create/Edit Transaction Modal */}
      <Modal
        visible={isModalOpen}
        header={<Header variant="h2">{selectedTransaction ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}</Header>}
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
                {selectedTransaction ? 'Save Changes' : 'Create Transaction'}
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
              label="Transaction Type"
              description="Select whether this is income or an expense"
              constraintText="Required"
            >
              <Select
                selectedOption={{ label: formData.type === 'income' ? 'Income' : 'Expense', value: formData.type }}
                onChange={({ detail }) => handleFormChange('type', detail.selectedOption?.value || 'income')}
                options={[
                  { label: 'Income', value: 'income' },
                  { label: 'Expense', value: 'expense' }
                ]}
              />
            </FormField>

            <FormField
              label="Name"
              description="Enter a descriptive name for this recurring transaction"
              constraintText="Required"
            >
              <Input
                value={formData.name}
                onChange={({ detail }) => handleFormChange('name', detail.value)}
                placeholder="e.g., Monthly Salary, Office Rent"
              />
            </FormField>

            <FormField
              label="Amount"
              description="Enter the transaction amount"
              constraintText="Required"
            >
              <Input
                value={formData.amount}
                onChange={({ detail }) => handleFormChange('amount', detail.value)}
                placeholder="e.g., 1000"
                type="number"
              />
            </FormField>

            <FormField
              label="Category"
              description="Select a category for this transaction"
              constraintText="Required"
            >
              <Select
                selectedOption={
                  formData.type === 'income'
                    ? (CATEGORIES_INCOME.find(c => c.value === formData.category) || null)
                    : (CATEGORIES_EXPENSE.find(c => c.value === formData.category) || null)
                }
                onChange={({ detail }) => handleFormChange('category', detail.selectedOption?.value || '')}
                options={formData.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE}
                placeholder="Select a category"
              />
            </FormField>

            <FormField
              label="Frequency"
              description="How often does this transaction occur?"
              constraintText="Required"
            >
              <Select
                selectedOption={FREQUENCIES.find(f => f.value === formData.frequency) || null}
                onChange={({ detail }) => handleFormChange('frequency', detail.selectedOption?.value || '')}
                options={FREQUENCIES}
                placeholder="Select frequency"
              />
            </FormField>

            <FormField
              label="Start Date"
              description="When should this recurring transaction begin?"
              constraintText="Required"
            >
              <DatePicker
                value={formData.startDate}
                onChange={({ detail }) => handleFormChange('startDate', detail.value)}
                placeholder="YYYY-MM-DD"
              />
            </FormField>

            <FormField
              label="End Date (Optional)"
              description="When should this recurring transaction end? Leave blank for indefinite."
            >
              <DatePicker
                value={formData.endDate}
                onChange={({ detail }) => handleFormChange('endDate', detail.value)}
                placeholder="YYYY-MM-DD"
              />
            </FormField>

            <FormField
              label="Description (Optional)"
              description="Additional notes about this recurring transaction"
            >
              <Input
                value={formData.description}
                onChange={({ detail }) => handleFormChange('description', detail.value)}
                placeholder="Add any additional notes here"
              />
            </FormField>

            <FormField
              label="Status"
              description="Is this recurring transaction active?"
            >
              <Toggle
                checked={formData.active}
                onChange={({ detail }) => handleFormChange('active', detail.checked)}
              >
                {formData.active ? 'Active' : 'Inactive'}
              </Toggle>
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>
    </Container>
  );
};

export default RecurringTransactions;
