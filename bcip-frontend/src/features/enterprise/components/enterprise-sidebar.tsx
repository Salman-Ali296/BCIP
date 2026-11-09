"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    BarChart3,
    BookOpen,
    Building2,
    ClipboardList,
    CreditCard,
    Headset,
    KeyRound,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Layers,
    Tags,
    Sliders,
    Settings2,
    ShieldAlert,
    Gauge,
    Users,
    type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
    businessPlanCanAccess,
    requiredPlanForPath,
    type BusinessPlan,
} from "@/lib/api/business-billing";
import {
    useOptionalBusinessWorkspace,
} from "@/features/business-trial/context/business-workspace-context";
import { useEnterprise } from "../context/enterprise-context";

interface NavigationItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const NAVIGATION: Array<{ label: string; items: NavigationItem[] }> = [
    {
        label: "Workspace",
        items: [
            { label: "Overview", href: "/business/dashboard", icon: LayoutDashboard },
            { label: "Complaints", href: "/business/complaints", icon: ClipboardList },
            { label: "Inbox", href: "/business/inbox", icon: Activity },
        ],
    },
    {
        label: "Understand",
        items: [
            { label: "Analytics", href: "/business/analytics", icon: BarChart3 },
            { label: "Trends", href: "/business/trends", icon: Activity },
            { label: "Reports", href: "/business/reports", icon: ClipboardList },
            { label: "Customers", href: "/business/customers", icon: Users },
        ],
    },
    {
        label: "Manage",
        items: [
            { label: "Teams", href: "/business/teams", icon: Users },
            { label: "People", href: "/business/employees", icon: Users },
            { label: "Escalations", href: "/business/escalations", icon: ShieldAlert },
            { label: "Knowledge", href: "/business/knowledge", icon: BookOpen },
            { label: "Categories", href: "/business/categories", icon: Tags },
            { label: "Performance", href: "/business/performance", icon: Gauge },
            { label: "Workspace settings", href: "/business/settings", icon: Settings2 },
        ],
    },
];

const PLAN_LABELS: Record<BusinessPlan, string> = {
    starter: "Starter",
    growth: "Growth",
    business: "Business",
};

