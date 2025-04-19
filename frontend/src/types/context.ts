import { User, LoginCredentials, UpdateProfileData } from './api';

export interface UserContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  setUser: (user: User | null) => void;
}

export interface UserProviderProps {
  children: React.ReactNode;
}
