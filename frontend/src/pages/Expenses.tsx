import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Cloudscape Design System components
import {
  Container,
  Header,
  Table,
  Box,
  SpaceBetween,
  Button,
  Modal,
  Form,
  FormField,
  Input,
  DatePicker,
  Select,
  Alert,
  Pagination,
  TextFilter,
  Spinner
} from '@cloudscape-design/components';

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [selectedItems, setSelectedItems] = useState<ExpenseItem[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const categoryOptions = [
    { label: 'Office Supplies', value: 'office_supplies' },
    { label: 'Software', value: 'software' },
    { label: 'Travel', value: 'travel' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Other', value: 'other' }
  ];

  useEffect(() => {
    fetchExpenseData();
  }, []);

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a call to your API
      // const response = await api.get('/api/v1/finance/expenses');
      // setExpenseItems(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setExpenseItems([
          { id: '1', description: 'Office Supplies', amount: 150, date: '2025-04-05', category: 'office_supplies' },
          { id: '2', description: 'Software Subscription', amount: 99, date: '2025-04-10', category: 'software' },
          { id: '3', description: 'Business Trip', amount: 850, date: '2025-04-15', category: 'travel' },
          { id: '4', description: 'Marketing Campaign', amount: 500, date: '2025-04-20', category: 'marketing' },
          { id: '5', description: 'Utilities', amount: 200, date: '2025-04-25', category: 'utilities' }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load expense data');
      setLoading(false);
      console.error(err);
    }
  };

  const handleAddExpense = async () => {
    // Validate form
    if (!formData.description.trim()) {
      setFormError('Description is required');
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setFormError('Amount must be a positive number');
      return;
    }
    if (!formData.date) {
      setFormError('Date is required');
      return;
    }
    if (!formData.category) {
      setFormError('Category is required');
      return;
    }

    try {
      // In a real app, this would be a call to your API
      // await api.post('/api/v1/finance/expenses', {
      //   description: formData.description,
      //   amount: Number(formData.amount),
      //   date: formData.date,
      //   category: formData.category
      // });

      // For demo purposes, we'll just update the state
      const newExpense = {
        id: Date.now().toString(),
        description: formData.description,
        amount: Number(formData.amount),
        date: formData.date,
        category: formData.category
      };

      setExpenseItems([newExpense, ...expenseItems]);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setFormError('Failed to add expense');
      console.error(err);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // In a real app, this would be a call to your API
      // await Promise.all(selectedItems.map(item => api.delete(`/api/v1/finance/expenses/${item.id}`)));

      // For demo purposes, we'll just update the state
      const remainingItems = expenseItems.filter(
        item => !selectedItems.some(selected => selected.id === item.id)
      );
      setExpenseItems(remainingItems);
      setSelectedItems([]);
    } catch (err) {
      setError('Failed to delete expense items');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: '',
      category: ''
    });
    setFormError(null);
  };

  const filteredItems = expenseItems.filter(item =>
    item.description.toLowerCase().includes(filterText.toLowerCase()) ||
    item.category.toLowerCase().includes(filterText.toLowerCase())
  );

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading expense data...
        </Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Table
          header={
            <Header
              variant="h2"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  {selectedItems.length > 0 && (
                    <Button
                      variant="normal"
                      onClick={handleDeleteSelected}
                    >
                      Delete Selected
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Add Expense
                  </Button>
                </SpaceBetween>
              }
              counter={`(${expenseItems.length})`}
            >
              Expenses
            </Header>
          }
          columnDefinitions={[
            {
              id: 'date',
              header: 'Date',
              cell: item => new Date(item.date).toLocaleDateString(),
              sortingField: 'date'
            },
            {
              id: 'description',
              header: 'Description',
              cell: item => item.description,
              sortingField: 'description'
            },
            {
              id: 'category',
              header: 'Category',
              cell: item => {
                const category = categoryOptions.find(cat => cat.value === item.category);
                return category ? category.label : item.category;
              },
              sortingField: 'category'
            },
            {
              id: 'amount',
              header: 'Amount',
              cell: item => `$${item.amount.toLocaleString()}`,
              sortingField: 'amount'
            }
          ]}
          items={paginatedItems}
          selectionType="multi"
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          filter={
            <TextFilter
              filteringText={filterText}
              filteringPlaceholder="Find expense"
              filteringAriaLabel="Filter expenses"
              onChange={({ detail }) => {
                setFilterText(detail.filteringText);
                setCurrentPage(1);
              }}
            />
          }
          pagination={
            <Pagination
              currentPageIndex={currentPage}
              pagesCount={totalPages}
              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
            />
          }
          empty={
            <Box textAlign="center" color="inherit">
              <b>No expenses</b>
              <Box variant="p" color="inherit">
                No expense data to display.
              </Box>
            </Box>
          }
        />

        {/* Add Expense Modal */}
        <Modal
          visible={isModalOpen}
          header={<Header variant="h2">Add Expense</Header>}
          onDismiss={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddExpense}>
                  Add Expense
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <Form errorText={formError}>
            <SpaceBetween size="l">
              <FormField label="Description" controlId="description">
                <Input
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.detail.value })}
                />
              </FormField>

              <FormField label="Amount" controlId="amount">
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.detail.value })}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Date" controlId="date">
                <DatePicker
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.detail.value })}
                  placeholder="YYYY/MM/DD"
                />
              </FormField>

              <FormField label="Category" controlId="category">
                <Select
                  options={categoryOptions}
                  selectedOption={
                    formData.category
                      ? categoryOptions.find(option => option.value === formData.category) || null
                      : null
                  }
                  onChange={e => setFormData({ ...formData, category: e.detail.selectedOption.value })}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Modal>
      </SpaceBetween>
    </Container>
  );
};

export default Expenses;
