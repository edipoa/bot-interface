import React from 'react';
import { BFIcons } from './BF-Icons';

export interface BFTableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface BFTableProps<T = any> {
  columns: BFTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  'data-test'?: string;
}

export function BFTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  actions,
  emptyMessage = 'Nenhum dado disponível',
  isLoading = false,
  'data-test': dataTest,
}: BFTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortOrder]);

  if (isLoading) {
    return (
      <div className="w-full p-8 text-center text-[--muted-foreground]" data-test={dataTest}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[--primary]" />
        <p className="mt-2">Carregando...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-8 text-center text-[--muted-foreground]" data-test={dataTest}>
        {emptyMessage}
      </div>
    );
  }


  return (
    <div className="w-full" data-test={dataTest}>
      {/* Desktop: Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[--border] bg-[--muted]/30">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 text-left text-[--foreground]
                    ${column.sortable ? 'cursor-pointer hover:bg-[--muted]/50 select-none' : ''}
                    ${column.width ? column.width : ''}
                  `}
                  onClick={() => handleSort(column.key, column.sortable)}
                  data-test={`table-header-${column.key}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortKey === column.key ? (
                          sortOrder === 'asc' ? (
                            <BFIcons.ChevronUp size={16} />
                          ) : (
                            <BFIcons.ChevronDown size={16} />
                          )
                        ) : (
                          <BFIcons.ChevronDown size={16} className="opacity-30" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-left text-[--foreground] w-24">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  border-b border-[--border]
                  ${onRowClick ? 'cursor-pointer hover:bg-[--accent] transition-colors' : ''}
                `}
                onClick={() => onRowClick?.(row)}
                data-test={`table-row-${rowIndex}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-[--foreground]">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-3">
        {sortedData.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`
              bg-[--card] border border-[--border] rounded-lg p-4
              ${onRowClick ? 'cursor-pointer hover:bg-[--accent] transition-colors' : ''}
            `}
            onClick={() => onRowClick?.(row)}
            data-test={`table-card-${rowIndex}`}
          >
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start gap-3">
                  <span className="text-[--muted-foreground] text-sm font-medium min-w-[100px]">
                    {column.label}:
                  </span>
                  <div className="text-[--foreground] text-sm text-right flex-1">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </div>
                </div>
              ))}
              {actions && (
                <div className="flex justify-between items-center gap-3 pt-2 border-t border-[--border]">
                  <span className="text-[--muted-foreground] text-sm font-medium">
                    Ações:
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
