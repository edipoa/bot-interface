/**
 * BF-PhoneInput Component
 * 
 * Input customizado para número de telefone brasileiro
 * - Formatação automática: (XX) XXXXX-XXXX
 * - Validação de formato
 * - Estados de erro e desabilitado
 * - Acessibilidade completa
 */

import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface BFPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  'data-test'?: string;
}

export const BFPhoneInput: React.FC<BFPhoneInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = '(00) 00000-0000',
  autoFocus = false,
  'data-test': dataTest = 'bf-phone-input',
}) => {
  const [focused, setFocused] = useState(false);

  // Formata o número de telefone brasileiro
  const formatPhoneNumber = (input: string): string => {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + número)
    const limited = numbers.slice(0, 11);
    
    // Aplica formatação
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  // Retorna apenas os números (sem formatação)
  const getRawValue = (): string => {
    return value.replace(/\D/g, '');
  };

  // Valida se tem 10 ou 11 dígitos
  const isValid = (): boolean => {
    const raw = getRawValue();
    return raw.length === 10 || raw.length === 11;
  };

  return (
    <div className="w-full" data-test={dataTest}>
      {/* Label */}
      <label
        htmlFor="phone-input"
        className="block mb-2 text-sm text-foreground"
      >
        Número de telefone
      </label>

      {/* Input Container */}
      <div
        className={`
          relative flex items-center gap-3 px-4 h-14 
          bg-white border-2 rounded-xl transition-all
          ${focused && !error ? 'border-[var(--bf-blue-primary)] shadow-lg shadow-blue-500/10' : ''}
          ${error ? 'border-destructive' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
        `}
      >
        {/* Ícone */}
        <Phone
          className={`
            w-5 h-5 transition-colors
            ${focused && !error ? 'text-[var(--bf-blue-primary)]' : 'text-muted-foreground'}
            ${error ? 'text-destructive' : ''}
          `}
        />

        {/* Input */}
        <input
          id="phone-input"
          type="tel"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`
            flex-1 bg-transparent outline-none
            text-foreground placeholder:text-muted-foreground
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          data-test={`${dataTest}-field`}
          aria-invalid={!!error}
          aria-describedby={error ? 'phone-error' : undefined}
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p
          id="phone-error"
          className="mt-2 text-sm text-destructive flex items-center gap-1"
          data-test={`${dataTest}-error`}
          role="alert"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && (
        <p className="mt-2 text-xs text-muted-foreground">
          Digite seu número com DDD
        </p>
      )}
    </div>
  );
};
