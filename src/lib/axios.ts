import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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

/**
 * API de Débitos
 */
export const debtsAPI = {
  /**
   * Busca todos os débitos do usuário autenticado
   */
  getMyDebts: async () => {
    const response = await api.get(`players/${tokenService.getUser()?.id}/debts`);
    return response.data;
  },

  /**
   * Busca débitos por ID do usuário (admin)
   */
  getDebtsByUserId: async (userId: string) => {
    const response = await api.get(`/debts/user/${userId}`);
    return response.data;
  },

  /**
   * Busca um débito específico por ID
   */
  getDebtById: async (debtId: string) => {
    const response = await api.get(`/debts/${debtId}`);
    return response.data;
  },

  /**
   * Marca débito como pago
   */
  markAsPaid: async (debtId: string, data?: { amount?: number; method?: string; notes?: string; category?: string }) => {
    const response = await api.post(`/debts/${debtId}/pay`, data || {});
    return response.data;
  },

  /**
   * Lista todos os debitos
   */
  getAllDebts: async (page: number = 1, limit: number = 10, status?: string, search?: string, sort?: string) => {
    const params: any = { page, limit };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    const response = await api.get('/debts', { params });
    return response.data;
  },

  /**
   * Cria um novo débito
   */
  createDebt: async (data: any) => {
    const response = await api.post('/debts', data);
    return response.data;
  },
};


/**
 * API de Games (Jogos)
 */
export const gamesAPI = {
  /**
   * Busca todos os jogos com paginação e filtros
   */
  getAllGames: async (page: number = 1, limit: number = 10, status?: string, search?: string) => {
    const params: any = { page, limit };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;

    const response = await api.get('/games', { params });
    return response.data;
  },

  /**
   * Cria um novo jogo
   */
  createGame: async (data: {
    name: string;
    type: string;
    date: string;
    time: string;
    location: string;
    maxPlayers: number;
    pricePerPlayer: number;
    chatId: string;
    workspaceId: string;
  }) => {
    const response = await api.post('/games', data);
    return response.data;
  },

  /**
   * Atualiza um jogo existente
   */
  updateGame: async (gameId: string, data: { pricePerPlayer?: number }) => {
    const response = await api.put(`/games/${gameId}`, data);
    return response.data;
  },

  /**
   * Cancela/deleta um jogo
   */
  deleteGame: async (gameId: string) => {
    const response = await api.delete(`/games/${gameId}`);
    return response.data;
  },

  /**
   * Busca um jogo específico por ID
   */
  getGameById: async (gameId: string) => {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  /**
   * Fecha um jogo
   */
  closeGame: async (gameId: string) => {
    const response = await api.post(`/games/${gameId}/close`);
    return response.data;
  },

  /**
   * Remove um jogador de um jogo
   */
  removePlayerFromGame: async (gameId: string, playerId: string) => {
    const response = await api.delete(`/games/${gameId}/players/${playerId}`);
    return response.data;
  },

  /**
   * Marca/desmarca um jogador como pago
   */
  togglePlayerPayment: async (gameId: string, slot: number, isPaid: boolean) => {
    const response = await api.patch(`/games/${gameId}/players/${slot}/payment`, { isPaid });
    return response.data;
  },

  /**
   * Busca todos os jogos abertos do usuário autenticado
   */
  getMyOpenGames: async () => {
    const response = await api.get(`players/${tokenService.getUser()?.id}/games`);
    return response.data;
  },

  /**
   * Busca estatísticas dos jogos
   */
  getStats: async () => {
    const response = await api.get('/games/stats');
    return response.data.data;
  },

  /**
   * Adiciona um jogador ao jogo
   */
  addPlayerToGame: async (gameId: string, phone: string, name: string, isGoalkeeper: boolean, guestName?: string) => {
    const body: any = {
      phone,
      name,
      isGoalkeeper
    };

    if (guestName) {
      body.guestName = guestName;
    }

    const response = await api.post(`/games/${gameId}/players`, body);
    return response.data;
  },
};

/**
 * API de Chats
 */
export const chatsAPI = {
  /**
   * Busca todos os chats
   */
  getAllChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  /**
   * Cria um novo chat
   */
  createChat: async (data: {
    workspaceId: string;
    chatId: string;
    name?: string;
    label?: string;
    type?: 'group' | 'private';
    schedule?: {
      weekday: number;
      time: string;
      title: string;
      priceCents: number;
      pix: string;
    };
  }) => {
    const response = await api.post('/chats', data);
    return response.data;
  },

  /**
   * Atualiza um chat
   */
  updateChat: async (
    chatId: string,
    data: {
      name?: string;
      label?: string;
      status?: 'active' | 'inactive' | 'archived';
      schedule?: {
        weekday: number;
        time: string;
        title: string;
        priceCents: number;
        pix: string;
      };
    }
  ) => {
    const response = await api.put(`/chats/${chatId}`, data);
    return response.data;
  },
  /**
   * Busca chats por workspace
   */
  getChatsByWorkspace: async (workspaceId: string) => {
    const response = await api.get('/chats', {
      params: { workspaceId }
    });
    return response.data;
  },
};

/**
 * API de Workspaces
 */
export const workspacesAPI = {
  /**
   * Busca todos os workspaces
   */
  getAllWorkspaces: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },

  /**
   * Busca um workspace por ID
   */
  getWorkspace: async (workspaceId: string) => {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
  },

  /**
   * Atualiza configurações do Organizze para um workspace
   */
  updateOrganizzeSettings: async (
    workspaceId: string,
    data: {
      email: string;
      apiKey: string;
      accountId: number;
      categories: {
        fieldPayment: number;
        playerPayment: number;
        playerDebt: number;
        general: number;
      };
    }
  ) => {
    const response = await api.patch(`/workspaces/${workspaceId}/organizze`, data);
    return response.data;
  },

  /**
   * Remove configurações do Organizze de um workspace
   */
  deleteOrganizzeSettings: async (workspaceId: string) => {
    const response = await api.delete(`/workspaces/${workspaceId}/organizze`);
    return response.data;
  },

  /**
   * Busca chats de um workspace
   */
  getWorkspaceChats: async (workspaceId: string) => {
    const response = await api.get(`/workspaces/${workspaceId}/chats`);
    return response.data;
  },

  /**
   * Busca estatísticas de um workspace
   */
  getWorkspaceStats: async (workspaceId: string) => {
    const response = await api.get(`/workspaces/${workspaceId}/stats`);
    return response.data;
  },
};

