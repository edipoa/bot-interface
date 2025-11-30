import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface BFDateInputProps {
  value: string; // Formato yyyy-mm-dd (ISO)
  onChange: (value: string) => void; // Retorna yyyy-mm-dd
  error?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  placeholder?: string;
  fullWidth?: boolean;
  required?: boolean;
  'data-test'?: string;
}

export const BFDateInput: React.FC<BFDateInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = 'Data',
  helperText = 'Formato dd/mm/yyyy, ex.: 13/11/2024',
  placeholder = '13/11/2024',
  fullWidth = false,
  required = false,
  'data-test': dataTest = 'bf-date-input',
}) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState('');

  React.useEffect(() => {
    if (value) {
      setInternalValue(formatDisplayValue(value));
    } else {
      setInternalValue('');
    }
  }, [value]);

  const formatDisplayValue = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
  };

  const formatISOValue = (displayDate: string): string => {
    const numbers = displayDate.replace(/\D/g, '');
    if (numbers.length !== 8) return '';

    const day = numbers.slice(0, 2);
    const month = numbers.slice(2, 4);
    const year = numbers.slice(4, 8);

    return `${year}-${month}-${day}`;
  };

  const formatDate = (input: string): string => {
    const numbers = input.replace(/\D/g, '');
    const limited = numbers.slice(0, 8);

    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setInternalValue(formatted);

    if (formatted.length === 10) {
      const isoDate = formatISOValue(formatted);
      if (isoDate) {
        onChange(isoDate);
      }
    } else {
      if (value) {
        onChange('');
      }
    }
  };

  return (
    <div className={fullWidth ? 'w-full' : ''} data-test={dataTest}>
      {label && (
        <label
          htmlFor="date-input"
          className="block mb-2 text-sm text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          relative flex items-center gap-3 px-4 h-12
          bg-white dark:bg-gray-800 border-2 rounded-xl transition-all
          ${focused && !error ? 'border-[var(--bf-blue-primary)] shadow-lg shadow-blue-500/10' : ''}
          ${error ? 'border-destructive' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
        `}
      >
        <Calendar
          className={`
            w-5 h-5 transition-colors
            ${focused && !error ? 'text-[var(--bf-blue-primary)]' : 'text-muted-foreground'}
            ${error ? 'text-destructive' : ''}
          `}
        />

        <input
          id="date-input"
          type="text"
          value={internalValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={10}
          className={`
            flex-1 bg-transparent outline-none
            text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          data-test={`${dataTest}-field`}
          aria-invalid={!!error}
          aria-describedby={error ? 'date-error' : undefined}
        />
      </div>

      {error && (
        <p
          id="date-error"
          className="mt-2 text-sm text-destructive flex items-center gap-1"
          data-test={`${dataTest}-error`}
          role="alert"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="mt-2 text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};
