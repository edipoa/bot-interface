import React from 'react';

export interface BFBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  'data-test'?: string;
}

export const BFBadge: React.FC<BFBadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  icon,
  'data-test': dataTest,
}) => {
  const variantClasses = {
    success: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
    warning: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
    error: 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20',
    info: 'bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20',
    neutral: 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]',
    primary: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 gap-1',
    md: 'px-2.5 py-1 gap-1.5',
    lg: 'px-3 py-1.5 gap-2',
  };

  const combinedClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    inline-flex items-center
    border
    rounded-[var(--radius-full)]
    ${className}
  `;

  // Suporte retrocompatível: separa ícones dos children se não houver prop icon
  const childrenArray = React.Children.toArray(children);
  const hasIconInChildren = !icon && childrenArray.some(
    child => React.isValidElement(child) && typeof child.type !== 'string'
  );

  if (hasIconInChildren) {
    // Separa elementos React (ícones) de texto
    const iconElements: React.ReactNode[] = [];
    const textElements: React.ReactNode[] = [];
    
    childrenArray.forEach(child => {
      if (React.isValidElement(child) && typeof child.type !== 'string') {
        iconElements.push(child);
      } else if (typeof child === 'string' && child.trim()) {
        textElements.push(child);
      }
    });

    return (
      <span className={combinedClasses} data-test={dataTest}>
        {iconElements.length > 0 && (
          <span className="flex-shrink-0">{iconElements}</span>
        )}
        {textElements.length > 0 && (
          <span className="truncate whitespace-nowrap">{textElements}</span>
        )}
      </span>
    );
  }

  return (
    <span className={combinedClasses} data-test={dataTest}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate whitespace-nowrap">{children}</span>
    </span>
  );
};

/*
Vue 3 Implementation Example:

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  dataTest?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md'
})

const badgeClasses = computed(() => {
  const variantClasses = {
    success: 'bg-[--success]/10 text-[--success] border-[--success]/20',
    warning: 'bg-[--warning]/10 text-[--warning] border-[--warning]/20',
    error: 'bg-[--destructive]/10 text-[--destructive] border-[--destructive]/20',
    info: 'bg-[--info]/10 text-[--info] border-[--info]/20',
    neutral: 'bg-[--muted] text-[--muted-foreground] border-[--border]',
    primary: 'bg-[--primary]/10 text-[--primary] border-[--primary]/20',
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 gap-1 text-xs',
    md: 'px-2.5 py-1 gap-1.5 text-sm',
    lg: 'px-3 py-1.5 gap-2 text-base',
  }
  
  return [
    variantClasses[props.variant],
    sizeClasses[props.size],
    'inline-flex items-center',
    'border',
    'rounded-[--radius-full]'
  ].join(' ')
})
</script>

<template>
  <span :class="badgeClasses" :data-test="dataTest">
    <span v-if="$slots.icon" class="flex-shrink-0">
      <slot name="icon" />
    </span>
    <span>
      <slot />
    </span>
  </span>
</template>
*/
