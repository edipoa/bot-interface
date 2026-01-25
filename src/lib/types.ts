export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isGoalkeeper?: boolean;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  nick?: string;
  position?: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'STRIKER';
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
  workspaceId: string;
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
  workspaceId?: string;
  gameId?: string;
  membershipId?: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'MEMBERSHIP' | 'GAME_FEE' | 'FIELD_RENTAL' | 'REFEREE' | 'OTHER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  amount: number; // Em centavos
  dueDate: string;
  paidAt?: string;
  description?: string;
  method?: 'pix' | 'dinheiro' | 'transf' | 'ajuste';
  organizzeId?: number;
  createdAt: string;
  updatedAt: string;
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
    // Financial Defaults
    courtCostCents?: number;
    refereeCostCents?: number;
    monthlyFeeCents?: number;
    // General
    commandsEnabled?: string[];
    pix?: string;
    title?: string;
    logoUrl?: string;
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
  lastMessage?: string;
  lastMessageAt?: string;
}

// BBQ Types
export enum BBQStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export interface BBQParticipant {
  userId: string;
  userName: string;
  invitedBy: string | null;
  invitedByName?: string | null;
  isPaid: boolean;
  isGuest: boolean;
  isFree?: boolean;
  debtId?: string;
  transactionId?: string;
}

export interface BBQResponseDto {
  id: string;
  chatId: string;
  workspaceId: string;
  status: BBQStatus;
  description?: string;
  date: string; // ISO date string
  createdAt: string;
  closedAt?: string;
  finishedAt?: string;
  participants: BBQParticipant[];
  financials?: {
    meatCost: number;
    cookCost: number;
    ticketPrice: number;
  };
  valuePerPerson: number | null; // Keep for legacy compatibility if needed, or deprecate
  participantCount: number;
}

export interface BBQListResponseDto {
  bbqs: BBQResponseDto[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface BBQStatsDto {
  total: number;
  open: number;
  closed: number;
  finished: number;
  cancelled: number;
}

export interface CreateBBQDto {
  chatId: string;
  workspaceId: string;
  date?: string; // ISO date string
  valuePerPerson?: number;
}

export interface UpdateBBQDto {
  date?: string; // ISO date string
  valuePerPerson?: number;
  status?: BBQStatus;
}

export interface UpdateBBQStatusDto {
  status: BBQStatus;
}

export interface BBQFilterDto {
  status?: BBQStatus;
  chatId?: string;
  workspaceId?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  page?: number;
  limit?: number;
}

// Legacy interface for backward compatibility
export interface BBQ {
  _id: string;
  status: 'open' | 'closed' | 'finished' | 'cancelled';
  date: string; // ISO date string
  participants: BBQParticipant[];
  valuePerPerson: number; // in cents
}

