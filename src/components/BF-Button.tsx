import React from 'react';
import { Button as ShadButton } from './ui/button';

export interface BFButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'loading'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  loading?: boolean; // Alias for isLoading
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  'data-test'?: string;
}

export const BFButton = React.forwardRef<HTMLButtonElement, BFButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loading, // Alias for isLoading
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  'data-test': dataTest,
  ...restProps
}, ref) => {
  // Support both isLoading and loading props
  const isButtonLoading = loading ?? isLoading;
  const variantClasses = {
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--bf-green-dark)]',
    secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--bf-blue-dark)]',
    outline: 'border-2 border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-white',
    ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)]',
    danger: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
    success: 'bg-[var(--success)] text-[var(--success-foreground)] hover:opacity-90',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 gap-1.5',
    md: 'h-10 px-4 gap-2',
    lg: 'h-12 px-6 gap-2.5',
  };

  const combinedClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    rounded-[var(--radius-md)]
    inline-flex items-center justify-center
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <button
      ref={ref}
      className={combinedClasses}
      disabled={disabled || isButtonLoading}
      data-test={dataTest}
      {...restProps}
    >
      {isButtonLoading && (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isButtonLoading && icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {!isButtonLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
});

BFButton.displayName = 'BFButton';

/*
Vue 3 Implementation Example:

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  isLoading?: boolean
  iconPosition?: 'left' | 'right'
  dataTest?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  isLoading: false,
  iconPosition: 'left',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const variantClasses = {
    primary: 'bg-[--primary] text-[--primary-foreground] hover:bg-[--bf-green-dark]',
    secondary: 'bg-[--secondary] text-[--secondary-foreground] hover:bg-[--bf-blue-dark]',
    outline: 'border-2 border-[--primary] text-[--primary] bg-transparent hover:bg-[--primary] hover:text-white',
    ghost: 'bg-transparent text-[--foreground] hover:bg-[--accent]',
    danger: 'bg-[--destructive] text-[--destructive-foreground] hover:opacity-90',
    success: 'bg-[--success] text-[--success-foreground] hover:opacity-90',
  }
  
  const sizeClasses = {
    sm: 'h-8 px-3 gap-1.5',
    md: 'h-10 px-4 gap-2',
    lg: 'h-12 px-6 gap-2.5',
  }
  
  return [
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.fullWidth ? 'w-full' : '',
    'rounded-[--radius-md]',
    'inline-flex items-center justify-center',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' ')
})
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || isLoading"
    :data-test="dataTest"
    @click="emit('click', $event)"
  >
    <svg v-if="isLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
    <slot v-if="!isLoading && iconPosition === 'left'" name="icon-left" />
    <slot />
    <slot v-if="!isLoading && iconPosition === 'right'" name="icon-right" />
  </button>
</template>
*/
