"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowUpRight,
    CalendarClock,
    CircleCheck,
    CreditCard,
    FileText,
    History,
    LoaderCircle,
    Pencil,
    ReceiptText,
    RotateCw,
} from "lucide-react";
import {
    cancelBusinessSubscription,
    createBusinessBillingPortal,
    getBillingProfile,
    getBusinessBillingHistory,
    getBusinessPlanName,
    getBusinessSubscription,
    getBusinessSubscriptionHistory,
    getBusinessUsage,
    hasActiveBusinessSubscription,
    normalizeBusinessPlan,
    resumeBusinessSubscription,
    type BillingProfileState,
    type BusinessSubscription,
    type BusinessUsage,
} from "@/lib/api/business-billing";
import { ApiClientError } from "@/lib/api/client";
import { getBusinessTrialStatus, type BusinessTrialStatus } from "@/features/business-trial/api/business-trial-api";
import { BillingAddressSummary, BillingDetailsForm } from "@/features/business-billing/components/BillingDetailsForm";
import { formatDate, formatMoney } from "@/features/business-billing/plan-format";

type HistoryEntry = Awaited<ReturnType<typeof getBusinessSubscriptionHistory>>[number];
type Invoice = Awaited<ReturnType<typeof getBusinessBillingHistory>>[number];

const ACTION_LABELS: Record<string, string> = {
    ACTIVATED: "Plan activated",
    DEMO_ACTIVATED: "Plan activated (demo)",
    PLAN_CHANGED: "Plan changed",
    DEMO_PLAN_CHANGED: "Plan changed (demo)",
    CANCELED: "Subscription ended",
    DEMO_CANCEL_SCHEDULED: "Cancellation scheduled",
    DEMO_CANCEL_REVOKED: "Cancellation withdrawn",
    STATUS_CHANGED: "Status updated",
    MIGRATED: "Plan migrated",
};

