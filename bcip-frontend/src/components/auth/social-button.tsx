"use client";

import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface SocialButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    provider?: "google" | "microsoft";
    loading?: boolean;
}

export function SocialButton({
    provider = "google",
    loading = false,
    disabled,
    onClick,
    className = "",
    type = "button",
    ...props
}: SocialButtonProps) {
    const isDisabled = disabled || loading;

    if (provider === "microsoft") {
        return (
            <button
                type={type}
                disabled={isDisabled}
                onClick={onClick}
                aria-label={
                    loading
                        ? "Connecting to Microsoft"
                        : "Continue with Microsoft"
                }
                className={`
        group relative flex w-full items-center justify-center
        gap-3 overflow-hidden rounded-xl
        border border-slate-200
        bg-white px-4 py-3
        text-sm font-medium text-slate-700
        shadow-sm
        transition-all duration-200 ease-out

        hover:border-slate-300
        hover:bg-slate-50
        hover:shadow-md

        active:scale-[0.99]
        active:bg-slate-100

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500/30
        focus-visible:ring-offset-2

        disabled:pointer-events-none
        disabled:opacity-60

        ${className}
      `}
                {...props}
            >
                {/* Subtle hover highlight */}
                <span
                    aria-hidden="true"
                    className="
          absolute inset-0 -translate-x-full
          bg-gradient-to-r from-transparent
          via-slate-100/60 to-transparent
          transition-transform duration-700
          group-hover:translate-x-full
        "
                />

                {/* Content */}
                <span className="relative flex items-center justify-center gap-3">
                    {loading ? (
                        <Loader2
                            className="h-[18px] w-[18px] animate-spin text-slate-500"
                            aria-hidden="true"
                        />
                    ) : (
                        <span
                            className="
              flex h-[18px] w-[18px]
              items-center justify-center
              shrink-0
            "
                            aria-hidden="true"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-[18px] w-[18px]"
                                role="img"
                            >
                                <path
                                    fill="#F25022"
                                    d="M1 1h10.5v10.5H1z" />
                                <path
                                    fill="#7FBA00"
                                    d="M12.5 1H23v10.5H12.5z" />
                                <path
                                    fill="#00A4EF"
                                    d="M1 12.5h10.5V23H1z" />
                                <path
                                    fill="#FFB900"
                                    d="M12.5 12.5H23V23H12.5z" />
                            </svg>
                        </span>
                    )}

                    <span>
                        {loading ? "Connecting to Microsoft..." : "Continue with Microsoft"}
                    </span>
                </span>
            </button>
        );
    }

    return (
        <button
            type={type}
            disabled={isDisabled}
            onClick={onClick}
            aria-label={
                loading
                    ? "Connecting to Google"
                    : "Continue with Google"
            }
            className={`
        group relative flex w-full items-center justify-center
        gap-3 overflow-hidden rounded-xl
        border border-slate-200
        bg-white px-4 py-3
        text-sm font-medium text-slate-700
        shadow-sm
        transition-all duration-200 ease-out

        hover:border-slate-300
        hover:bg-slate-50
        hover:shadow-md

        active:scale-[0.99]
        active:bg-slate-100

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500/30
        focus-visible:ring-offset-2

        disabled:pointer-events-none
        disabled:opacity-60

        ${className}
      `}
            {...props}
        >
            {/* Subtle hover highlight */}
            <span
                aria-hidden="true"
                className="
          absolute inset-0 -translate-x-full
          bg-gradient-to-r from-transparent
          via-slate-100/60 to-transparent
          transition-transform duration-700
          group-hover:translate-x-full
        "
            />

            {/* Content */}
            <span className="relative flex items-center justify-center gap-3">
                {loading ? (
                    <Loader2
                        className="h-[18px] w-[18px] animate-spin text-slate-500"
                        aria-hidden="true"
                    />
                ) : (
                    <span
                        className="
              flex h-[18px] w-[18px]
              items-center justify-center
              shrink-0
            "
                        aria-hidden="true"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-[18px] w-[18px]"
                            role="img"
                        >
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                    </span>
                )}

                <span>
                    {loading ? "Connecting to Google..." : "Continue with Google"}
                </span>
            </span>
        </button>
    );
}