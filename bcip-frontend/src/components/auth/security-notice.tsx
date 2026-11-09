"use client";

import React from "react";
import { LockKeyhole } from "lucide-react";

interface SecurityNoticeProps {
    className?: string;
}

export function SecurityNotice({
    className = "",
}: SecurityNoticeProps) {
    return (
        <div
            className={`flex items-center justify-center gap-1.5 pt-3 text-center text-[11px] text-slate-500 select-none ${className}`}
        >
            <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-slate-400" />

            <span>
                Secure sign-in to your business complaint intelligence workspace.
            </span>
        </div>
    );
}