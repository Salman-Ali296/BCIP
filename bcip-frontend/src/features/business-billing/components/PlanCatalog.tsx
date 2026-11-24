"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ArrowRight, Check, LoaderCircle, Minus, Sparkles } from "lucide-react";
import type { BillingInterval, BusinessPlanCatalogItem } from "@/lib/api/business-billing";
import {
    billedLine,
    formatLimit,
    formatMoney,
    formatRetention,
    formatStorage,
    headlinePrice,
    yearlySavingsCents,
} from "@/features/business-billing/plan-format";

export interface PlanAction {
    label: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    pending?: boolean;
    note?: string;
}

interface PlanCatalogProps {
    plans: BusinessPlanCatalogItem[];
    interval: BillingInterval;
    onIntervalChange: (interval: BillingInterval) => void;
    actionFor: (plan: BusinessPlanCatalogItem) => PlanAction;
    currentPlanId?: string | null;
    badgeFor?: (plan: BusinessPlanCatalogItem) => string | null;
}

export function IntervalToggle({
    interval,
    onChange,
}: {
    interval: BillingInterval;
    onChange: (interval: BillingInterval) => void;
}) {
    return (
        <div
            role="radiogroup"
            aria-label="Billing period"
            className="inline-flex items-center gap-1 rounded-full border border-line bg-wash p-1"
        >
            {(["month", "year"] as const).map((choice) => {
                const selected = interval === choice;
                return (
                    <button
                        key={choice}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(choice)}
                        className={`inline-flex min-h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition ${
                            selected
                                ? "bg-ink text-white shadow-[0_8px_20px_rgba(32,18,57,0.16)]"
                                : "text-ink-soft hover:text-ink"
                        }`}
                    >
                        {choice === "month" ? "Monthly" : "Yearly"}
                        {choice === "year" && (
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    selected ? "bg-white/20 text-white" : "bg-lilac text-brand"
                                }`}
                            >
                                2 months free
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function ActionButton({ action, featured }: { action: PlanAction; featured: boolean }) {
    const className = `group mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${
        featured
            ? "bg-ink text-white hover:-translate-y-0.5 hover:bg-brand disabled:hover:translate-y-0"
            : "border border-line bg-wash text-ink hover:border-line-strong hover:bg-brand/[0.06]"
    }`;
    const content: ReactNode = (
        <>
            {action.pending && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
            {action.label}
            {!action.pending && !action.disabled && (
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
            )}
        </>
    );
    if (action.href && !action.disabled) {
        return <Link href={action.href} className={className}>{content}</Link>;
    }
    return (
        <button type="button" onClick={action.onClick} disabled={action.disabled || action.pending} className={className}>
            {content}
        </button>
    );
}

function PlanCard({
    plan,
    interval,
    action,
    isCurrent,
    badge,
}: {
    plan: BusinessPlanCatalogItem;
    interval: BillingInterval;
    action: PlanAction;
    isCurrent: boolean;
    badge: string | null;
}) {
    const price = headlinePrice(plan, interval);
    const savings = interval === "year" ? yearlySavingsCents(plan) : 0;
    const featured = plan.featured === true;

    return (
        <article
            className={`relative flex flex-col rounded-[24px] border p-7 transition sm:p-8 ${
                featured
                    ? "border-brand-soft bg-gradient-to-b from-lilac via-white to-white shadow-[0_30px_80px_-30px_rgba(107,66,216,0.35)] lg:-translate-y-3"
                    : "border-line bg-white hover:border-line"
            }`}
        >
            {featured && (
                <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                    <Sparkles size={12} aria-hidden="true" /> Most popular
                </span>
            )}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{plan.audience}</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{plan.name}</h3>
                </div>
                {(isCurrent || badge) && (
                    <span className="shrink-0 rounded-full border border-brand-soft bg-lilac px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
                        {isCurrent ? "Current plan" : badge}
                    </span>
                )}
            </div>
            <p className="mt-3 min-h-[3rem] text-sm leading-6 text-muted">{plan.tagline}</p>

            <div className="mt-6 flex items-end gap-1.5">
                {price ? (
                    <>
                        <span className="text-5xl font-semibold tracking-[-0.04em] text-ink">{price}</span>
                        <span className="pb-1.5 text-sm text-muted">/ month</span>
                    </>
                ) : (
                    <span className="text-4xl font-semibold tracking-tight text-ink">Custom</span>
                )}
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                {billedLine(plan, interval)}
                {savings > 0 && (
                    <span className="rounded-full bg-lilac px-2 py-0.5 font-semibold text-brand">
                        Save {formatMoney(savings, plan.pricing.currency)}
                    </span>
                )}
            </p>

            <ActionButton action={action} featured={featured} />
            {action.note && <p className="mt-3 text-center text-xs text-subtle">{action.note}</p>}

            <dl className="mt-7 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-wash p-3 text-center">
                {[
                    ["Complaints/mo", formatLimit(plan.limits.complaintsPerMonth)],
                    ["Team seats", formatLimit(plan.limits.teamMembers)],
                    ["AI analyses", formatLimit(plan.limits.aiAnalysesPerMonth)],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-[10px] font-medium uppercase tracking-wider text-subtle">{label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
                    </div>
                ))}
            </dl>

            <ul className="mt-7 flex-1 space-y-3 border-t border-line pt-6">
                {plan.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-sm leading-5 text-ink-soft">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lilac">
                            <Check size={12} className="text-brand" aria-hidden="true" />
                        </span>
                        {highlight}
                    </li>
                ))}
            </ul>
        </article>
    );
}

export function PlanComparison({ plans }: { plans: BusinessPlanCatalogItem[] }) {
    if (!plans.length) return null;
    const groups = Array.from(new Set(plans[0].featureComparison.map((feature) => feature.group)));
    const capacityRows: Array<[string, (plan: BusinessPlanCatalogItem) => string]> = [
        ["Complaints per month", (plan) => formatLimit(plan.limits.complaintsPerMonth)],
        ["Team seats", (plan) => formatLimit(plan.limits.teamMembers)],
        ["AI analyses per month", (plan) => formatLimit(plan.limits.aiAnalysesPerMonth)],
        ["Evidence storage", (plan) => formatStorage(plan.limits.storageMb)],
        ["Complaint history retention", (plan) => formatRetention(plan.limits.retentionDays)],
    ];

    return (
        <section aria-labelledby="plan-comparison-title" className="mt-24">
            <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Compare plans</p>
                <h2 id="plan-comparison-title" className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    Every capability, side by side.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted">
                    All plans include the customer complaint portal, AI triage and secure multi-tenant data isolation.
                </p>
            </div>
            <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-line">
                            <th scope="col" className="w-[40%] px-6 py-5 text-xs font-semibold uppercase tracking-wider text-subtle">
                                Features
                            </th>
                            {plans.map((plan) => (
                                <th key={plan.id} scope="col" className="px-6 py-5">
                                    <span className={`text-base font-semibold ${plan.featured ? "text-brand" : "text-ink"}`}>
                                        {plan.name}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-wash">
                            <th colSpan={plans.length + 1} scope="colgroup" className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                                Usage & capacity
                            </th>
                        </tr>
                        {capacityRows.map(([label, value]) => (
                            <tr key={label} className="border-t border-line">
                                <th scope="row" className="px-6 py-3.5 font-normal text-ink-soft">{label}</th>
                                {plans.map((plan) => (
                                    <td key={plan.id} className="px-6 py-3.5 font-medium text-ink">{value(plan)}</td>
                                ))}
                            </tr>
                        ))}
                        {groups.map((group) => (
                            <Fragment key={group}>
                                <tr className="border-t border-line bg-wash">
                                    <th colSpan={plans.length + 1} scope="colgroup" className="px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                                        {group}
                                    </th>
                                </tr>
                                {plans[0].featureComparison
                                    .filter((feature) => feature.group === group)
                                    .map((feature) => (
                                        <tr key={feature.id} className="border-t border-line">
                                            <th scope="row" className="px-6 py-3.5 font-normal text-ink-soft">{feature.name}</th>
                                            {plans.map((plan) => {
                                                const included = plan.featureComparison.find((item) => item.id === feature.id)?.included === true;
                                                return (
                                                    <td key={plan.id} className="px-6 py-3.5">
                                                        {included ? (
                                                            <Check size={18} className="text-brand" aria-label="Included" />
                                                        ) : (
                                                            <Minus size={18} className="text-faint" aria-label="Not included" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

const FAQS: Array<[string, string]> = [
    [
        "How does the free trial work?",
        "Every approved business can start a 14-day Starter trial without payment details. Configure your workspace, invite your team and receive real complaints. Upgrade whenever you are ready; your data and settings carry over.",
    ],
    [
        "Can I switch between monthly and yearly billing?",
        "Yes. Choose yearly to get two months free, or switch plans and billing periods later from Plan & billing. Changes to paid subscriptions are prorated.",
    ],
    [
        "What do you need to activate a paid plan?",
        "Your billing contact, invoice address and optional tax ID. Card payments are processed by our payment provider; BCIP never stores card numbers.",
    ],
    [
        "What happens if we reach a usage limit?",
        "Your workspace keeps working and existing complaints stay accessible. New complaints or AI analyses beyond the monthly limit pause until the next cycle or until you upgrade.",
    ],
    [
        "Can we cancel anytime?",
        "Yes. Cancellation takes effect at the end of the current billing period, and you can resume before then without losing anything.",
    ],
];

export function PlanFaq() {
    return (
        <section aria-labelledby="plan-faq-title" className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Questions</p>
                <h2 id="plan-faq-title" className="mt-4 text-3xl font-semibold tracking-tight text-ink">
                    Billing, answered.
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted">
                    Still deciding? <Link href="/contact" className="font-semibold text-brand underline-offset-4 hover:underline">Talk to our team</Link> about the right setup for your organization.
                </p>
            </div>
            <div className="divide-y divide-line rounded-2xl border border-line bg-white">
                {FAQS.map(([question, answer]) => (
                    <details key={question} className="group px-6 py-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                            {question}
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-muted transition group-open:rotate-45">+</span>
                        </summary>
                        <p className="mt-3 pr-10 text-sm leading-6 text-muted">{answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}

export function PlanCatalog({
    plans,
    interval,
    onIntervalChange,
    actionFor,
    currentPlanId,
    badgeFor,
}: PlanCatalogProps) {
    return (
        <div>
            <div className="flex justify-center">
                <IntervalToggle interval={interval} onChange={onIntervalChange} />
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-start">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        interval={interval}
                        action={actionFor(plan)}
                        isCurrent={currentPlanId === plan.id}
                        badge={badgeFor?.(plan) ?? null}
                    />
                ))}
            </div>
        </div>
    );
}

export function PlanCatalogSkeleton() {
    return (
        <div className="mt-14 grid gap-6 lg:grid-cols-3" role="status" aria-label="Loading plans">
            {[0, 1, 2].map((item) => (
                <div key={item} className="h-[560px] animate-pulse rounded-[24px] border border-line bg-wash" />
            ))}
        </div>
    );
}
