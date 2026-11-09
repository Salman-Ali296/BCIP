"use client";

import React, { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { Check, AlertCircle } from "lucide-react";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    helperText?: string;
    success?: boolean;
    leftIcon?: ReactNode;
    rightAction?: ReactNode;
    containerClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            id,
            label,
            error,
            helperText,
            success,
            leftIcon,
            rightAction,
            disabled,
            value,
            className = "",
            containerClassName = "",
            ...props
        },
        ref
    ) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
        const errorId = inputId ? `${inputId}-error` : undefined;
        const helperId = inputId ? `${inputId}-helper` : undefined;

        const isFilled = value !== undefined && value !== "" && value !== null;

        return (
            <div className={`space-y-1.5 text-left ${containerClassName}`}>
                <div className="flex items-center justify-between">
                    <label
                        htmlFor={inputId}
                        className={`block text-xs font-semibold tracking-wide ${
                            error
                                ? "text-red-700"
                                : disabled
                                ? "text-slate-400"
                                : "text-slate-800"
                        }`}
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {rightAction && <div className="text-xs">{rightAction}</div>}
                </div>

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        value={value}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? errorId : helperText ? helperId : undefined}
                        className={`w-full rounded-lg border text-sm transition-colors duration-150 py-2.5 px-3.5 
                            ${leftIcon ? "pl-9" : "pl-3.5"}
                            ${success || error ? "pr-10" : "pr-3.5"}
                            ${
                                error
                                    ? "border-red-300 bg-red-50/20 text-red-950 placeholder-red-300 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                    : success
                                    ? "border-emerald-300 bg-white text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    : disabled
                                    ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : isFilled
                                    ? "border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 hover:border-slate-300 hover:bg-white focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            }
                            ${className}
                        `}
                        {...props}
                    />

                    {error && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    )}

                    {success && !error && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                            <Check className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {error && (
                    <p id={errorId} role="alert" className="text-xs text-red-600 font-medium">
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p id={helperId} className="text-xs text-slate-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

TextInput.displayName = "TextInput";
