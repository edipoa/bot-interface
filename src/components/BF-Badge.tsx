import React from 'react';

export interface BFBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  style?: 'solid' | 'outlined';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  'data-test'?: string;
}

export const BFBadge: React.FC<BFBadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  style = 'solid',
  children,
  className = '',
  icon,
  'data-test': dataTest,
}) => {
  const solidVariantClasses = {
    success: 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)]',
    warning: 'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border-[var(--badge-warning-border)]',
    error: 'bg-[var(--badge-error-bg)] text-[var(--badge-error-text)] border-[var(--badge-error-border)]',
    info: 'bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] border-[var(--badge-info-border)]',
    neutral: 'bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border-[var(--badge-neutral-border)]',
    primary: 'bg-[var(--badge-primary-bg)] text-[var(--badge-primary-text)] border-[var(--badge-primary-border)]',
  };

  const outlinedVariantClasses = {
    success: 'bg-transparent text-[var(--badge-success-text)] border-[var(--badge-success-text)] border-2',
    warning: 'bg-transparent text-[var(--badge-warning-text)] border-[var(--badge-warning-text)] border-2',
    error: 'bg-transparent text-[var(--badge-error-text)] border-[var(--badge-error-text)] border-2',
    info: 'bg-transparent text-[var(--badge-info-text)] border-[var(--badge-info-text)] border-2',
    neutral: 'bg-transparent text-[var(--badge-neutral-text)] border-[var(--badge-neutral-text)] border-2',
    primary: 'bg-transparent text-[var(--badge-primary-text)] border-[var(--badge-primary-text)] border-2',
  };

  const variantClasses = style === 'outlined' ? outlinedVariantClasses : solidVariantClasses;

  const sizeClasses = {
    sm: 'px-2 py-0.5 gap-1 text-xs font-medium',
    md: 'px-2.5 py-1 gap-1.5 text-sm font-medium',
    lg: 'px-3 py-1.5 gap-2 text-base font-semibold',
  };

  const combinedClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    inline-flex items-center
    ${style === 'outlined' ? '' : 'border'}
    rounded-[var(--radius-full)]
    transition-all duration-200
    whitespace-nowrap
    ${className}
  `;

  const childrenArray = React.Children.toArray(children);
  const hasIconInChildren = !icon && childrenArray.some(
    child => React.isValidElement(child) && typeof child.type !== 'string'
  );

  if (hasIconInChildren) {
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