import React from 'react';

export interface BFButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'loading'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  'data-test'?: string;
}

export const BFButton = React.forwardRef<HTMLButtonElement, BFButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loading,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  'data-test': dataTest,
  ...restProps
}, ref) => {
  const isButtonLoading = loading ?? isLoading;

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-[#00D66F] hover:bg-[#00A854] text-white shadow-sm';
      case 'secondary':
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
      case 'outline':
        return 'border-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-600';
      case 'ghost':
        return 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-sm';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white shadow-sm';
      default:
        return '';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'h-8 px-3 gap-1.5';
      case 'md': return 'h-10 px-4 gap-2';
      case 'lg': return 'h-12 px-6 gap-2.5';
      default: return 'h-10 px-4 gap-2';
    }
  };

  const combinedClasses = `
    ${getVariantClasses(variant)}
    ${getSizeClasses(size)}
    ${fullWidth ? 'w-full' : ''}
    rounded-lg
    inline-flex items-center justify-center
    transition-all duration-200
    cursor-pointer
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