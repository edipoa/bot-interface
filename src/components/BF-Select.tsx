import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface BFSelectOption {
  value: string | number;
  label: string;
}

interface BFSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: BFSelectOption[];
  error?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  placeholder?: string;
  'data-test'?: string;
}

export const BFSelect: React.FC<BFSelectProps> = ({
  value,
  onChange,
  options,
  error,
  disabled = false,
  label,
  helperText,
  placeholder = 'Selecione...',
  'data-test': dataTest = 'bf-select',
}) => {
  const stringValue = String(value);

  const handleValueChange = (newValue: string) => {
    const option = options.find(opt => String(opt.value) === newValue);
    if (option) {
      onChange(option.value);
    }
  };

  return (
    <div className="w-full" data-test={dataTest}>
      {/* Label */}
      {label && (
        <label
          htmlFor="select-trigger"
          className="block mb-2 text-sm text-foreground"
        >
          {label}
        </label>
      )}

      {/* Select usando shadcn/ui */}
      <Select
        value={stringValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id="select-trigger"
          className={`
            h-12 px-4 rounded-xl border-2 transition-all duration-200
            font-normal text-left
            ${error 
              ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20 focus-visible:shadow-lg focus-visible:shadow-red-500/10' 
              : 'border-gray-300 dark:border-gray-700 focus-visible:border-[var(--bf-blue-primary)] focus-visible:ring-[var(--bf-blue-primary)]/10 focus-visible:shadow-lg focus-visible:shadow-blue-500/10'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
              : 'bg-white dark:bg-gray-800 hover:border-[var(--bf-blue-primary)]/50'
            }
            text-gray-900 dark:text-gray-100
          `}
          data-test={`${dataTest}-trigger`}
          aria-invalid={!!error}
          aria-describedby={error ? 'select-error' : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent
          className={`
            bg-white dark:bg-gray-900
            border-2 border-gray-300 dark:border-gray-700
            rounded-xl shadow-xl
            max-h-[300px] overflow-y-auto
            z-50 p-1
          `}
          data-test={`${dataTest}-content`}
        >
          {options.map((option) => (
            <SelectItem
              key={String(option.value)}
              value={String(option.value)}
              className={`
                px-4 py-3 cursor-pointer 
                transition-all duration-150
                text-gray-900 dark:text-gray-100
                hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800
                data-[state=checked]:bg-[var(--bf-blue-primary)] 
                data-[state=checked]:text-white
                data-[state=checked]:font-medium
                data-[state=checked]:shadow-sm
                rounded-lg mx-1 my-0.5
                outline-none
              `}
              data-test={`${dataTest}-option-${option.value}`}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Mensagem de erro */}
      {error && (
        <p
          id="select-error"
          className="mt-2 text-sm text-destructive flex items-center gap-1"
          data-test={`${dataTest}-error`}
          role="alert"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <p className="mt-2 text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};
