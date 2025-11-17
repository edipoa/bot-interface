import React from 'react';

export interface BFCardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'stat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  'data-test'?: string;
  onClick?: () => void;
}

export const BFCard: React.FC<BFCardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  hover = false,
  'data-test': dataTest,
  onClick,
}) => {
  const variantClasses = {
    default: 'bg-[var(--card)] border border-[var(--border)]',
    outlined: 'bg-transparent border-2 border-[var(--border)]',
    elevated: 'bg-[var(--card)] shadow-lg',
    stat: 'bg-gradient-to-br from-[#00D66F] to-[#00A854] text-white border-0',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const combinedClasses = `
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    rounded-[var(--radius-lg)]
    ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div className={combinedClasses} data-test={dataTest} onClick={onClick}>
      {children}
    </div>
  );
};

export interface BFCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  'data-test'?: string;
}

export const BFCardHeader: React.FC<BFCardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
  'data-test': dataTest,
}) => {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`} data-test={dataTest}>
      <div>
        <h3 className="text-[--card-foreground]">{title}</h3>
        {subtitle && <p className="text-[--muted-foreground] mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export interface BFCardContentProps {
  children: React.ReactNode;
  className?: string;
  'data-test'?: string;
}

export const BFCardContent: React.FC<BFCardContentProps> = ({
  children,
  className = '',
  'data-test': dataTest,
}) => {
  return (
    <div className={className} data-test={dataTest}>
      {children}
    </div>
  );
};

export interface BFCardFooterProps {
  children: React.ReactNode;
  className?: string;
  'data-test'?: string;
}

export const BFCardFooter: React.FC<BFCardFooterProps> = ({
  children,
  className = '',
  'data-test': dataTest,
}) => {
  return (
    <div className={`flex items-center justify-between mt-4 pt-4 border-t border-[--border] ${className}`} data-test={dataTest}>
      {children}
    </div>
  );
};

/*
Vue 3 Implementation Example:

// BFCard.vue
<script setup lang="ts">
interface Props {
  variant?: 'default' | 'outlined' | 'elevated' | 'stat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  dataTest?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hover: false
})

const emit = defineEmits<{
  click: []
}>()

const cardClasses = computed(() => {
  const variantClasses = {
    default: 'bg-[--card] border border-[--border]',
    outlined: 'bg-transparent border-2 border-[--border]',
    elevated: 'bg-[--card] shadow-lg',
    stat: 'bg-gradient-to-br from-[--primary] to-[--bf-green-dark] text-white border-0',
  }
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  
  return [
    variantClasses[props.variant],
    paddingClasses[props.padding],
    'rounded-[--radius-lg]',
    props.hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
  ].join(' ')
})
</script>

<template>
  <div 
    :class="cardClasses" 
    :data-test="dataTest"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>

// BFCardHeader.vue
<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  dataTest?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-start justify-between mb-4" :data-test="dataTest">
    <div>
      <h3 class="text-[--card-foreground]">{{ title }}</h3>
      <p v-if="subtitle" class="text-[--muted-foreground] mt-1">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.action">
      <slot name="action" />
    </div>
  </div>
</template>
*/
