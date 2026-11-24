"use client";

import Link from "next/link";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { getBusinessPlanName } from "@/lib/api/business-billing";

// Keys match BUSINESS_FEATURES in bcip-backend/src/modules/billing/business-plans.ts.
// `unlockedBy` is the cheapest plan that switches the feature on, taken from the
// plan catalog migration (20261122000000_plan_catalog_billing_profile).
const FEATURE_ROWS: Array<{
    key: string;
    label: string;
    unlockedBy: "Starter" | "Professional" | "Enterprise";
    href?: string;
}> = [
    { key: "complaint_management", label: "Complaint inbox", unlockedBy: "Starter", href: "/business/complaints" },
    { key: "complaint_portal", label: "Customer complaint page", unlockedBy: "Starter" },
    { key: "ai_triage", label: "AI category, sentiment and priority", unlockedBy: "Starter" },
    { key: "team_management", label: "Team members and roles", unlockedBy: "Starter", href: "/business/teams" },
    { key: "csat_feedback", label: "Customer satisfaction ratings", unlockedBy: "Starter" },
    { key: "escalations", label: "Escalations and SLA alerts", unlockedBy: "Professional", href: "/business/escalations" },
    { key: "duplicate_detection", label: "Duplicate detection", unlockedBy: "Professional" },
    { key: "ai_response_suggestions", label: "AI reply drafts", unlockedBy: "Professional" },
    { key: "analytics", label: "Analytics and trends", unlockedBy: "Professional", href: "/business/analytics" },
    { key: "reports", label: "Reports", unlockedBy: "Professional", href: "/business/reports" },
    { key: "knowledge_resources", label: "Knowledge base", unlockedBy: "Professional", href: "/business/knowledge" },
    { key: "audit_logs", label: "Audit logs", unlockedBy: "Enterprise" },
    { key: "custom_branding", label: "Custom branding", unlockedBy: "Enterprise" },
    { key: "api_access", label: "API access", unlockedBy: "Enterprise" },
];

export function PlanFeaturesPanel({
    plan,
    isTrial,
    features,
}: {
    plan: string;
    isTrial: boolean;
    features: Record<string, boolean>;
}) {
    const planName = getBusinessPlanName(plan);
    const included = FEATURE_ROWS.filter((row) => features[row.key] === true);
    const locked = FEATURE_ROWS.filter((row) => features[row.key] !== true);
    const nextTier = locked.some((row) => row.unlockedBy === "Professional")
        ? "Professional"
        : locked.length > 0
          ? "Enterprise"
          : null;

    return (
        <section className="business-dashboard-panel" aria-labelledby="plan-features-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="business-eyebrow">
                        {isTrial ? "Free trial" : `${planName} plan`}
                    </p>
                    <h2 id="plan-features-heading" className="business-display mt-1 text-xl">
                        {locked.length === 0
                            ? "Everything is switched on"
                            : `${included.length} of ${FEATURE_ROWS.length} features switched on`}
                    </h2>
                    <p className="mt-1.5 max-w-2xl text-sm leading-5 text-[var(--workspace-muted)]">
                        {isTrial
                            ? "The trial gives you the basics so you can see how complaints flow in. Professional opens the rest of the workspace."
                            : nextTier === "Enterprise"
                              ? "You have the full complaint workspace. Enterprise adds audit logs, branding and API access for larger organisations."
                              : nextTier === "Professional"
                                ? "Professional adds escalations, duplicate detection, reply drafts and analytics."
                                : "Your plan includes every feature BCIP offers."}
                    </p>
                </div>
                {nextTier && (
                    <Link
                        href="/business/upgrade"
                        className="business-button-primary min-h-10 shrink-0 px-4 py-2 text-sm"
                    >
                        {nextTier === "Professional" ? "Upgrade to Professional" : "Talk to us about Enterprise"}
                        <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                )}
            </div>

            <ul className="mt-5 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2 xl:grid-cols-3">
                {included.map((row) => (
                    <li key={row.key} className="flex items-center gap-2">
                        <Check size={16} className="shrink-0 text-[var(--workspace-green)]" aria-hidden="true" />
                        {row.href ? (
                            <Link href={row.href} className="hover:underline">
                                {row.label}
                            </Link>
                        ) : (
                            <span>{row.label}</span>
                        )}
                    </li>
                ))}
                {locked.map((row) => (
                    <li key={row.key} className="flex items-center gap-2 text-[var(--workspace-muted)]">
                        <LockKeyhole size={14} className="shrink-0" aria-hidden="true" />
                        <span>
                            {row.label}
                            <span className="ml-1.5 rounded bg-[var(--workspace-paper-deep)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                {row.unlockedBy}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
