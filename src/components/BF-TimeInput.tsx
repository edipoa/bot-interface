/**
 * BF-TimeInput Component
 * 
 * Input customizado para horário no formato HH:mm
 * - Máscara automática
 * - Validação de formato
 * - Estados de erro e desabilitado
 */

import React, { useState } from 'react';
import { Clock } from 'lucide-react';

interface BFTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  'data-test'?: string;
}

export const BFTimeInput: React.FC<BFTimeInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = 'Horário',
  helperText = 'Formato HH:mm, ex.: 20:30',
  'data-test': dataTest = 'bf-time-input',
}) => {
  const [focused, setFocused] = useState(false);

  // Formata o horário HH:mm
  const formatTime = (input: string): string => {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '');
    
    // Limita a 4 dígitos (HHmm)
    const limited = numbers.slice(0, 4);
    
    // Aplica formatação
    if (limited.length <= 2) {
      return limited;
    } else {
      return `${limited.slice(0, 2)}:${limited.slice(2)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTime(e.target.value);
    onChange(formatted);
  };

  // Valida formato HH:mm
  const isValid = (): boolean => {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(value);
  };

  return (
    <div className="w-full" data-test={dataTest}>
      {/* Label */}
      {label && (
        <label
          htmlFor="time-input"
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
        <Clock
          className={`
            w-5 h-5 transition-colors
            ${focused && !error ? 'text-[var(--bf-blue-primary)]' : 'text-muted-foreground'}
            ${error ? 'text-destructive' : ''}
          `}
        />

        {/* Input */}
        <input
          id="time-input"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="20:30"
          maxLength={5}
          className={`
            flex-1 bg-transparent outline-none
            text-foreground placeholder:text-muted-foreground
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          data-test={`${dataTest}-field`}
          aria-invalid={!!error}
          aria-describedby={error ? 'time-error' : undefined}
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p
          id="time-error"
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
