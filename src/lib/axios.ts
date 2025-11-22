/**
 * Axios Instance with Authentication Interceptor
 * 
 * Configuração do axios com interceptor para:
 * - Adicionar automaticamente o token de autenticação nos requests
 * - Redirecionar para login quando receber erro 401 (não autenticado)
 * - Tentar renovar token automaticamente quando expirado
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const tokenService = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

/**
 * Interceptor de Request
 * Adiciona o token de autenticação no header de todas as requisições
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response
 * Trata erros de autenticação e tenta renovar token quando necessário
 */
api.interceptors.response.use(
  (response) => {
    // Resposta bem-sucedida, retorna normalmente
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      tokenService.clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      tokenService.clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenService.getRefreshToken();

    if (!refreshToken) {
      tokenService.clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { accessToken } = response.data;

      if (accessToken) {
        tokenService.setTokens(accessToken, refreshToken);
        
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        isRefreshing = false;

        return api(originalRequest);
      }

      throw new Error('No access token received');
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      isRefreshing = false;
      tokenService.clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export const authAPI = {
  /**
   * Solicita código OTP para o telefone
   */
  requestOTP: async (phone: string) => {
    const response = await api.post('/auth/request-otp', { phone });
    return response.data;
  },

  /**
   * Verifica o código OTP e retorna os tokens
   */
  verifyOTP: async (phone: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { phone, code: otp });
    
    console.log('Response from API:', response.data);
    
    const responseData = response.data.data || response.data;
    const accessToken = responseData.accessToken || responseData.access_token;
    const refreshToken = responseData.refreshToken || responseData.refresh_token;
    const user = responseData.user;
    
    console.log('Tokens extracted:', { accessToken, refreshToken, user });
    
    if (accessToken && refreshToken) {
      tokenService.setTokens(accessToken, refreshToken);
      if (user) {
        tokenService.setUser(user);
      }
      console.log('Tokens saved to localStorage');
    } else {
      console.error('No tokens received from API');
    }
    
    return responseData;
  },

  /**
   * Obtém dados do usuário autenticado
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Faz logout do usuário
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenService.clearTokens();
      window.location.href = '/login';
    }
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated: () => {
    return !!tokenService.getAccessToken();
  },
};

export default api;
