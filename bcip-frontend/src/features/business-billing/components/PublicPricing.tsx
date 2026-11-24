"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Headset, ShieldCheck, Sparkles } from "lucide-react";
import {
    getBusinessPlans,
    type BillingInterval,
    type BusinessPlanCatalogItem,
} from "@/lib/api/business-billing";
import {
    BillingPageShell,
    Eyebrow,
    Notice,
} from "@/features/business-billing/components/BillingPageShell";
import {
    PlanCatalog,
    PlanCatalogSkeleton,
    PlanComparison,
    PlanFaq,
    type PlanAction,
} from "@/features/business-billing/components/PlanCatalog";

const ASSURANCES = [
    { icon: Sparkles, title: "14-day free trial", text: "Start on Starter with no card required." },
    { icon: ShieldCheck, title: "Tenant-isolated data", text: "Every business workspace is fully separated." },
    { icon: Headset, title: "Human support", text: "Real people help you set up and roll out." },
];

export function PublicPricing() {
    const [plans, setPlans] = useState<BusinessPlanCatalogItem[]>([]);
    const [interval, setInterval] = useState<BillingInterval>("year");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        getBusinessPlans()
            .then((result) => {
                if (active) setPlans(result);
            })
            .catch(() => {
                if (active) setError("Plans are temporarily unavailable. Please refresh in a moment or contact our team.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    function actionFor(plan: BusinessPlanCatalogItem): PlanAction {
        if (plan.customPricing) return { label: "Talk to sales", href: "/contact" };
        if (plan.trialAvailable) {
            return { label: "Start 14-day free trial", href: "/signup", note: "No card required" };
        }
        return {
            label: `Get ${plan.name}`,
            href: `/business/upgrade?plan=${encodeURIComponent(plan.id)}&interval=${interval}`,
        };
    }

    return (
        <BillingPageShell
            aside={
                <div className="flex items-center gap-3">
                    <Link href="/login" className="text-sm font-medium text-ink-soft transition hover:text-ink">
                        Sign in
                    </Link>
                    <Link
                        href="/signup"
                        className="inline-flex min-h-9 items-center rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-brand"
                    >
                        Register business
                    </Link>
                </div>
            }
        >
            <section className="mx-auto max-w-3xl text-center">
                <Eyebrow>Pricing & plans</Eyebrow>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-ink sm:text-6xl">
                    Turn every complaint into a<br className="hidden sm:block" />{" "}
                    <span className="text-brand">better customer experience.</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
                    Simple, transparent plans for teams of every size. Capture complaints, let AI triage them,
                    and resolve faster with the workflows your business needs.
                </p>
            </section>

            <div className="mt-12">
                {error && <Notice tone="error">{error}</Notice>}
                {loading ? (
                    <PlanCatalogSkeleton />
                ) : (
                    plans.length > 0 && (
                        <PlanCatalog
                            plans={plans}
                            interval={interval}
                            onIntervalChange={setInterval}
                            actionFor={actionFor}
                        />
                    )
                )}
            </div>

            <ul className="mt-16 grid gap-4 sm:grid-cols-3">
                {ASSURANCES.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lilac">
                            <Icon size={19} className="text-brand" aria-hidden="true" />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-ink">{title}</span>
                            <span className="mt-1 block text-sm leading-6 text-muted">{text}</span>
                        </span>
                    </li>
                ))}
            </ul>

            {!loading && plans.length > 0 && <PlanComparison plans={plans} />}

            <PlanFaq />

            <section className="mt-24 overflow-hidden rounded-[28px] border border-line bg-lilac-soft p-8 sm:p-12">
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div className="flex gap-5">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand-soft bg-lilac">
                            <Building2 size={21} className="text-brand" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-ink">Rolling out across departments?</h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                                Enterprise includes unlimited capacity, audit logs and a dedicated success manager.
                                We can also tailor contracts and invoicing for procurement.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/contact"
                        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-line px-6 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-brand/[0.06]"
                    >
                        Contact sales
                    </Link>
                </div>
            </section>
        </BillingPageShell>
    );
}
