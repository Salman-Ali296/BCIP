"use client";

import React, { forwardRef, useState, InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
    error?: string;
    helperText?: string;
    success?: boolean;
    rightAction?: ReactNode;
    containerClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    (
        {
            id,
            label,
            error,
            helperText,
            success,
            rightAction,
            disabled,
            value,
            className = "",
            containerClassName = "",
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
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
                    <input
                        ref={ref}
                        id={inputId}
                        type={showPassword ? "text" : "password"}
                        disabled={disabled}
                        value={value}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? errorId : helperText ? helperId : undefined}
                        className={`w-full rounded-lg border text-sm transition-colors duration-150 py-2.5 px-3.5 pr-10
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

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:cursor-not-allowed transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
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

PasswordInput.displayName = "PasswordInput";
