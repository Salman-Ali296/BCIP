"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CircleHelp, LoaderCircle, RotateCw } from "lucide-react";
import {
    getBusinessSubscription,
    hasActiveBusinessSubscription,
} from "@/lib/api/business-billing";
import { ApiClientError } from "@/lib/api/client";
import {
    BusinessTrialApiError,
    completeBusinessOnboarding,
    getBusinessTrialStatus,
    type BusinessTrialStatus,
} from "@/features/business-trial/api/business-trial-api";

type SetupState = "loading" | "ready" | "saving" | "error";

function isUnauthorized(error: unknown): boolean {
    return (
        (error instanceof BusinessTrialApiError || error instanceof ApiClientError) &&
        error.status === 401
    );
}

async function requestSetupStatus() {
    const [trialStatus, subscription] = await Promise.all([
        getBusinessTrialStatus(),
        getBusinessSubscription(),
    ]);
    return { trialStatus, subscription };
}

export function BusinessSetup() {
    const router = useRouter();
    const [status, setStatus] = useState<BusinessTrialStatus | null>(null);
    const [state, setState] = useState<SetupState>("loading");
    const [error, setError] = useState("");

    const loadWorkspace = useCallback(async () => {
        try {
            const { trialStatus, subscription } = await requestSetupStatus();
            if (
                trialStatus.trial?.active !== true &&
                !hasActiveBusinessSubscription(subscription)
            ) {
                router.replace("/business/upgrade");
                return;
            }
            if (trialStatus.onboardingComplete) {
                router.replace("/business/dashboard");
                return;
            }
            setStatus(trialStatus);
            setState("ready");
        } catch (requestError: unknown) {
            if (isUnauthorized(requestError)) {
                router.replace(
                    "/login?returnTo=%2Fbusiness%2Fonboarding",
                );
                return;
            }
            setError("We couldn’t load your workspace details. Please try again.");
            setState("error");
        }
    }, [router]);

    useEffect(() => {
        let current = true;
        requestSetupStatus()
            .then(({ trialStatus, subscription }) => {
                if (!current) return;
                if (
                    trialStatus.trial?.active !== true &&
                    !hasActiveBusinessSubscription(subscription)
                ) {
                    router.replace("/business/upgrade");
                    return;
                }
                if (trialStatus.onboardingComplete) {
                    router.replace("/business/dashboard");
                    return;
                }
                setStatus(trialStatus);
                setState("ready");
            })
            .catch((requestError: unknown) => {
                if (!current) return;
                if (isUnauthorized(requestError)) {
                    router.replace("/login?returnTo=%2Fbusiness%2Fonboarding");
                    return;
                }
                setError("We couldn’t load your workspace details. Please try again.");
                setState("error");
            });
        return () => {
            current = false;
        };
    }, [router]);

    async function finishSetup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (state !== "ready") return;

        setState("saving");
        setError("");
        try {
            await completeBusinessOnboarding();
            router.replace("/business/dashboard");
        } catch (requestError: unknown) {
            if (isUnauthorized(requestError)) {
                router.replace(
                    "/login?returnTo=%2Fbusiness%2Fonboarding",
                );
                return;
            }
            setError("We couldn’t finish workspace setup. Your details are safe; try again.");
            setState("ready");
        }
    }

    return (
        <main className="business-flow grid min-h-screen place-items-center px-4 py-10 sm:px-7">
            <div className="w-full max-w-4xl">
                <Link
                    href="/business/upgrade"
                    className="text-sm font-semibold text-[var(--workspace-muted)] transition hover:text-[var(--workspace-green)]"
                >
                    Plan & billing
                </Link>

                <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <header className="pt-2">
                        <p className="business-eyebrow">One last step</p>
                        <h1 className="business-display mt-3 text-4xl leading-tight sm:text-5xl">
                            Make your customer portal ready.
                        </h1>
                        <p className="mt-4 text-base leading-7 text-[var(--workspace-muted)]">
                            Confirm the business workspace, then you can welcome customer
                            feedback and work through it with your team.
                        </p>
                        <ol className="mt-8 space-y-4" aria-label="Setup progress">
                            {[
                                { label: "Choose a plan", complete: true },
                                { label: "Prepare your workspace", complete: false },
                                { label: "Open your dashboard", complete: false },
                            ].map(({ label, complete }, index) => (
                                <li key={label} className="flex items-center gap-3">
                                    <span
                                        className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                                            complete
                                                ? "bg-[var(--workspace-green)] text-white"
                                                : index === 1
                                                  ? "bg-[var(--workspace-acid)] text-[var(--workspace-green-deep)]"
                                                  : "border border-[var(--workspace-line)] bg-[var(--workspace-card)] text-[var(--workspace-muted)]"
                                        }`}
                                    >
                                        {complete ? <Check size={15} aria-hidden="true" /> : index + 1}
                                    </span>
                                    <span className="text-sm font-semibold">{label}</span>
                                </li>
                            ))}
                        </ol>
                    </header>

                    <section className="business-card p-6 sm:p-8">
                        <p className="business-eyebrow">Workspace details</p>
                        <h2 className="business-display mt-2 text-2xl">
                            {status?.tenant.name ?? "Your business"}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--workspace-muted)]">
                            Your customer portal will be the front door for people who need
                            help from your business.
                        </p>

                        <div className="mt-6 rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-paper)] p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--workspace-muted)]">
                                Customer portal
                            </p>
                            <p className="mt-2 break-all text-sm font-semibold">
                                {status?.complaintPortalUrl ?? "Available when setup is complete"}
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mt-5 rounded-xl border border-[var(--workspace-rust)]/30 bg-[var(--workspace-rust-wash)] p-4 text-sm leading-6 text-[var(--workspace-rust)]"
                            >
                                {error}
                            </div>
                        )}

                        {state === "loading" ? (
                            <p role="status" className="mt-6 flex items-center gap-2 text-sm text-[var(--workspace-muted)]">
                                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                                Checking workspace details…
                            </p>
                        ) : state === "error" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setState("loading");
                                    setError("");
                                    void loadWorkspace();
                                }}
                                className="business-button-secondary mt-6"
                            >
                                <RotateCw size={16} aria-hidden="true" />
                                Try again
                            </button>
                        ) : (
                            <form onSubmit={finishSetup} className="mt-6">
                                <button
                                    type="submit"
                                    disabled={state === "saving"}
                                    className="business-button-primary w-full sm:w-auto"
                                >
                                    {state === "saving" ? (
                                        <>
                                            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                                            Preparing workspace…
                                        </>
                                    ) : (
                                        <>
                                            Finish setup
                                            <ArrowRight size={16} aria-hidden="true" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[var(--workspace-muted)]">
                            <CircleHelp size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                            You can update your workspace preferences any time from your plan’s settings.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
