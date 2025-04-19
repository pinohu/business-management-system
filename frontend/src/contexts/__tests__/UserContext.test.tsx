import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/UserService';
import { UserContextValue } from '../../types/context';
import { User } from '../../types/api';

// Mock UserService
vi.mock('@/services/UserService', () => ({
  UserService: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockToken = 'mock-token';

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides user context to children', () => {
    const TestComponent = () => {
      const { user, isAuthenticated } = useUser();
      return (
        <div>
          <div data-testid="user">{user ? user.name : 'No user'}</div>
          <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
        </div>
      );
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('auth')).toHaveTextContent('Not authenticated');
  });

  it('handles successful login', async () => {
    (UserService.login as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    const TestComponent = () => {
      const { login, user, isAuthenticated } = useUser();
      return (
        <div>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
          <div data-testid="user">{user ? user.name : 'No user'}</div>
          <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
        </div>
      );
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('auth')).toHaveTextContent('Authenticated');
    });
  });

  it('handles login error', async () => {
    const error = new Error('Invalid credentials');
    (UserService.login as jest.Mock).mockRejectedValueOnce(error);

    const TestComponent = () => {
      const { login, error: loginError } = useUser();
      return (
        <div>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
          {loginError && <div data-testid="error">{loginError.message}</div>}
        </div>
      );
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('handles successful registration', async () => {
    (UserService.register as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    const TestComponent = () => {
      const { register, user, isAuthenticated } = useUser();
      return (
        <div>
          <button onClick={() => register('test@example.com', 'password', 'Test User')}>Register</button>
          <div data-testid="user">{user ? user.name : 'No user'}</div>
          <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
        </div>
      );
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('auth')).toHaveTextContent('Authenticated');
    });
  });

  it('handles logout', async () => {
    // First login
    (UserService.login as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    const TestComponent = () => {
      const { login, logout, user, isAuthenticated } = useUser();
      return (
        <div>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
          <button onClick={logout}>Logout</button>
          <div data-testid="user">{user ? user.name : 'No user'}</div>
          <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
        </div>
      );
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('auth')).toHaveTextContent('Authenticated');
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('auth')).toHaveTextContent('Not authenticated');
    });
  });

  it('loads user profile on mount if token exists', async () => {
    localStorage.setItem('token', mockToken);
    (UserService.getProfile as jest.Mock).mockResolvedValueOnce(mockUser);

    const TestComponent = () => {
      const { user, isAuthenticated } = useUser();
      return (
        <div>
          <div data-testid="user">{user ? user.name : 'No user'}</div>
          <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
        </div>
      );
    };

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('auth')).toHaveTextContent('Authenticated');
    });

    localStorage.removeItem('token');
  });
});
