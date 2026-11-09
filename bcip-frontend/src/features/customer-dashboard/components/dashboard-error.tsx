"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface CustomerDashboardErrorProps {
    onRetry: () => void;
}

export function CustomerDashboardError({ onRetry }: CustomerDashboardErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-white p-12 text-center shadow-xs">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
                Unable to load your complaints
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-600">
                Please check your network connection and try again. Our servers and security gateways are operational.
            </p>
            <div className="mt-6 flex items-center gap-3">
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
                >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Retry
                </button>
            </div>
        </div>
    );
}
