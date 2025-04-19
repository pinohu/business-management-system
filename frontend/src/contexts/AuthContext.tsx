import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      api.get<{user: User}>('/auth/profile')
        .then(response => {
          setUser(response.user);
        })
        .catch((err) => {
          console.error('Error fetching profile on initial load:', err); // Log error during profile fetch
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Attempting login with:', { email }); // Log email, hide password
    try {
      const response = await api.post<{message: string, user: User, token: string}>('/auth/login', { email, password });
      console.log('Login API response:', response); // Log successful response
      const { token, user } = response;
      localStorage.setItem('token', token);
      setUser(user);
      setError(null);
    } catch (err) {
      console.error('Login API error:', err); // Log error response
      setError('Login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await api.post<{message: string, user: User, token: string}>('/auth/register', { email, password, name });
      const { token, user } = response;
      localStorage.setItem('token', token);
      setUser(user);
      setError(null);
    } catch (err) {
      setError('Registration failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
