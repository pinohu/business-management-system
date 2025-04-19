import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../UserService';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockToken = 'mock-token';

describe('UserService', () => {
  let userService: UserService;
  const API_URL = 'http://localhost:3000/api';

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const mockResponse = {
        data: {
          message: 'User registered successfully',
          token: 'mock-token',
          user: {
            id: '1',
            email: userData.email,
            name: userData.name
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await userService.register(userData);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/users/register`, userData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle registration errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const error = new Error('Email already exists');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(userService.register(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        data: {
          message: 'Login successful',
          token: 'mock-token',
          user: {
            id: '1',
            email: loginData.email,
            name: 'Test User'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await userService.login(loginData);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/users/login`, loginData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const error = new Error('Invalid credentials');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(userService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      localStorage.setItem('token', mockToken);
      const mockResponse = {
        data: mockUser,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await userService.getProfile();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle profile fetch errors', async () => {
      const error = new Error('Unauthorized');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(userService.getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      localStorage.setItem('token', mockToken);
      const updateData = {
        name: 'Updated Name'
      };

      const updatedUser = {
        ...mockUser,
        name: updateData.name
      };

      const mockResponse = {
        data: updatedUser,
      };

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await userService.updateProfile(updateData);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${API_URL}/users/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${mockToken}` }
        }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should handle profile update errors', async () => {
      localStorage.setItem('token', mockToken);
      const updateData = {
        name: 'Updated Name'
      };

      const error = new Error('Unauthorized');
      mockedAxios.put.mockRejectedValueOnce(error);

      await expect(userService.updateProfile(updateData)).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('logout', () => {
    it('successfully logs out user', async () => {
      localStorage.setItem('token', mockToken);
      await userService.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
