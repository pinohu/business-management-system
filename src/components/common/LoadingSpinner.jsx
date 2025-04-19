import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({ message, size = 40, thickness = 4 }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <CircularProgress
        size={size}
        thickness={thickness}
        sx={{
          color: 'primary.main',
        }}
      />
      {message && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner; 