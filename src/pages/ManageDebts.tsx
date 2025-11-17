import React, { useState } from 'react';
import { BFCard } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFBadge } from '../components/BF-Badge';
import { BFTable } from '../components/BF-Table';
import { BFIcons } from '../components/BF-Icons';
import { mockDebts } from '../lib/mockData';
import type { Debt } from '../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const ManageDebts: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>(mockDebts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const filteredDebts = debts.filter((debt) => {
    const matchesSearch =
      debt.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.gameName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || debt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = debts
    .filter((d) => d.status === 'pending' || d.status === 'overdue')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPaid = debts
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + d.amount, 0);

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

  const columns = [
    {
      key: 'playerName',
      label: 'Jogador',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[--primary]/10 flex items-center justify-center">
            <span className="text-[--primary]">{value.charAt(0)}</span>
          </div>
          <span className="text-[--foreground]">{value}</span>
        </div>
      ),
    },
    {
      key: 'gameName',
      label: 'Jogo',
      render: (value: string) => <span className="text-[--foreground]">{value}</span>,
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
      key: 'dueDate',
      label: 'Vencimento',
      sortable: true,
      render: (value: string, row: Debt) => {
        const isOverdue = new Date(value) < new Date() && row.status !== 'paid';
        return (
          <span className={isOverdue ? 'text-[--destructive]' : 'text-[--muted-foreground]'}>
            {new Date(value).toLocaleDateString('pt-BR')}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: Debt['status']) => getStatusBadge(value),
    },
  ];

  return (
    <div className="space-y-6" data-test="manage-debts">
      {/* Header */}
      <div>
        <h1 className="text-[--foreground] mb-2">Gerenciar Débitos</h1>
        <p className="text-[--muted-foreground]">
          Acompanhe e gerencie os débitos dos jogadores
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--warning]/10 p-2 rounded-lg">
              <BFIcons.AlertCircle size={20} color="var(--warning)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Pendente</p>
              <h3 className="text-[--warning]">
                R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--success]/10 p-2 rounded-lg">
              <BFIcons.CheckCircle size={20} color="var(--success)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Recebido</p>
              <h3 className="text-[--success]">
                R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--destructive]/10 p-2 rounded-lg">
              <BFIcons.Clock size={20} color="var(--destructive)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Atrasados</p>
              <h3 className="text-[--foreground]">
                {debts.filter((d) => d.status === 'overdue').length}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--info]/10 p-2 rounded-lg">
              <BFIcons.Activity size={20} color="var(--info)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Este Mês</p>
              <h3 className="text-[--foreground]">
                {debts.filter((d) => {
                  const month = new Date(d.createdAt).getMonth();
                  return month === new Date().getMonth();
                }).length}
              </h3>
            </div>
          </div>
        </BFCard>
      </div>

      {/* Filters */}
      <BFCard variant="elevated" padding="lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <BFInput
              placeholder="Buscar por jogador ou jogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<BFIcons.Search size={20} />}
              fullWidth
              data-test="search-debts"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-test="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <BFButton
            variant="outline"
            icon={<BFIcons.Mail size={20} />}
            data-test="send-reminders"
          >
            Enviar Lembretes
          </BFButton>
        </div>
      </BFCard>

      {/* Table */}
      <BFCard variant="elevated" padding="none">
        <BFTable
          columns={columns}
          data={filteredDebts}
          onRowClick={(debt) => setSelectedDebt(debt)}
          actions={(row: Debt) => (
            <div className="flex items-center gap-2">
              {(row.status === 'pending' || row.status === 'overdue') && (
                <button
                  className="p-2 hover:bg-[--accent] rounded-md transition-colors"
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
                className="p-2 hover:bg-[--accent] rounded-md transition-colors"
                title="Ver Detalhes"
                data-test={`view-debt-${row.id}`}
              >
                <BFIcons.Eye size={18} color="var(--primary)" />
              </button>
            </div>
          )}
          data-test="debts-table"
        />
      </BFCard>

      {/* Payment Dialog */}
      <Dialog open={!!selectedDebt} onOpenChange={() => setSelectedDebt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Confirme o pagamento do débito selecionado
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
              <BFInput
                label="Observações (opcional)"
                placeholder="Adicione uma observação..."
                fullWidth
              />
              <div className="flex justify-end gap-3 pt-4">
                <BFButton variant="ghost" onClick={() => setSelectedDebt(null)}>
                  Cancelar
                </BFButton>
                <BFButton
                  variant="success"
                  icon={<BFIcons.CheckCircle size={20} />}
                  onClick={() => {
                    setDebts(debts.map((d) =>
                      d.id === selectedDebt.id ? { ...d, status: 'paid' as const, paidAt: new Date().toISOString() } : d
                    ));
                    setSelectedDebt(null);
                  }}
                  data-test="confirm-payment"
                >
                  Confirmar Pagamento
                </BFButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
