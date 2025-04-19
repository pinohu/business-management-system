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
  Spinner,
  ColumnLayout,
  Textarea
} from '@cloudscape-design/components';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

const Invoices: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientName: '',
    amount: '',
    date: '',
    dueDate: '',
    status: 'draft'
  });
  const [formError, setFormError] = useState<string | null>(null);

  const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' }
  ];

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a call to your API
      // const response = await api.get('/api/v1/finance/invoices');
      // setInvoices(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setInvoices([
          { id: '1', invoiceNumber: 'INV-2025-001', clientName: 'Acme Corp', amount: 3500, date: '2025-04-01', dueDate: '2025-05-01', status: 'sent' },
          { id: '2', invoiceNumber: 'INV-2025-002', clientName: 'TechStart Inc', amount: 1200, date: '2025-04-05', dueDate: '2025-05-05', status: 'draft' },
          { id: '3', invoiceNumber: 'INV-2025-003', clientName: 'Global Solutions', amount: 4800, date: '2025-03-15', dueDate: '2025-04-15', status: 'overdue' },
          { id: '4', invoiceNumber: 'INV-2025-004', clientName: 'Bright Future LLC', amount: 2500, date: '2025-03-20', dueDate: '2025-04-20', status: 'paid' },
          { id: '5', invoiceNumber: 'INV-2025-005', clientName: 'Innovative Systems', amount: 3200, date: '2025-04-10', dueDate: '2025-05-10', status: 'sent' }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load invoices');
      setLoading(false);
      console.error(err);
    }
  };

  const handleAddInvoice = async () => {
    // Validate form
    if (!formData.invoiceNumber.trim()) {
      setFormError('Invoice number is required');
      return;
    }
    if (!formData.clientName.trim()) {
      setFormError('Client name is required');
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
    if (!formData.dueDate) {
      setFormError('Due date is required');
      return;
    }

    try {
      // In a real app, this would be a call to your API
      // await api.post('/api/v1/finance/invoices', {
      //   invoiceNumber: formData.invoiceNumber,
      //   clientName: formData.clientName,
      //   amount: Number(formData.amount),
      //   date: formData.date,
      //   dueDate: formData.dueDate,
      //   status: formData.status
      // });

      // For demo purposes, we'll just update the state
      const newInvoice = {
        id: Date.now().toString(),
        invoiceNumber: formData.invoiceNumber,
        clientName: formData.clientName,
        amount: Number(formData.amount),
        date: formData.date,
        dueDate: formData.dueDate,
        status: formData.status as 'draft' | 'sent' | 'paid' | 'overdue'
      };

      setInvoices([newInvoice, ...invoices]);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setFormError('Failed to add invoice');
      console.error(err);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // In a real app, this would be a call to your API
      // await Promise.all(selectedItems.map(item => api.delete(`/api/v1/finance/invoices/${item.id}`)));

      // For demo purposes, we'll just update the state
      const remainingItems = invoices.filter(
        item => !selectedItems.some(selected => selected.id === item.id)
      );
      setInvoices(remainingItems);
      setSelectedItems([]);
    } catch (err) {
      setError('Failed to delete invoices');
      console.error(err);
    }
  };

  const handleGeneratePdf = (invoiceId: string) => {
    // In a real app, this would call an API endpoint to generate a PDF
    alert(`Generating PDF for invoice ${invoiceId}`);
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      clientName: '',
      amount: '',
      date: '',
      dueDate: '',
      status: 'draft'
    });
    setFormError(null);
  };

  const filteredItems = invoices.filter(item =>
    item.invoiceNumber.toLowerCase().includes(filterText.toLowerCase()) ||
    item.clientName.toLowerCase().includes(filterText.toLowerCase()) ||
    item.status.toLowerCase().includes(filterText.toLowerCase())
  );

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Box color="text-status-info">Draft</Box>;
      case 'sent':
        return <Box color="text-status-warning">Sent</Box>;
      case 'paid':
        return <Box color="text-status-success">Paid</Box>;
      case 'overdue':
        return <Box color="text-status-error">Overdue</Box>;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading invoices...
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
                    Create Invoice
                  </Button>
                </SpaceBetween>
              }
              counter={`(${invoices.length})`}
            >
              Invoices
            </Header>
          }
          columnDefinitions={[
            {
              id: 'invoiceNumber',
              header: 'Invoice #',
              cell: item => item.invoiceNumber,
              sortingField: 'invoiceNumber'
            },
            {
              id: 'clientName',
              header: 'Client',
              cell: item => item.clientName,
              sortingField: 'clientName'
            },
            {
              id: 'amount',
              header: 'Amount',
              cell: item => `$${item.amount.toLocaleString()}`,
              sortingField: 'amount'
            },
            {
              id: 'date',
              header: 'Date',
              cell: item => new Date(item.date).toLocaleDateString(),
              sortingField: 'date'
            },
            {
              id: 'dueDate',
              header: 'Due Date',
              cell: item => new Date(item.dueDate).toLocaleDateString(),
              sortingField: 'dueDate'
            },
            {
              id: 'status',
              header: 'Status',
              cell: item => getStatusBadge(item.status),
              sortingField: 'status'
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: item => (
                <Button
                  variant="normal"
                  onClick={() => handleGeneratePdf(item.id)}
                >
                  Generate PDF
                </Button>
              )
            }
          ]}
          items={paginatedItems}
          selectionType="multi"
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          filter={
            <TextFilter
              filteringText={filterText}
              filteringPlaceholder="Find invoice"
              filteringAriaLabel="Filter invoices"
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
              <b>No invoices</b>
              <Box variant="p" color="inherit">
                No invoices to display.
              </Box>
            </Box>
          }
        />

        {/* Create Invoice Modal */}
        <Modal
          visible={isModalOpen}
          header={<Header variant="h2">Create Invoice</Header>}
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
                <Button variant="primary" onClick={handleAddInvoice}>
                  Create Invoice
                </Button>
              </SpaceBetween>
            </Box>
          }
          size="large"
        >
          <Form errorText={formError}>
            <SpaceBetween size="l">
              <ColumnLayout columns={2}>
                <FormField label="Invoice Number" controlId="invoiceNumber">
                  <Input
                    value={formData.invoiceNumber}
                    onChange={e => setFormData({ ...formData, invoiceNumber: e.detail.value })}
                    placeholder="INV-2025-001"
                  />
                </FormField>

                <FormField label="Client Name" controlId="clientName">
                  <Input
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.detail.value })}
                    placeholder="Client name"
                  />
                </FormField>
              </ColumnLayout>

              <ColumnLayout columns={2}>
                <FormField label="Amount" controlId="amount">
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.detail.value })}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Status" controlId="status">
                  <Select
                    options={statusOptions}
                    selectedOption={
                      statusOptions.find(option => option.value === formData.status) || statusOptions[0]
                    }
                    onChange={e => setFormData({ ...formData, status: e.detail.selectedOption.value })}
                  />
                </FormField>
              </ColumnLayout>

              <ColumnLayout columns={2}>
                <FormField label="Invoice Date" controlId="date">
                  <DatePicker
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.detail.value })}
                    placeholder="YYYY/MM/DD"
                  />
                </FormField>

                <FormField label="Due Date" controlId="dueDate">
                  <DatePicker
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.detail.value })}
                    placeholder="YYYY/MM/DD"
                  />
                </FormField>
              </ColumnLayout>
            </SpaceBetween>
          </Form>
        </Modal>
      </SpaceBetween>
    </Container>
  );
};

export default Invoices;
