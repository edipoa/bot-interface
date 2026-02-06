import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000000000000,
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

    const workspaceId = localStorage.getItem('workspaceId');
    if (workspaceId && config.headers) {
      config.headers['x-workspace-id'] = workspaceId;
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

    // Handle 403 Forbidden (e.g., early access restriction for future games)
    if (error.response?.status === 403) {
      const message = (error.response.data as any)?.message ||
        'Acesso restrito a mensalistas para jogos futuros';

      // Dynamically import toast to avoid circular dependencies
      import('sonner').then(({ toast }) => {
        toast.error(message, {
          description: 'Torne-se um mensalista para ter early access aos jogos!',
          duration: 5000,
        });
      });

      return Promise.reject(error);
    }

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

    const responseData = response.data.data || response.data;
    const accessToken = responseData.accessToken || responseData.access_token;
    const refreshToken = responseData.refreshToken || responseData.refresh_token;
    const user = responseData.user;

    if (accessToken && refreshToken) {
      tokenService.setTokens(accessToken, refreshToken);
      if (user) {
        tokenService.setUser(user);
      }
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
    // API returns {success: true, data: {user data}}, so we need to extract the data
    return response.data.data || response.data;
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
  updateGame: async (gameId: string, data: any) => {
    const response = await api.put(`/games/${gameId}`, data);
    return response.data;
  },

  /**
   * Cancela/deleta um jogo
   */
  deleteGame: async (gameId: string, workspaceId: string) => {
    const response = await api.delete(`/games/${gameId}`, { data: { workspaceId } });
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
  closeGame: async (gameId: string, workspaceId: string) => {
    const response = await api.post(`/games/${gameId}/close`, { workspaceId });
    return response.data;
  },

  /**
   * Remove um jogador de um jogo (Legacy alias)
   */
  removePlayerFromGame: async (gameId: string, playerId: string) => {
    return gamesAPI.removePlayer(gameId, playerId);
  },

  /**
   * Remove um jogador
   */
  removePlayer: async (gameId: string, userId: string) => {
    const response = await api.post(`/games/${gameId}/remove-player`, { userId });
    return response.data;
  },

  /**
   * Remove um convidado de um jogo
   */
  removeGuest: async (gameId: string, slot: number) => {
    const response = await api.post(`/games/${gameId}/remove-guest`, { slot });
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
   * Busca um chat por ID
   */
  getChatById: async (chatId: string) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  /**
   * Vincula um novo chat (Bind)
   */
  bindChat: async (data: {
    code?: string;
    chatId?: string;
    name?: string;
    workspaceId?: string;
  }) => {
    // Backend espera chatId e workspaceId no body para createChat ou lógica especifica de bind
    // Se for via código !bind, o endpoint pode ser diferente ou o payload adaptado
    const response = await api.post('/chats', data);
    return response.data;
  },

  /**
   * Cria um novo chat (Legacy/Manual)
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
      settings?: {
        allowGuests?: boolean;
        autoCreateGame?: boolean;
        autoCreateDaysBefore?: number;
        requirePaymentProof?: boolean;
      };
      financials?: {
        defaultPriceCents?: number;
        pixKey?: string;
        acceptsCash?: boolean;
      };
      schedule?: {
        weekday?: number;
        time?: string;
        title?: string;
        priceCents?: number;
        pix?: string;
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
  /**
   * Ativa um chat
   */
  activateChat: async (chatId: string) => {
    const response = await api.post(`/chats/${chatId}/activate`);
    return response.data;
  },

  /**
   * Desativa um chat
   */
  deactivateChat: async (chatId: string) => {
    const response = await api.post(`/chats/${chatId}/deactivate`);
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
   * Atualiza os dados de um workspace
   */
  updateWorkspace: async (workspaceId: string, data: any) => {
    const response = await api.put(`/workspaces/${workspaceId}`, data);
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
   * Cria um novo jogador
   */
  createPlayer: async (data: {
    name: string;
    phoneE164: string;
    nick?: string;
    position?: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'STRIKER';
    type: 'MENSALISTA' | 'AVULSO';
    stars?: number;
    workspaceId: string;
  }) => {
    const response = await api.post('/players', data);
    return response.data;
  },

  /**
   * Atualiza os dados de um jogador
   */
  updatePlayer: async (playerId: string, data: {
    name?: string;
    nick?: string;
    phoneE164?: string;
    status?: 'active' | 'inactive' | 'suspended';
    isGoalie?: boolean;
    role?: 'admin' | 'user';
    workspaceId?: string;
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
    workspaceId?: string;
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

    if (params?.workspaceId) {
      queryParams.workspaceId = params.workspaceId;
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
   * Busca movimentações (transações) de um jogador
   */
  getPlayerTransactions: async (playerId: string) => {
    const response = await api.get(`/players/${playerId}/transactions`);
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

/**
 * API de BBQ (Churrascos)
 */
export const bbqAPI = {
  /**
   * Lista todos os churrascos com paginação e filtros
   * @swagger GET /api/bbq
   */
  getAllBBQs: async (filters?: {
    status?: 'open' | 'closed' | 'finished' | 'cancelled';
    chatId?: string;
    workspaceId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const params: any = {
      page: filters?.page || 1,
      limit: filters?.limit || 20,
    };

    if (filters?.status) params.status = filters.status;
    if (filters?.chatId) params.chatId = filters.chatId;
    if (filters?.workspaceId) params.workspaceId = filters.workspaceId;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    const response = await api.get('/bbq', { params });
    return response.data;
  },

  /**
   * Obtém estatísticas de churrascos
   * @swagger GET /api/bbq/stats
   */
  getStats: async (workspaceId?: string) => {
    const params: any = {};
    if (workspaceId) params.workspaceId = workspaceId;

    const response = await api.get('/bbq/stats', { params });
    return response.data.data || response.data;
  },

  /**
   * Obtém detalhes de um churrasco específico
   * @swagger GET /api/bbq/{id}
   */
  getBBQById: async (id: string) => {
    const response = await api.get(`/bbq/${id}`);
    return response.data;
  },

  /**
   * Cria um novo churrasco
   */
  createBBQ: async (data: any) => {
    const response = await api.post('/bbq', data);
    return response.data;
  },

  /**
   * Atualiza um churrasco
   */
  updateBBQ: async (id: string, data: any) => {
    const response = await api.patch(`/bbq/${id}`, data);
    return response.data;
  },

  /**
   * Fecha um churrasco e gera cobranças
   */
  closeBBQ: async (id: string) => {
    const response = await api.post(`/bbq/${id}/close`);
    return response.data;
  },

  /**
   * Cancela um churrasco
   */
  cancelBBQ: async (id: string) => {
    const response = await api.post(`/bbq/${id}/cancel`);
    return response.data;
  },

  /**
   * Adiciona participante (membro)
   */
  addParticipant: async (bbqId: string, userId: string, userName: string) => {
    const response = await api.post(`/bbq/${bbqId}/participants`, { userId, userName });
    return response.data;
  },

  /**
   * Adiciona participante (convidado)
   */
  addGuest: async (bbqId: string, invitedBy: string, guestName: string) => {
    const response = await api.post(`/bbq/${bbqId}/participants`, { invitedBy, guestName, isGuest: true });
    return response.data;
  },

  /**
   * Remove participante
   */
  removeParticipant: async (bbqId: string, userId: string) => {
    const response = await api.delete(`/bbq/${bbqId}/participants/${userId}`);
    return response.data;
  },

  /**
   * Alterna status de pagamento
   */
  toggleParticipantPayment: async (bbqId: string, userId: string, isPaid: boolean) => {
    const response = await api.patch(`/bbq/${bbqId}/participants/${userId}/payment`, { isPaid });
    return response.data;
  }
};


/**
 * API de Memberships (Assinaturas)
 */
export const membershipsAPI = {
  /**
   * Busca a assinatura do usuário autenticado
   */
  getMyMembership: async (workspaceId: string) => {
    const response = await api.get(`/memberships/my`, {
      params: { workspaceId }
    });
    return response.data;
  },

  /**
   * Cria uma nova assinatura
   */

  createMembership: async (data: { workspaceId: string; userId: string; planValue: number }) => {
    const response = await api.post('/memberships/admin/create', data);
    return response.data;
  },

  /**
   * Suspende a assinatura
   */
  suspendMembership: async (membershipId: string, notes?: string) => {
    const response = await api.patch(`/memberships/${membershipId}/suspend`, { notes });
    return response.data;
  },

  /**
   * Cancela a assinatura
   */
  cancelMembership: async (membershipId: string, immediate: boolean = false, notes?: string) => {
    const response = await api.post(`/memberships/${membershipId}/cancel`, { immediate, notes });
    return response.data;
  },

  /**
   * Reativa a assinatura
   */
  reactivateMembership: async (membershipId: string, notes?: string) => {
    const response = await api.patch(`/memberships/${membershipId}/reactivate`, { notes });
    return response.data;
  },
  getAdminList: async (params: { workspaceId: string; page?: number; limit?: number; filter?: string; search?: string }) => {
    const response = await api.get('/memberships/admin/list', { params });
    return response.data;
  },
  updateMembership: async (id: string, data: { planValue?: number; billingDay?: number; workspaceId?: string }) => {
    const response = await api.put(`/memberships/${id}`, data);
    return response.data;
  },
  registerManualPayment: async (id: string, data: { amount: number; method: string; description?: string; workspaceId?: string }) => {
    const response = await api.post(`/memberships/${id}/manual-payment`, data);
    return response.data;
  },
  suspendMembershipAdmin: async (id: string, reason: string, workspaceId: string) => {
    const response = await api.post(`/memberships/${id}/suspend`, { reason, workspaceId });
    return response.data;
  },
  cancelMembershipAdmin: async (id: string, immediate: boolean, workspaceId: string) => {
    const response = await api.post(`/memberships/${id}/cancel`, { immediate, workspaceId });
    return response.data;
  },
  processMonthlyBilling: async (workspaceId: string) => {
    const response = await api.post('/memberships/admin/process-billing', { workspaceId });
    return response.data;
  },
};

/**
 * API de Transactions (Faturas/Transações)
 */
export const transactionsAPI = {
  /**
   * Busca transações do usuário autenticado
   */
  getMyTransactions: async (page: number = 1, limit: number = 10, filters?: {
    status?: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
  }) => {
    const params: any = { page, limit };
    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;
    if (filters?.category) params.category = filters.category;

    const response = await api.get('/transactions/my', { params });
    return response.data;
  },

  /**
   * Busca o saldo financeiro do usuário
   */
  getMyBalance: async (workspaceId?: string) => {
    const params: any = {};
    if (workspaceId) params.workspaceId = workspaceId;

    const response = await api.get('/transactions/balance', { params });
    return response.data;
  },

  /**
   * Processa pagamento de uma transação
   */
  payTransaction: async (transactionId: string, data?: {
    method?: 'pix' | 'dinheiro' | 'transf' | 'ajuste';
    notes?: string;
  }) => {
    const response = await api.post(`/transactions/${transactionId}/pay`, data || {});
    return response.data;
  },

  /**
   * Busca uma transação específica por ID
   */
  getTransactionById: async (transactionId: string) => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  },

  getAll: async (params: {
    workspaceId: string;
    page?: number;
    limit?: number;
    type?: 'INCOME' | 'EXPENSE';
    status?: string;
    category?: string;
    search?: string;
  }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getStats: async (workspaceId: string) => {
    const response = await api.get('/transactions/stats', {
      params: { workspaceId }
    });
    return response.data;
  },

  getChartData: async (workspaceId: string, days?: number) => {
    const response = await api.get('/transactions/chart', {
      params: { workspaceId, days }
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  notifySingles: async (workspaceId: string) => {
    const response = await api.post(`/transactions/${workspaceId}/notify-singles`);
    return response.data;
  }
};


export default api;

