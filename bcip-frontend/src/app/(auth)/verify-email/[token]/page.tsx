"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle, MailCheck } from "lucide-react";

import { EmailVerificationShell } from "@/components/auth/email-verification-shell";
import { ApiClientError } from "@/lib/api/client";
import { verifyEmailToken } from "@/lib/api/auth";

interface VerifyEmailPageProps {
    params: Promise<{
        token: string;
    }>;
}

type VerificationState = "ready" | "verifying" | "verified" | "error";

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
    const { token } = use(params);
    const [state, setState] = useState<VerificationState>("ready");
    const [message, setMessage] = useState("");
    const [verifiedEmail, setVerifiedEmail] = useState("");

    async function verifyEmail() {
        if (state === "verifying") return;

        setState("verifying");
        setMessage("");
        try {
            const result = await verifyEmailToken(token);
            if (!result.emailVerified) {
                setMessage("The email address is not verified yet. Request a 6-digit code and try again.");
                setState("error");
                return;
            }
            setVerifiedEmail(result.email);
            setState("verified");
        } catch (error: unknown) {
            setMessage(error instanceof ApiClientError && error.status === 0
                ? "We couldn't connect to BCIP. Check your connection and try again."
                : "This older verification link could not be confirmed. Request a 6-digit code instead.");
            setState("error");
        }
    }

    return (
        <div className="min-h-screen bg-[#29104f]">
            <EmailVerificationShell
                heading={
                    state === "verified"
                        ? <>Your email is confirmed.</>
                        : <>Confirm your email address.</>
                }
                description={
                    state === "verified"
                        ? "Your email address is verified. You can now sign in to your BCIP account."
                        : "Confirm the email address associated with your account. New verifications use a one-time 6-digit code."
                }
            >
                <div className="mb-6">
                    <div
                        className={`grid h-12 w-12 place-items-center rounded-2xl border ${
                            state === "verified"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : state === "error"
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-[var(--landing-border)] bg-[var(--landing-wash)] text-[var(--landing-violet)]"
                        }`}
                    >
                        {state === "verified" ? (
                            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                        ) : state === "error" ? (
                            <AlertCircle className="h-6 w-6" aria-hidden="true" />
                        ) : state === "verifying" ? (
                            <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
                        ) : (
                            <MailCheck className="h-6 w-6" aria-hidden="true" />
                        )}
                    </div>
                    <h2
                        aria-live="polite"
                        className="mt-5 text-xl font-semibold tracking-tight text-[var(--landing-ink)] sm:text-2xl"
                    >
                        {state === "verified"
                            ? "Email confirmed"
                            : state === "error"
                              ? "Link needs attention"
                              : state === "verifying"
                                ? "Confirming your email"
                                : "Ready to confirm"}
                    </h2>
                    <p
                        role={state === "error" ? "alert" : state === "verifying" || state === "verified" ? "status" : undefined}
                        className={`mt-2 text-sm leading-6 ${
                            state === "error" ? "text-red-700" : "text-[var(--landing-muted)]"
                        }`}
                    >
                        {state === "error"
                            ? message
                            : state === "verifying"
                              ? "Checking your verification link…"
                              : state === "verified"
                                ? `Verified address: ${verifiedEmail}`
                                : "Select the button below to confirm your email address."}
                    </p>
                </div>

                {state === "ready" || state === "verifying" ? (
                    <button
                        type="button"
                        onClick={verifyEmail}
                        disabled={state === "verifying"}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--landing-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(32,18,57,0.14)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-violet)] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {state === "verifying" ? (
                            <>
                                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                                Verifying…
                            </>
                        ) : (
                            "Confirm email address"
                        )}
                    </button>
                ) : state === "verified" ? (
                    <Link
                        href={`/login?email=${encodeURIComponent(verifiedEmail)}`}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--landing-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(32,18,57,0.14)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-violet)]"
                    >
                        Continue to sign in
                    </Link>
                ) : (
                    <Link
                        href="/verify-email"
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--landing-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(32,18,57,0.14)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-violet)]"
                    >
                        Request a verification code
                    </Link>
                )}
            </EmailVerificationShell>
        </div>
    );
}
