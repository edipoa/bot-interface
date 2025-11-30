import React, { useEffect, useState } from 'react';
import { BFCard } from './BF-Card';
import { BFButton } from './BF-Button';
import { BFInput } from './BF-Input';
import { BFTable } from './BF-Table';
import { BFIcons } from './BF-Icons';
import { BFPagination } from './BF-Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

/**
 * Statistics card configuration
 */
export interface BFListViewStat {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    variant?: 'default' | 'stat' | 'outlined' | 'elevated';
    iconBgColor?: string;
    iconColor?: string;
    valueColor?: string;
    labelColor?: string;
}

/**
 * Table column configuration
 */
export interface BFListViewColumn<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Pagination configuration
 */
export interface BFListViewPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/**
 * Status filter configuration
 */
export interface BFListViewStatusFilter {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}

/**
 * Create button configuration
 */
export interface BFListViewCreateButton {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

/**
 * Empty state configuration
 */
export interface BFListViewEmptyState {
    icon?: React.ReactNode;
    message: string;
    submessage?: string;
}

/**
 * Props for BFListView component
 */
export interface BFListViewProps<T> {
    // Header
    title: string;
    description: string;
    createButton?: BFListViewCreateButton;
    headerActions?: React.ReactNode;

    // Statistics
    stats: BFListViewStat[];

    // Filters
    searchPlaceholder?: string;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    statusFilter?: BFListViewStatusFilter;
    customFilters?: React.ReactNode;

    // Table
    columns: BFListViewColumn<T>[];
    data: T[];
    loading: boolean;
    emptyState?: BFListViewEmptyState;
    onRowClick?: (row: T) => void;
    rowActions?: (row: T) => React.ReactNode;

    // Pagination
    pagination: BFListViewPagination;

    // Data test attributes
    dataTest?: string;
}

/**
 * Reusable list view component for managing entities (Games, Players, Debts, etc.)
 * 
 * @example
 * ```tsx
 * <BFListView
 *   title="Gerenciar Jogos"
 *   description="Crie e gerencie jogos e eventos esportivos"
 *   createButton={{ label: "Novo Jogo", onClick: handleCreate }}
 *   stats={[...]}
 *   searchPlaceholder="Buscar por nome ou local..."
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   statusFilter={{ value: status, onChange: setStatus, options: [...] }}
 *   columns={[...]}
 *   data={games}
 *   loading={loading}
 *   pagination={pagination}
 * />
 * ```
 */
export function BFListView<T extends { id: string }>({
    title,
    description,
    createButton,
    headerActions,
    stats,
    searchPlaceholder,
    searchTerm,
    onSearchChange,
    statusFilter,
    customFilters,
    columns,
    data,
    loading,
    emptyState,
    onRowClick,
    rowActions,
    pagination,
    dataTest = 'list-view',
}: BFListViewProps<T>) {
    return (
        <div className="space-y-6" data-test={dataTest}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[--foreground] mb-2">{title}</h1>
                    <p className="text-[--muted-foreground]">{description}</p>
                </div>
                {createButton && (
                    <BFButton
                        variant="primary"
                        icon={createButton.icon || <BFIcons.Plus size={20} />}
                        onClick={createButton.onClick}
                        data-test={`${dataTest}-create-button`}
                    >
                        {createButton.label}
                    </BFButton>
                )}
                {headerActions}
            </div>

            {/* Statistics Cards */}
            {stats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <BFCard
                            key={index}
                            variant={stat.variant || 'outlined'}
                            padding="md"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor: stat.iconBgColor || 'var(--primary)/10',
                                    }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <p
                                        className="text-sm"
                                        style={{ color: stat.labelColor || 'var(--muted-foreground)' }}
                                    >
                                        {stat.label}
                                    </p>
                                    <h3
                                        className="text-xl font-semibold"
                                        style={{ color: stat.valueColor || 'var(--foreground)' }}
                                    >
                                        {stat.value}
                                    </h3>
                                </div>
                            </div>
                        </BFCard>
                    ))}
                </div>
            )}

            {/* Filters */}
            {(onSearchChange || statusFilter || customFilters) && (
                <BFCard variant="elevated" padding="lg">
                    <div className="flex flex-col md:flex-row gap-4">
                        {onSearchChange && (
                            <div className="flex-1">
                                <BFInput
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={onSearchChange}
                                    icon={<BFIcons.Search size={20} />}
                                    fullWidth
                                    data-test={`${dataTest}-search`}
                                />
                            </div>
                        )}
                        {statusFilter && (
                            <div className="w-full md:w-48">
                                <Select value={statusFilter.value} onValueChange={statusFilter.onChange}>
                                    <SelectTrigger
                                        data-test={`${dataTest}-filter-status`}
                                        className="h-10 border border-[--border] bg-white dark:bg-gray-800"
                                    >
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusFilter.options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {customFilters}
                    </div>
                </BFCard>
            )}

            {/* Table */}
            <BFCard variant="elevated" padding="none">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                            <p className="mt-2 text-[--muted-foreground]">Carregando...</p>
                        </div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        {emptyState?.icon || <BFIcons.Search size={48} className="text-[--muted-foreground] mb-3" />}
                        <p className="text-[--muted-foreground]">
                            {emptyState?.message || 'Nenhum item encontrado'}
                        </p>
                        {emptyState?.submessage && (
                            <p className="text-sm text-[--muted-foreground] mt-1">
                                {emptyState.submessage}
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <BFTable
                            columns={columns}
                            data={data}
                            onRowClick={onRowClick}
                            actions={rowActions}
                            data-test={`${dataTest}-table`}
                        />

                        <BFPagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={pagination.onPageChange}
                            data-test={`${dataTest}-pagination`}
                        />
                    </>
                )}
            </BFCard>
        </div>
    );
}
