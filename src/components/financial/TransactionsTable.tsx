import React from 'react';
import { BFTable } from '../BF-Table';
import { BFBadge } from '../BF-Badge';
import { BFPagination } from '../BF-Pagination';
import type { BFListViewColumn } from '../BFListView';
import { Button } from '../ui/button';
import { Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

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
    onEdit?: (transaction: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
    transactions,
    loading: _loading,
    pagination,
    onEdit
}) => {
    const getStatusBadge = (status: string) => {
        const map: any = {
            'COMPLETED': { variant: 'success', label: 'Concluído' },
            'PENDING': { variant: 'warning', label: 'Pendente' },
            'CANCELLED': { variant: 'info', label: 'Cancelado' },
            'OVERDUE': { variant: 'error', label: 'Vencido' }
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
            key: 'user',
            label: 'Usuário',
            render: (val: { _id: string, name: string } | null) => (
                <BFBadge variant="neutral">
                    {val?.name || 'Sem vínculo'}
                </BFBadge>
            )
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
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (_: string, row: Transaction) => {
                const isMembership = row.category === "MEMBERSHIP";

                return (
                    <div className="flex justify-end items-center" onClick={(e) => e.stopPropagation()}>

                        {/* VISÃO DESKTOP: Botões Visíveis (hidden no mobile) */}
                        <div className="hidden md:flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit?.(row)}
                                disabled={isMembership}
                                className={isMembership ? "opacity-50 cursor-not-allowed" : ""}
                                title="Editar Transação"
                            >
                                <Edit size={16} />
                            </Button>
                        </div>

                        {/* VISÃO MOBILE: Menu Dropdown (visible apenas no mobile) */}
                        <div className="flex md:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => onEdit?.(row)}
                                        disabled={isMembership}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Editar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-4">
            <BFTable
                columns={columns}
                data={transactions}
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
