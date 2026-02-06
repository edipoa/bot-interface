import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFIcons } from '../components/BF-Icons';
import { transactionsAPI } from '@/lib/axios';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FinancialStatsCards, FinancialStatsDto } from '@/components/financial/FinancialStatsCards';
import { TransactionsTable, Transaction } from '@/components/financial/TransactionsTable';
import { CreateTransactionModal } from '@/components/financial/CreateTransactionModal';
import { FinancialCharts } from '@/components/financial/FinancialCharts';
import { financialService } from '@/services/financial.service';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AdminFinance: React.FC = () => {
    const { currentWorkspace } = useAuth();
    const activeWorkspaceId = currentWorkspace?.id || '';

    const [loading, setLoading] = useState(false); // Default to false since we wait for activeWorkspaceId which is immediate from context (or null)
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [_, setIsNotifyingSingles] = useState(false);

    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        description: string;
        variant: 'destructive' | 'default' | 'success';
        action?: () => Promise<void>;
    }>({
        open: false,
        title: '',
        description: '',
        variant: 'success'
    });

    const handleNotifySingles = async () => {
        if (!activeWorkspaceId) return;

        setConfirmState({
            open: true,
            title: 'Enviar cobranças avulsas?',
            description: 'Isto vai enviar cobranças avulsas deste workspace. Deseja continuar?',
            variant: 'success',
            action: async () => {
                setIsNotifyingSingles(true);

                try {
                    const response = await transactionsAPI.notifySingles(activeWorkspaceId);
                    toast.success(response.message || 'Cobranças enviadas com sucesso!');
                    fetchData();
                } catch (error: any) {
                    toast.error('Erro ao enviar cobranças: ' + (error.response?.data?.message || error.message));
                } finally {
                    setIsNotifyingSingles(false);
                }
            }
        });
    };
    //Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const handleEditClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleSaveTransaction = async (id: string, data: { status: string; description: string }) => {
        const response = await transactionsAPI.update(id, data);

        if (response.success) {
            fetchData();

            toast.success('Atualizado com sucesso!', {
                description: 'Transação atualizada com sucesso!'
            });

        } else {
            toast.error('Erro ao atualizar transação!', {
                description: 'Transação não atualizada!'
            });
        }
    };

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Stats & Charts
    const [stats, setStats] = useState<FinancialStatsDto>({
        revenue: 0,
        expenses: 0,
        balance: 0,
        pending: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    // Modal
    const [createOpen, setCreateOpen] = useState(false);

    // Notification loading state
    const [isNotifying, setIsNotifying] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, page: 1 })); // Reset page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Initialize Workspace - REMOVED (Handled by AuthContext)


    // Fetch Data
    const fetchData = useCallback(async () => {
        if (!activeWorkspaceId) return;

        try {
            setLoading(true);

            // Parallel fetching
            const [txResponse, statsResponse, chartResponse] = await Promise.all([
                transactionsAPI.getAll({
                    workspaceId: activeWorkspaceId,
                    page: pagination.page,
                    limit: pagination.limit,
                    type: filterType === 'all' ? undefined : filterType as any,
                    status: filterStatus === 'all' ? undefined : filterStatus as any,
                    search: debouncedSearch || undefined
                }),
                transactionsAPI.getStats(activeWorkspaceId),
                transactionsAPI.getChartData(activeWorkspaceId, 30)
            ]);

            // Process Transactions
            const mapped = txResponse.transactions.map((t: any) => ({
                id: t._id || t.id,
                key: t._id || t.id,
                type: t.type,
                category: t.category,
                amount: t.amount,
                description: t.description || t.notes || '-',
                status: t.status,
                date: t.dueDate || t.createdAt,
                user: t.user || t.userId
            }));

            setTransactions(mapped);
            setPagination(prev => ({
                ...prev,
                total: txResponse.total || 0,
                totalPages: txResponse.pages || 0
            }));

            // Process Stats
            setStats(statsResponse);

            // Process Chart
            setChartData(chartResponse);

        } catch (error) {
            console.error('Error fetching financial data:', error);
            toast.error('Erro ao carregar dados financeiros');
        } finally {
            setLoading(false);
        }
    }, [activeWorkspaceId, pagination.page, pagination.limit, filterType, filterStatus, debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleNotifyPendingInvoices = async () => {
        if (!activeWorkspaceId) {
            toast.error('Workspace não identificado');
            return;
        }

        setIsNotifying(true);
        try {
            const report = await financialService.notifyPendingInvoices(activeWorkspaceId);

            if (report.totalFound === 0) {
                toast.info('Nenhuma fatura pendente encontrada para o mês atual.');
            } else {
                toast.success(
                    `Processo finalizado! Enviadas: ${report.sent}, Falhas: ${report.failed}`,
                    {
                        description: `Total de faturas encontradas: ${report.totalFound}`,
                        duration: 5000,
                    }
                );
            }
        } catch (error: any) {
            console.error('Error notifying pending invoices:', error);
            const errorMessage = error?.response?.data?.message || 'Não foi possível disparar as notificações';
            toast.error(errorMessage);
        } finally {
            setIsNotifying(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">

                {/* Título e Subtítulo */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Gestão Financeira
                    </h1>
                    <p className="text-sm text-gray-500">
                        Acompanhe o fluxo de caixa do grupo
                    </p>
                </div>

                {/* Grupo de Botões */}
                {/* Mobile: Coluna (flex-col), Largura Total (w-full) */}
                {/* Desktop (sm): Linha (flex-row), Largura Auto (w-auto) */}
                <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">

                    <BFButton
                        variant="secondary"
                        icon={<BFIcons.MessageCircle size={20} />}
                        onClick={handleNotifyPendingInvoices}
                        disabled={isNotifying || loading}
                        className="w-full sm:w-auto justify-center" // Força esticar no mobile
                    >
                        Cobrar Mensalidades
                    </BFButton>

                    <BFButton
                        variant="secondary"
                        icon={<BFIcons.Bell size={20} />}
                        onClick={handleNotifySingles}
                        disabled={isNotifying || loading}
                        className="w-full sm:w-auto justify-center"
                    >
                        Cobrar Avulsos
                    </BFButton>

                    <BFButton
                        variant="primary"
                        icon={<BFIcons.Plus size={20} />}
                        onClick={() => setCreateOpen(true)}
                        className="w-full sm:w-auto justify-center"
                    >
                        Nova Transação
                    </BFButton>
                </div>
            </div>

            <FinancialStatsCards stats={stats} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <FinancialCharts data={chartData} loading={loading} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h3 className="font-semibold text-lg">Histórico de Transações</h3>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="w-full sm:w-64">
                            <BFInput
                                placeholder="Buscar por descrição..."
                                value={searchTerm}
                                onChange={setSearchTerm}
                                icon={<BFIcons.Search size={18} />}
                                fullWidth
                            />
                        </div>
                        <div className="w-40">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="INCOME">Receitas</SelectItem>
                                    <SelectItem value="EXPENSE">Despesas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-40">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="COMPLETED">Pago</SelectItem>
                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                    <SelectItem value="OVERDUE">Vencido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <TransactionsTable
                        transactions={transactions}
                        loading={loading}
                        onEdit={handleEditClick}
                        pagination={{
                            ...pagination,
                            onPageChange: handlePageChange
                        }}
                    />

                    <EditTransactionModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        transaction={selectedTransaction}
                        onSave={handleSaveTransaction}
                    />
                    <AlertDialog
                        open={confirmState.open}
                        onOpenChange={(isOpen) => setConfirmState(prev => ({ ...prev, open: isOpen }))}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {confirmState.description}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-blue-600 hover:bg-blue-700">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={async () => {
                                        if (confirmState.action) {
                                            await confirmState.action();
                                        }
                                        setConfirmState(prev => ({ ...prev, open: false }));
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <CreateTransactionModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={fetchData}
                workspaceId={activeWorkspaceId}
            />
        </div>
    );
};
