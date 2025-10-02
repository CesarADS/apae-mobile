// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  permissions: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  recoveryCode: string;
  newPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];
}

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  status: number;
}

// Hook state types
export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AuthState extends AsyncState<LoginResponse> {
  isAuthenticated: boolean;
  user: User | null;
}