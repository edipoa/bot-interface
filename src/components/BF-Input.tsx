import React from 'react';

export interface BFInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  'data-test'?: string;
  onChange?: (value: string) => void;
}

export const BFInput: React.FC<BFInputProps> = ({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  inputSize = 'md',
  fullWidth = false,
  className = '',
  'data-test': dataTest,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  const sizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-5',
  };

  const inputClasses = `
    ${sizeClasses[inputSize]}
    ${fullWidth ? 'w-full' : ''}
    ${icon && iconPosition === 'left' ? 'pl-10' : ''}
    ${icon && iconPosition === 'right' ? 'pr-10' : ''}
    ${error ? 'border-[var(--destructive)] focus:ring-[var(--destructive)]' : 'border-[var(--border)] focus:ring-[var(--primary)]'}
    bg-[var(--input-background)]
    border
    rounded-[var(--radius-md)]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`} data-test={dataTest}>
      {label && (
        <label className="block mb-2 text-[var(--foreground)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
            {icon}
          </div>
        )}
        <input className={inputClasses} onChange={handleChange} {...props} />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[var(--destructive)] text-sm" data-test={`${dataTest}-error`}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-[var(--muted-foreground)] text-sm">
          {helperText}
        </p>
      )}
    </div>
  );
};

export interface BFTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  'data-test'?: string;
}

export const BFTextarea: React.FC<BFTextareaProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  'data-test': dataTest,
  ...props
}) => {
  const textareaClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'border-[var(--destructive)] focus:ring-[var(--destructive)]' : 'border-[var(--border)] focus:ring-[var(--primary)]'}
    bg-[var(--input-background)]
    border
    rounded-[var(--radius-md)]
    px-4 py-3
    min-h-[100px]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    resize-y
    ${className}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`} data-test={dataTest}>
      {label && (
        <label className="block mb-2 text-[var(--foreground)]">
          {label}
        </label>
      )}
      <textarea className={textareaClasses} {...props} />
      {error && (
        <p className="mt-1.5 text-[var(--destructive)] text-sm" data-test={`${dataTest}-error`}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-[var(--muted-foreground)] text-sm">
          {helperText}
        </p>
      )}
    </div>
  );
};

/*
Vue 3 Implementation Example:

// BFInput.vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  error?: string
  helperText?: string
  iconPosition?: 'left' | 'right'
  inputSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  dataTest?: string
  disabled?: boolean
  type?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconPosition: 'left',
  inputSize: 'md',
  fullWidth: false,
  type: 'text'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-5',
  }
  
  return [
    sizeClasses[props.inputSize],
    props.fullWidth ? 'w-full' : '',
    props.error ? 'border-[--destructive] focus:ring-[--destructive]' : 'border-[--border] focus:ring-[--primary]',
    'bg-[--input-background]',
    'border',
    'rounded-[--radius-md]',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="{ 'w-full': fullWidth }" :data-test="dataTest">
    <label v-if="label" class="block mb-2 text-[--foreground]">
      {{ label }}
    </label>
    <div class="relative">
      <div v-if="$slots.icon && iconPosition === 'left'" class="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted-foreground]">
        <slot name="icon" />
      </div>
      <input
        :class="inputClasses"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleInput"
      />
      <div v-if="$slots.icon && iconPosition === 'right'" class="absolute right-3 top-1/2 -translate-y-1/2 text-[--muted-foreground]">
        <slot name="icon" />
      </div>
    </div>
    <p v-if="error" class="mt-1.5 text-[--destructive] text-sm" :data-test="`${dataTest}-error`">
      {{ error }}
    </p>
    <p v-else-if="helperText" class="mt-1.5 text-[--muted-foreground] text-sm">
      {{ helperText }}
    </p>
  </div>
</template>
*/
