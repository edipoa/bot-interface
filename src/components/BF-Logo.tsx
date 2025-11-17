import React from 'react';

export interface BFLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

export const BFLogo: React.FC<BFLogoProps> = ({ size = 'md', variant = 'full', className = '' }) => {
  const sizes = {
    sm: { height: 32, iconSize: 24 },
    md: { height: 40, iconSize: 32 },
    lg: { height: 56, iconSize: 44 },
  };

  const { height, iconSize } = sizes[size];

  if (variant === 'icon') {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="48" height="48" rx="12" fill="url(#gradient-logo)" />
        <path
          d="M24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12ZM24 14C29.5228 14 34 18.4772 34 24C34 29.5228 29.5228 34 24 34C18.4772 34 14 29.5228 14 24C14 18.4772 18.4772 14 24 14Z"
          fill="white"
        />
        <circle cx="24" cy="20" r="2.5" fill="white" />
        <path
          d="M18 26L21 23L24 26L27 23L30 26"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="gradient-logo" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00D66F" />
            <stop offset="1" stopColor="#00A854" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ height }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="url(#gradient-logo-full)" />
        <path
          d="M24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12ZM24 14C29.5228 14 34 18.4772 34 24C34 29.5228 29.5228 34 24 34C18.4772 34 14 29.5228 14 24C14 18.4772 18.4772 14 24 14Z"
          fill="white"
        />
        <circle cx="24" cy="20" r="2.5" fill="white" />
        <path
          d="M18 26L21 23L24 26L27 23L30 26"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="gradient-logo-full" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00D66F" />
            <stop offset="1" stopColor="#00A854" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col" style={{ color: 'inherit' }}>
        <span className="font-bold leading-tight" style={{ fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.25rem' : '1.5rem', color: 'inherit' }}>
          Bot Fut
        </span>
        <span className="leading-tight" style={{ fontSize: size === 'sm' ? '0.625rem' : size === 'md' ? '0.75rem' : '0.875rem', opacity: 0.8, color: 'inherit' }}>
          Gestão Inteligente
        </span>
      </div>
    </div>
  );
};

/*
Vue 3 Implementation:

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'full'
})

const sizes = {
  sm: { height: 32, iconSize: 24, titleSize: '1rem', subtitleSize: '0.625rem' },
  md: { height: 40, iconSize: 32, titleSize: '1.25rem', subtitleSize: '0.75rem' },
  lg: { height: 56, iconSize: 44, titleSize: '1.5rem', subtitleSize: '0.875rem' },
}
</script>

<template>
  <svg v-if="variant === 'icon'" :width="sizes[size].iconSize" :height="sizes[size].iconSize" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="url(#gradient-logo)" />
    <path d="M24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12ZM24 14C29.5228 14 34 18.4772 34 24C34 29.5228 29.5228 34 24 34C18.4772 34 14 29.5228 14 24C14 18.4772 18.4772 14 24 14Z" fill="white" />
    <circle cx="24" cy="20" r="2.5" fill="white" />
    <path d="M18 26L21 23L24 26L27 23L30 26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <defs>
      <linearGradient id="gradient-logo" x1="0" y1="0" x2="48" y2="48">
        <stop stop-color="#00D66F" />
        <stop offset="1" stop-color="#00A854" />
      </linearGradient>
    </defs>
  </svg>
  
  <div v-else class="flex items-center gap-3" :style="{ height: sizes[size].height + 'px' }">
    <svg :width="sizes[size].iconSize" :height="sizes[size].iconSize" viewBox="0 0 48 48" fill="none">
      <!-- Same SVG content -->
    </svg>
    <div class="flex flex-col">
      <span class="font-bold text-[--foreground] leading-tight" :style="{ fontSize: sizes[size].titleSize }">
        Bot Fut
      </span>
      <span class="text-[--muted-foreground] leading-tight" :style="{ fontSize: sizes[size].subtitleSize }">
        Gestão Inteligente
      </span>
    </div>
  </div>
</template>
*/
