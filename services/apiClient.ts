const API_BASE_URL = "https://gedapae.com.br/api";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Tratamento específico para diferentes status codes
        if (response.status === 403 || response.status === 401) {
          throw new Error('Usuário ou senha inválidos');
        }
        
        try {
          const errorText = await response.text();
          throw new Error(errorText || `Erro HTTP: ${response.status}`);
        } catch {
          // Se não conseguir ler o texto, usar mensagem genérica
          throw new Error(`Erro HTTP: ${response.status}`);
        }
      }

      // Verificar se a resposta tem conteúdo antes de tentar parsear JSON
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {} as T;
      }
      
      try {
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        // Só fazer log em desenvolvimento para debugging
        if (__DEV__) {
          console.warn('JSON Parse Error:', parseError, 'Response text:', text);
        }
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      // Não fazer console.error aqui para evitar logs desnecessários no Expo Go
      // O erro será tratado pela aplicação
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);