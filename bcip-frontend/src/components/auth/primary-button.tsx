"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    children: ReactNode;
    fullWidth?: boolean;
    variant?: "primary" | "danger";
}

export function PrimaryButton({
    loading = false,
    loadingText,
    children,
    disabled,
    fullWidth = true,
    variant = "primary",
    className = "",
    type = "submit",
    ...props
}: PrimaryButtonProps) {
    const isDisabled = disabled || loading;

    const variantStyles =
        variant === "danger"
            ? "bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-red-500/20"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500/20";

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer
                ${variantStyles}
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>{loading ? loadingText || children : children}</span>
        </button>
    );
}
