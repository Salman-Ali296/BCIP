"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, Sparkles, Users } from "lucide-react";

import {
    AuthLayout,
    AuthCard,
    TextInput,
    PrimaryButton,
    FormError,
    SuccessMessage,
    SecurityNotice,
} from "@/components/auth";

const INDUSTRIES = [
    "Retail",
    "Banking / Financial Services",
    "E-commerce",
    "Healthcare",
    "Education",
    "Telecommunications",
    "Technology",
    "Other",
];

const TEAM_SIZES = [
    "1–10",
    "11–50",
    "51–200",
    "201–500",
    "500+",
];

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [businessName, setBusinessName] = useState(searchParams.get("business") || "");
    const [businessNameError, setBusinessNameError] = useState("");
    const [industry, setIndustry] = useState(INDUSTRIES[0]);
    const [teamSize, setTeamSize] = useState(TEAM_SIZES[1]);
    const [isActivating, setIsActivating] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleFillDemo = () => {
        setBusinessName("Meridian Logistics & Retail");
        setIndustry("Retail");
        setTeamSize("51–200");
        setBusinessNameError("");
        setErrorMessage("");
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!businessName.trim()) {
            setBusinessNameError("Please enter your business or organization name.");
            return;
        }

        setIsActivating(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 900));
            setSuccessMessage("Workspace configured! Launching your intelligence dashboard...");
            setTimeout(() => {
                router.push("/business/dashboard");
            }, 1000);
        } catch {
            setErrorMessage("Failed to save workspace profile. Please try again.");
            setIsActivating(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard
                heading="Tell us about your business"
                supportingText="Establish your business context so BCIP can configure industry-specific complaint categories and SLA routing."
                badge="Account Activation"
                footer={
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>Step 2 of 2: Workspace Context</span>
                            <button
                                type="button"
                                onClick={handleFillDemo}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Sparkles className="w-3 h-3" />
                                Pre-fill
                            </button>
                        </div>
                        <SecurityNotice />
                    </div>
                }
            >
                {errorMessage && (
                    <FormError
                        message={errorMessage}
                        onDismiss={() => setErrorMessage("")}
                        className="mb-4"
                    />
                )}

                {successMessage && (
                    <SuccessMessage
                        message={successMessage}
                        onDismiss={() => setSuccessMessage("")}
                        className="mb-4"
                    />
                )}

                <form onSubmit={handleComplete} className="space-y-5" noValidate>
                    <TextInput
                        label="Business / Organization name"
                        type="text"
                        required
                        autoFocus
                        value={businessName}
                        error={businessNameError}
                        placeholder="e.g. Meridian Global Corp"
                        onChange={(e) => {
                            setBusinessName(e.target.value);
                            if (businessNameError) setBusinessNameError("");
                        }}
                    />

                    {/* Industry Selector */}
                    <div className="space-y-1.5 text-left">
                        <label
                            htmlFor="onboarding-industry"
                            className="block text-xs font-semibold tracking-wide text-slate-800"
                        >
                            Industry <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="onboarding-industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            {INDUSTRIES.map((ind) => (
                                <option key={ind} value={ind}>
                                    {ind}
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-slate-500">
                            Pre-loads default taxonomy and NLP complaint tags for this sector.
                        </p>
                    </div>

                    {/* Team Size Segmented Grid */}
                    <div className="space-y-1.5 text-left">
                        <label className="block text-xs font-semibold tracking-wide text-slate-800">
                            Team size <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {TEAM_SIZES.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setTeamSize(size)}
                                    className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-colors ${
                                        teamSize === size
                                            ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <PrimaryButton
                        type="submit"
                        loading={isActivating}
                        loadingText="Activating workspace..."
                        className="mt-3"
                    >
                        <span>Launch Intelligence Workspace</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </PrimaryButton>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen grid place-items-center bg-[#f8fafc]">
                    <span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
            }
        >
            <OnboardingContent />
        </Suspense>
    );
}
