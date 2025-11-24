import React from 'react';
import { BFIcons } from './BF-Icons';

export interface BFSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  'data-test'?: string;
}

export const BFSearchInput: React.FC<BFSearchInputProps> = ({
  placeholder = 'Buscar...',
  value,
  onChange,
  onClear,
  className = '',
  'data-test': dataTest,
}) => {
  return (
    <div className={`relative ${className}`} data-test={dataTest}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <BFIcons.Search size={20} color="var(--muted-foreground)" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[--primary] transition-all"
        data-test={`${dataTest}-input`}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          data-test={`${dataTest}-clear`}
        >
          <BFIcons.X size={16} color="var(--muted-foreground)" />
        </button>
      )}
    </div>
  );
};