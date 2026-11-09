"use client";

import React from "react";
import { Check } from "lucide-react";

interface Step {
    number: string;
    label: string;
}

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps?: number;
    steps?: Step[];
    className?: string;
}

const DEFAULT_STEPS: Step[] = [
    { number: "01", label: "Account" },
    { number: "02", label: "Business" },
    { number: "03", label: "Workspace" },
];

export function ProgressIndicator({
    currentStep,
    totalSteps = 3,
    steps = DEFAULT_STEPS,
    className = "",
}: ProgressIndicatorProps) {
    return (
        <div className={`space-y-3 mb-6 select-none ${className}`}>
            <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 tracking-wide">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {steps[currentStep - 1]?.label || ""}
                </span>
            </div>

            {/* Stepper track */}
            <div className="grid grid-cols-3 gap-2">
                {steps.map((step, idx) => {
                    const stepNumber = idx + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div key={step.number} className="space-y-1.5">
                            {/* Segment Bar */}
                            <div
                                className={`h-1.5 rounded-full transition-all duration-200 ${
                                    isCompleted
                                        ? "bg-blue-600"
                                        : isCurrent
                                        ? "bg-blue-600"
                                        : "bg-slate-200"
                                }`}
                            />

                            <div className="flex items-center gap-1.5 pt-0.5">
                                <span
                                    className={`text-[11px] font-mono font-semibold ${
                                        isCurrent
                                            ? "text-blue-600"
                                            : isCompleted
                                            ? "text-slate-700"
                                            : "text-slate-400"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-3 h-3 inline stroke-[2.5]" />
                                    ) : (
                                        step.number
                                    )}
                                </span>
                                <span
                                    className={`text-xs font-medium truncate ${
                                        isCurrent
                                            ? "text-slate-900 font-semibold"
                                            : isCompleted
                                            ? "text-slate-700"
                                            : "text-slate-400"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
