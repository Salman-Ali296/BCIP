"use client";

import { AlertTriangle, ArrowRight, UploadCloud, Eye } from "lucide-react";
import type { CustomerComplaint } from "../types";

interface ActionRequiredCardProps {
    complaint: CustomerComplaint;
    onProvideInfo: (complaint: CustomerComplaint) => void;
    onViewComplaint: (complaint: CustomerComplaint) => void;
}

export function ActionRequiredCard({
    complaint,
    onProvideInfo,
    onViewComplaint,
}: ActionRequiredCardProps) {
    if (!complaint.actionRequired || complaint.actionRequired.isResolved) {
        return null;
    }

    const { actionRequired } = complaint;

    return (
        <section
            aria-label="Action required on complaint"
            className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-orange-50/40 p-5 shadow-sm sm:p-6"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                        <AlertTriangle className="h-6 w-6 stroke-[2.2]" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-amber-200/90 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                                Action Required
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                                Case {complaint.id}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-amber-800 font-medium">
                                Requested {actionRequired.requestedAt}
                            </span>
                        </div>
                        <h3 className="mt-1.5 text-lg font-bold text-slate-900">
                            {actionRequired.title}
                        </h3>
                        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-700">
                            {actionRequired.description}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 shrink-0">
                    <button
                        type="button"
                        onClick={() => onProvideInfo(complaint)}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                    >
                        <UploadCloud className="h-4 w-4" aria-hidden="true" />
                        Provide Information
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewComplaint(complaint)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                    >
                        <Eye className="h-4 w-4 text-slate-500" aria-hidden="true" />
                        View Complaint
                    </button>
                </div>
            </div>
        </section>
    );
}
