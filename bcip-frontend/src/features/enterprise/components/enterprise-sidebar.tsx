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
    ShieldAlert,
    Sliders,
    Settings2,
    BrainCircuit,
    FileText,
    Tags,
    UserRound,
    Users,
    type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { BrandMark } from "@/components/brand/brand-logo";
import {
    getBusinessPlanName,
    isBusinessFeatureAvailable,
    requiredFeatureForPath,
} from "@/lib/api/business-billing";
import { useOptionalBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import { useEnterprise } from "../context/enterprise-context";

interface NavigationItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const BUSINESS_NAVIGATION: Array<{ label: string; items: NavigationItem[] }> = [
    {
        label: "Today",
        items: [
            { label: "Overview", href: "/business/dashboard", icon: LayoutDashboard },
            { label: "Inbox", href: "/business/inbox", icon: Activity },
        ],
    },
    {
        label: "Complaints",
        items: [
            { label: "All complaints", href: "/business/complaints", icon: ClipboardList },
            { label: "Escalations", href: "/business/escalations", icon: ShieldAlert },
            { label: "Customers", href: "/business/customers", icon: Users },
        ],
    },
    {
        label: "Insights",
        items: [
            { label: "AI insights", href: "/business/dashboard#ai-insights", icon: BrainCircuit },
            { label: "Analytics", href: "/business/analytics", icon: BarChart3 },
            { label: "Reports", href: "/business/reports", icon: FileText },
        ],
    },
    {
        label: "Setup",
        items: [
            { label: "Categories", href: "/business/categories", icon: Tags },
            { label: "Knowledge base", href: "/business/knowledge", icon: BookOpen },
            { label: "Teams", href: "/business/teams", icon: Users },
            { label: "People", href: "/business/employees", icon: UserRound },
            { label: "Settings", href: "/business/settings", icon: Settings2 },
        ],
    },
];

// Features that only open on Professional or above, used to label locked links.
const PROFESSIONAL_FEATURES = new Set([
    "analytics",
    "reports",
    "escalations",
    "knowledge_resources",
    "duplicate_detection",
    "ai_response_suggestions",
]);

export function EnterpriseSidebar({
    onNavigate,
    collapsed = false,
}: {
    onNavigate?: () => void;
    collapsed?: boolean;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { currentUser } = useEnterprise();
    const workspace = useOptionalBusinessWorkspace();
    const isAdmin = pathname.startsWith("/admin");
    const isEscalation = pathname.startsWith("/escalation");
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
        ? BUSINESS_NAVIGATION
        : [{
              label: isAdmin ? "Administration" : isEscalation ? "Escalations" : "Workspace",
              items: isAdmin
                  ? adminNavigation
                  : isEscalation
                    ? escalationNavigation
                    : BUSINESS_NAVIGATION[0].items,
          }];
    const businessName = workspace?.businessName ?? currentUser.organization;
    const logoHref = isAdmin ? "/admin/dashboard" : isEscalation ? "/escalation/dashboard" : "/business/dashboard";

    if (!workspace) {
        return (
            <aside className={`flex h-full w-72 shrink-0 flex-col ${
                isAdmin
                    ? "admin-sidebar border-r text-white"
                    : "border-r border-slate-800 bg-ink text-white"
            }`}>
                <Link
                    href={logoHref}
                    onClick={onNavigate}
                    className="flex min-h-[5.25rem] items-center gap-3 border-b border-white/10 px-6"
                >
                    <span className="grid h-10 w-10 place-items-center">
                        <BrandMark size={34} />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-extrabold tracking-[0.11em]">BCIP</span>
                        <span className="mt-0.5 block truncate text-xs text-white/60">
                            {isAdmin ? "Platform control" : isEscalation ? "Escalation desk" : "Business workspace"}
                        </span>
                    </span>
                </Link>

                <div className="border-b border-white/10 px-6 py-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                        {isAdmin ? "Platform scope" : "Your workspace"}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold">{businessName}</p>
                </div>

                <nav
                    className="flex-1 space-y-6 overflow-y-auto px-4 py-6"
                    aria-label={isAdmin ? "Platform administration" : "Workspace navigation"}
                >
                    {navigationGroups.map((group) => (
                        <section key={group.label} aria-label={group.label}>
                            <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                                {group.label}
                            </h2>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onNavigate}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                                isAdmin
                                                    ? isActive
                                                        ? "bg-violet-600 text-white"
                                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                                    : isActive
                                                      ? "bg-slate-700 text-white"
                                                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                            }`}
                                        >
                                            <Icon size={17} aria-hidden="true" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </nav>

                <div className="space-y-4 border-t border-white/10 p-4">
                    <div className="flex items-center gap-3 px-1">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">
                            {initials || "BO"}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold">{user?.fullName ?? "Workspace user"}</span>
                            <span className="block truncate text-[11px] text-white/55">{user?.email ?? "Account"}</span>
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

    return (
        <aside
            className={`enterprise-sidebar flex h-full shrink-0 flex-col ${
                workspace
                    ? "business-sidebar"
                    : isAdmin
                      ? "admin-sidebar border-r text-white"
                      : "border-r border-slate-800 bg-ink text-white"
            } ${collapsed ? "is-collapsed" : ""}`}
        >
            <Link
                href={logoHref}
                onClick={onNavigate}
                className="enterprise-sidebar-brand"
                aria-label={collapsed ? `BCIP, ${businessName}` : undefined}
            >
                <span className="enterprise-sidebar-logo">
                    <BrandMark size={32} />
                </span>
                <span className="enterprise-sidebar-brand-copy min-w-0">
                    <span className="block text-sm font-extrabold tracking-[0.11em]">BCIP</span>
                    <span className="mt-0.5 block truncate text-xs text-white/60">
                        {isAdmin ? "Platform control" : isEscalation ? "Escalation desk" : "Business workspace"}
                    </span>
                </span>
            </Link>

            <div className="enterprise-sidebar-workspace">
                <p className="enterprise-sidebar-group-label">
                    {workspace ? "Your business" : isAdmin ? "Platform scope" : "Your workspace"}
                </p>
                <p className="mt-1 truncate text-sm font-semibold">{businessName}</p>
            </div>

            <nav
                className="enterprise-sidebar-nav flex-1 space-y-5 overflow-y-auto px-3 py-5"
                aria-label={isAdmin ? "Platform administration" : "Business workspace"}
            >
                {navigationGroups.map((group) => (
                    <section key={group.label} aria-label={collapsed ? undefined : group.label}>
                        <h2 className="enterprise-sidebar-group-label mb-1.5 px-3">
                            {group.label}
                        </h2>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const available =
                                    !workspace ||
                                    isBusinessFeatureAvailable(workspace.features, item.href);
                                const requiredFeature = requiredFeatureForPath(item.href);
                                const isActive = available && (
                                    pathname === item.href ||
                                    pathname.startsWith(`${item.href}/`) ||
                                    (item.href === "/business/complaints" && pathname.startsWith("/business/complaints/"))
                                );
                                const Icon = item.icon;
                                const href = available
                                    ? item.href
                                    : `/business/upgrade?feature=${encodeURIComponent(requiredFeature ?? "")}`;

                                return (
                                    <Link
                                        key={item.href}
                                        href={href}
                                        onClick={onNavigate}
                                        aria-current={isActive ? "page" : undefined}
                                        aria-label={
                                            !available
                                                ? `${item.label}, needs a higher plan`
                                                : collapsed
                                                  ? item.label
                                                  : undefined
                                        }
                                        title={collapsed ? item.label : undefined}
                                        className={`enterprise-sidebar-link flex min-h-10 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
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
                                            <Icon size={17} className="shrink-0" aria-hidden="true" />
                                            <span className="enterprise-sidebar-link-label truncate">{item.label}</span>
                                        </span>
                                        {available ? (
                                            isActive && <span className="enterprise-sidebar-active-mark" />
                                        ) : (
                                            <span className="enterprise-sidebar-lock flex shrink-0 items-center gap-1 opacity-70">
                                                {!collapsed && requiredFeature && PROFESSIONAL_FEATURES.has(requiredFeature) && (
                                                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                                        Pro
                                                    </span>
                                                )}
                                                <LockKeyhole size={13} aria-hidden="true" />
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </nav>

            <div className="enterprise-sidebar-footer space-y-3 border-t border-white/10 p-3">
                {workspace && (
                    <Link
                        href={workspace.isTrial ? "/business/upgrade" : "/business/billing"}
                        onClick={onNavigate}
                        className="enterprise-sidebar-plan block rounded-xl border border-white/15 bg-white/5 p-3 transition hover:bg-white/10"
                        aria-label={collapsed ? "Plan and billing" : undefined}
                        title={collapsed ? "Plan and billing" : undefined}
                    >
                        <span className="flex items-center justify-between gap-2 text-xs font-bold">
                            <span className="enterprise-sidebar-plan-label">
                                {workspace.isTrial ? "Free trial" : `${getBusinessPlanName(workspace.plan)} plan`}
                            </span>
                            <CreditCard size={15} aria-hidden="true" />
                        </span>
                        {!collapsed && (
                            <span className="mt-1.5 block text-xs text-white/60">
                                {workspace.isTrial
                                    ? `${workspace.trialDaysRemaining ?? 0} days left · Upgrade to Professional`
                                    : "Billing and invoices"}
                            </span>
                        )}
                    </Link>
                )}

                <div className={`enterprise-sidebar-profile ${collapsed ? "is-collapsed" : ""}`}>
                    <span className="enterprise-sidebar-avatar">{initials || "BO"}</span>
                    {!collapsed && (
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold">
                                {user?.fullName ?? "Business owner"}
                            </span>
                            <span className="block truncate text-[11px] text-white/55">
                                {user?.email ?? "Workspace account"}
                            </span>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={logout}
                        aria-label="Sign out"
                        title="Sign out"
                        className="enterprise-sidebar-logout"
                    >
                        <LogOut size={16} aria-hidden="true" />
                    </button>
                </div>

                <Link
                    href="/support"
                    onClick={onNavigate}
                    className="enterprise-sidebar-support"
                    aria-label={collapsed ? "Help and support" : undefined}
                    title={collapsed ? "Help and support" : undefined}
                >
                    <Headset size={14} aria-hidden="true" />
                    <span className="enterprise-sidebar-support-label">Help & support</span>
                </Link>
            </div>
        </aside>
    );
}
