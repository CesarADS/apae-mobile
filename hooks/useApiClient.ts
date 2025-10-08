import Constants from 'expo-constants';
import { useCallback, useRef } from 'react';

const API_BASE_URL_RAW: string | undefined = (Constants?.expoConfig?.extra as any)?.apiBaseUrl;

if (!API_BASE_URL_RAW) {
  throw new Error('API_BASE_URL não configurada. Certifique-se de definir no seu .env e reiniciar o bundler.');
}

const API_BASE_URL = API_BASE_URL_RAW;

interface RequestOptions extends RequestInit {}

interface UseApiClientOptions {
  baseURL?: string;
  initialToken?: string | null;
}

export const useApiClient = (options: UseApiClientOptions = {}) => {
  const baseURL = options.baseURL || API_BASE_URL;
  const tokenRef = useRef<string | null>(options.initialToken || null);

  const setToken = useCallback((token: string | null) => {
    tokenRef.current = token;
  }, []);

  const getHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (tokenRef.current) {
      headers.Authorization = `Bearer ${tokenRef.current}`;
    }
    return headers;
  }, []);

  const request = useCallback(async <T,>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const url = `${baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Usuário ou senha inválidos');
        }
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `Erro HTTP: ${response.status}`);
      }
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {} as T;
      }
      try {
        return JSON.parse(text) as T;
      } catch (e) {
        if (__DEV__) {
          console.warn('JSON Parse Error', e, text);
        }
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      throw err;
    }
  }, [baseURL, getHeaders]);

  const get = useCallback(<T,>(endpoint: string) => request<T>(endpoint, { method: 'GET' }), [request]);
  const post = useCallback(<T,>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }), [request]);
  const put = useCallback(<T,>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }), [request]);
  const del = useCallback(<T,>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }), [request]);

  return {
    setToken,
    request,
    get,
    post,
    put,
    delete: del,
  };
};
