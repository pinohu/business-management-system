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

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box padding="l" className="register-page">
      <Container>
        <SpaceBetween size="l">
          <Header
            variant="h1"
            description="Create an account to start managing your business"
            textAlign="center"
          >
            Create Account
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
                  onClick={() => navigate('/login')}
                >
                  Sign in instead
                </Button>
                <Button
                  variant="primary"
                  formAction="submit"
                  loading={loading}
                  onClick={handleSubmit}
                >
                  Create account
                </Button>
              </SpaceBetween>
            }
          >
            <SpaceBetween size="l">
              <FormField label="Name" controlId="name">
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.detail.value)}
                  placeholder="Enter your name"
                  autoFocus
                  required
                />
              </FormField>

              <FormField label="Email" controlId="email">
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.detail.value)}
                  placeholder="Enter your email"
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

              <FormField label="Confirm Password" controlId="confirmPassword">
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.detail.value)}
                  placeholder="Confirm your password"
                  required
                />
              </FormField>
            </SpaceBetween>
          </Form>

          <Box textAlign="center">
            <Link to="/login">Already have an account? Sign in</Link>
          </Box>
        </SpaceBetween>
      </Container>
    </Box>
  );
};

export default Register;
