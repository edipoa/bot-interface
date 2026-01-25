import React from 'react';
import { BFTable } from '../BF-Table';
import { BFBadge } from '../BF-Badge';
import { BFPagination } from '../BF-Pagination';
import type { BFListViewColumn } from '../BFListView';

export interface Transaction {
    id: string;
    key: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    amount: number;
    description: string;
    status: string;
    date: string;
    user?: { name: string; phone?: string };
}

interface TransactionsTableProps {
    transactions: Transaction[];
    loading: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
    onRowClick?: (transaction: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
    transactions,
    loading: _loading,
    pagination,
    onRowClick
}) => {
    const getStatusBadge = (status: string) => {
        const map: any = {
            'COMPLETED': { variant: 'success', label: 'Concluído' },
            'PENDING': { variant: 'warning', label: 'Pendente' },
            'CANCELLED': { variant: 'neutral', label: 'Cancelado' },
            'OVERDUE': { variant: 'danger', label: 'Vencido' }
        };
        const config = map[status] || { variant: 'neutral', label: status };
        return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
    };

    const columns: BFListViewColumn<Transaction>[] = [
        {
            key: 'date',
            label: 'Data',
            render: (val: string) => new Date(val).toLocaleDateString('pt-BR')
        },
        {
            key: 'category',
            label: 'Categoria',
            render: (val: string) => <BFBadge variant="neutral">{val}</BFBadge>
        },
        {
            key: 'description',
            label: 'Descrição',
            render: (val: string, row: Transaction) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {row.user?.name ? `${row.user.name} - ` : ''}{val}
                    </span>
                    {row.user?.phone && (
                        <span className="text-xs text-gray-500">{row.user.phone}</span>
                    )}
                </div>
            )
        },
        {
            key: 'amount',
            label: 'Valor',
            render: (val: number, row: Transaction) => (
                <span className={`font-bold ${row.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.type === 'INCOME' ? '+' : '-'} R$ {val.toFixed(2)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (val: string) => getStatusBadge(val)
        }
    ];

    return (
        <div className="space-y-4">
            <BFTable
                columns={columns}
                data={transactions}
                onRowClick={onRowClick}
                emptyMessage="Nenhuma transação encontrada"
            />

            <BFPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={pagination.onPageChange}
            />
        </div>
    );
};
