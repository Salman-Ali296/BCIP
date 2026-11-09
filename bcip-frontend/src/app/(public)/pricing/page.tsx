import type { Metadata } from "next";
import { ArrowRight, Check, Mail } from "lucide-react";

import { BCIP_CONTACT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
    title: "Pricing",
    description: "Talk with BCIP about a complaint intelligence plan for your organisation.",
};

const plans = [
    {
        label: "Focused pilot",
        title: "Start with one team",
        description: "Explore a structured complaint workflow with a focused group and a clearly scoped use case.",
        points: ["Customer complaint capture", "Team complaint workspace", "AI-assisted triage preview", "Operational feedback session"],
        accent: "bg-blue-50 text-blue-700",
    },
    {
        label: "Business rollout",
        title: "Connect operations",
        description: "Bring more teams into a shared process for reviewing, assigning and learning from customer issues.",
        points: ["Role-aware team experiences", "Complaint categories and priority signals", "Trend and recurring-issue visibility", "Rollout planning conversation"],
        accent: "bg-emerald-50 text-emerald-700",
        featured: true,
    },
    {
        label: "Enterprise evaluation",
        title: "Plan for your context",
        description: "Discuss organisational needs, governance expectations and a phased path to broader adoption.",
        points: ["Requirements and workflow review", "Governance and access discussion", "Phased evaluation scope", "Direct product conversation"],
        accent: "bg-violet-50 text-violet-700",
    },
];

export default function PricingPage() {
    const mailto = `mailto:${BCIP_CONTACT_EMAIL}?subject=${encodeURIComponent("BCIP pricing and product enquiry")}`;

    return (
        <main className="bg-[#f6f8fb] text-slate-950">
            <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 text-center lg:px-8 lg:pb-20 lg:pt-28">
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-blue-700">
                    Pricing & plans
                </span>
                <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-.06em] sm:text-6xl">
                    Find the right way to get started.
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                    BCIP pricing depends on the teams, workflows and rollout scope you have in mind. Share your needs and we’ll discuss a suitable next step.
                </p>
                <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
                    <Mail size={15} /> No public list pricing yet — request a conversation.
                </p>
            </section>

            <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-20 md:grid-cols-3 lg:px-8">
                {plans.map((plan) => (
                    <article key={plan.label} className={`relative flex flex-col rounded-[24px] border bg-white p-7 shadow-sm ${plan.featured ? "border-blue-300 shadow-[0_20px_55px_rgba(36,84,214,.12)] md:-translate-y-2" : "border-slate-200"}`}>
                        {plan.featured && (
                            <span className="absolute right-6 top-6 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-blue-700">
                                Popular starting point
                            </span>
                        )}
                        <span className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] ${plan.accent}`}>{plan.label}</span>
                        <h2 className="mt-6 text-2xl font-bold tracking-tight">{plan.title}</h2>
                        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">{plan.description}</p>
                        <div className="mt-7 border-t border-slate-100 pt-6">
                            <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">A conversation can cover</p>
                            <ul className="mt-4 space-y-3">
                                {plan.points.map((point) => (
                                    <li key={point} className="flex items-start gap-2.5 text-sm leading-5 text-slate-700">
                                        <Check size={16} className="mt-0.5 shrink-0 text-blue-700" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <a href={mailto} className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${plan.featured ? "bg-[#2454d6] text-white hover:bg-[#1b43b4]" : "border border-slate-300 text-slate-800 hover:bg-slate-50"}`}>
                            Discuss this option <ArrowRight size={15} />
                        </a>
                    </article>
                ))}
            </section>

            <section className="border-t border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-[.8fr_1.2fr] lg:px-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-700">A transparent starting point</p>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight">What happens after you get in touch?</h2>
                    </div>
                    <ol className="grid gap-5 sm:grid-cols-3">
                        {[
                            ["01", "Share your context", "Tell us about your teams and complaint workflow."],
                            ["02", "Review the fit", "Walk through the product capabilities relevant to your needs."],
                            ["03", "Agree the next step", "Discuss availability, scope and commercial details before proceeding."],
                        ].map(([number, title, description]) => (
                            <li key={number}>
                                <span className="font-mono text-xs font-bold text-blue-700">{number}</span>
                                <h3 className="mt-2 font-bold">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </main>
    );
}
