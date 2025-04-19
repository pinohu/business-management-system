import api from './api';
import config from '../config';

// User interface
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Auth response interface
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Auth service class
class AuthService {
  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    this.setTokens(response.token, response.refreshToken);
    return response;
  }

  // Register
  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);

    this.setTokens(response.token, response.refreshToken);
    return response;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response;
  }

  // Update profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/auth/profile', userData);
    return response;
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification');
  }

  // Set tokens
  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(config.auth.tokenKey, token);
    localStorage.setItem(config.auth.refreshTokenKey, refreshToken);
  }

  // Clear tokens
  private clearTokens(): void {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(config.auth.tokenKey);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem(config.auth.tokenKey);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(config.auth.refreshTokenKey);
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // Check if refresh token is expired
  isRefreshTokenExpired(): boolean {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return true;

    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // Get user role
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }

  // Check if user has role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user has any of the roles
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return roles.includes(userRole || '');
  }

  // Check if user has all of the roles
  hasAllRoles(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return roles.every(role => role === userRole);
  }
}

// Export auth service instance
export default new AuthService(); 