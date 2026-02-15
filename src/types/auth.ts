// Authentication and User types

export type UserRole = 'student' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  cafeteriaId?: string; // For partner users (backward compat)
  businessId?: string;  // Business this partner manages
  businessType?: string; // Type of business
}

export interface LoginCredentials {
  email: string;
  password: string;
  cafeteriaId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
