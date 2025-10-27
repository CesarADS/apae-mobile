import Constants from 'expo-constants';
import { useCallback } from 'react';

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

  // Token global compartilhado entre todas as instâncias do hook
  // Evita que diferentes hooks usem tokens diferentes durante o mesmo ciclo de vida do app
  // (ex.: login define o token e o hook de documentos usa imediatamente)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let __ensureModuleScope: void; // marcador para indicar escopo de módulo
  // @ts-expect-error - variável de módulo deliberada
  if (typeof globalThis.__APAEMOBILE_API_TOKEN === 'undefined') {
    // @ts-expect-error - criação controlada
    globalThis.__APAEMOBILE_API_TOKEN = options.initialToken ?? null;
  }

  // Helpers para acessar/atualizar token global
  const getGlobalToken = () => (globalThis as any).__APAEMOBILE_API_TOKEN as string | null;
  const setGlobalToken = (token: string | null) => {
    (globalThis as any).__APAEMOBILE_API_TOKEN = token;
  };

  const setToken = useCallback((token: string | null) => {
    setGlobalToken(token);
  }, []);

  const getHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = getGlobalToken();
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const request = useCallback(async <T,>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const url = `${baseURL}${endpoint}`;
    
    // Detectar se é FormData para não adicionar Content-Type
    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
    
    // Adicionar token se disponível
    const token = getGlobalToken();
    console.log('[API Client] Token disponível:', token ? 'SIM' : 'NÃO');
    console.log('[API Client] Endpoint:', endpoint);
    console.log('[API Client] É FormData:', isFormData);
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Para FormData, NÃO adicionar Content-Type manualmente!
    // O fetch precisa adicionar automaticamente com o boundary correto
    // Ex: "multipart/form-data; boundary=----WebKitFormBoundary..."
    if (isFormData) {
      // DELETAR Content-Type para o fetch gerar com boundary automático
      delete headers['Content-Type'];
    } else if (!headers['Content-Type']) {
      // Para JSON, adicionar Content-Type application/json
      headers['Content-Type'] = 'application/json';
    }
    
    console.log('[API Client] Headers finais:', headers);
    
    const config: RequestInit = {
      ...options,
      headers,
    };
    
    if (isFormData) {
      console.log('[API Client] Body é FormData, tentando enviar...');
    }
    
    try {
      console.log('[API Client] Fazendo fetch para:', url);
      const response = await fetch(url, config);
      console.log('[API Client] Response status:', response.status);
      console.log('[API Client] Response ok:', response.ok);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado ou inválido
          console.log('[API Client] ❌ Token inválido ou expirado (401)');
          setGlobalToken(null);
          throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
        }
        
        if (response.status === 403) {
          // Autenticado mas sem permissão
          console.log('[API Client] ❌ Acesso negado (403) - Sem permissão');
          const errorText = await response.text().catch(() => '');
          console.log('[API Client] ❌ Detalhe do erro 403:', errorText);
          throw new Error(errorText || 'Você não tem permissão para realizar esta ação. Contate o administrador.');
        }
        
        const errorText = await response.text().catch(() => '');
        console.log('[API Client] ❌ Erro HTTP:', response.status, errorText);
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
