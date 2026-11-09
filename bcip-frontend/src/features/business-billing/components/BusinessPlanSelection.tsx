"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CircleCheck,
    CreditCard,
    LoaderCircle,
    LockKeyhole,
} from "lucide-react";
import {
    createBusinessBillingPortal,
    createBusinessCheckout,
    getBusinessSubscription,
    hasActiveBusinessSubscription,
    normalizeBusinessPlan,
    type BillingInterval,
    type BusinessPlan,
    type BusinessSubscription,
} from "@/lib/api/business-billing";
import { ApiClientError } from "@/lib/api/client";
import { getBusinessTrialStatus } from "@/features/business-trial/api/business-trial-api";
import { BUSINESS_PLANS } from "@/features/business-billing/plans";

type VerificationState = "idle" | "checking" | "pending" | "failed";

function BusinessPlanSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [interval, setInterval] = useState<BillingInterval>("month");
    const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
    const [loadingSubscription, setLoadingSubscription] = useState(true);
    const [pendingPlan, setPendingPlan] = useState<BusinessPlan | "portal" | null>(null);
    const [message, setMessage] = useState("");
    const [requiresSignIn, setRequiresSignIn] = useState(false);
    const [verification, setVerification] = useState<VerificationState>("idle");

    const readCheckoutStatus = useCallback(async () => {
        const current = await getBusinessSubscription();
        const activePlan = normalizeBusinessPlan(current.plan);
        if (hasActiveBusinessSubscription(current) && activePlan) {
            const trialStatus = await getBusinessTrialStatus();
            router.replace(
                trialStatus.onboardingComplete
                    ? "/business/dashboard"
                    : "/business/onboarding",
            );
            return null;
        }
        return current;
    }, [router]);

    const verifyCheckout = useCallback(async () => {
        setVerification("checking");
        setMessage("");
        try {
            const current = await readCheckoutStatus();
            if (current) {
                setSubscription(current);
                setVerification("pending");
                setMessage(
                    "Your checkout returned successfully. We’re still confirming the plan activation; check again shortly.",
                );
            }
        } catch (error: unknown) {
            if (error instanceof ApiClientError && error.status === 401) {
                setRequiresSignIn(true);
            } else {
                setMessage(
                    "We couldn’t confirm your plan yet. Your dashboard will remain protected until activation is verified.",
                );
            }
            setVerification("failed");
        }
        setLoadingSubscription(false);
    }, [readCheckoutStatus]);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get("checkout") === "success") {
            let current = true;
            readCheckoutStatus()
                .then((subscriptionStatus) => {
                    if (!current) return;
                    if (subscriptionStatus) {
                        setSubscription(subscriptionStatus);
                        setVerification("pending");
                        setMessage(
                            "Your checkout returned successfully. We’re still confirming the plan activation; check again shortly.",
                        );
                    }
                    setLoadingSubscription(false);
                })
                .catch((error: unknown) => {
                    if (!current) return;
                    if (error instanceof ApiClientError && error.status === 401) {
                        setRequiresSignIn(true);
                    } else {
                        setMessage(
                            "We couldn’t confirm your plan yet. Your dashboard will remain protected until activation is verified.",
                        );
                    }
                    setVerification("failed");
                    setLoadingSubscription(false);
                });
            return () => {
                current = false;
            };
        }
        let current = true;
        getBusinessSubscription()
            .then((result) => {
                if (current) setSubscription(result);
            })
            .catch((error: unknown) => {
                if (error instanceof ApiClientError && error.status === 401) {
                    if (current) setRequiresSignIn(true);
                    return;
                }
                if (current) {
                    setMessage(
                        "We couldn’t load your current plan. You can still review the available options.",
                    );
                }
            })
            .finally(() => {
                if (current) setLoadingSubscription(false);
            });

        return () => {
            current = false;
        };
    }, [readCheckoutStatus]);

    async function handleContinue(plan: BusinessPlan) {
        setPendingPlan(plan);
        setMessage("");
        try {
            const checkout = await createBusinessCheckout(plan, interval);
            window.location.assign(checkout.url);
        } catch (error: unknown) {
            if (error instanceof ApiClientError && error.status === 401) {
                router.push("/login?returnTo=%2Fbusiness%2Fupgrade");
                return;
            }
            setMessage(
                "Secure checkout isn’t available right now. No payment was taken. Please try again or contact support.",
            );
            setPendingPlan(null);
        }
    }

    async function handleManageBilling() {
        setPendingPlan("portal");
        setMessage("");
        try {
            const portal = await createBusinessBillingPortal();
            window.location.assign(portal.url);
        } catch (error: unknown) {
            if (error instanceof ApiClientError && error.status === 401) {
                router.push("/login?returnTo=%2Fbusiness%2Fupgrade");
                return;
            }
            setMessage(
                "We couldn’t open billing management. Please try again or contact support.",
            );
            setPendingPlan(null);
        }
    }

    const activePlan =
        subscription && hasActiveBusinessSubscription(subscription)
            ? normalizeBusinessPlan(subscription.plan)
            : null;
    const checkoutReturned =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("checkout") === "success";
    const checkoutCancelled =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("checkout") === "cancelled";
    const requestedPlan = searchParams.get("plan");

    return (
        <main className="business-flow min-h-screen px-4 py-8 sm:px-7 sm:py-12 lg:px-10">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--workspace-muted)] transition hover:text-[var(--workspace-green)]"
                >
                    <ArrowLeft size={15} aria-hidden="true" />
                    BCIP home
                </Link>

                <header className="mt-10 grid gap-7 border-b border-[var(--workspace-line)] pb-8 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="max-w-2xl">
                        <p className="business-eyebrow">Your business, your plan</p>
                        <h1 className="business-display mt-3 text-4xl leading-tight sm:text-5xl">
                            Choose the support that fits your business.
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--workspace-muted)]">
                            Start with the essentials, then bring more insight and coordination
                            into your customer care as you grow.
                        </p>
                    </div>
                    <div className="flex w-fit items-center gap-1 rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-card)] p-1">
                        {(["month", "year"] as const).map((choice) => (
                            <button
                                key={choice}
                                type="button"
                                aria-pressed={interval === choice}
                                onClick={() => setInterval(choice)}
                                className={`min-h-10 rounded-lg px-4 text-sm font-bold transition ${
                                    interval === choice
                                        ? "bg-[var(--workspace-green)] text-white"
                                        : "text-[var(--workspace-muted)] hover:text-[var(--workspace-ink)]"
                                }`}
                            >
                                {choice === "month" ? "Monthly" : "Yearly"}
                            </button>
                        ))}
                    </div>
                </header>

                {checkoutReturned && (
                    <section
                        aria-live="polite"
                        className={`mt-6 flex items-start gap-3 rounded-xl border p-4 ${
                            verification === "pending" || verification === "failed"
                                ? "border-[var(--workspace-line)] bg-[var(--workspace-card)]"
                                : "border-[var(--workspace-green)]/30 bg-[var(--workspace-green-wash)]"
                        }`}
                    >
                        {verification === "checking" ||
                        (verification === "idle" && checkoutReturned) ? (
                            <LoaderCircle className="mt-0.5 h-5 w-5 animate-spin text-[var(--workspace-green)]" />
                        ) : (
                            <CircleCheck className="mt-0.5 h-5 w-5 text-[var(--workspace-green)]" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-bold">
                                {verification === "checking" ||
                                (verification === "idle" && checkoutReturned)
                                    ? "Confirming your plan"
                                    : verification === "pending"
                                      ? "Activation is still in progress"
                                      : verification === "failed"
                                        ? "Plan status needs another check"
                                        : "Checkout complete"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--workspace-muted)]">
                                {message || "We’re checking your business account before opening your workspace."}
                            </p>
                            {verification !== "checking" &&
                                verification !== "idle" &&
                                !requiresSignIn && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVerification("checking");
                                            void verifyCheckout();
                                        }}
                                        className="mt-3 text-sm font-bold text-[var(--workspace-green)] underline underline-offset-4"
                                    >
                                        Check activation again
                                    </button>
                                )}
                            {requiresSignIn && (
                                <Link
                                    href="/login?returnTo=%2Fbusiness%2Fupgrade"
                                    className="mt-3 inline-block text-sm font-bold text-[var(--workspace-green)] underline underline-offset-4"
                                >
                                    Sign in to continue
                                </Link>
                            )}
                        </div>
                    </section>
                )}

                {!checkoutReturned && message && (
                    <p role="status" className="mt-5 rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-card)] p-4 text-sm text-[var(--workspace-muted)]">
                        {message}
                    </p>
                )}
                {checkoutCancelled && (
                    <p role="status" className="mt-5 rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-card)] p-4 text-sm text-[var(--workspace-muted)]">
                        Checkout was cancelled. No plan change was made.
                    </p>
                )}

                {requiresSignIn && !checkoutReturned && (
                    <p className="mt-5 text-sm text-[var(--workspace-muted)]">
                        <Link
                            href="/login?returnTo=%2Fbusiness%2Fupgrade"
                            className="font-bold text-[var(--workspace-green)] underline underline-offset-4"
                        >
                            Sign in
                        </Link>{" "}
                        to continue to secure checkout.
                    </p>
                )}

                {activePlan && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--workspace-green)]/25 bg-[var(--workspace-green-wash)] px-4 py-3">
                        <p className="text-sm font-semibold">
                            Your active plan is{" "}
                            <span className="font-extrabold capitalize">{activePlan}</span>.
                        </p>
                        <button
                            type="button"
                            onClick={() => void handleManageBilling()}
                            disabled={pendingPlan === "portal"}
                            className="business-button-secondary min-h-10 px-3 py-2 text-xs"
                        >
                            {pendingPlan === "portal" ? (
                                <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                            ) : (
                                <CreditCard size={15} aria-hidden="true" />
                            )}
                            Manage billing
                        </button>
                    </div>
                )}

                <section className="mt-7 grid gap-4 lg:grid-cols-3" aria-label="Available plans">
                    {BUSINESS_PLANS.map((plan) => {
                        const isCurrent = activePlan === plan.id;
                        const isSelected = requestedPlan === plan.id;
                        const isPending = pendingPlan === plan.id;

                        return (
                            <article
                                key={plan.id}
                                className={`business-card relative flex flex-col p-6 sm:p-7 ${
                                    isSelected
                                        ? "border-[var(--workspace-green)] ring-1 ring-[var(--workspace-green)]"
                                        : ""
                                }`}
                            >
                                {plan.featured && (
                                    <span className="mb-3 block w-fit rounded-full bg-[var(--workspace-acid)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--workspace-green-deep)]">
                                        A popular next step
                                    </span>
                                )}
                                <p className="business-eyebrow">{plan.audience}</p>
                                <h2 className="business-display mt-5 text-3xl">{plan.name}</h2>
                                <p className="mt-3 min-h-14 text-sm leading-6 text-[var(--workspace-muted)]">
                                    {plan.summary}
                                </p>

                                <div className="my-6 rounded-xl bg-[var(--workspace-paper)] p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--workspace-muted)]">
                                        {interval === "month" ? "Monthly billing" : "Yearly billing"}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        Review your exact price before confirming
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-[var(--workspace-muted)]">
                                        Stripe shows the configured amount, taxes, and renewal terms securely at checkout.
                                    </p>
                                </div>

                                <ul className="flex-1 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2.5 text-sm leading-5"
                                        >
                                            <Check
                                                size={16}
                                                className="mt-0.5 shrink-0 text-[var(--workspace-green)]"
                                                aria-hidden="true"
                                            />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isCurrent && !activePlan) {
                                            void handleContinue(plan.id);
                                        }
                                    }}
                                    disabled={
                                        loadingSubscription ||
                                        pendingPlan !== null ||
                                        requiresSignIn ||
                                        Boolean(activePlan)
                                    }
                                    className={`mt-7 w-full ${
                                        isCurrent || activePlan
                                            ? "business-button-secondary"
                                            : "business-button-primary"
                                    }`}
                                >
                                    {isPending ? (
                                        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                                    ) : isCurrent ? (
                                        <>
                                            Current plan
                                            <Check size={16} aria-hidden="true" />
                                        </>
                                    ) : activePlan ? (
                                        "Manage plan above"
                                    ) : loadingSubscription ? (
                                        "Loading plan…"
                                    ) : (
                                        <>
                                            Choose {plan.name}
                                            <ArrowRight size={16} aria-hidden="true" />
                                        </>
                                    )}
                                </button>
                            </article>
                        );
                    })}
                </section>

                <div className="mt-7 flex flex-col justify-between gap-4 border-t border-[var(--workspace-line)] pt-6 text-sm text-[var(--workspace-muted)] sm:flex-row sm:items-center">
                    <p className="flex items-start gap-2">
                        <LockKeyhole size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        Your price and renewal terms are confirmed before payment.
                    </p>
                    <Link
                        href="/contact"
                        className="font-bold text-[var(--workspace-green)] underline underline-offset-4"
                    >
                        Need help choosing? Talk to us
                    </Link>
                </div>
                <p className="mt-5 text-center text-sm text-[var(--workspace-muted)]">
                    Want to explore before subscribing?{" "}
                    <Link
                        href="/business/trial"
                        className="font-bold text-[var(--workspace-green)] underline underline-offset-4"
                    >
                        Start a 14-day trial
                    </Link>
                </p>
            </div>
        </main>
    );
}

export function BusinessPlanSelection() {
    return (
        <Suspense
            fallback={
                <main className="business-flow grid min-h-screen place-items-center">
                    <p role="status" className="text-sm text-[var(--workspace-muted)]">
                        Loading plans…
                    </p>
                </main>
            }
        >
            <BusinessPlanSelectionContent />
        </Suspense>
    );
}
