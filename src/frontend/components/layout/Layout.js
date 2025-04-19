import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const Layout = ({ children }) => {
  return (
    <MainContainer>
      {children}
    </MainContainer>
  );
};

export default Layout; 