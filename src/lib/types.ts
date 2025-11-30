export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  nick?: string;
  isGoalie?: boolean;
  status: 'active' | 'inactive' | 'suspended';
  balance: number;
  totalDebt: number;
  role?: 'admin' | 'user';
  joinDate: string;
  lastActivity: string;
  createdAt?: string;
  updatedAt?: string;
  profilePicture?: string;
}

export interface Game {
  id: string;
  name: string;
  type: 'futebol' | 'basquete' | 'volei' | 'outros';
  date: string;
  time: string;
  location: string;
  maxPlayers: number;
  currentPlayers: number;
  pricePerPlayer: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'closed';
  createdBy: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  playerId: string;
  playerName: string;
  gameId: string;
  gameName: string;
  slot?: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  notes?: string;
  category?: string;
}

export interface PlayerDebt {
  _id: string;
  workspaceId?: {
    _id: string;
    name: string;
    slug: string;
  };
  gameId?: {
    _id: string;
    chatId: string;
  };
  userId: string;
  type: string;
  method: string;
  category: string;
  amountCents: number;
  note: string;
  status: 'pendente' | 'pago' | 'cancelado';
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  pix?: string;
}

export interface Transaction {
  id: string;
  playerId: string;
  playerName: string;
  type: 'payment' | 'debt' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface DashboardStats {
  totalPlayers: number;
  activePlayers: number;
  totalGames: number;
  upcomingGames: number;
  totalDebt: number;
  paidThisMonth: number;
  revenue: number;
  revenueGrowth: number;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  command: string;
  category: 'player' | 'game' | 'debt' | 'report' | 'system';
  parameters: CommandParameter[];
  createdAt: string;
  updatedAt: string;
  executionCount: number;
}

export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  platform: 'whatsapp' | 'telegram' | 'discord';
  status: 'active' | 'inactive' | 'maintenance';
  totalChats: number;
  activeChats: number;
  createdAt: string;
  lastSync: string;
  updatedAt?: string;
  timezone?: string;
  settings?: {
    maxPlayers?: number;
    pricePerGame?: number;
    pricePerGameCents?: number;
    commandsEnabled?: string[];
    pix?: string;
    title?: string;
  };
  apiKey?: string;
  organizzeConfig?: {
    email: string;
    hasApiKey: boolean;
    accountId: number;
    categories: {
      fieldPayment: number;
      playerPayment: number;
      playerDebt: number;
      general: number;
    };
  };
}

export interface ChatSchedule {
  weekday: number; // 0 = Dom, 1 = Seg, ..., 6 = Sáb
  time: string; // "HH:mm"
  title: string;
  priceCents: number;
  pix: string;
}

export interface Chat {
  id: string;
  workspaceId: string;
  name?: string;
  chatId: string;
  label?: string;
  type: 'group' | 'private';
  status: 'active' | 'inactive' | 'archived';
  memberCount: number;
  schedule?: ChatSchedule;
  createdAt: string;
  updatedAt: string;
}
