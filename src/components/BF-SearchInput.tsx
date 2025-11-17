import React from 'react';
import { BFIcons } from './BF-Icons';

export interface BFSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  'data-test'?: string;
}

export const BFSearchInput: React.FC<BFSearchInputProps> = ({
  placeholder = 'Buscar...',
  value,
  onChange,
  onClear,
  className = '',
  'data-test': dataTest,
}) => {
  return (
    <div className={`relative ${className}`} data-test={dataTest}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <BFIcons.Search size={20} color="var(--muted-foreground)" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 bg-[--background] border border-[--border] rounded-lg text-[--foreground] placeholder:text-[--muted-foreground] focus:outline-none focus:ring-2 focus:ring-[--primary] transition-all"
        data-test={`${dataTest}-input`}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[--accent] rounded-md transition-colors"
          data-test={`${dataTest}-clear`}
        >
          <BFIcons.X size={16} color="var(--muted-foreground)" />
        </button>
      )}
    </div>
  );
};

/*
Vue 3 Implementation Example:

<script setup lang="ts">
interface Props {
  placeholder?: string
  modelValue: string
  dataTest?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  clear: []
}>()

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="relative" :data-test="dataTest">
    <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <BFIcon name="Search" :size="20" color="var(--muted-foreground)" />
    </div>
    <input
      type="text"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      class="w-full h-11 pl-10 pr-10 bg-[--background] border border-[--border] rounded-lg text-[--foreground] placeholder:text-[--muted-foreground] focus:outline-none focus:ring-2 focus:ring-[--primary] transition-all"
      :data-test="`${dataTest}-input`"
    />
    <button
      v-if="modelValue"
      @click="handleClear"
      class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[--accent] rounded-md transition-colors"
      :data-test="`${dataTest}-clear`"
    >
      <BFIcon name="X" :size="16" color="var(--muted-foreground)" />
    </button>
  </div>
</template>
*/
