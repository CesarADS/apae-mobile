import {
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    ResetPasswordRequest
} from '../types/auth';
import { apiClient } from './apiClient';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/user/login', credentials);
    
    // Verificar se tem a permissão DOCUMENTOS
    if (!response.permissions || !response.permissions.includes("DOCUMENTOS")) {
      throw new Error("Você não tem permissão para digitalizar documentos");
    }
    
    return response;
  }

  static async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/user/forgot-password', request);
  }

  static async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/user/reset-password', request);
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      // Implementar validação do token se houver endpoint
      // await apiClient.post('/user/validate-token', { token });
      return true;
    } catch {
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      // Implementar logout se houver endpoint
      // await apiClient.post('/user/logout');
    } finally {
      // Limpar token local
      apiClient.setToken(null);
    }
  }
}