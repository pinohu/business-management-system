import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User, UpdateProfileData } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class UserService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await axios.get<User>(`${API_URL}/users/profile`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await axios.patch<User>(`${API_URL}/users/profile`, data, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}

export const userService = new UserService();
