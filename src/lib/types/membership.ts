

export interface Membership {
    id: string;
    workspaceId: string;
    userId: string;
    status: MembershipStatus;
    planValue: number; // Em reais
    planValueCents: number; // Em centavos
    startDate: string;
    endDate?: string;
    nextDueDate: string;
    canceledAt?: string;
    suspendedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    // Campos calculados
    isOverdue?: boolean;
    daysUntilDue?: number;
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export enum TransactionCategory {
    MEMBERSHIP = 'MEMBERSHIP',
    GAME_FEE = 'GAME_FEE',
    FIELD_RENTAL = 'FIELD_RENTAL',
    REFEREE = 'REFEREE',
    OTHER = 'OTHER'
}

export interface Transaction {
    id: string;
    workspaceId: string;
    userId?: string;
    userName?: string;
    gameId?: string;
    gameName?: string;
    membershipId?: string;
    type: TransactionType;
    category: TransactionCategory;
    status: TransactionStatus;
    amount: number; // Em reais
    amountCents: number; // Em centavos
    dueDate: string;
    paidAt?: string;
    description?: string;
    method?: 'pix' | 'dinheiro' | 'transf' | 'ajuste';
    createdAt: string;
    updatedAt: string;
}

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED_SCHEDULED' | 'INACTIVE';

export interface ITransaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
    dueDate: string;
    paidAt?: string;
}

export interface IFinancialBalance {
    totalPending: number; // Valor que o usuário deve pagar agora
    history: ITransaction[];
}
