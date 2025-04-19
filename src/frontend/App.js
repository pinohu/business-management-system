import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from 'react-query';

// Layout Components
import Layout from './components/layout/Layout';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Page Components
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import AI from './pages/AI';
import Vision from './pages/Vision';
import Speech from './pages/Speech';
import Settings from './pages/Settings';

// Theme Configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4a90e2',
      light: '#7eb6ff',
      dark: '#0063af',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <CssBaseline />
          <Router>
            <Layout>
              <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Header />
                  <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/ai" element={<AI />} />
                      <Route path="/vision" element={<Vision />} />
                      <Route path="/speech" element={<Speech />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Container>
                </Box>
              </Box>
            </Layout>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 