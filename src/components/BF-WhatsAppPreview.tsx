/**
 * BF-WhatsAppPreview Component
 * 
 * Preview visual de mensagens do WhatsApp
 * - Simula o visual de uma mensagem do bot
 * - Suporta múltiplas linhas
 * - Ícones e formatação
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';

interface BFWhatsAppPreviewProps {
  title: string;
  content: string;
  variant?: 'success' | 'info' | 'default';
  icon?: React.ReactNode;
  'data-test'?: string;
}

const variantConfig = {
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-[var(--bf-green-primary)]',
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-[var(--bf-blue-primary)]',
  },
  default: {
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-500',
  },
};

export const BFWhatsAppPreview: React.FC<BFWhatsAppPreviewProps> = ({
  title,
  content,
  variant = 'default',
  icon,
  'data-test': dataTest = 'bf-whatsapp-preview',
}) => {
  const config = variantConfig[variant];

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2
        ${config.bgColor} ${config.borderColor}
        shadow-sm
      `}
      data-test={dataTest}
    >
      {/* Header com ícone */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`${config.iconColor} flex-shrink-0`}>
          {icon || <MessageSquare className="w-5 h-5" />}
        </div>
        <h4 className="text-foreground">{title}</h4>
      </div>

      {/* Conteúdo da mensagem */}
      <div
        className="pl-8 text-sm text-foreground whitespace-pre-line font-mono"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {content}
      </div>

      {/* Badge "WhatsApp Bot" */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
        <MessageSquare className="w-4 h-4 text-green-500" />
        <span className="text-xs text-muted-foreground">
          Mensagem do Bot
        </span>
      </div>
    </div>
  );
};
