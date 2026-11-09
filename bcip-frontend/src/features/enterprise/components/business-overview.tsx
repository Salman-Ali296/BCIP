"use client";

import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    BookOpen,
    Check,
    ClipboardList,
    Headset,
    ShieldAlert,
    Users,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
    businessPlanCanAccess,
    requiredPlanForPath,
} from "@/lib/api/business-billing";
import { useBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";

interface Shortcut {
    label: string;
    description: string;
    href: string;
    icon: typeof ClipboardList;
}

const SHORTCUTS: Shortcut[] = [
    {
        label: "Review complaints",
        description: "See what needs a response from your team.",
        href: "/business/inbox",
        icon: ClipboardList,
    },
    {
        label: "Understand feedback",
        description: "Explore themes and service patterns.",
        href: "/business/trends",
        icon: BarChart3,
    },
    {
        label: "Coordinate your team",
        description: "Bring the right people into the work.",
        href: "/business/teams",
        icon: Users,
    },
    {
        label: "Resolve urgent cases",
        description: "Keep time-sensitive customer issues moving.",
        href: "/business/escalations",
        icon: ShieldAlert,
    },
];

export function BusinessOverview() {
    const { user } = useAuth();
    const workspace = useBusinessWorkspace();
    const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? "there";
    const visibleShortcuts = SHORTCUTS.filter(
        (shortcut) =>
            workspace.isTrial ||
            businessPlanCanAccess(
                workspace.plan,
                requiredPlanForPath(shortcut.href),
            ),
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="business-eyebrow">Business workspace / Overview</p>
                    <h1 className="business-display mt-2 text-4xl leading-tight sm:text-5xl">
                        Good to see you, {firstName}.
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--workspace-muted)]">
                        A clear place to stay close to your customers and the issues that matter.
                    </p>
                </div>
                <div className="flex w-fit items-center gap-2 rounded-full border border-[var(--workspace-line)] bg-[var(--workspace-card)] px-3 py-2 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-[var(--workspace-green)]" />
                    {workspace.isTrial
                        ? "Trial workspace"
                        : `${workspace.plan[0].toUpperCase()}${workspace.plan.slice(1)} plan`}
                </div>
            </header>

            <section className="relative overflow-hidden rounded-[1.75rem] bg-[var(--workspace-green-deep)] p-6 text-[#fffef9] sm:p-9 lg:p-11">
                <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-7 -top-16 h-56 w-56 rounded-full border border-white/10" />
                <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                    <div className="max-w-2xl">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--workspace-acid)]">
                            {workspace.businessName}
                        </p>
                        <h2 className="business-display mt-4 max-w-xl text-4xl leading-[1.05] sm:text-5xl">
                            Better conversations start with a clear view.
                        </h2>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                            Keep customer concerns, your team’s next steps, and follow-up in one
                            steady rhythm.
                        </p>
                        <Link
                            href="/business/inbox"
                            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--workspace-acid)] px-5 py-3 text-sm font-extrabold text-[var(--workspace-green-deep)] transition hover:brightness-95"
                        >
                            Go to your inbox
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-white/15 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                        {[
                            ["01", "Listen"],
                            ["02", "Respond"],
                            ["03", "Improve"],
                        ].map(([number, label]) => (
                            <div key={number} className="min-w-0">
                                <span className="font-mono text-xs font-bold text-[var(--workspace-acid)]">
                                    {number}
                                </span>
                                <p className="mt-2 text-sm font-semibold">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="business-card p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="business-eyebrow">Your first steps</p>
                            <h2 className="business-display mt-2 text-2xl">
                                Make the workspace yours.
                            </h2>
                        </div>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--workspace-green-wash)] text-[var(--workspace-green)]">
                            <Check size={18} aria-hidden="true" />
                        </span>
                    </div>
                    <div className="mt-6 divide-y divide-[var(--workspace-line)]">
                        <Link
                            href={
                                workspace.complaintPortalUrl
                                    ? workspace.complaintPortalUrl
                                    : "/business/onboarding"
                            }
                            target={workspace.complaintPortalUrl ? "_blank" : undefined}
                            rel={workspace.complaintPortalUrl ? "noreferrer" : undefined}
                            className="group flex items-center justify-between gap-4 py-4"
                        >
                            <span>
                                <span className="block text-sm font-bold">Customer complaint portal</span>
                                <span className="mt-1 block text-xs leading-5 text-[var(--workspace-muted)]">
                                    {workspace.complaintPortalUrl
                                        ? "Open the page customers use to contact you."
                                        : "Finish setup to prepare your customer-facing page."}
                                </span>
                            </span>
                            <ArrowUpRight
                                size={17}
                                className="shrink-0 text-[var(--workspace-green)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                aria-hidden="true"
                            />
                        </Link>
                        <Link href="/business/complaints" className="group flex items-center justify-between gap-4 py-4">
                            <span>
                                <span className="block text-sm font-bold">Keep every conversation moving</span>
                                <span className="mt-1 block text-xs leading-5 text-[var(--workspace-muted)]">
                                    Review, respond, and follow up on customer concerns.
                                </span>
                            </span>
                            <ArrowRight
                                size={17}
                                className="shrink-0 text-[var(--workspace-green)] transition group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>

                <div className="business-card flex flex-col p-6 sm:p-7">
                    <div>
                        <p className="business-eyebrow">Your plan</p>
                        <h2 className="business-display mt-2 text-2xl">
                            {workspace.isTrial
                                ? "Explore the full workspace."
                                : `You’re on ${workspace.plan[0].toUpperCase()}${workspace.plan.slice(1)}.`}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-[var(--workspace-muted)]">
                            {workspace.isTrial
                                ? `${workspace.trialDaysRemaining ?? 0} days remain to explore your business workspace.`
                                : "Your workspace includes resources matched to your plan."}
                        </p>
                    </div>
                    <Link
                        href="/business/upgrade"
                        className="business-button-secondary mt-6 w-full"
                    >
                        Review plan and billing
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[var(--workspace-muted)]">
                        <BookOpen size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                        Your current plan keeps core complaint handling close at hand.
                    </p>
                </div>
            </section>

            <section aria-labelledby="workspace-shortcuts-heading">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="business-eyebrow">A good place to continue</p>
                        <h2 id="workspace-shortcuts-heading" className="business-display mt-2 text-3xl">
                            Workspace shortcuts
                        </h2>
                    </div>
                    <Link
                        href="/support"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--workspace-green)]"
                    >
                        <Headset size={16} aria-hidden="true" />
                        Help & support
                    </Link>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {visibleShortcuts.map((shortcut) => {
                        const Icon = shortcut.icon;
                        return (
                            <Link
                                key={shortcut.label}
                                href={shortcut.href}
                                className="business-card group min-h-40 p-5 transition duration-150 hover:-translate-y-1 hover:border-[var(--workspace-green)]"
                            >
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--workspace-green-wash)] text-[var(--workspace-green)]">
                                    <Icon size={18} aria-hidden="true" />
                                </span>
                                <span className="mt-5 flex items-center justify-between gap-3 text-sm font-extrabold">
                                    {shortcut.label}
                                    <ArrowRight
                                        size={15}
                                        className="shrink-0 text-[var(--workspace-green)] transition group-hover:translate-x-1"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="mt-2 block text-xs leading-5 text-[var(--workspace-muted)]">
                                    {shortcut.description}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
