import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export default function InvoiceGenerator({ open, onClose, income }) {
  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    invoiceNumber: `INV-${Date.now()}`,
    dueDate: new Date().toISOString().split('T')[0],
    items: [],
    notes: '',
  });

  const handleChange = (field) => (event) => {
    setInvoiceData({ ...invoiceData, [field]: event.target.value });
  };

  const handleItemChange = (index, field) => (event) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: event.target.value };
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', amount: '', quantity: 1 }],
    });
  };

  const removeItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.quantity) || 1),
      0
    );
  };

  const generatePDF = () => {
    // TODO: Implement PDF generation
    console.log('Generating PDF invoice:', invoiceData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Generate Invoice</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Client Information</Typography>
            <StyledTextField
              label="Client Name"
              fullWidth
              value={invoiceData.clientName}
              onChange={handleChange('clientName')}
            />
            <StyledTextField
              label="Client Email"
              fullWidth
              type="email"
              value={invoiceData.clientEmail}
              onChange={handleChange('clientEmail')}
            />
            <StyledTextField
              label="Client Address"
              fullWidth
              multiline
              rows={3}
              value={invoiceData.clientAddress}
              onChange={handleChange('clientAddress')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Invoice Details</Typography>
            <StyledTextField
              label="Invoice Number"
              fullWidth
              value={invoiceData.invoiceNumber}
              onChange={handleChange('invoiceNumber')}
            />
            <StyledTextField
              label="Due Date"
              fullWidth
              type="date"
              value={invoiceData.dueDate}
              onChange={handleChange('dueDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Items</Typography>
            {invoiceData.items.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={handleItemChange(index, 'description')}
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={handleItemChange(index, 'quantity')}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={item.amount}
                  onChange={handleItemChange(index, 'amount')}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeItem(index)}
                  sx={{ minWidth: 'auto' }}
                >
                  ×
                </Button>
              </Box>
            ))}
            <Button variant="outlined" onClick={addItem} sx={{ mt: 1 }}>
              Add Item
            </Button>
          </Grid>
          <Grid item xs={12}>
            <StyledTextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={invoiceData.notes}
              onChange={handleChange('notes')}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" align="right">
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={generatePDF}
          disabled={!invoiceData.clientName || invoiceData.items.length === 0}
        >
          Generate PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
} 