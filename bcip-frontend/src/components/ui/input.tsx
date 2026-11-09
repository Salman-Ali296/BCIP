import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, suffix, icon, className, ...props }: InputProps) {
  const [touched, setTouched] = useState(false);
  const hasError = touched && error;
  const isValid = touched && !error && props.value;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          className={cn(
            'w-full rounded-lg border-2 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2',
            icon && 'pl-10',
            suffix && 'pr-24',
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : isValid
              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200',
            className
          )}
          onBlur={() => setTouched(true)}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {suffix}
          </span>
        )}
        {isValid && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
            ✓
          </span>
        )}
      </div>
      {hasError && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}