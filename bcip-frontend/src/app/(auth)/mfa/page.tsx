"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, ShieldAlert, Smartphone } from "lucide-react";

import {
    AuthLayout,
    AuthCard,
    VerificationCodeInput,
    Checkbox,
    PrimaryButton,
    SecondaryButton,
    FormError,
    SuccessMessage,
    SecurityNotice,
} from "@/components/auth";
import { useAuth } from "@/providers/auth-provider";

function MFAContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [code, setCode] = useState("");
    const [trustDevice, setTrustDevice] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [authMethod, setAuthMethod] = useState<"totp" | "sms" | "backup">("totp");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (code.length !== 6) {
            setErrorMessage("Please enter the complete 6-digit code.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulated MFA verification
            await new Promise((resolve) => setTimeout(resolve, 800));

            if (code === "000000") {
                setErrorMessage("Invalid verification code. Please check your authenticator and try again.");
                setIsSubmitting(false);
                return;
            }

            setSuccessMessage("Identity verified. Redirecting to your workspace...");
            if (trustDevice) {
                localStorage.setItem("bcip.trustedDevice", "true");
            }

            setTimeout(() => {
                router.push("/business/dashboard");
            }, 1000);
        } catch {
            setErrorMessage("Unable to verify code. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard
                heading="Verify your identity"
                supportingText={
                    authMethod === "totp"
                        ? "Enter the 6-digit verification code from your authenticator app."
                        : authMethod === "sms"
                        ? "Enter the 6-digit verification code sent via SMS to your registered phone."
                        : "Enter one of your emergency 8-digit or 6-digit backup security codes."
                }
                badge="Multi-Factor Authentication"
                footer={
                    <div className="space-y-4">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Return to Sign In
                        </Link>
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

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Method header indicator */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            {authMethod === "totp" ? (
                                <Smartphone className="w-4 h-4 text-blue-600" />
                            ) : (
                                <KeyRound className="w-4 h-4 text-blue-600" />
                            )}
                            <span>
                                {authMethod === "totp"
                                    ? "Authenticator App (TOTP)"
                                    : authMethod === "sms"
                                    ? "SMS Verification"
                                    : "Backup Recovery Code"}
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">6 Digits</span>
                    </div>

                    {/* 6-digit Verification Code Input */}
                    <div className="py-2">
                        <VerificationCodeInput
                            length={6}
                            value={code}
                            onChange={(newCode) => {
                                setCode(newCode);
                                if (errorMessage) setErrorMessage("");
                            }}
                            error={Boolean(errorMessage)}
                        />
                    </div>

                    {/* Trust device for 30 days */}
                    <div className="pt-1">
                        <Checkbox
                            label="Trust this device for 30 days"
                            description="Do not require two-step verification on this browser for the next month."
                            checked={trustDevice}
                            onChange={(e) => setTrustDevice(e.target.checked)}
                        />
                    </div>

                    {/* Primary Button */}
                    <PrimaryButton
                        type="submit"
                        loading={isSubmitting}
                        loadingText="Verifying..."
                        disabled={code.length !== 6}
                        className="mt-2"
                    >
                        Verify
                    </PrimaryButton>

                    {/* Secondary: Use another verification method */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                        {authMethod !== "backup" ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setAuthMethod(authMethod === "totp" ? "sms" : "backup")
                                }
                                className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-1 cursor-pointer"
                            >
                                Use another verification method
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAuthMethod("totp")}
                                className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-1 cursor-pointer"
                            >
                                Back to authenticator app
                            </button>
                        )}

                        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                            <span>Having trouble?</span>
                            <Link href="/contact" className="hover:text-slate-600 hover:underline">
                                Contact IT Administrator
                            </Link>
                        </div>
                    </div>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}

export default function MFAPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen grid place-items-center bg-[#f8fafc]">
                    <span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
            }
        >
            <MFAContent />
        </Suspense>
    );
}
