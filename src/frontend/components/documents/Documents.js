import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === 'processed'
      ? theme.palette.success.light
      : status === 'processing'
      ? theme.palette.warning.light
      : theme.palette.error.light,
  color:
    status === 'processed'
      ? theme.palette.success.dark
      : status === 'processing'
      ? theme.palette.warning.dark
      : theme.palette.error.dark,
}));

const documents = [
  {
    id: 1,
    name: 'Contract.pdf',
    type: 'PDF',
    size: '2.4 MB',
    status: 'processed',
    date: '2024-03-15',
    client: 'Tech Solutions',
  },
  {
    id: 2,
    name: 'Invoice_123.pdf',
    type: 'PDF',
    size: '1.8 MB',
    status: 'processing',
    date: '2024-03-14',
    client: 'Global Corp',
  },
  {
    id: 3,
    name: 'Proposal.docx',
    type: 'DOCX',
    size: '3.1 MB',
    status: 'error',
    date: '2024-03-13',
    client: 'Innovation Labs',
  },
  // Add more sample documents as needed
];

const Documents = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleAction = (action) => {
    // Implement action handling
    handleMenuClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircleIcon color="success" />;
      case 'processing':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Documents</Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => {/* Implement upload */}}
        >
          Upload Document
        </Button>
      </Box>

      <StyledPaper>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search documents..."
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
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => {/* Implement filter dialog */}}
          >
            Filter
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Client</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DocumentIcon sx={{ mr: 1 }} />
                        {document.name}
                      </Box>
                    </TableCell>
                    <TableCell>{document.type}</TableCell>
                    <TableCell>{document.size}</TableCell>
                    <TableCell>
                      <StatusChip
                        icon={getStatusIcon(document.status)}
                        label={document.status}
                        status={document.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{document.date}</TableCell>
                    <TableCell>{document.client}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="More actions">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, document)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDocuments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </StyledPaper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>View</MenuItem>
        <MenuItem onClick={() => handleAction('download')}>Download</MenuItem>
        <MenuItem onClick={() => handleAction('share')}>Share</MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default Documents; 