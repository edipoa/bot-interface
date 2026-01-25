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
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  'data-test'?: string;
}

export const BFMoneyInput: React.FC<BFMoneyInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label,
  helperText = 'Aceita: 10,00 | 10.00 | R$10 | 1000c',
  placeholder = '10,00',
  showCentsPreview = true,
  className = '',
  onKeyDown,
  'data-test': dataTest = 'bf-money-input',
}) => {
  const [focused, setFocused] = useState(false);

  const parsePriceToCents = (priceStr: string): number => {
    if (!priceStr) return 0;

    const cleaned = priceStr.replace(/[^\d,.]|R\$|c/gi, '').trim();

    if (priceStr.toLowerCase().endsWith('c')) {
      return parseInt(cleaned) || 0;
    }

    const normalized = cleaned.replace(',', '.');
    const float = parseFloat(normalized) || 0;
    return Math.round(float * 100);
  };

  const formatCentsToMoney = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    const numbers = newValue.replace(/\D/g, '');

    if (!numbers) {
      onChange('', 0);
      return;
    }

    const valueInCents = parseInt(numbers);
    const valueInReais = valueInCents / 100;

    const formatted = valueInReais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    console.log('BFMoneyInput - input:', numbers, 'formatted:', formatted, 'cents:', valueInCents);
    onChange(formatted, valueInCents);
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
          bg-white dark:bg-gray-800 border-2 rounded-xl transition-all
          ${focused && !error ? 'border-[var(--bf-blue-primary)] shadow-lg shadow-blue-500/10' : ''}
          ${error ? 'border-destructive' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
          ${className}
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
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            flex-1 bg-transparent outline-none
            text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
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
