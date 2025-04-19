import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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
  Box,
  ColumnLayout,
  Spinner
} from '@cloudscape-design/components';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    taxId: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a call to your API
      // const response = await api.get('/api/v1/auth/profile');
      // setProfile(response.data);

      // For demo purposes, we'll use mock data
      setTimeout(() => {
        const mockProfile = {
          id: user?.id || '1',
          name: user?.name || 'John Doe',
          email: user?.email || 'john.doe@example.com',
          role: user?.role || 'USER',
          company: 'Acme Corporation',
          phone: '(555) 123-4567',
          address: '123 Business St, Suite 100, San Francisco, CA 94107',
          taxId: 'XX-XXXXXXX'
        };

        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          email: mockProfile.email,
          company: mockProfile.company || '',
          phone: mockProfile.phone || '',
          address: mockProfile.address || '',
          taxId: mockProfile.taxId || ''
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load profile data');
      setLoading(false);
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a call to your API
      // await api.put('/api/v1/auth/profile', formData);

      // For demo purposes, we'll just update the state
      setTimeout(() => {
        if (profile) {
          const updatedProfile = {
            ...profile,
            name: formData.name,
            company: formData.company,
            phone: formData.phone,
            address: formData.address,
            taxId: formData.taxId
          };
          setProfile(updatedProfile);
          setSuccess('Profile updated successfully');
          setIsEditing(false);
          setLoading(false);

          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        }
      }, 1000);
    } catch (err) {
      setError('Failed to update profile');
      setLoading(false);
      console.error(err);
    }
  };

  const handleChangePassword = () => {
    // In a real app, this would navigate to a password change page or open a modal
    alert('Change password functionality would be implemented here');
  };

  if (loading && !profile) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading profile data...
        </Box>
      </Box>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          actions={
            isEditing ? (
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setFormData({
                        name: profile.name,
                        email: profile.email,
                        company: profile.company || '',
                        phone: profile.phone || '',
                        address: profile.address || '',
                        taxId: profile.taxId || ''
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateProfile}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </SpaceBetween>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )
          }
        >
          User Profile
        </Header>

        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success" dismissible onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <ColumnLayout columns={2}>
          <Container
            header={<Header variant="h2">Account Information</Header>}
          >
            {isEditing ? (
              <Form>
                <SpaceBetween size="l">
                  <FormField label="Name" controlId="name">
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.detail.value })}
                    />
                  </FormField>

                  <FormField label="Email" controlId="email">
                    <Input
                      value={formData.email}
                      disabled
                      placeholder="Email cannot be changed"
                    />
                  </FormField>

                  <FormField label="Role" controlId="role">
                    <Input
                      value={profile?.role || ''}
                      disabled
                      placeholder="Role cannot be changed"
                    />
                  </FormField>

                  <Button
                    variant="normal"
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
                </SpaceBetween>
              </Form>
            ) : (
              <SpaceBetween size="l">
                <ColumnLayout columns={2} variant="text-grid">
                  <div>
                    <Box variant="awsui-key-label">Name</Box>
                    <div>{profile?.name}</div>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Email</Box>
                    <div>{profile?.email}</div>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Role</Box>
                    <div>{profile?.role}</div>
                  </div>
                </ColumnLayout>

                <Button
                  variant="normal"
                  onClick={handleChangePassword}
                >
                  Change Password
                </Button>
              </SpaceBetween>
            )}
          </Container>

          <Container
            header={<Header variant="h2">Business Information</Header>}
          >
            {isEditing ? (
              <Form>
                <SpaceBetween size="l">
                  <FormField label="Company" controlId="company">
                    <Input
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.detail.value })}
                    />
                  </FormField>

                  <FormField label="Phone" controlId="phone">
                    <Input
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.detail.value })}
                    />
                  </FormField>

                  <FormField label="Address" controlId="address">
                    <Input
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.detail.value })}
                    />
                  </FormField>

                  <FormField label="Tax ID" controlId="taxId">
                    <Input
                      value={formData.taxId}
                      onChange={e => setFormData({ ...formData, taxId: e.detail.value })}
                    />
                  </FormField>
                </SpaceBetween>
              </Form>
            ) : (
              <ColumnLayout columns={2} variant="text-grid">
                <div>
                  <Box variant="awsui-key-label">Company</Box>
                  <div>{profile?.company || 'Not provided'}</div>
                </div>
                <div>
                  <Box variant="awsui-key-label">Phone</Box>
                  <div>{profile?.phone || 'Not provided'}</div>
                </div>
                <div>
                  <Box variant="awsui-key-label">Address</Box>
                  <div>{profile?.address || 'Not provided'}</div>
                </div>
                <div>
                  <Box variant="awsui-key-label">Tax ID</Box>
                  <div>{profile?.taxId || 'Not provided'}</div>
                </div>
              </ColumnLayout>
            )}
          </Container>
        </ColumnLayout>
      </SpaceBetween>
    </Container>
  );
};

export default Profile;
