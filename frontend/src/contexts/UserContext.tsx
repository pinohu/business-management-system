import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserContextValue, UserProviderProps } from '@/types/context';
import { User, LoginCredentials, UpdateProfileData } from '@/types/api';
import { userService } from '@/services/UserService';

const UserContext = createContext<UserContextValue | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.login(credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    userService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: UserContextValue = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