/**
 * API de Ledgers (Histórico de Transações)
 */
export const ledgersAPI = {
  /**
   * Busca histórico de transações do usuário com paginação
   */
  getMyLedgers: async (page: number = 1, limit: number = 20) => {
    const response = await api.get(`/players/${tokenService.getUser()?.id}/transactions`, {
      params: { page, limit }
    });
    return response.data;
  },
};

/**
 * API de Players 
 */
export const playersAPI = {
  /**
   * Atualiza os dados de um jogador
   */
  updatePlayer: async (playerId: string, data: {
    name?: string;
    nick?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'suspended';
    isGoalie?: boolean;
  }) => {
    const response = await api.put(`/players/${playerId}`, data);
    return response.data;
  },

  /**
   * Busca jogadores com filtros e paginação
   */
  getPlayers: async (params?: {
    search?: string;
    status?: 'active' | 'inactive' | 'all';
    page?: number;
    limit?: number;
  }) => {
    const queryParams: any = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    if (params?.search) {
      queryParams.search = params.search;
    }

    if (params?.status && params.status !== 'all') {
      queryParams.status = params.status;
    }

    const response = await api.get('/players', { params: queryParams });
    return response.data;
  },

  /**
   * Busca jogadores por nome ou telefone (legacy)
   */
  searchPlayers: async (search: string) => {
    const response = await api.get('/players', {
      params: {
        search,
        status: 'active',
        sortBy: 'name'
      }
    });
    return response.data;
  },

  /**
   * Busca um jogador específico por ID
   */
  getPlayerById: async (playerId: string) => {
    const response = await api.get(`/players/${playerId}`);
    return response.data;
  },

  /**
   * Busca débitos de um jogador específico
   */
  getPlayerDebts: async (playerId: string) => {
    const response = await api.get(`/players/${playerId}/debts`);
    return response.data;
  },

  /**
   * Marca um débito como pago
   */
  payPlayerDebt: async (playerId: string, debtId: string) => {
    const response = await api.patch(`/players/${playerId}/debts/${debtId}/pay`);
    return response.data;
  },

  /**
   * Exclui um jogador
   */
  deletePlayer: async (playerId: string) => {
    const response = await api.delete(`/players/${playerId}`);
    return response.data;
  },

  /**
   * Adiciona crédito ao jogador
   */
  addCredit: async (playerId: string, data: {
    workspaceId: string;
    amountCents: number;
    note?: string;
    method?: string;
    category?: string;
  }) => {
    const response = await api.post(`/players/${playerId}/credit`, data);
    return response.data;
  },
};


export default api;
