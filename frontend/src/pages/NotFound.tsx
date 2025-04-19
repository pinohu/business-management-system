import React from 'react';
import { useNavigate } from 'react-router-dom';

// Cloudscape Design System components
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween
} from '@cloudscape-design/components';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box padding={{ top: 'xxxl' }}>
      <Container
        header={
          <Header variant="h1" textAlign="center">
            404 - Page Not Found
          </Header>
        }
      >
        <SpaceBetween size="l" alignItems="center">
          <Box textAlign="center" variant="p">
            The page you are looking for does not exist or has been moved.
          </Box>
          <Box textAlign="center">
            <Button
              variant="primary"
              onClick={() => navigate('/')}
            >
              Go to Dashboard
            </Button>
          </Box>
        </SpaceBetween>
      </Container>
    </Box>
  );
};

export default NotFound;
