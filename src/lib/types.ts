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
  status: 'active' | 'inactive' | 'suspended';
  balance: number;
  totalDebt: number;
  joinDate: string;
  lastActivity: string;
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
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  playerId: string;
  playerName: string;
  gameId: string;
  gameName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  notes?: string;
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
  description: string;
  platform: 'whatsapp' | 'telegram' | 'discord';
  status: 'active' | 'inactive' | 'maintenance';
  totalChats: number;
  activeChats: number;
  createdAt: string;
  lastSync: string;
  apiKey?: string;
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
  name: string;
  chatId: string; // ID do chat na plataforma (WhatsApp, Telegram, etc)
  label?: string;
  type: 'group' | 'private';
  status: 'active' | 'inactive' | 'archived';
  memberCount: number;
  schedule?: ChatSchedule;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt?: string;
}
