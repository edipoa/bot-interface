/**
 * BF-DateInput Component
 * 
 * Input customizado para data no formato dd/mm
 * - Máscara automática
 * - Validação de formato
 * - Estados de erro e desabilitado
 */

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface BFDateInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  placeholder?: string;
  'data-test'?: string;
}

export const BFDateInput: React.FC<BFDateInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = 'Data',
  helperText = 'Formato dd/mm, ex.: 13/11',
  placeholder = '13/11',
  'data-test': dataTest = 'bf-date-input',
}) => {
  const [focused, setFocused] = useState(false);

  // Formata a data dd/mm
  const formatDate = (input: string): string => {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '');
    
    // Limita a 4 dígitos (ddmm)
    const limited = numbers.slice(0, 4);
    
    // Aplica formatação
    if (limited.length <= 2) {
      return limited;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    onChange(formatted);
  };

  // Valida formato dd/mm
  const isValidFormat = (): boolean => {
    const regex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])$/;
    return regex.test(value);
  };

  return (
    <div className="w-full" data-test={dataTest}>
      {/* Label */}
      {label && (
        <label
          htmlFor="date-input"
          className="block mb-2 text-sm text-foreground"
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div
        className={`
          relative flex items-center gap-3 px-4 h-12
          bg-white border-2 rounded-xl transition-all
          ${focused && !error ? 'border-[var(--bf-blue-primary)] shadow-lg shadow-blue-500/10' : ''}
          ${error ? 'border-destructive' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
        `}
      >
        {/* Ícone */}
        <Calendar
          className={`
            w-5 h-5 transition-colors
            ${focused && !error ? 'text-[var(--bf-blue-primary)]' : 'text-muted-foreground'}
            ${error ? 'text-destructive' : ''}
          `}
        />

        {/* Input */}
        <input
          id="date-input"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={5}
          className={`
            flex-1 bg-transparent outline-none
            text-foreground placeholder:text-muted-foreground
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          data-test={`${dataTest}-field`}
          aria-invalid={!!error}
          aria-describedby={error ? 'date-error' : undefined}
        />
      </div>

      {/* Mensagem de erro */}
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

      {/* Helper text */}
      {!error && helperText && (
        <p className="mt-2 text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};
