/**
 * BF-Textarea Component
 * 
 * Textarea customizada com estilo do design system
 * - Estados de erro e desabilitado
 * - Contador de caracteres opcional
 * - Auto-resize opcional
 */

import React, { useState } from 'react';

interface BFTextareaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  'data-test'?: string;
}

export const BFTextarea: React.FC<BFTextareaProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label,
  helperText,
  placeholder,
  rows = 3,
  maxLength,
  showCharCount = false,
  'data-test': dataTest = 'bf-textarea',
}) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full" data-test={dataTest}>
      {/* Label */}
      {label && (
        <label
          htmlFor="textarea-input"
          className="block mb-2 text-sm text-foreground"
        >
          {label}
        </label>
      )}

      {/* Textarea Container */}
      <div
        className={`
          relative px-4 py-3
          bg-white dark:bg-gray-800 border-2 rounded-xl transition-all
          ${focused && !error ? 'border-[var(--bf-blue-primary)] shadow-lg shadow-blue-500/10' : ''}
          ${error ? 'border-destructive' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}
        `}
      >
        {/* Textarea */}
        <textarea
          id="textarea-input"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full bg-transparent outline-none resize-none
            text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          data-test={`${dataTest}-field`}
          aria-invalid={!!error}
          aria-describedby={error ? 'textarea-error' : undefined}
        />

        {/* Character count */}
        {showCharCount && maxLength && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-muted-foreground">
              {value.length} / {maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p
          id="textarea-error"
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
