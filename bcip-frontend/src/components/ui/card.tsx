import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ title, subtitle, icon, selected, onClick, className, children }: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
        selected
          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 shadow-lg'
          : 'border-slate-200 bg-white hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h3 className={cn('font-semibold', selected ? 'text-indigo-700' : 'text-slate-800')}>
            {title}
          </h3>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </button>
  );
}