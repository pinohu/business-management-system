import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Alert,
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <ErrorIcon
            color="error"
            sx={{
              fontSize: 64,
              mb: 2,
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            {t('errors.boundary.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {t('errors.boundary.message')}
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={resetErrorBoundary}
            sx={{ mr: 1 }}
          >
            {t('errors.boundary.tryAgain')}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mr: 1 }}
          >
            {t('errors.boundary.refresh')}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => window.location.href = '/'}
          >
            {t('errors.boundary.goHome')}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 