function Panel({ title, icon, action, children }: { title: string; icon: ReactNode; action?: ReactNode; children: ReactNode }) {
    return (
        <section className="rounded-[22px] border border-line bg-white p-6 text-ink sm:p-7">
            <div className="flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 text-base font-semibold text-ink">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-lilac text-brand">{icon}</span>
                    {title}
                </h2>
                {action}
            </div>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function UsageMeter({ label, used, limit, format }: { label: string; used: number; limit: number | null; format?: (value: number) => string }) {
    const show = format ?? ((value: number) => value.toLocaleString("en-US"));
    const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const tone = percent >= 90 ? "bg-rose-500" : percent >= 75 ? "bg-amber-500" : "bg-brand";
    return (
        <div>
            <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink-soft">{label}</span>
                <span className="font-medium text-ink">
                    {show(used)} <span className="text-subtle">/ {limit === null ? "Unlimited" : show(limit)}</span>
                </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label={label} aria-valuenow={limit ? percent : undefined} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full rounded-full ${limit === null ? "bg-line-strong" : tone}`} style={{ width: limit === null ? "100%" : `${Math.max(percent, 2)}%` }} />
            </div>
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}

export function BusinessBillingOverview() {
    const searchParams = useSearchParams();
    const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
    const [trialStatus, setTrialStatus] = useState<BusinessTrialStatus | null>(null);
    const [usage, setUsage] = useState<BusinessUsage | null>(null);
    const [billing, setBilling] = useState<BillingProfileState | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingProfile, setEditingProfile] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [pending, setPending] = useState<"cancel" | "resume" | "portal" | null>(null);
    const [notice, setNotice] = useState(searchParams.get("activated") ? "Your plan is active. Welcome aboard." : "");

    const load = useCallback(async () => {
        try {
            const [current, trial, profile, planHistory] = await Promise.all([
                getBusinessSubscription(),
                getBusinessTrialStatus(),
                getBillingProfile(),
                getBusinessSubscriptionHistory(),
            ]);
            setSubscription(current);
            setTrialStatus(trial);
            setBilling(profile);
            setHistory(planHistory);
            const [usageResult, invoiceResult] = await Promise.allSettled([
                getBusinessUsage(),
                current.customerId ? getBusinessBillingHistory() : Promise.resolve([]),
            ]);
            setUsage(usageResult.status === "fulfilled" ? usageResult.value : null);
            setInvoices(invoiceResult.status === "fulfilled" ? invoiceResult.value : []);
        } catch (loadError: unknown) {
            setError(
                loadError instanceof ApiClientError && loadError.status === 403
                    ? "Only the business administrator can view billing for this workspace."
                    : "We couldn’t load your billing information. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        void Promise.resolve().then(() => {
            if (active) void load();
        });
        return () => {
            active = false;
        };
    }, [load]);

    async function updateCancellation(cancel: boolean) {
        setPending(cancel ? "cancel" : "resume");
        setNotice("");
        try {
            const updated = cancel ? await cancelBusinessSubscription() : await resumeBusinessSubscription();
            setSubscription(updated);
            setConfirmCancel(false);
            setNotice(cancel
                ? `Your subscription will end on ${updated.currentPeriodEnd ? formatDate(updated.currentPeriodEnd) : "the renewal date"}. You keep full access until then.`
                : "Cancellation withdrawn. Your plan will renew as normal.");
            void getBusinessSubscriptionHistory().then(setHistory).catch(() => undefined);
        } catch {
            setNotice("We couldn’t update your subscription. Please try again.");
        } finally {
            setPending(null);
        }
    }

    async function openPortal() {
        setPending("portal");
        try {
            const portal = await createBusinessBillingPortal();
            window.location.assign(portal.url);
        } catch {
            setNotice("Payment method management isn’t available right now.");
            setPending(null);
        }
    }

    if (loading) {
        return (
            <p role="status" className="flex items-center gap-2 py-20 text-sm text-[var(--workspace-muted)]">
                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Loading plan & billing…
            </p>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-[var(--workspace-line)] bg-[var(--workspace-card)] p-6">
                <p className="text-sm">{error}</p>
                <button type="button" onClick={() => { setError(""); setLoading(true); void load(); }} className="business-button-secondary mt-4">
                    <RotateCw size={15} aria-hidden="true" /> Try again
                </button>
            </div>
        );
    }

    const isPaid = subscription ? hasActiveBusinessSubscription(subscription) : false;
    const paidPlan = isPaid ? normalizeBusinessPlan(subscription?.plan) : null;
    const trial = trialStatus?.trial?.active ? trialStatus.trial : null;
    const planName = paidPlan ? getBusinessPlanName(paidPlan) : trial ? getBusinessPlanName(trial.plan) : "No active plan";
    const cancelScheduled = Boolean(isPaid && subscription?.cancelAtPeriodEnd);
    const isStripe = subscription?.paymentProvider === "stripe";

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="business-eyebrow">Workspace administration</p>
                    <h1 className="business-display mt-2 text-3xl sm:text-4xl">Plan & billing</h1>
                    <p className="mt-2 text-sm text-[var(--workspace-muted)]">Manage your subscription, usage, invoices and billing details.</p>
                </div>
                <Link href="/business/upgrade" className="business-button-secondary">
                    Compare plans <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
            </header>

            {notice && (
                <p role="status" className="flex items-center gap-2 rounded-2xl border border-brand-soft bg-lilac-soft px-5 py-3 text-sm text-brand-strong">
                    <CircleCheck size={16} className="shrink-0 text-brand" aria-hidden="true" /> {notice}
                </p>
            )}

            <section className="relative overflow-hidden rounded-[26px] border border-brand-soft bg-wash p-7 text-ink sm:p-9">
                <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lilac blur-3xl" />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Current plan</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                cancelScheduled ? "bg-amber-50 text-amber-900" : isPaid || trial ? "bg-lilac text-brand" : "bg-rose-50 text-rose-800"
                            }`}>
                                {cancelScheduled ? "Cancels at period end" : isPaid ? (subscription?.status === "demo_active" ? "Active · demo" : "Active") : trial ? "Free trial" : "Inactive"}
                            </span>
                        </div>
                        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink">{planName}</h2>
                        <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                            {isPaid && subscription?.billingCycle && (
                                <span className="inline-flex items-center gap-1.5"><CreditCard size={14} aria-hidden="true" /> {subscription.billingCycle === "year" ? "Yearly" : "Monthly"} billing</span>
                            )}
                            {isPaid && subscription?.currentPeriodEnd && (
                                <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} aria-hidden="true" /> {cancelScheduled ? "Access until" : "Renews"} {formatDate(subscription.currentPeriodEnd)}</span>
                            )}
                            {!isPaid && trial && (
                                <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} aria-hidden="true" /> {trial.daysRemaining} {trial.daysRemaining === 1 ? "day" : "days"} left · ends {formatDate(trial.expiresAt)}</span>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {!isPaid ? (
                            <Link href="/business/upgrade" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-brand">
                                {trial ? "Upgrade now" : "Choose a plan"} <ArrowUpRight size={15} aria-hidden="true" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/business/upgrade" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-brand">
                                    Change plan
                                </Link>
                                {isStripe && (
                                    <button type="button" onClick={() => void openPortal()} disabled={pending !== null} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-5 text-sm font-semibold text-ink hover:border-line-strong disabled:opacity-60">
                                        {pending === "portal" ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <CreditCard size={15} aria-hidden="true" />}
                                        Payment method
                                    </button>
                                )}
                                {cancelScheduled ? (
                                    <button type="button" onClick={() => void updateCancellation(false)} disabled={pending !== null} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-5 text-sm font-semibold text-ink hover:border-line-strong disabled:opacity-60">
                                        {pending === "resume" && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
                                        Resume subscription
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => setConfirmCancel(true)} disabled={pending !== null} className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-muted hover:text-ink">
                                        Cancel plan
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {confirmCancel && (
                    <div className="relative mt-7 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                        <p className="text-sm font-semibold text-ink">Cancel {planName}?</p>
                        <p className="mt-1 text-sm leading-6 text-ink-soft">
                            Your workspace keeps every feature until {subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "the end of this billing period"}. After that, complaint intake and team access pause until you choose a plan again. You can resume anytime before then.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button type="button" onClick={() => void updateCancellation(true)} disabled={pending !== null} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                                {pending === "cancel" && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
                                Yes, cancel at period end
                            </button>
                            <button type="button" onClick={() => setConfirmCancel(false)} className="min-h-10 rounded-xl px-4 text-sm font-semibold text-ink-soft hover:text-ink">
                                Keep my plan
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <Panel title="Usage this cycle" icon={<History size={17} aria-hidden="true" />}>
                    {usage ? (
                        <div className="space-y-5">
                            <UsageMeter label="Complaints received" used={usage.usage.complaints.used} limit={usage.usage.complaints.limit} />
                            <UsageMeter label="AI analyses" used={usage.usage.aiAnalyses.used} limit={usage.usage.aiAnalyses.limit} />
                            <UsageMeter label="Team seats" used={usage.usage.teamMembers.used} limit={usage.usage.teamMembers.limit} />
                            <UsageMeter label="Evidence storage" used={usage.usage.storage.usedBytes} limit={usage.usage.storage.limitBytes} format={formatBytes} />
                            <p className="text-xs text-subtle">Monthly counters reset on {formatDate(usage.period.resetsAt)}.</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted">Usage appears once your workspace has an active plan.</p>
                    )}
                </Panel>

                <Panel
                    title="Billing details"
                    icon={<ReceiptText size={17} aria-hidden="true" />}
                    action={billing?.saved && !editingProfile ? (
                        <button type="button" onClick={() => setEditingProfile(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-line-strong hover:text-ink">
                            <Pencil size={13} aria-hidden="true" /> Edit
                        </button>
                    ) : undefined}
                >
                    {billing && (editingProfile || !billing.saved) ? (
                        <>
                            {!billing.saved && !editingProfile && (
                                <p className="mb-5 text-sm leading-6 text-muted">Add the details that should appear on your invoices. They’re required before activating a paid plan.</p>
                            )}
                            <BillingDetailsForm
                                initial={billing.profile}
                                submitLabel="Save billing details"
                                onCancel={billing.saved ? () => setEditingProfile(false) : undefined}
                                onSaved={(profile) => {
                                    setBilling({ saved: true, profile });
                                    setEditingProfile(false);
                                    setNotice("Billing details saved.");
                                }}
                            />
                        </>
                    ) : (
                        billing && <BillingAddressSummary profile={billing.profile} />
                    )}
                </Panel>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Panel title="Plan history" icon={<CalendarClock size={17} aria-hidden="true" />}>
                    {history.length === 0 ? (
                        <p className="text-sm text-muted">Plan changes will appear here.</p>
                    ) : (
                        <ol className="space-y-4">
                            {history.slice(0, 8).map((entry) => (
                                <li key={entry.id} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium text-ink">{ACTION_LABELS[entry.action] ?? entry.action.replace(/_/g, " ").toLowerCase()}</p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {entry.previousPlan && entry.newPlan && entry.previousPlan !== entry.newPlan
                                                ? `${getBusinessPlanName(entry.previousPlan)} → ${getBusinessPlanName(entry.newPlan)}`
                                                : entry.newPlan ? getBusinessPlanName(entry.newPlan) : "—"}
                                        </p>
                                    </div>
                                    <time className="shrink-0 text-xs text-subtle" dateTime={entry.effectiveDate}>{formatDate(entry.effectiveDate)}</time>
                                </li>
                            ))}
                        </ol>
                    )}
                </Panel>

                <Panel title="Invoices" icon={<FileText size={17} aria-hidden="true" />}>
                    {invoices.length === 0 ? (
                        <p className="text-sm leading-6 text-muted">
                            {subscription?.status === "demo_active"
                                ? "Demo activations don’t generate invoices."
                                : "Invoices from your payment provider will appear here after your first payment."}
                        </p>
                    ) : (
                        <ul className="divide-y divide-line">
                            {invoices.slice(0, 10).map((invoice) => (
                                <li key={invoice.id} className="flex items-center justify-between gap-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-ink">
                                            {invoice.amountPaid !== null && invoice.currency ? formatMoney(invoice.amountPaid, invoice.currency) : "—"}
                                        </p>
                                        <p className="text-xs capitalize text-muted">{invoice.status}{invoice.createdAt ? ` · ${formatDate(invoice.createdAt)}` : ""}</p>
                                    </div>
                                    {invoice.hostedInvoiceUrl && (
                                        <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand hover:underline">View invoice</a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </div>
    );
}
