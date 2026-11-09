"use client";

import React, { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: ReactNode;
    description?: ReactNode;
    containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ id, label, description, disabled, containerClassName = "", className = "", ...props }, ref) => {
        const checkboxId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        return (
            <div className={`flex items-start gap-2.5 select-none ${containerClassName}`}>
                <input
                    ref={ref}
                    id={checkboxId}
                    type="checkbox"
                    disabled={disabled}
                    className={`mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-colors ${className}`}
                    {...props}
                />
                <div className="flex flex-col">
                    <label
                        htmlFor={checkboxId}
                        className={`text-xs font-medium cursor-pointer ${
                            disabled ? "text-slate-400 cursor-not-allowed" : "text-slate-700 hover:text-slate-900"
                        }`}
                    >
                        {label}
                    </label>
                    {description && <span className="text-[11px] text-slate-500">{description}</span>}
                </div>
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";
