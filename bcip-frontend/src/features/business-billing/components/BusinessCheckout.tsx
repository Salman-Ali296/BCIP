"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CircleCheck,
    CreditCard,
    FlaskConical,
    LoaderCircle,
    LockKeyhole,
    Pencil,
    ReceiptText,
} from "lucide-react";
import {
    changeBusinessSubscription,
    createBusinessCheckout,
    createDemoBusinessCheckout,
    getBillingProfile,
    getBusinessPlanName,
    getBusinessPlans,
    getBusinessSubscription,
    hasActiveBusinessSubscription,
    normalizeBusinessPlan,
    type BillingInterval,
    type BillingProfile,
    type BusinessPlanCatalogItem,
    type BusinessSubscription,
} from "@/lib/api/business-billing";
import { ApiClientError } from "@/lib/api/client";
import {
    BusinessTrialApiError,
    getBusinessTrialStatus,
    type BusinessTrialStatus,
} from "@/features/business-trial/api/business-trial-api";
import { BillingPageShell, Eyebrow, Notice } from "@/features/business-billing/components/BillingPageShell";
import { BillingAddressSummary, BillingDetailsForm } from "@/features/business-billing/components/BillingDetailsForm";
import { IntervalToggle } from "@/features/business-billing/components/PlanCatalog";
import {
    addInterval,
    formatDate,
    formatLimit,
    formatMoney,
    intervalLabel,
    yearlySavingsCents,
} from "@/features/business-billing/plan-format";

type Step = "details" | "review" | "done";

interface ActivationResult {
    planName: string;
    interval: BillingInterval;
    periodEnd: string | null;
    demo: boolean;
}

function isUnauthorized(error: unknown): boolean {
    return (error instanceof ApiClientError || error instanceof BusinessTrialApiError) && error.status === 401;
}

