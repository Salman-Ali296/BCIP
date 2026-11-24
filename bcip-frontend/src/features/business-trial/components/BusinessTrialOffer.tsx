"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CreditCard, LoaderCircle, RotateCw, X } from "lucide-react";
import {
    acceptBusinessTrial,
    BusinessTrialApiError,
    getBusinessTrialStatus,
    type BusinessTrialStatus,
} from "@/features/business-trial/api/business-trial-api";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { BrandLogo } from "@/components/brand/brand-logo";

type LoadState = "loading" | "ready" | "error";

export function BusinessTrialOffer() {
    const router = useRouter();
    const { user } = useAuth();
    const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? "";
    const [status, setStatus] = useState<BusinessTrialStatus | null>(null);
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const loadStatus = useCallback(async () => {
        try {
            const result = await getBusinessTrialStatus();
            setStatus(result);
            setLoadState("ready");
        } catch (requestError: unknown) {
            setError(
                requestError instanceof ApiClientError &&
                    requestError.status === 401 ||
                    requestError instanceof BusinessTrialApiError &&
                    requestError.status === 401
                    ? "Sign in to review trial availability."
                    : "We couldn’t load trial availability. Please try again.",
            );
            setLoadState("error");
        }
    }, []);

    useEffect(() => {
        let current = true;
        getBusinessTrialStatus()
            .then((result) => {
                if (!current) return;
                setStatus(result);
                setLoadState("ready");
            })
            .catch((requestError: unknown) => {
                if (!current) return;
                const unauthorized =
                    (requestError instanceof ApiClientError ||
                        requestError instanceof BusinessTrialApiError) &&
                    requestError.status === 401;
                setError(
                    unauthorized
                        ? "Sign in to review trial availability."
                        : "We couldn’t load trial availability. Please try again.",
                );
                setLoadState("error");
            });
        return () => {
            current = false;
        };
    }, []);

    async function startTrial(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!acceptedTerms || pending) return;

        setPending(true);
        setError("");
        try {
            await acceptBusinessTrial();
            router.replace("/business/onboarding");
        } catch (requestError: unknown) {
            if (
                (requestError instanceof ApiClientError ||
                    requestError instanceof BusinessTrialApiError) &&
                requestError.status === 401
            ) {
                router.replace("/login?returnTo=%2Fbusiness%2Ftrial");
                return;
            }
            setError("We couldn’t start your trial. No changes were made; please try again.");
            setPending(false);
        }
    }

    const trialEnded =
        loadState === "ready" && !status?.trial?.active && status?.canAcceptTrial === false;

    return (
        <main className="business-flow grid min-h-screen place-items-center px-4 py-10 sm:px-7">
            <div className="w-full max-w-4xl">
                <div className="flex items-center justify-between gap-4">
                    <BrandLogo height={30} />
                    <Link
                        href="/business/upgrade"
                        className="text-sm font-semibold text-[var(--workspace-muted)] transition hover:text-[var(--workspace-green)]"
                    >
                        See all plans
                    </Link>
                </div>

                {/* Welcome */}
                <section className="mt-8">
                    <p className="business-eyebrow">
                        {trialEnded ? "Welcome back" : "Thanks for signing up"}
                    </p>
                    <h1 className="business-display mt-3 text-4xl leading-tight sm:text-5xl">
                        {trialEnded
                            ? `Good to see you again${firstName ? `, ${firstName}` : ""}.`
                            : `Welcome to BCIP${firstName ? `, ${firstName}` : ""}.`}
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--workspace-muted)]">
                        {trialEnded
                            ? "Your free trial has finished. Your complaints and settings are still here. Pick a plan to switch the workspace back on."
                            : status?.tenant.name
                              ? `Your account for ${status.tenant.name} is ready. One more step: start your free trial, or buy a plan if you already know what you need.`
                              : "Your account is ready. One more step: start your free trial, or buy a plan if you already know what you need."}
                    </p>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="mt-6 rounded-xl border border-[var(--workspace-rust)]/30 bg-[var(--workspace-rust-wash)] p-4 text-sm leading-6 text-[var(--workspace-rust)]"
                    >
                        {error}
                        {error.startsWith("Sign in") && (
                            <Link
                                href="/login?returnTo=%2Fbusiness%2Ftrial"
                                className="ml-1 font-bold underline underline-offset-4"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                )}

                <div className="mt-8 grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
                    {/* Option 1: the trial */}
                    <section className="business-card overflow-hidden">
                        <div className="p-7 sm:p-9">
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--workspace-green)]">
                                {trialEnded ? "Free trial" : "Recommended"}
                            </p>
                            <h2 className="business-display mt-2 text-3xl">
                                {trialEnded ? "Trial finished" : "Start your 14-day free trial"}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[var(--workspace-muted)]">
                                No card needed. You can upgrade at any point during the trial
                                without losing anything.
                            </p>

                            <ul className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                                {[
                                    { label: "Complaint inbox and tracking IDs", included: true },
                                    { label: "Your own complaint page", included: true },
                                    { label: "AI category and priority", included: true },
                                    { label: "Team members and roles", included: true },
                                    { label: "Escalations and SLA alerts", included: false },
                                    { label: "Analytics and reports", included: false },
                                ].map((item) => (
                                    <li key={item.label} className="flex items-start gap-2">
                                        {item.included ? (
                                            <Check size={16} className="mt-0.5 shrink-0 text-[var(--workspace-green)]" aria-hidden="true" />
                                        ) : (
                                            <X size={16} className="mt-0.5 shrink-0 text-[var(--workspace-muted)]" aria-hidden="true" />
                                        )}
                                        <span className={item.included ? "" : "text-[var(--workspace-muted)]"}>
                                            {item.label}
                                            {!item.included && <span className="sr-only"> (not in the trial)</span>}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {loadState === "loading" ? (
                                <p role="status" className="mt-7 flex items-center gap-2 text-sm text-[var(--workspace-muted)]">
                                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                                    Checking your account…
                                </p>
                            ) : loadState === "error" ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");
                                        setLoadState("loading");
                                        void loadStatus();
                                    }}
                                    className="business-button-secondary mt-7"
                                >
                                    <RotateCw size={16} aria-hidden="true" />
                                    Try again
                                </button>
                            ) : status?.trial?.active ? (
                                <div className="mt-7">
                                    <p className="flex items-center gap-2 text-sm font-bold text-[var(--workspace-green)]">
                                        <Check size={17} aria-hidden="true" />
                                        Your trial is running · {status.trial.daysRemaining} days left
                                    </p>
                                    <Link
                                        href={
                                            status.onboardingComplete
                                                ? "/business/dashboard"
                                                : "/business/onboarding"
                                        }
                                        className="business-button-primary mt-4"
                                    >
                                        {status.onboardingComplete ? "Open my dashboard" : "Continue setup"}
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Link>
                                </div>
                            ) : status?.canAcceptTrial ? (
                                <form onSubmit={startTrial} className="mt-7 border-t border-[var(--workspace-line)] pt-6">
                                    <label className="flex items-start gap-3 text-sm leading-6 text-[var(--workspace-muted)]">
                                        <input
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(event) => setAcceptedTerms(event.target.checked)}
                                            className="mt-1 h-4 w-4 accent-[var(--workspace-green)]"
                                        />
                                        <span>
                                            I agree to the{" "}
                                            <Link href="/terms" className="font-semibold underline underline-offset-4">
                                                trial terms
                                            </Link>
                                            . The trial ends by itself after 14 days.
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={!acceptedTerms || pending}
                                        className="business-button-primary mt-5 w-full sm:w-auto"
                                    >
                                        {pending ? (
                                            <>
                                                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                                                Starting your trial…
                                            </>
                                        ) : (
                                            <>
                                                Start free trial
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <p className="mt-7 border-t border-[var(--workspace-line)] pt-6 text-sm leading-6 text-[var(--workspace-muted)]">
                                    Each business can use the free trial once. Choose a plan to
                                    keep going.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Option 2: buy now */}
                    <aside className="flex flex-col justify-between rounded-3xl bg-[var(--workspace-green-deep)] p-7 text-white sm:p-8">
                        <div>
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                                <CreditCard size={18} aria-hidden="true" />
                            </span>
                            <h2 className="business-display mt-5 text-2xl leading-tight">
                                {trialEnded ? "Choose a plan" : "Already know you want it?"}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-white/75">
                                {trialEnded
                                    ? "Professional adds escalations, duplicate detection, reply drafts and analytics on top of what you used in the trial."
                                    : "Skip the trial and go straight to a paid plan. Everything in that plan is switched on from day one."}
                            </p>
                        </div>
                        <div className="mt-8">
                            <Link
                                href="/business/upgrade"
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[var(--workspace-green-deep)] transition hover:bg-white/90"
                            >
                                {trialEnded ? "Choose a plan" : "Buy a plan now"}
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                            <p className="mt-3 text-center text-xs text-white/60">
                                You&apos;ll see the price before you pay.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
