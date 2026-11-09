"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    Clock3,
    KeyRound,
    LoaderCircle,
    MailCheck,
    RefreshCw,
} from "lucide-react";

import { EmailVerificationShell } from "@/components/auth/email-verification-shell";
import { VerificationCodeInput } from "@/components/auth/verification-code-input";
import { ApiClientError } from "@/lib/api/client";
import { requestEmailVerificationCode, verifyEmailCode } from "@/lib/api/auth";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get("email") ?? "";

    const [email, setEmail] = useState(emailFromUrl);
    const [code, setCode] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [hasSentCode, setHasSentCode] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((previous) => Math.max(0, previous - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const sendCode = async () => {
        if (cooldown > 0 || isSending || isVerifying) return;
        const normalizedEmail = email.trim().toLowerCase();
        if (
            normalizedEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            setEmailError("Enter a valid email address.");
            setErrorMessage("");
            setStatusMessage("");
            return;
        }

        setIsSending(true);
        setStatusMessage("");
        setErrorMessage("");
        setEmailError("");

        try {
            await requestEmailVerificationCode(normalizedEmail);
            setEmail(normalizedEmail);
            setCode("");
            setHasSentCode(true);
            setStatusMessage(
                "If an unverified account exists for this address, a 6-digit code will arrive shortly.",
            );
            setCooldown(60);
        } catch (error: unknown) {
            setErrorMessage(error instanceof ApiClientError && error.status === 0
                ? "We couldn't connect to BCIP. Check your connection and try again."
                : "We couldn't send a verification code just now. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!hasSentCode) {
            await sendCode();
            return;
        }
        if (isVerifying || code.length !== 6) return;

        setIsVerifying(true);
        setStatusMessage("");
        setErrorMessage("");
        try {
            const result = await verifyEmailCode(email.trim().toLowerCase(), code);
            setIsVerified(result.emailVerified);
            setStatusMessage("Your email is verified. You can now sign in.");
        } catch (error: unknown) {
            setErrorMessage(error instanceof ApiClientError && error.status === 0
                ? "We couldn't connect to BCIP. Check your connection and try again."
                : "That code is invalid or expired. Check your inbox or request a new code.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#29104f]">
            <EmailVerificationShell
                heading={
                    isVerified ? (
                        <>Your email is verified.</>
                    ) : (
                        <>
                            Verify your email to{" "}
                            <span className="text-[var(--landing-violet)]">get started.</span>
                        </>
                    )
                }
                description="Confirm the email address you used to create your BCIP account with a secure 6-digit code."
            >
                <div className="mb-6">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl border ${
                        isVerified
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-[var(--landing-border)] bg-[var(--landing-wash)] text-[var(--landing-violet)]"
                    }`}>
                        {isVerified ? (
                            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                        ) : hasSentCode ? (
                            <KeyRound className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <MailCheck className="h-6 w-6" aria-hidden="true" />
                        )}
                    </div>
                    <h2
                        aria-live="polite"
                        className="mt-5 text-xl font-semibold tracking-tight text-[var(--landing-ink)] sm:text-2xl"
                    >
                        {isVerified
                            ? "Email verified"
                            : hasSentCode
                                ? "Enter your 6-digit code"
                                : "Send a verification code"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                        {isVerified
                            ? "Your account is ready. Continue to sign in."
                            : hasSentCode
                                ? `Enter the code sent to ${email}. It expires in 10 minutes.`
                                : "Select the button below and we’ll email a one-time verification code to your address."}
                    </p>
                </div>

                {statusMessage && (
                    <p
                        role="status"
                        aria-live="polite"
                        className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
                    >
                        {statusMessage}
                    </p>
                )}

                {errorMessage && (
                    <p
                        role="alert"
                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                    >
                        {errorMessage}
                    </p>
                )}

                {isVerified ? (
                    <Link
                        href={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--landing-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(32,18,57,0.14)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-violet)]"
                    >
                        Continue to sign in
                    </Link>
                ) : (
                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label
                                htmlFor="verification-email"
                                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--landing-ink)]"
                            >
                                Email address
                            </label>
                            <input
                                id="verification-email"
                                name="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                maxLength={254}
                                required
                                disabled={isSending || isVerifying}
                                value={email}
                                aria-invalid={Boolean(emailError)}
                                aria-describedby={emailError ? "verification-email-error" : undefined}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setCode("");
                                    setHasSentCode(false);
                                    setCooldown(0);
                                    setEmailError("");
                                    setErrorMessage("");
                                    setStatusMessage("");
                                }}
                                className="w-full rounded-xl border border-[var(--landing-border)] bg-white px-4 py-3 text-sm text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)] focus:border-[var(--landing-violet)] focus:ring-4 focus:ring-violet-500/10"
                                placeholder="you@company.com"
                            />
                            {emailError && (
                                <p
                                    id="verification-email-error"
                                    role="alert"
                                    className="mt-2 text-sm text-red-700"
                                >
                                    {emailError}
                                </p>
                            )}
                        </div>

                        {hasSentCode && (
                            <div>
                                <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--landing-ink)]">
                                    Verification code
                                </span>
                                <div role="group" aria-label="6-digit email verification code">
                                    <VerificationCodeInput
                                        value={code}
                                        onChange={(value) => {
                                            setCode(value);
                                            setErrorMessage("");
                                        }}
                                        disabled={isVerifying}
                                        error={Boolean(errorMessage)}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={
                                isSending ||
                                isVerifying ||
                                (!hasSentCode && cooldown > 0) ||
                                (hasSentCode && code.length !== 6)
                            }
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--landing-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(32,18,57,0.14)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-violet)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-violet)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {isSending || isVerifying ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    {isVerifying ? "Verifying…" : "Sending code…"}
                                </>
                            ) : hasSentCode ? (
                                "Verify email"
                            ) : cooldown > 0 ? (
                                <>
                                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                                    Send code in {cooldown}s
                                </>
                            ) : (
                                <>
                                    <MailCheck className="h-4 w-4" aria-hidden="true" />
                                    Send verification code
                                </>
                            )}
                        </button>

                        {hasSentCode && (
                            <button
                                type="button"
                                onClick={sendCode}
                                disabled={cooldown > 0 || isSending || isVerifying}
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--landing-border)] px-5 py-3 text-sm font-semibold text-[var(--landing-ink)] transition hover:bg-[var(--landing-wash)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-violet)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {cooldown > 0 ? (
                                    <>
                                        <Clock3 className="h-4 w-4" aria-hidden="true" />
                                        Resend code in {cooldown}s
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                                        Resend code
                                    </>
                                )}
                            </button>
                        )}
                    </form>
                )}

                <p className="mt-5 text-center text-xs leading-5 text-[var(--landing-muted)]">
                    The code is valid for 10 minutes. Check your spam folder if it doesn’t arrive.
                </p>
            </EmailVerificationShell>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="grid min-h-screen place-items-center bg-[#29104f]">
                    <span
                        role="status"
                        aria-label="Loading email verification"
                        className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
