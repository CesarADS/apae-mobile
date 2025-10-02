import { useState } from 'react';
import { AuthService } from '../services/authService';
import {
    AuthState
} from '../types/auth';

export const useAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    data: null,
    loading: false,
    error: null,
  });

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const login = async (credentials?: { email: string; password: string }): Promise<boolean> => {
    // Usar credentials passados ou os estados atuais
    const loginEmail = credentials?.email || email;
    const loginPassword = credentials?.password || password;
    
    if (!loginEmail || !loginPassword) {
      setState(prev => ({ ...prev, error: 'Email e senha são obrigatórios' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.login({ email: loginEmail, password: loginPassword });
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: null, // TODO: carregar dados do usuário se necessário
        data: result,
        loading: false,
      }));
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setState({
      isAuthenticated: false,
      user: null,
      data: null,
      loading: false,
      error: null,
    });
    setEmail('');
    setPassword('');
  };

  return {
    ...state,
    email,
    password,
    setEmail,
    setPassword,
    login,
    logout,
    clearError,
  };
};