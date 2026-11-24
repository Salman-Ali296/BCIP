"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CalendarClock, CircleCheck, Clock3, LoaderCircle, RotateCw } from "lucide-react";
import {
    getBusinessPlanName,
    getBusinessPlans,
    getBusinessSubscription,
    hasActiveBusinessSubscription,
    normalizeBusinessPlan,
    type BillingInterval,
    type BusinessPlanCatalogItem,
    type BusinessSubscription,
} from "@/lib/api/business-billing";
import { ApiClientError } from "@/lib/api/client";
import {
    BusinessTrialApiError,
    getBusinessTrialStatus,
    type BusinessTrialStatus,
} from "@/features/business-trial/api/business-trial-api";
import { useAuth } from "@/providers/auth-provider";
import { BillingPageShell, Eyebrow, Notice } from "@/features/business-billing/components/BillingPageShell";
import {
    PlanCatalog,
    PlanCatalogSkeleton,
    PlanComparison,
    PlanFaq,
    type PlanAction,
} from "@/features/business-billing/components/PlanCatalog";
import { formatDate } from "@/features/business-billing/plan-format";

const TRIAL_DAYS = 14;

function isUnauthorized(error: unknown): boolean {
    return (
        (error instanceof ApiClientError || error instanceof BusinessTrialApiError) &&
        error.status === 401
    );
}

function checkoutHref(planId: string, interval: BillingInterval): string {
    return `/business/checkout?plan=${encodeURIComponent(planId)}&interval=${interval}`;
}

function BusinessPlanSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshSession } = useAuth();
    const requiresBusinessApproval = user?.accountType === "BUSINESS" && user.businessVerified !== true;
    const requestedInterval = searchParams.get("interval");
    const checkoutState = searchParams.get("checkout");

    const [interval, setInterval] = useState<BillingInterval>(requestedInterval === "month" ? "month" : "year");
    const [plans, setPlans] = useState<BusinessPlanCatalogItem[]>([]);
    const [plansError, setPlansError] = useState("");
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
    const [trialStatus, setTrialStatus] = useState<BusinessTrialStatus | null>(null);
    const [loadingAccount, setLoadingAccount] = useState(!requiresBusinessApproval);
    const [requiresSignIn, setRequiresSignIn] = useState(false);
    const [verifying, setVerifying] = useState(checkoutState === "success");
    const [message, setMessage] = useState("");
    const [checkingApproval, setCheckingApproval] = useState(false);

    useEffect(() => {
        let active = true;
        getBusinessPlans()
            .then((result) => {
                if (active) setPlans(result);
            })
            .catch(() => {
                if (active) setPlansError("We couldn’t load the available plans. Please try again.");
            })
            .finally(() => {
                if (active) setLoadingPlans(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const loadAccount = useCallback(async () => {
        const [trial, current] = await Promise.all([getBusinessTrialStatus(), getBusinessSubscription()]);
        setTrialStatus(trial);
        setSubscription(current);
        return { trial, current };
    }, []);

    const verifyCheckout = useCallback(async () => {
        try {
            const { trial, current } = await loadAccount();
            if (hasActiveBusinessSubscription(current) && normalizeBusinessPlan(current.plan)) {
                router.replace(trial.onboardingComplete ? "/business/billing?activated=1" : "/business/onboarding");
                return;
            }
            setMessage("Your payment was submitted. We’re still confirming activation with the payment provider. Check again in a few seconds.");
        } catch (error: unknown) {
            if (isUnauthorized(error)) setRequiresSignIn(true);
            else setMessage("We couldn’t confirm your plan yet. Your workspace stays protected until activation is verified.");
        } finally {
            setVerifying(false);
        }
    }, [loadAccount, router]);

    useEffect(() => {
        if (requiresBusinessApproval) return;
        let active = true;
        void Promise.resolve()
            .then(() => {
                if (!active) return undefined;
                if (checkoutState === "success") return verifyCheckout();
                return loadAccount().then(() => undefined).catch((error: unknown) => {
                    if (!active) return;
                    if (isUnauthorized(error)) setRequiresSignIn(true);
                    else setMessage("We couldn’t load your current plan. You can still compare the options below.");
                });
            })
            .finally(() => {
                if (active) setLoadingAccount(false);
            });
        return () => {
            active = false;
        };
    }, [checkoutState, loadAccount, requiresBusinessApproval, verifyCheckout]);

    async function checkApproval() {
        setCheckingApproval(true);
        try {
            await refreshSession();
        } finally {
            setCheckingApproval(false);
        }
    }

    const activePlan = subscription && hasActiveBusinessSubscription(subscription)
        ? normalizeBusinessPlan(subscription.plan)
        : null;
    const trial = trialStatus?.trial?.active ? trialStatus.trial : null;
    const canStartTrial = trialStatus?.canAcceptTrial === true;
    const workspaceHome = trialStatus?.onboardingComplete ? "/business/dashboard" : "/business/onboarding";

    function actionFor(plan: BusinessPlanCatalogItem): PlanAction {
        if (requiresSignIn) return { label: "Sign in to continue", href: "/login?returnTo=%2Fbusiness%2Fupgrade" };
        if (requiresBusinessApproval) return { label: "Available after approval", disabled: true };
        if (loadingAccount) return { label: "Checking your plan…", disabled: true, pending: true };
        if (plan.customPricing) return { label: "Talk to sales", href: "/contact" };
        if (activePlan === plan.id && subscription?.billingCycle === interval) {
            return { label: "Your current plan", disabled: true };
        }
        if (activePlan) {
            const sameTier = activePlan === plan.id;
            return {
                label: sameTier ? `Switch to ${interval === "year" ? "yearly" : "monthly"} billing` : `Switch to ${plan.name}`,
                href: `${checkoutHref(plan.id, interval)}&change=1`,
            };
        }
        if (!plan.billingIntervals[interval]) {
            return { label: `${interval === "year" ? "Yearly" : "Monthly"} checkout unavailable`, disabled: true };
        }
        if (plan.trialAvailable && trial) {
            return { label: "Continue your trial", href: workspaceHome, note: `${trial.daysRemaining} ${trial.daysRemaining === 1 ? "day" : "days"} remaining` };
        }
        if (plan.trialAvailable && canStartTrial) {
            return { label: "Start 14-day free trial", href: "/business/trial", note: "No card required" };
        }
        return { label: trial ? `Upgrade to ${plan.name}` : `Choose ${plan.name}`, href: checkoutHref(plan.id, interval) };
    }

    function badgeFor(plan: BusinessPlanCatalogItem): string | null {
        if (activePlan === plan.id) return subscription?.billingCycle === "year" ? "Current · yearly" : "Current · monthly";
        if (trial && normalizeBusinessPlan(trial.plan) === plan.id) return "On trial";
        return null;
    }

    const trialProgress = trial ? Math.min(100, Math.max(4, ((TRIAL_DAYS - trial.daysRemaining) / TRIAL_DAYS) * 100)) : 0;

    return (
        <BillingPageShell
            backHref={trialStatus?.onboardingComplete ? "/business/dashboard" : "/"}
            backLabel={trialStatus?.onboardingComplete ? "Back to workspace" : "BCIP home"}
        >
            <section className="mx-auto max-w-3xl text-center">
                <Eyebrow>{activePlan ? "Change your plan" : trial ? "Upgrade your trial" : "Plans for your business"}</Eyebrow>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-ink sm:text-5xl">
                    {activePlan
                        ? "Scale your plan as your team grows."
                        : trial
                          ? "Keep everything you’ve set up. Unlock more."
                          : "Choose the plan that fits your complaint operations."}
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                    Pick a tier and a billing period. You’ll confirm your billing details and review the total before anything is charged.
                </p>
            </section>

            <div className="mx-auto mt-10 max-w-4xl space-y-4">
                {verifying && (
                    <Notice>
                        <span className="flex items-center gap-2"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Confirming your plan activation…</span>
                    </Notice>
                )}
                {checkoutState === "cancelled" && <Notice>Checkout was cancelled. No payment was taken and your plan is unchanged.</Notice>}
                {message && (
                    <Notice>
                        <p>{message}</p>
                        {checkoutState === "success" && !verifying && (
                            <button type="button" onClick={() => { setVerifying(true); setMessage(""); void verifyCheckout(); }} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
                                <RotateCw size={14} aria-hidden="true" /> Check activation again
                            </button>
                        )}
                    </Notice>
                )}
                {plansError && <Notice tone="error">{plansError}</Notice>}
                {requiresBusinessApproval && (
                    <Notice>
                        <p className="font-semibold text-ink">Your business registration is under review.</p>
                        <p className="mt-1">Compare plans now. The free trial and checkout open as soon as an administrator approves your business.</p>
                        <button type="button" onClick={() => void checkApproval()} disabled={checkingApproval} className="mt-2 font-semibold text-brand hover:underline disabled:opacity-60">
                            {checkingApproval ? "Checking approval…" : "Check approval status"}
                        </button>
                    </Notice>
                )}

                {trial && !activePlan && (
                    <div className="flex flex-col gap-4 rounded-2xl border border-brand-soft bg-lilac p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lilac">
                                <Clock3 size={19} className="text-brand" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">
                                    {getBusinessPlanName(trial.plan)} trial · {trial.daysRemaining} {trial.daysRemaining === 1 ? "day" : "days"} left
                                </p>
                                <p className="mt-1 text-sm text-muted">Ends {formatDate(trial.expiresAt)}. Upgrade anytime; your workspace and data carry over.</p>
                                <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-line" aria-hidden="true">
                                    <div className="h-full rounded-full bg-brand" style={{ width: `${trialProgress}%` }} />
                                </div>
                            </div>
                        </div>
                        <Link href={workspaceHome} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                            {trialStatus?.onboardingComplete ? "Open workspace" : "Continue setup"} <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                )}

                {activePlan && subscription && (
                    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-wash p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lilac">
                                <CircleCheck size={19} className="text-brand" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-ink">
                                    {getBusinessPlanName(activePlan)} · {subscription.billingCycle === "year" ? "Yearly" : "Monthly"} billing
                                </p>
                                {subscription.currentPeriodEnd && (
                                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                                        <CalendarClock size={14} aria-hidden="true" />
                                        {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} {formatDate(subscription.currentPeriodEnd)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Link href="/business/billing" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                            Manage billing <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-12">
                {loadingPlans ? (
                    <PlanCatalogSkeleton />
                ) : (
                    plans.length > 0 && (
                        <PlanCatalog
                            plans={plans}
                            interval={interval}
                            onIntervalChange={setInterval}
                            actionFor={actionFor}
                            badgeFor={badgeFor}
                        />
                    )
                )}
            </div>

            {!activePlan && !requiresBusinessApproval && !loadingAccount && (trial || canStartTrial) && (
                <p className="mt-8 text-center text-sm text-muted">
                    Prefer to skip the trial?{" "}
                    <Link href={checkoutHref("starter", interval)} className="font-semibold text-brand hover:underline">
                        Buy Starter now
                    </Link>
                </p>
            )}

            {!loadingPlans && plans.length > 0 && <PlanComparison plans={plans} />}
            <PlanFaq />
        </BillingPageShell>
    );
}

export function BusinessPlanSelection() {
    return (
        <Suspense
            fallback={
                <div className="grid min-h-screen place-items-center bg-wash text-sm text-muted">Loading plans…</div>
            }
        >
            <BusinessPlanSelectionContent />
        </Suspense>
    );
}
