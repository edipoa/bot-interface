import React, { useEffect, useState } from 'react';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFBadge } from '../components/BF-Badge';
import { BFIcons } from '../components/BF-Icons';
import { BFListView } from '../components/BFListView';
import type { Debt } from '../lib/types';
import type { BFListViewColumn, BFListViewStat } from '../components/BFListView';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { debtsAPI } from '@/lib/axios';
import { toast } from 'sonner';

interface DebtAPIResponse {
  id: string;
  playerId: string;
  playerName: string;
  gameId: string;
  gameName: string;
  slot?: number;
  workspaceId: string;
  amount: number;
  amountCents: number;
  status: string;
  notes: string;
  category: string;
  createdAt: string;
  paidAt: string;
  updatedAt: string;
}

export const ManageDebts: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [payingDebt, setPayingDebt] = useState(false);

  const [stats, setStats] = useState({
    overdue: 0,
    debtsMonth: 0,
    pendingAmount: 0,
    paidAmount: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchDebts();
  }, [pagination.page, filterStatus, debouncedSearchTerm]);

  const mapStatusFromAPI = (apiStatus: string): Debt['status'] => {
    const statusMap: Record<string, Debt['status']> = {
      'confirmado': 'paid',
      'pendente': 'pending',
      'cancelado': 'cancelled',
    };
    return statusMap[apiStatus] || 'pending';
  };

  const mapStatusToAPI = (frontendStatus: string): string | undefined => {
    if (frontendStatus === 'all') return undefined;
    const statusMap: Record<string, string> = {
      'paid': 'confirmado',
      'pending': 'pendente',
      'cancelled': 'cancelado',
      'overdue': 'pendente', // Overdue is still pending in the API
    };
    return statusMap[frontendStatus];
  };

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const apiStatus = mapStatusToAPI(filterStatus);
      const response = await debtsAPI.getAllDebts(
        pagination.page,
        pagination.limit,
        apiStatus,
        debouncedSearchTerm || undefined
      );

      // Map API response to frontend Debt type
      const mappedDebts: Debt[] = response.debts.map((debt: DebtAPIResponse) => ({
        id: debt.id,
        playerId: debt.playerId,
        playerName: debt.playerName || 'Desconhecido',
        gameId: debt.gameId,
        gameName: debt.gameName,
        slot: debt.slot,
        amount: debt.amountCents / 100, // Convert cents to reais
        dueDate: debt.createdAt, // Using createdAt as dueDate for now
        status: mapStatusFromAPI(debt.status),
        createdAt: debt.createdAt,
        paidAt: debt.paidAt,
        notes: debt.notes,
        category: debt.category,
      }));

      setDebts(mappedDebts);
      setStats({
        overdue: response.overdue || 0,
        debtsMonth: response.debtsMonth || 0,
        pendingAmount: response.pendingAmount || 0,
        paidAmount: response.paidAmount || 0,
      });
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (error) {
      console.error('Error fetching debts:', error);
      toast.error('Erro ao carregar débitos');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedDebt) return;

    try {
      setPayingDebt(true);

      // CENTRALIZADO: Sempre usa o mesmo endpoint
      // O backend detecta automaticamente se é débito de jogo ou geral
      await debtsAPI.markAsPaid(selectedDebt.id, {
        category: selectedDebt.category as any,
      });

      toast.success('✅ Pagamento registrado com sucesso!');
      setSelectedDebt(null);
      fetchDebts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
    } finally {
      setPayingDebt(false);
    }
  };

  const getStatusBadge = (status: Debt['status']) => {
    const statusMap = {
      pending: { variant: 'warning' as const, label: 'Pendente' },
      paid: { variant: 'success' as const, label: 'Pago' },
      overdue: { variant: 'error' as const, label: 'Atrasado' },
      cancelled: { variant: 'neutral' as const, label: 'Cancelado' },
    };
    const config = statusMap[status];
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  // Configure statistics for BFListView
  const listStats: BFListViewStat[] = [
    {
      label: 'Pendente',
      value: `R$ ${stats.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: <BFIcons.AlertCircle size={20} color="var(--warning)" />,
      iconBgColor: 'var(--warning)/10',
      valueColor: 'var(--warning)',
      variant: 'elevated',
    },
    {
      label: 'Recebido',
      value: `R$ ${stats.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: <BFIcons.CheckCircle size={20} color="var(--success)" />,
      iconBgColor: 'var(--success)/10',
      valueColor: 'var(--success)',
      variant: 'elevated',
    },
    {
      label: 'Atrasados',
      value: stats.overdue,
      icon: <BFIcons.Clock size={20} color="var(--destructive)" />,
      iconBgColor: 'var(--destructive)/10',
      variant: 'elevated',
    },
    {
      label: 'Este Mês',
      value: stats.debtsMonth,
      icon: <BFIcons.Activity size={20} color="var(--info)" />,
      iconBgColor: 'var(--info)/10',
      variant: 'elevated',
    },
  ];

  // Configure columns for BFListView
  const columns: BFListViewColumn<Debt>[] = [
    {
      key: 'playerName',
      label: 'Jogador',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <span className="text-white font-semibold">{value.charAt(0).toUpperCase()}</span>
          </div>
          <span className="text-[--foreground]">{value}</span>
        </div>
      ),
    },
    {
      key: 'gameName',
      label: 'Jogo',
      render: (value: string) => (
        <span className={`text-sm ${!value ? 'text-muted-foreground italic' : 'text-[--foreground]'}`}>
          {value || 'Débito Avulso'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (value: number) => (
        <span className="text-[--foreground]">
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      render: (value: string) => (
        <span className="text-[--muted-foreground]">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: Debt['status']) => getStatusBadge(value),
    },
  ];

  return (
    <>
      <BFListView
        title="Gerenciar Débitos"
        description="Acompanhe e gerencie os débitos dos jogadores"
        stats={listStats}
        searchPlaceholder="Buscar por jogador ou jogo..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={{
          value: filterStatus,
          onChange: setFilterStatus,
          options: [
            { value: 'all', label: 'Todos' },
            { value: 'pending', label: 'Pendente' },
            { value: 'paid', label: 'Pago' },
            { value: 'cancelled', label: 'Cancelado' },
          ],
        }}
        columns={columns}
        data={debts}
        loading={loading}
        onRowClick={(debt) => setSelectedDebt(debt)}
        rowActions={(row: Debt) => (
          <div className="flex items-center gap-2">
            {row.status === 'pending' && (
              <button
                className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
                title="Registrar Pagamento"
                data-test={`pay-debt-${row.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDebt(row);
                }}
              >
                <BFIcons.CheckCircle size={18} color="var(--success)" />
              </button>
            )}
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
              title="Ver Detalhes"
              data-test={`view-debt-${row.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDebt(row);
              }}
            >
              <BFIcons.Eye size={18} color="var(--primary)" />
            </button>
          </div>
        )}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
          onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
        }}
        dataTest="manage-debts"
      />

      {/* Payment Dialog */}
      <Dialog open={!!selectedDebt} onOpenChange={() => setSelectedDebt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDebt?.status === 'paid' ? 'Detalhes do Débito' : 'Registrar Pagamento'}
            </DialogTitle>
            <DialogDescription>
              {selectedDebt?.status === 'paid'
                ? 'Informações do débito pago'
                : 'Confirme o pagamento do débito selecionado'}
            </DialogDescription>
          </DialogHeader>
          {selectedDebt && (
            <div className="space-y-4">
              <div>
                <p className="text-[--muted-foreground]">Jogador</p>
                <p className="text-[--foreground]">{selectedDebt.playerName}</p>
              </div>
              <div>
                <p className="text-[--muted-foreground]">Jogo</p>
                <p className="text-[--foreground]">{selectedDebt.gameName}</p>
              </div>
              <div>
                <p className="text-[--muted-foreground]">Valor</p>
                <h3 className="text-[--foreground]">
                  R$ {selectedDebt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              {selectedDebt.notes && (
                <div>
                  <p className="text-[--muted-foreground]">Observações</p>
                  <p className="text-[--foreground]">{selectedDebt.notes}</p>
                </div>
              )}
              {selectedDebt.status === 'paid' && selectedDebt.paidAt && (
                <div>
                  <p className="text-[--muted-foreground]">Data do Pagamento</p>
                  <p className="text-[--foreground]">
                    {new Date(selectedDebt.paidAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {selectedDebt.status === 'pending' && (
                <>
                  <BFInput
                    label="Observações (opcional)"
                    placeholder="Adicione uma observação..."
                    value={paymentNotes}
                    onChange={(value) => setPaymentNotes(value)}
                    fullWidth
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <BFButton
                      variant="ghost"
                      onClick={() => {
                        setSelectedDebt(null);
                        setPaymentNotes('');
                      }}
                      disabled={payingDebt}
                    >
                      Cancelar
                    </BFButton>
                    <BFButton
                      variant="success"
                      icon={<BFIcons.CheckCircle size={20} />}
                      onClick={handleConfirmPayment}
                      disabled={payingDebt}
                      data-test="confirm-payment"
                    >
                      {payingDebt ? 'Processando...' : 'Confirmar Pagamento'}
                    </BFButton>
                  </div>
                </>
              )}
              {selectedDebt.status !== 'pending' && (
                <div className="flex justify-end pt-4">
                  <BFButton
                    variant="ghost"
                    onClick={() => setSelectedDebt(null)}
                  >
                    Fechar
                  </BFButton>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
