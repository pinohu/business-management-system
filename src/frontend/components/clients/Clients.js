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
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const ClientCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const clients = [
  {
    id: 1,
    name: 'Tech Solutions',
    contact: 'John Doe',
    email: 'john@techsolutions.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    type: 'Enterprise',
    status: 'Active',
    projects: 5,
    revenue: '$125,000',
  },
  {
    id: 2,
    name: 'Global Corp',
    contact: 'Jane Smith',
    email: 'jane@globalcorp.com',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    type: 'Enterprise',
    status: 'Active',
    projects: 3,
    revenue: '$85,000',
  },
  {
    id: 3,
    name: 'Innovation Labs',
    contact: 'Mike Johnson',
    email: 'mike@innovationlabs.com',
    phone: '+1 (555) 456-7890',
    location: 'San Francisco, CA',
    type: 'Startup',
    status: 'Inactive',
    projects: 1,
    revenue: '$25,000',
  },
  // Add more sample clients as needed
];

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (client) => {
    setSelectedClient(client);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setOpenDialog(true);
  };

  const handleSaveClient = () => {
    // Implement save logic
    handleCloseDialog();
  };

  const handleDeleteClient = (client) => {
    // Implement delete logic
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
        >
          Add Client
        </Button>
      </Box>

      <StyledPaper>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="All Clients" />
          <Tab label="Active" />
          <Tab label="Inactive" />
        </Tabs>

        <Grid container spacing={3}>
          {filteredClients.map((client) => (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <ClientCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {client.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{client.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {client.contact}
                      </Typography>
                    </Box>
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <EmailIcon color="action" />
                      </ListItemAvatar>
                      <ListItemText primary={client.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <PhoneIcon color="action" />
                      </ListItemAvatar>
                      <ListItemText primary={client.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <LocationIcon color="action" />
                      </ListItemAvatar>
                      <ListItemText primary={client.location} />
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Chip
                      icon={<BusinessIcon />}
                      label={client.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={client.status}
                      size="small"
                      color={client.status === 'Active' ? 'success' : 'default'}
                    />
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {client.projects} Projects
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.revenue} Revenue
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(client)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClient(client)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ClientCard>
            </Grid>
          ))}
        </Grid>
      </StyledPaper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedClient ? 'Edit Client' : 'Add New Client'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Company Name"
              fullWidth
              defaultValue={selectedClient?.name}
            />
            <TextField
              label="Contact Person"
              fullWidth
              defaultValue={selectedClient?.contact}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              defaultValue={selectedClient?.email}
            />
            <TextField
              label="Phone"
              fullWidth
              defaultValue={selectedClient?.phone}
            />
            <TextField
              label="Location"
              fullWidth
              defaultValue={selectedClient?.location}
            />
            <TextField
              label="Client Type"
              fullWidth
              defaultValue={selectedClient?.type}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveClient} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients; 