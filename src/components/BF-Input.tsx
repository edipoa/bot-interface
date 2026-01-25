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

export const BFInput = React.forwardRef<HTMLInputElement, BFInputProps>(({
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
}, ref) => {
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
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-[var(--primary)]'}
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    border
    rounded-[var(--radius-md)]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-gray-400 dark:placeholder:text-gray-500
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
        <input ref={ref} className={inputClasses} onChange={handleChange} {...props} />
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
});

BFInput.displayName = 'BFInput';

export interface BFTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  'data-test'?: string;
}

export const BFTextarea = React.forwardRef<HTMLTextAreaElement, BFTextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  'data-test': dataTest,
  ...props
}, ref) => {
  const textareaClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-[var(--primary)]'}
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    border
    rounded-[var(--radius-md)]
    px-4 py-3
    min-h-[100px]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-gray-400 dark:placeholder:text-gray-500
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
      <textarea ref={ref} className={textareaClasses} {...props} />
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
});

BFTextarea.displayName = 'BFTextarea';