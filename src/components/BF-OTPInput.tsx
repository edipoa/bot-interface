/**
 * BF-OTPInput Component
 * 
 * Input customizado para código OTP de 6 dígitos
 * - 6 campos separados
 * - Navegação automática entre campos
 * - Cole código completo de uma vez
 * - Estados de erro e loading
 * - Acessibilidade completa
 */

import React, { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface BFOTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  'data-test'?: string;
}

export const BFOTPInput: React.FC<BFOTPInputProps> = ({
  value,
  onChange,
  length = 6,
  error,
  loading = false,
  disabled = false,
  autoFocus = false,
  'data-test': dataTest = 'bf-otp-input',
}) => {
  const [focused, setFocused] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Garante que o valor tenha o tamanho correto
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  useEffect(() => {
    // Auto-focus no primeiro campo vazio
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    // Aceita apenas números
    if (digit && !/^\d$/.test(digit)) return;

    const newDigits = [...digits];
    newDigits[index] = digit || ' ';
    const newValue = newDigits.join('').trim();
    onChange(newValue);

    // Move para o próximo campo se digitou um número
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: apaga e volta para o campo anterior
    if (e.key === 'Backspace' && !digits[index].trim() && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Setas de navegação
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (numbers) {
      onChange(numbers);
      // Foca no último campo preenchido ou no próximo vazio
      const focusIndex = Math.min(numbers.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="w-full" data-test={dataTest}>
      {/* Label */}
      <label className="block mb-3 text-sm text-foreground">
        Código de verificação
      </label>

      {/* OTP Inputs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit.trim()}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            disabled={disabled || loading}
            className={`
              w-12 h-14 sm:w-14 sm:h-16
              text-center text-2xl
              bg-white border-2 rounded-xl
              transition-all duration-200
              outline-none
              ${focused === index && !error
                ? 'border-[var(--bf-blue-primary)] shadow-lg shadow-blue-500/10 scale-105'
                : ''
              }
              ${error ? 'border-destructive' : 'border-border'}
              ${digit.trim() ? 'border-[var(--bf-green-primary)]' : ''}
              ${disabled || loading
                ? 'opacity-50 cursor-not-allowed bg-muted'
                : 'hover:border-[var(--bf-blue-primary)]/50'
              }
            `}
            data-test={`${dataTest}-digit-${index}`}
            aria-label={`Dígito ${index + 1} de ${length}`}
            aria-invalid={!!error}
          />
        ))}

        {/* Loading indicator */}
        {loading && (
          <Loader2
            className="w-5 h-5 ml-2 text-[var(--bf-blue-primary)] animate-spin"
            data-test={`${dataTest}-loading`}
          />
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          className="mt-3 text-sm text-destructive text-center flex items-center justify-center gap-1"
          data-test={`${dataTest}-error`}
          role="alert"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && !loading && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Digite o código de 6 dígitos enviado para seu telefone
        </p>
      )}
    </div>
  );
};
