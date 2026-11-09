"use client";

import React, { ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";

export interface SuccessMessageProps {
    message?: string | ReactNode;
    onDismiss?: () => void;
    className?: string;
}

export function SuccessMessage({ message, onDismiss, className = "" }: SuccessMessageProps) {
    if (!message) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900 transition-all ${className}`}
        >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{message}</div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="text-emerald-500 hover:text-emerald-800 p-0.5 rounded cursor-pointer"
                    aria-label="Dismiss message"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
