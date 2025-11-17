/**
 * BF-MoneyInput Component
 * 
 * Input customizado para valores monetários
 * - Suporta múltiplos formatos (10,00 | 10.00 | R$10 | 1000c)
 * - Conversão automática para centavos
 * - Display do valor convertido
 */

import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

interface BFMoneyInputProps {
  value: string;
  onChange: (value: string, cents: number) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  placeholder?: string;
  showCentsPreview?: boolean;
  'data-test'?: string;
}

export const BFMoneyInput: React.FC<BFMoneyInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = 'Valor',
  helperText = 'Aceita: 10,00 | 10.00 | R$10 | 1000c',
  placeholder = '10,00',
  showCentsPreview = true,
  'data-test': dataTest = 'bf-money-input',
}) => {
  const [focused, setFocused] = useState(false);

  // Converte preço para centavos
  const parsePriceToCents = (priceStr: string): number => {
    if (!priceStr) return 0;
    
    // Remove tudo exceto números, vírgula e ponto
    const cleaned = priceStr.replace(/[^\d,.]|R\$|c/gi, '').trim();
    
    // Se termina com 'c', já está em centavos
    if (priceStr.toLowerCase().endsWith('c')) {
      return parseInt(cleaned) || 0;
    }
    
    // Converte vírgula para ponto e multiplica por 100
    const normalized = cleaned.replace(',', '.');
    const float = parseFloat(normalized) || 0;
    return Math.round(float * 100);
  };

  // Formata centavos para exibição
  const formatCentsToMoney = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cents = parsePriceToCents(newValue);
    onChange(newValue, cents);
  };

  const cents = parsePriceToCents(value);

  return (
    <div className="w-full" data-test={dataTest}>
      {/* Label */}
      {label && (
        <label
          htmlFor="money-input"
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
        <DollarSign
          className={`
            w-5 h-5 transition-colors
            ${focused && !error ? 'text-[var(--bf-blue-primary)]' : 'text-muted-foreground'}
            ${error ? 'text-destructive' : ''}
          `}
        />

        {/* Input */}
        <input
          id="money-input"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            flex-1 bg-transparent outline-none
            text-foreground placeholder:text-muted-foreground
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          data-test={`${dataTest}-field`}
          aria-invalid={!!error}
          aria-describedby={error ? 'money-error' : undefined}
        />
      </div>

      {/* Preview de centavos */}
      {showCentsPreview && value && !error && (
        <p className="mt-2 text-xs text-muted-foreground">
          Convertido: {formatCentsToMoney(cents)} ({cents} centavos)
        </p>
      )}

      {/* Mensagem de erro */}
      {error && (
        <p
          id="money-error"
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
