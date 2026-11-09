"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle, RotateCw } from "lucide-react";
import {
    acceptBusinessTrial,
    BusinessTrialApiError,
    getBusinessTrialStatus,
    type BusinessTrialStatus,
} from "@/features/business-trial/api/business-trial-api";
import { ApiClientError } from "@/lib/api/client";

type LoadState = "loading" | "ready" | "error";

export function BusinessTrialOffer() {
    const router = useRouter();
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

    return (
        <main className="business-flow grid min-h-screen place-items-center px-4 py-10 sm:px-7">
            <div className="w-full max-w-3xl">
                <Link
                    href="/business/upgrade"
                    className="text-sm font-semibold text-[var(--workspace-muted)] transition hover:text-[var(--workspace-green)]"
                >
                    Compare plans
                </Link>
                <section className="business-card mt-7 overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
                        <div className="p-7 sm:p-10">
                            <p className="business-eyebrow">A considered first step</p>
                            <h1 className="business-display mt-3 text-4xl leading-tight sm:text-5xl">
                                Get to know your workspace.
                            </h1>
                            <p className="mt-4 text-base leading-7 text-[var(--workspace-muted)]">
                                Start with 14 days to see how BCIP fits the way your business
                                handles customer feedback. No payment details are needed to begin.
                            </p>
                            {status?.tenant.name && (
                                <p className="mt-6 border-t border-[var(--workspace-line)] pt-5 text-sm">
                                    Setting up for{" "}
                                    <span className="font-bold">{status.tenant.name}</span>
                                </p>
                            )}

                            {error && (
                                <div
                                    role="alert"
                                    className="mt-5 rounded-xl border border-[var(--workspace-rust)]/30 bg-[var(--workspace-rust-wash)] p-4 text-sm leading-6 text-[var(--workspace-rust)]"
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

                            {loadState === "loading" ? (
                                <p role="status" className="mt-7 flex items-center gap-2 text-sm text-[var(--workspace-muted)]">
                                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                                    Checking trial availability…
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
                                        Your trial is active · {status.trial.daysRemaining} days remaining
                                    </p>
                                    <Link
                                        href={
                                            status.onboardingComplete
                                                ? "/business/dashboard"
                                                : "/business/onboarding"
                                        }
                                        className="business-button-primary mt-4"
                                    >
                                        Continue setup
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Link>
                                </div>
                            ) : status?.canAcceptTrial ? (
                                <form onSubmit={startTrial} className="mt-7">
                                    <label className="flex items-start gap-3 text-sm leading-6 text-[var(--workspace-muted)]">
                                        <input
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(event) => setAcceptedTerms(event.target.checked)}
                                            className="mt-1 h-4 w-4 accent-[var(--workspace-green)]"
                                        />
                                        <span>
                                            I agree to start a 14-day business workspace trial.
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
                                                Starting trial…
                                            </>
                                        ) : (
                                            <>
                                                Start my free trial
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="mt-7">
                                    <p className="text-sm leading-6 text-[var(--workspace-muted)]">
                                        A trial isn’t available for this account. Choose a plan to
                                        continue to your workspace.
                                    </p>
                                    <Link href="/business/upgrade" className="business-button-primary mt-4">
                                        Choose a plan
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        <aside className="flex flex-col justify-between bg-[var(--workspace-green-deep)] p-7 text-[#fffef9] sm:p-9">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">
                                    Your first fortnight
                                </p>
                                <p className="business-display mt-4 text-3xl leading-tight">
                                    More clarity, less chasing.
                                </p>
                            </div>
                            <ul className="mt-8 space-y-4">
                                {[
                                    "A single place for incoming complaints",
                                    "Clear ownership for every response",
                                    "A view of progress your team can share",
                                ].map((benefit) => (
                                    <li key={benefit} className="flex items-start gap-3 text-sm leading-6 text-white/80">
                                        <Check
                                            size={17}
                                            className="mt-0.5 shrink-0 text-[var(--workspace-acid)]"
                                            aria-hidden="true"
                                        />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-10 border-t border-white/15 pt-5 text-xs leading-5 text-white/55">
                                When you’re ready, compare plans and review your price before subscribing.
                            </p>
                        </aside>
                    </div>
                </section>
            </div>
        </main>
    );
}
