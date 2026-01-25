import React, { useEffect, useState, useCallback } from 'react';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFIcons } from '../components/BF-Icons';
import { transactionsAPI, workspacesAPI } from '@/lib/axios';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FinancialStatsCards, FinancialStatsDto } from '@/components/financial/FinancialStatsCards';
import { TransactionsTable, Transaction } from '@/components/financial/TransactionsTable';
import { CreateTransactionModal } from '@/components/financial/CreateTransactionModal';
import { FinancialCharts } from '@/components/financial/FinancialCharts';

export const AdminFinance: React.FC = () => {
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, page: 1 })); // Reset page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Initialize Workspace
    useEffect(() => {
        const fetchWorkspace = async () => {
            try {
                const response = await workspacesAPI.getAllWorkspaces();
                if (response.workspaces && response.workspaces.length > 0) {
                    const mostRecent = response.workspaces.sort((a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0];
                    setActiveWorkspaceId(mostRecent.id);
                }
            } catch (error) {
                console.error('Error fetching workspace:', error);
            }
        };
        fetchWorkspace();
    }, []);

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
    }, [activeWorkspaceId, pagination.page, pagination.limit, filterType, debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestão Financeira</h1>
                    <p className="text-sm text-gray-500">Acompanhe o fluxo de caixa do grupo</p>
                </div>
                <BFButton
                    variant="primary"
                    icon={<BFIcons.Plus size={20} />}
                    onClick={() => setCreateOpen(true)}
                >
                    Nova Transação
                </BFButton>
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
                    </div>
                </div>

                <div className="p-0">
                    <TransactionsTable
                        transactions={transactions}
                        loading={loading}
                        pagination={{
                            ...pagination,
                            onPageChange: handlePageChange
                        }}
                    />
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
