import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Cloudscape Design System components
import {
  Container,
  Header,
  SpaceBetween,
  Form,
  FormField,
  Input,
  Button,
  Alert,
  Box
} from '@cloudscape-design/components';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box padding="l" className="login-page">
      <Container>
        <SpaceBetween size="l">
          <Header
            variant="h1"
            description="Sign in to access your business management dashboard"
            textAlign="center"
          >
            Business Management System
          </Header>

          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  formAction="none"
                  onClick={() => navigate('/register')}
                >
                  Create an account
                </Button>
                <Button
                  variant="primary"
                  formAction="submit"
                  loading={loading}
                  onClick={handleSubmit}
                >
                  Sign in
                </Button>
              </SpaceBetween>
            }
          >
            <SpaceBetween size="l">
              <FormField label="Email" controlId="email">
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.detail.value)}
                  placeholder="Enter your email"
                  autoFocus
                  required
                />
              </FormField>

              <FormField label="Password" controlId="password">
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.detail.value)}
                  placeholder="Enter your password"
                  required
                />
              </FormField>
            </SpaceBetween>
          </Form>

          <Box textAlign="center">
            <Link to="/register">Don't have an account? Sign up</Link>
          </Box>
        </SpaceBetween>
      </Container>
    </Box>
  );
};

export default Login;
