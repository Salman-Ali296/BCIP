"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

interface AuthCardProps {
    heading: string;
    supportingText?: string;
    badge?: string;
    children: ReactNode;
    footer?: ReactNode;
    showLogoOnMobile?: boolean;
    className?: string;
}

export function AuthCard({
    heading,
    supportingText,
    badge,
    children,
    footer,
    showLogoOnMobile = true,
    className = "",
}: AuthCardProps) {
    return (
        <div
            className={`w-full max-w-[440px] mx-auto bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 ${className}`}
        >
            {/* Mobile Header / Logo fallback */}
            {showLogoOnMobile && (
                <div className="lg:hidden flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                            B
                        </div>
                        <span className="font-bold text-slate-900 tracking-tight text-sm">
                            BCIP
                        </span>
                    </Link>
                    <span className="text-[11px] font-medium text-slate-500">
                        Enterprise Portal
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="mb-6 space-y-1.5">
                {badge && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 mb-1 border border-slate-200">
                        {badge}
                    </div>
                )}
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {heading}
                </h1>
                {supportingText && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {supportingText}
                    </p>
                )}
            </div>

            {/* Form & Main Content */}
            <div>{children}</div>

            {/* Optional Footer */}
            {footer && <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">{footer}</div>}
        </div>
    );
}
