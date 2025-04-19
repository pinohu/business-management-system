// This is the entry point for your Next.js app
// Cursor will fill this file with appropriate page and component structure

import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Dashboard from '../components/Dashboard';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Dashboard />
      </Container>
    </ThemeProvider>
  );
}
