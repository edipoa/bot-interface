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
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'default':
        return 'bg-white dark:bg-[#1A2B42] border border-gray-200 dark:border-[#293548]';
      case 'outlined':
        return 'bg-transparent border-2 border-gray-200 dark:border-[#293548]';
      case 'elevated':
        return 'bg-white dark:bg-[#1A2B42] shadow-lg';
      case 'stat':
        return 'bg-gradient-to-br from-[#00D66F] to-[#00A854] text-white border-0';
      default:
        return '';
    }
  };

  const getPaddingClasses = (padding: string) => {
    switch (padding) {
      case 'none': return 'p-0';
      case 'sm': return 'p-3';
      case 'md': return 'p-4';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  };

  const combinedClasses = `
    ${getVariantClasses(variant)}
    ${getPaddingClasses(padding)}
    rounded-xl
    ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div
      className={combinedClasses}
      data-test={dataTest}
      onClick={onClick}
    >
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
