"use client";

import React, { ReactNode } from "react";
import { AlertCircle, AlertTriangle, X } from "lucide-react";

export interface FormErrorProps {
    message?: string | ReactNode;
    type?: "error" | "warning";
    onDismiss?: () => void;
    className?: string;
}

export function FormError({
    message,
    type = "error",
    onDismiss,
    className = "",
}: FormErrorProps) {
    if (!message) return null;

    const isWarning = type === "warning";

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed transition-all ${
                isWarning
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-red-200 bg-red-50 text-red-900"
            } ${className}`}
        >
            {isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{message}</div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                    aria-label="Dismiss error"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