export function EnterpriseSidebar({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { currentUser } = useEnterprise();
    const workspace = useOptionalBusinessWorkspace();
    const isAdmin = pathname.startsWith("/admin");
    const initials = (user?.fullName ?? workspace?.businessName ?? currentUser.organization)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    const adminNavigation: NavigationItem[] = [
        { label: "Platform overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Organizations", href: "/admin/organizations", icon: Building2 },
        { label: "Business units", href: "/admin/business-units", icon: Layers },
        { label: "User directory", href: "/admin/users", icon: Users },
        { label: "Roles & permissions", href: "/admin/roles", icon: KeyRound },
        { label: "SLA policies", href: "/admin/sla-policies", icon: Sliders },
        { label: "Security", href: "/admin/security", icon: LockKeyhole },
        { label: "Audit logs", href: "/admin/audit-logs", icon: Activity },
        { label: "Settings", href: "/admin/settings", icon: Settings2 },
    ];
    const escalationNavigation: NavigationItem[] = [
        { label: "Overview", href: "/escalation/dashboard", icon: LayoutDashboard },
        { label: "Critical escalations", href: "/escalation/critical", icon: ShieldAlert },
        { label: "SLA risk", href: "/escalation/sla-risk", icon: Activity },
        { label: "Escalation queue", href: "/escalation/queue", icon: ClipboardList },
    ];
    const navigationGroups = workspace
        ? NAVIGATION
        : [{
              label: pathname.startsWith("/admin")
                  ? "Administration"
                  : pathname.startsWith("/escalation")
                    ? "Escalations"
                    : "Workspace",
              items: pathname.startsWith("/admin")
                  ? adminNavigation
                  : pathname.startsWith("/escalation")
                    ? escalationNavigation
                    : NAVIGATION[0].items,
          }];
    const businessName = workspace?.businessName ?? currentUser.organization;

    return (
        <aside
            className={`flex h-full w-72 shrink-0 flex-col ${
                workspace
                    ? "business-sidebar"
                    : isAdmin
                      ? "admin-sidebar border-r text-white"
                      : "border-r border-slate-800 bg-[#0f172a] text-white"
            }`}
        >
            <Link
                href={isAdmin ? "/admin/dashboard" : "/business/dashboard"}
                onClick={onNavigate}
                className="flex min-h-[5.25rem] items-center gap-3 border-b border-white/10 px-6"
            >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${
                    workspace
                        ? "bg-[var(--workspace-acid)] text-[var(--workspace-green-deep)]"
                        : "bg-violet-200 text-violet-950"
                }`}>
                    <Building2 size={20} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                    <span className="block text-sm font-extrabold tracking-[0.11em]">BCIP</span>
                    <span className="mt-0.5 block truncate text-xs text-white/60">
                        {isAdmin ? "Platform control" : "Business workspace"}
                    </span>
                </span>
            </Link>

            <div className="border-b border-white/10 px-6 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                    {workspace ? "Your business" : isAdmin ? "Platform scope" : "Your workspace"}
                </p>
                <p className="mt-1 truncate text-sm font-semibold">{businessName}</p>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6" aria-label={isAdmin ? "Platform administration" : "Business workspace"}>
                {navigationGroups.map((group) => (
                    <section key={group.label} aria-label={group.label}>
                        <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                            {group.label}
                        </h2>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const minimumPlan = requiredPlanForPath(item.href);
                                const available =
                                    !workspace ||
                                    workspace.isTrial ||
                                    !minimumPlan ||
                                    businessPlanCanAccess(workspace.plan, minimumPlan);
                                const isActive =
                                    available &&
                                    (pathname === item.href ||
                                        pathname.startsWith(`${item.href}/`));
                                const Icon = item.icon;
                                const href = available
                                    ? item.href
                                    : `/business/upgrade?plan=${minimumPlan}`;

                                return (
                                    <Link
                                        key={item.href}
                                        href={href}
                                        onClick={onNavigate}
                                        aria-current={isActive ? "page" : undefined}
                                        aria-label={
                                            available
                                                ? item.label
                                                : `${item.label}, included with ${minimumPlan} plan`
                                        }
                                        className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${
                                            workspace
                                                ? "business-sidebar-link"
                                                : `transition ${
                                                      isActive
                                                          ? "bg-violet-600 text-white"
                                                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                                  }`
                                        }`}
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <Icon size={17} aria-hidden="true" />
                                            <span className="truncate">{item.label}</span>
                                        </span>
                                        {available ? (
                                            isActive && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            )
                                        ) : (
                                            <LockKeyhole
                                                size={14}
                                                className="shrink-0 opacity-60"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </nav>

            <div className="space-y-4 border-t border-white/10 p-4">
                {workspace && (
                    <Link
                        href="/business/upgrade"
                        onClick={onNavigate}
                        className="block rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold">
                                {workspace.isTrial ? "Trial access" : `${PLAN_LABELS[workspace.plan]} plan`}
                            </span>
                            <CreditCard size={15} aria-hidden="true" />
                        </div>
                        <span className="mt-2 block text-xs leading-5 text-white/60">
                            {workspace.isTrial
                                ? `${workspace.trialDaysRemaining ?? 0} days remaining`
                                : "Review your plan"}
                        </span>
                    </Link>
                )}

                <div className="flex items-center gap-3 px-1">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">
                        {initials || "BO"}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold">
                            {user?.fullName ?? "Business owner"}
                        </span>
                        <span className="block truncate text-[11px] text-white/55">
                            {user?.email ?? "Workspace account"}
                        </span>
                    </span>
                    <button
                        type="button"
                        onClick={logout}
                        aria-label="Sign out"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                        <LogOut size={16} aria-hidden="true" />
                    </button>
                </div>

                <Link
                    href="/support"
                    onClick={onNavigate}
                    className="flex items-center gap-2 px-1 text-xs font-medium text-white/55 transition hover:text-white"
                >
                    <Headset size={14} aria-hidden="true" />
                    Help & support
                </Link>
            </div>
        </aside>
    );
}
