import React from 'react';
import { BFBadge } from './BF-Badge';
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
    <div className="w-full overflow-x-auto" data-test={dataTest}>
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
  );
}

/*
Vue 3 Implementation Example:

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'
import { BFBadge } from './BFBadge.vue'
import { BFIcon } from './BFIcon.vue'

interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => any
  width?: string
}

interface Props {
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  isLoading?: boolean
  dataTest?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: 'Nenhum dado disponível',
  isLoading: false
})

const emit = defineEmits<{
  rowClick: [row: T]
}>()

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const handleSort = (key: string, sortable?: boolean) => {
  if (!sortable) return

  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortedData = computed(() => {
  if (!sortKey.value) return props.data

  return [...props.data].sort((a, b) => {
    const aValue = a[sortKey.value!]
    const bValue = b[sortKey.value!]

    if (aValue === bValue) return 0

    const comparison = aValue > bValue ? 1 : -1
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})
</script>

<template>
  <div v-if="isLoading" class="w-full p-8 text-center text-[--muted-foreground]" :data-test="dataTest">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[--primary]" />
    <p class="mt-2">Carregando...</p>
  </div>

  <div v-else-if="data.length === 0" class="w-full p-8 text-center text-[--muted-foreground]" :data-test="dataTest">
    {{ emptyMessage }}
  </div>

  <div v-else class="w-full overflow-x-auto" :data-test="dataTest">
    <table class="w-full border-collapse">
      <thead>
        <tr class="border-b border-[--border] bg-[--muted]/30">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-4 py-3 text-left text-[--foreground]',
              column.sortable ? 'cursor-pointer hover:bg-[--muted]/50 select-none' : '',
              column.width || ''
            ]"
            @click="handleSort(column.key, column.sortable)"
            :data-test="`table-header-${column.key}`"
          >
            <div class="flex items-center gap-2">
              <span>{{ column.label }}</span>
              <div v-if="column.sortable" class="flex flex-col">
                <BFIcon
                  v-if="sortKey === column.key"
                  :name="sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                  :size="16"
                />
                <BFIcon v-else name="ChevronDown" :size="16" class="opacity-30" />
              </div>
            </div>
          </th>
          <th v-if="$slots.actions" class="px-4 py-3 text-left text-[--foreground] w-24">
            Ações
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in sortedData"
          :key="rowIndex"
          :class="[
            'border-b border-[--border]',
            'cursor-pointer hover:bg-[--accent] transition-colors'
          ]"
          @click="emit('rowClick', row)"
          :data-test="`table-row-${rowIndex}`"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 text-[--foreground]"
          >
            <component
              v-if="column.render"
              :is="column.render(row[column.key], row)"
            />
            <template v-else>{{ row[column.key] }}</template>
          </td>
          <td v-if="$slots.actions" class="px-4 py-3" @click.stop>
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
*/
