import { useState } from 'react';
import {
  AuthState
} from '../types/auth';
import { useApiClient } from './useApiClient';

export const useAuth = () => {
  const api = useApiClient();
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
      const result = await api.post<any>('/user/login', { email: loginEmail, password: loginPassword });
      
      // Decodificar o token JWT para extrair as permissões
      let permissions: string[] = [];
      if (result?.token) {
        try {
          // Decodificar o payload do JWT (segunda parte do token)
          const payload = result.token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          permissions = decodedPayload.permissions || [];
          console.log('Permissões decodificadas:', permissions);
        } catch (decodeError) {
          console.error('Erro ao decodificar token:', decodeError);
        }
      }
      
      // Verificar se tem permissão de DOCUMENTOS
      if (!permissions.includes('DOCUMENTOS')) {
        throw new Error('Você não tem permissão para digitalizar documentos');
      }
      
      // Definir o token para requisições futuras
      if (result?.token) {
        api.setToken(result.token);
      }
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: null, // TODO: carregar dados do usuário se necessário
        data: { ...result, permissions }, // Adicionar permissões decodificadas
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
    // Limpar o token
    api.setToken(null);
    
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