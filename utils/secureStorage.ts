import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Salva o token de autenticação de forma segura
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log('[SecureStorage] Token salvo com sucesso');
  } catch (error) {
    console.error('[SecureStorage] Erro ao salvar token:', error);
    throw error;
  }
};

/**
 * Recupera o token de autenticação
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log('[SecureStorage] Token recuperado:', token ? 'SIM' : 'NÃO');
    return token;
  } catch (error) {
    console.error('[SecureStorage] Erro ao recuperar token:', error);
    return null;
  }
};

/**
 * Remove o token de autenticação
 */
export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log('[SecureStorage] Token removido');
  } catch (error) {
    console.error('[SecureStorage] Erro ao remover token:', error);
  }
};

/**
 * Salva dados do usuário de forma segura
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
    console.log('[SecureStorage] Dados do usuário salvos');
  } catch (error) {
    console.error('[SecureStorage] Erro ao salvar dados do usuário:', error);
    throw error;
  }
};

/**
 * Recupera dados do usuário
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('[SecureStorage] Erro ao recuperar dados do usuário:', error);
    return null;
  }
};

/**
 * Remove dados do usuário
 */
export const deleteUserData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
    console.log('[SecureStorage] Dados do usuário removidos');
  } catch (error) {
    console.error('[SecureStorage] Erro ao remover dados do usuário:', error);
  }
};

/**
 * Limpa todos os dados de autenticação
 */
export const clearAuthData = async (): Promise<void> => {
  await Promise.all([deleteToken(), deleteUserData()]);
  console.log('[SecureStorage] Todos os dados de autenticação removidos');
};
