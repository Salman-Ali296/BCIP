"use client";

import { Check, CircleDot } from "lucide-react";
import { PROGRESS_STEPS } from "../mock-data";

interface ComplaintProgressTrackerProps {
    currentStep: number; // 0 to 5
    complaintId: string;
    statusLabel?: string;
}

export function ComplaintProgressTracker({
    currentStep,
    complaintId,
    statusLabel = "In Progress",
}: ComplaintProgressTrackerProps) {
    return (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Resolution Journey
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {complaintId}
                        </span>
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                        Current Stage: {PROGRESS_STEPS[currentStep]?.label || statusLabel}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-xs font-medium text-blue-800">
                        <CircleDot className="h-3 w-3 text-blue-600 animate-pulse" aria-hidden="true" />
                        Stage {currentStep + 1} of {PROGRESS_STEPS.length}
                    </span>
                </div>
            </div>

            {/* Desktop Horizontal Timeline */}
            <div className="mt-6 hidden md:block">
                <ol className="grid grid-cols-6 items-start gap-0 relative" aria-label="Complaint progress">
                    {PROGRESS_STEPS.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isUpcoming = index > currentStep;

                        return (
                            <li key={step.id} className="relative flex flex-col items-center text-center px-1">
                                {/* Connector Line */}
                                {index < PROGRESS_STEPS.length - 1 && (
                                    <div
                                        className={`absolute top-4 left-1/2 w-full h-[2.5px] -z-0 transition-colors ${
                                            isCompleted
                                                ? "bg-emerald-500"
                                                : isCurrent
                                                ? "bg-gradient-to-r from-blue-600 to-slate-200"
                                                : "bg-slate-200"
                                        }`}
                                        aria-hidden="true"
                                    />
                                )}

                                {/* Step Node Icon / Disc */}
                                <div
                                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                                        isCompleted
                                            ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50"
                                            : isCurrent
                                            ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100"
                                            : "bg-slate-100 text-slate-400 border border-slate-300"
                                    }`}
                                    aria-current={isCurrent ? "step" : undefined}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                                    ) : isCurrent ? (
                                        <span className="h-2.5 w-2.5 rounded-full bg-white ring-2 ring-blue-600 animate-ping" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Step Labels */}
                                <div className="mt-3">
                                    <p
                                        className={`text-xs font-semibold transition-colors ${
                                            isCurrent
                                                ? "text-blue-700"
                                                : isCompleted
                                                ? "text-slate-800"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-tight text-slate-500">
                                        {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="mt-5 block md:hidden">
                <ol className="space-y-4 border-l-2 border-slate-200 pl-4 ml-2" aria-label="Complaint progress mobile">
                    {PROGRESS_STEPS.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isUpcoming = index > currentStep;

                        return (
                            <li key={step.id} className="relative">
                                {/* Vertical node disc */}
                                <span
                                    className={`absolute -left-[25px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                                        isCompleted
                                            ? "bg-emerald-600 text-white"
                                            : isCurrent
                                            ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                            : "bg-slate-200 text-slate-500"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                <div className="pl-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-sm font-semibold ${
                                                isCurrent
                                                    ? "text-blue-700 font-bold"
                                                    : isCompleted
                                                    ? "text-slate-800"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                        {isCurrent && (
                                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                                                Active
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="text-[11px] text-emerald-700 font-medium">✓ Done</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}
