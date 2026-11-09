"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";

export interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    fullWidth?: boolean;
}

export function SecondaryButton({
    children,
    disabled,
    fullWidth = true,
    className = "",
    type = "button",
    ...props
}: SecondaryButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}
