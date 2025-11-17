/**
 * BF-AlertMessage Component
 * 
 * Componente de alerta para mensagens de erro, sucesso, info e warning
 * - Variantes: error, success, info, warning
 * - Ícones contextuais
 * - Animação de entrada
 * - Botão de fechar opcional
 * - Acessibilidade completa
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface BFAlertMessageProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  'data-test'?: string;
}

const variantConfig = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
    messageColor: 'text-red-700',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-[var(--bf-green-primary)]',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-[var(--bf-blue-primary)]',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-warning',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
  },
};

export const BFAlertMessage: React.FC<BFAlertMessageProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  'data-test': dataTest = 'bf-alert-message',
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border-2
        ${config.bgColor} ${config.borderColor}
        animate-in slide-in-from-top-2 fade-in duration-300
      `}
      data-test={dataTest}
      data-variant={variant}
    >
      {/* Ícone */}
      <Icon
        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`}
        data-test={`${dataTest}-icon`}
      />

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4
            className={`mb-1 ${config.titleColor}`}
            data-test={`${dataTest}-title`}
          >
            {title}
          </h4>
        )}
        <p
          className={`text-sm ${config.messageColor}`}
          data-test={`${dataTest}-message`}
        >
          {message}
        </p>
      </div>

      {/* Botão de fechar */}
      {onClose && (
        <button
          onClick={onClose}
          className={`
            flex-shrink-0 p-1 rounded-lg
            ${config.iconColor} opacity-70 hover:opacity-100
            hover:bg-white/50 transition-all
          `}
          data-test={`${dataTest}-close`}
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
