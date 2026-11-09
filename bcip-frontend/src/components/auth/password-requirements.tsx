"use client";

import React from "react";
import { Check } from "lucide-react";

interface PasswordRequirementsProps {
    password: string;
    className?: string;
}

export function evaluatePassword(pwd: string) {
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);

    return {
        hasLength,
        hasUpper,
        hasLower,
        hasNumber,
        isValid: hasLength && hasUpper && hasLower && hasNumber,
    };
}

export function PasswordRequirements({ password, className = "" }: PasswordRequirementsProps) {
    const { hasLength, hasUpper, hasLower, hasNumber } = evaluatePassword(password);

    const requirements = [
        { label: "8+ characters", met: hasLength },
        { label: "Uppercase letter", met: hasUpper },
        { label: "Lowercase letter", met: hasLower },
        { label: "Number", met: hasNumber },
    ];

    return (
        <div className={`space-y-1.5 pt-1 text-xs select-none ${className}`}>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Password requirements
            </span>
            <div className="grid grid-cols-2 gap-1.5">
                {requirements.map((req) => (
                    <div
                        key={req.label}
                        className={`flex items-center gap-1.5 transition-colors ${
                            req.met ? "text-emerald-700 font-medium" : "text-slate-400"
                        }`}
                    >
                        {req.met ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                        ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0">
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                            </span>
                        )}
                        <span className="text-xs">{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