function StepIndicator({ step }: { step: Step }) {
    const steps: Array<{ id: Step; label: string }> = [
        { id: "details", label: "Billing details" },
        { id: "review", label: "Review & confirm" },
        { id: "done", label: "Plan active" },
    ];
    const index = steps.findIndex((item) => item.id === step);
    return (
        <ol className="flex flex-wrap items-center gap-3 text-sm" aria-label="Checkout progress">
            {steps.map((item, itemIndex) => {
                const complete = itemIndex < index;
                const current = itemIndex === index;
                return (
                    <li key={item.id} className="flex items-center gap-3">
                        <span className={`flex items-center gap-2 ${current ? "text-ink" : complete ? "text-brand" : "text-subtle"}`} aria-current={current ? "step" : undefined}>
                            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                                complete ? "bg-brand text-white" : current ? "border border-brand text-brand" : "border border-line"
                            }`}>
                                {complete ? <Check size={14} aria-hidden="true" /> : itemIndex + 1}
                            </span>
                            <span className="font-medium">{item.label}</span>
                        </span>
                        {itemIndex < steps.length - 1 && <span className="hidden h-px w-8 bg-line sm:block" aria-hidden="true" />}
                    </li>
                );
            })}
        </ol>
    );
}

function BusinessCheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan") ?? "";
    const [interval, setInterval] = useState<BillingInterval>(searchParams.get("interval") === "month" ? "month" : "year");

    const [plans, setPlans] = useState<BusinessPlanCatalogItem[]>([]);
    const [profile, setProfile] = useState<BillingProfile | null>(null);
    const [profileSaved, setProfileSaved] = useState(false);
    const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
    const [trialStatus, setTrialStatus] = useState<BusinessTrialStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [step, setStep] = useState<Step>("details");
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [result, setResult] = useState<ActivationResult | null>(null);

    const load = useCallback(async () => {
        try {
            const [catalog, billing, current, trial] = await Promise.all([
                getBusinessPlans(),
                getBillingProfile(),
                getBusinessSubscription(),
                getBusinessTrialStatus(),
            ]);
            setPlans(catalog);
            setProfile(billing.profile);
            setProfileSaved(billing.saved);
            setSubscription(current);
            setTrialStatus(trial);
            setStep(billing.saved ? "review" : "details");
        } catch (error: unknown) {
            if (isUnauthorized(error)) {
                router.replace(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                return;
            }
            setLoadError(
                error instanceof ApiClientError && error.status === 403
                    ? "Only the business administrator can manage billing for this workspace."
                    : "We couldn’t prepare checkout. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        let active = true;
        void Promise.resolve().then(() => {
            if (active) void load();
        });
        return () => {
            active = false;
        };
    }, [load]);

    const plan = useMemo(() => plans.find((item) => item.id === planId) ?? null, [plans, planId]);
    const activePlan = subscription && hasActiveBusinessSubscription(subscription) ? normalizeBusinessPlan(subscription.plan) : null;
    const isChange = Boolean(activePlan);
    const trial = trialStatus?.trial?.active ? trialStatus.trial : null;
    const amount = plan ? plan.pricing.amountCents[interval] : 0;
    const savings = plan && interval === "year" ? yearlySavingsCents(plan) : 0;
    const renewsOn = addInterval(new Date(), interval);
    const isSamePlan = activePlan === planId && subscription?.billingCycle === interval;
    const intervalAvailable = plan ? plan.billingIntervals[interval] : false;
    const usesDemo = Boolean(plan?.demoCheckoutAvailable && (!isChange || subscription?.status === "demo_active"));

    async function confirm() {
        if (!plan || !agreed) return;
        setSubmitting(true);
        setSubmitError("");
        try {
            if (isChange) {
                const updated = await changeBusinessSubscription(plan.id, interval);
                setResult({ planName: plan.name, interval, periodEnd: updated.currentPeriodEnd, demo: updated.mode === "demo" });
                setStep("done");
            } else if (plan.demoCheckoutAvailable) {
                const activation = await createDemoBusinessCheckout(plan.id, interval);
                setResult({ planName: plan.name, interval, periodEnd: activation.periodEndsAt, demo: true });
                setStep("done");
            } else {
                const session = await createBusinessCheckout(plan.id, interval);
                window.location.assign(session.url);
                return;
            }
        } catch (error: unknown) {
            if (isUnauthorized(error)) {
                router.replace("/login?returnTo=%2Fbusiness%2Fupgrade");
                return;
            }
            if (error instanceof ApiClientError && error.code === "BILLING_PROFILE_REQUIRED") {
                setProfileSaved(false);
                setStep("details");
                setSubmitError("Add your billing details to continue.");
            } else {
                setSubmitError(
                    error instanceof ApiClientError && error.message
                        ? `${error.message} No payment was taken.`
                        : "We couldn’t activate this plan. No payment was taken; please try again.",
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <BillingPageShell backHref="/business/upgrade" backLabel="All plans">
                <p role="status" className="flex items-center justify-center gap-2 py-24 text-sm text-muted">
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Preparing secure checkout…
                </p>
            </BillingPageShell>
        );
    }

    if (loadError || !plan) {
        return (
            <BillingPageShell backHref="/business/upgrade" backLabel="All plans">
                <div className="mx-auto max-w-lg py-16 text-center">
                    <h1 className="text-2xl font-semibold text-ink">{loadError ? "Checkout isn’t available" : "Choose a plan first"}</h1>
                    <p className="mt-3 text-sm leading-6 text-muted">
                        {loadError || "This plan isn’t available. Pick one of the current plans to continue."}
                    </p>
                    <Link href="/business/upgrade" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-brand">
                        <ArrowLeft size={16} aria-hidden="true" /> View plans
                    </Link>
                </div>
            </BillingPageShell>
        );
    }

    if (step === "done" && result) {
        const nextHref = trialStatus?.onboardingComplete ? "/business/dashboard" : "/business/onboarding";
        return (
            <BillingPageShell>
                <section className="mx-auto max-w-xl py-10 text-center">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-brand-soft bg-lilac">
                        <CircleCheck size={30} className="text-brand" aria-hidden="true" />
                    </span>
                    <h1 className="mt-7 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{result.planName} is active.</h1>
                    <p className="mt-4 text-base leading-7 text-muted">
                        Your workspace now has every {result.planName} capability on {result.interval === "year" ? "yearly" : "monthly"} billing
                        {result.periodEnd ? `, renewing ${formatDate(result.periodEnd)}` : ""}.
                    </p>
                    {result.demo && (
                        <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900">
                            <FlaskConical size={14} aria-hidden="true" /> Development demo: no real payment was processed.
                        </p>
                    )}
                    <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link href={nextHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white hover:bg-brand">
                            {trialStatus?.onboardingComplete ? "Go to dashboard" : "Configure your workspace"} <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        <Link href="/business/billing" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line px-6 text-sm font-semibold text-ink hover:border-line-strong">
                            View billing
                        </Link>
                    </div>
                </section>
            </BillingPageShell>
        );
    }

    return (
        <BillingPageShell backHref="/business/upgrade" backLabel="All plans">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <Eyebrow>{isChange ? "Change plan" : trial ? "Upgrade from trial" : "Checkout"}</Eyebrow>
                    <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        {isChange ? `Switch to ${plan.name}` : `Activate ${plan.name}`}
                    </h1>
                </div>
                <StepIndicator step={step} />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
                <section className="rounded-[24px] border border-line bg-white p-6 sm:p-8">
                    {submitError && <div className="mb-6"><Notice tone="error">{submitError}</Notice></div>}

                    {step === "details" && profile && (
                        <>
                            <div className="mb-7 flex items-start gap-4">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lilac">
                                    <ReceiptText size={19} className="text-brand" aria-hidden="true" />
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold text-ink">Billing details</h2>
                                    <p className="mt-1 text-sm leading-6 text-muted">
                                        These appear on your invoices and receipts. We’ve prefilled what we know from your business registration.
                                    </p>
                                </div>
                            </div>
                            <BillingDetailsForm
                                initial={profile}
                                submitLabel="Save and continue"
                                onCancel={profileSaved ? () => setStep("review") : undefined}
                                onSaved={(saved) => {
                                    setProfile(saved);
                                    setProfileSaved(true);
                                    setSubmitError("");
                                    setStep("review");
                                }}
                            />
                        </>
                    )}

                    {step === "review" && profile && (
                        <>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-ink">Billed to</h2>
                                    <div className="mt-3"><BillingAddressSummary profile={profile} /></div>
                                </div>
                                <button type="button" onClick={() => setStep("details")} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink-soft hover:border-line-strong hover:text-ink">
                                    <Pencil size={13} aria-hidden="true" /> Edit
                                </button>
                            </div>

                            <div className="mt-7 border-t border-line pt-7">
                                <h2 className="text-lg font-semibold text-ink">Payment</h2>
                                {usesDemo ? (
                                    <div className="mt-3 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                        <FlaskConical size={18} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                                        <p>
                                            <span className="font-semibold">Development demo checkout.</span> Confirming activates the plan immediately without processing a payment. In production, payment is collected through secure Stripe checkout.
                                        </p>
                                    </div>
                                ) : isChange ? (
                                    <p className="mt-3 text-sm leading-6 text-muted">
                                        Your saved payment method will be used. The difference is prorated on your next invoice.
                                    </p>
                                ) : (
                                    <div className="mt-3 flex gap-3 rounded-2xl border border-line bg-wash p-4 text-sm leading-6 text-ink-soft">
                                        <CreditCard size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                                        <p>You’ll enter your card on Stripe’s secure payment page. BCIP never sees or stores your card number.</p>
                                    </div>
                                )}
                            </div>

                            {trial && !isChange && (
                                <p className="mt-6 rounded-2xl border border-brand-soft bg-lilac p-4 text-sm leading-6 text-brand-strong">
                                    Your {getBusinessPlanName(trial.plan)} trial ({trial.daysRemaining} {trial.daysRemaining === 1 ? "day" : "days"} left) ends when {plan.name} starts. Your workspace, team and complaints stay exactly as they are.
                                </p>
                            )}

                            <label className="mt-7 flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink-soft">
                                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-brand" />
                                <span>
                                    I agree that {plan.name} renews automatically every {interval === "year" ? "year" : "month"} at {formatMoney(amount, plan.pricing.currency)} until cancelled. I can cancel anytime from Plan & billing.
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={() => void confirm()}
                                disabled={!agreed || submitting || isSamePlan || !intervalAvailable}
                                className="mt-7 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
                                {isSamePlan
                                    ? "This is your current plan"
                                    : !intervalAvailable
                                      ? `${intervalLabel(interval)} billing unavailable`
                                      : submitting
                                        ? "Processing…"
                                        : isChange
                                          ? `Confirm switch to ${plan.name}`
                                          : usesDemo
                                            ? `Activate ${plan.name}`
                                            : "Continue to secure payment"}
                            </button>
                        </>
                    )}
                </section>

                <aside className="rounded-[24px] border border-brand-soft bg-gradient-to-b from-lilac to-white p-6 sm:p-8 lg:sticky lg:top-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Order summary</p>
                    <div className="mt-4 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-ink">{plan.name}</h2>
                            <p className="mt-1 text-sm text-muted">{plan.audience}</p>
                        </div>
                        <Link href={`/business/upgrade?interval=${interval}`} className="text-xs font-semibold text-brand hover:underline">Change</Link>
                    </div>

                    <div className="mt-6"><IntervalToggle interval={interval} onChange={setInterval} /></div>

                    <dl className="mt-7 space-y-3 border-t border-line pt-6 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted">{plan.name} · {intervalLabel(interval)}</dt>
                            <dd className="font-medium text-ink">{formatMoney(amount, plan.pricing.currency)}</dd>
                        </div>
                        {savings > 0 && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted">Yearly saving</dt>
                                <dd className="font-medium text-brand">−{formatMoney(savings, plan.pricing.currency)}</dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-4 border-t border-line pt-4 text-base">
                            <dt className="font-semibold text-ink">{isChange && !usesDemo ? "New recurring price" : "Due today"}</dt>
                            <dd className="font-semibold text-ink">{formatMoney(amount, plan.pricing.currency)}</dd>
                        </div>
                        <p className="text-xs leading-5 text-subtle">
                            {isChange && !usesDemo
                                ? "Prorated credit for your current plan is applied automatically."
                                : `Renews ${formatDate(renewsOn)}. Taxes may apply based on your billing address.`}
                        </p>
                    </dl>

                    <div className="mt-7 border-t border-line pt-6">
                        <p className="text-sm font-semibold text-ink">What’s included</p>
                        <ul className="mt-4 space-y-2.5">
                            {[
                                `${formatLimit(plan.limits.complaintsPerMonth)} complaints per month`,
                                `${formatLimit(plan.limits.teamMembers)} team seats`,
                                `${formatLimit(plan.limits.aiAnalysesPerMonth)} AI analyses per month`,
                                ...plan.highlights.filter((item) => !item.startsWith("Up to")),
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                                    <Check size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </BillingPageShell>
    );
}

export function BusinessCheckout() {
    return (
        <Suspense fallback={<div className="grid min-h-screen place-items-center bg-wash text-sm text-muted">Preparing checkout…</div>}>
            <BusinessCheckoutContent />
        </Suspense>
    );
}
