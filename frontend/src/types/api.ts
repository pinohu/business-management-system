export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
