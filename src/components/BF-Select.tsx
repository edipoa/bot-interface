/**
 * BF-Select Component
 * 
 * Select customizado com estilo do design system
 * - Estados de erro e desabilitado
 * - Ícone customizável
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // Tenta converter para número se o valor original era número
    const parsedValue = isNaN(Number(newValue)) ? newValue : Number(newValue);
    onChange(parsedValue);
  };

  return (
    <div className="w-full" data-test={dataTest}>
      {/* Label */}
      {label && (
        <label
          htmlFor="select-input"
          className="block mb-2 text-sm text-foreground"
        >
          {label}
        </label>
      )}

      {/* Select Container */}
      <div
        className={`
          relative flex items-center px-4 h-12
          bg-white border-2 rounded-xl transition-all
          ${focused && !error ? 'border-[var(--bf-blue-primary)] shadow-lg shadow-blue-500/10' : ''}
          ${error ? 'border-destructive' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
        `}
      >
        {/* Select */}
        <select
          id="select-input"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`
            flex-1 bg-transparent outline-none appearance-none
            text-foreground pr-8
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          data-test={`${dataTest}-field`}
          aria-invalid={!!error}
          aria-describedby={error ? 'select-error' : undefined}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Ícone */}
        <ChevronDown
          className={`
            absolute right-4 w-5 h-5 pointer-events-none transition-colors
            ${focused && !error ? 'text-[var(--bf-blue-primary)]' : 'text-muted-foreground'}
            ${error ? 'text-destructive' : ''}
          `}
        />
      </div>

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
