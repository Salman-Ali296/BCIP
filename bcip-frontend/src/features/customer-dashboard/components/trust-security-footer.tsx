"use client";

import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export function TrustSecurityFooter() {
    return (
        <footer className="mt-12 rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        <span>Your complaint information is securely handled.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                        <span>Only authorised teams can access your complaint.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        <span>Personal contact details are restricted to designated handlers.</span>
                    </div>
                </div>

                <div className="text-[11px] text-slate-400">
                    BCIP Customer Trust Framework • 256-bit TLS Session
                </div>
            </div>
        </footer>
    );
}
