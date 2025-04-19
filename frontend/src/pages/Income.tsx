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

interface IncomeItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

const Income: React.FC = () => {
  const { user } = useAuth();
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [selectedItems, setSelectedItems] = useState<IncomeItem[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const categoryOptions = [
    { label: 'Salary', value: 'salary' },
    { label: 'Freelance', value: 'freelance' },
    { label: 'Consulting', value: 'consulting' },
    { label: 'Investment', value: 'investment' },
    { label: 'Other', value: 'other' }
  ];

  useEffect(() => {
    fetchIncomeData();
  }, []);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a call to your API
      // const response = await api.get('/api/v1/finance/income');
      // setIncomeItems(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setIncomeItems([
          { id: '1', description: 'Monthly Salary', amount: 5000, date: '2025-04-01', category: 'salary' },
          { id: '2', description: 'Freelance Project', amount: 1500, date: '2025-04-05', category: 'freelance' },
          { id: '3', description: 'Consulting Fee', amount: 2000, date: '2025-04-10', category: 'consulting' },
          { id: '4', description: 'Stock Dividend', amount: 500, date: '2025-04-15', category: 'investment' },
          { id: '5', description: 'Client Payment', amount: 3000, date: '2025-04-20', category: 'freelance' }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load income data');
      setLoading(false);
      console.error(err);
    }
  };

  const handleAddIncome = async () => {
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
      // await api.post('/api/v1/finance/income', {
      //   description: formData.description,
      //   amount: Number(formData.amount),
      //   date: formData.date,
      //   category: formData.category
      // });

      // For demo purposes, we'll just update the state
      const newIncome = {
        id: Date.now().toString(),
        description: formData.description,
        amount: Number(formData.amount),
        date: formData.date,
        category: formData.category
      };

      setIncomeItems([newIncome, ...incomeItems]);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setFormError('Failed to add income');
      console.error(err);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // In a real app, this would be a call to your API
      // await Promise.all(selectedItems.map(item => api.delete(`/api/v1/finance/income/${item.id}`)));

      // For demo purposes, we'll just update the state
      const remainingItems = incomeItems.filter(
        item => !selectedItems.some(selected => selected.id === item.id)
      );
      setIncomeItems(remainingItems);
      setSelectedItems([]);
    } catch (err) {
      setError('Failed to delete income items');
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

  const filteredItems = incomeItems.filter(item =>
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
          Loading income data...
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
                    Add Income
                  </Button>
                </SpaceBetween>
              }
              counter={`(${incomeItems.length})`}
            >
              Income
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
              filteringPlaceholder="Find income"
              filteringAriaLabel="Filter income"
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
              <b>No income</b>
              <Box variant="p" color="inherit">
                No income data to display.
              </Box>
            </Box>
          }
        />

        {/* Add Income Modal */}
        <Modal
          visible={isModalOpen}
          header={<Header variant="h2">Add Income</Header>}
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
                <Button variant="primary" onClick={handleAddIncome}>
                  Add Income
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

export default Income;
