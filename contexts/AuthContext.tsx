import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import { AuthState } from '../types/auth';
import {
    canAccessMobileApp,
    decodeToken,
    hasMinimumPermissions,
    isTokenExpired
} from '../utils/permissions';

interface AuthContextType extends AuthState {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  login: (credentials?: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
      
      // Validar se recebeu o token
      if (!result?.token) {
        throw new Error('Token não recebido do servidor');
      }

      // Verificar se o token está expirado
      if (isTokenExpired(result.token)) {
        throw new Error('Token expirado');
      }

      // Decodificar o token para extrair as permissões
      const decodedToken = decodeToken(result.token);
      console.log('=== LOGIN DEBUG ===');
      console.log('Token decodificado:', decodedToken);
      console.log('Permissões recebidas:', decodedToken?.permissions);
      
      if (!decodedToken || !decodedToken.permissions) {
        throw new Error('Token inválido ou sem permissões');
      }

      // Validar se o usuário tem permissões mínimas para acessar o app mobile
      if (!hasMinimumPermissions(decodedToken.permissions)) {
        const accessInfo = canAccessMobileApp(decodedToken.permissions);
        throw new Error(
          'Você não possui permissões para digitalizar documentos. ' +
          'É necessário ter permissão de ler e escrever e visualizar tipos de documento para pelo menos uma entidade ' +
          '(Aluno, Colaborador ou Institucional).'
        );
      }

      // Verificar permissões de acesso
      const userPermissions = canAccessMobileApp(decodedToken.permissions);
      console.log('Permissões do usuário:', {
        aluno: userPermissions.canAccessAluno,
        colaborador: userPermissions.canAccessColaborador,
        instituicao: userPermissions.canAccessInstituicao,
        permissions: userPermissions.permissions,
      });
      
      // Definir o token para requisições futuras
      api.setToken(result.token);
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: {
          id: decodedToken.sub,
          name: decodedToken.nome || loginEmail,
          email: loginEmail,
          permissions: decodedToken.permissions,
        },
        data: {
          token: result.token,
          expiresAt: new Date(decodedToken.exp * 1000).toISOString(),
          permissions: decodedToken.permissions,
        },
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

  const value: AuthContextType = {
    ...state,
    email,
    password,
    setEmail,
    setPassword,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
