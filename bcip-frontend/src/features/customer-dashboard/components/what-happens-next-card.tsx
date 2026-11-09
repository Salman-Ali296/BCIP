"use client";

import { Clock, HelpCircle, ArrowRight, UserCheck } from "lucide-react";
import type { CustomerComplaint } from "../types";

interface WhatHappensNextCardProps {
    complaint: CustomerComplaint;
    onViewDetails: (complaint: CustomerComplaint) => void;
}

export function WhatHappensNextCard({
    complaint,
    onViewDetails,
}: WhatHappensNextCardProps) {
    if (!complaint.whatHappensNext) {
        return null;
    }

    const { summary, details, expectedNextUpdate } = complaint.whatHappensNext;

    return (
        <article className="flex flex-col justify-between rounded-2xl border border-blue-100/90 bg-gradient-to-br from-white via-blue-50/20 to-slate-50 p-6 shadow-sm">
            <div>
                <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/70 px-3 py-1 text-xs font-semibold text-blue-800">
                        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Status Transparency
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                        {complaint.id}
                    </span>
                </div>

                <h3 className="mt-3.5 text-lg font-bold tracking-tight text-slate-900">
                    What happens next?
                </h3>

                <div className="mt-3 space-y-2.5">
                    <p className="text-sm font-semibold text-blue-950">
                        {summary}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">
                        {details}
                    </p>
                </div>

                <div className="mt-4 rounded-xl border border-blue-200/60 bg-white/80 p-3.5">
                    <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-blue-600 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Expected Next Update
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                                {expectedNextUpdate}
                            </p>
                        </div>
                    </div>
                </div>

                {complaint.assignedAgent && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                        <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                        <span>Dedicated handler: <strong className="text-slate-800">{complaint.assignedAgent}</strong></span>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={() => onViewDetails(complaint)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                    View Complaint Details
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </article>
    );
}
