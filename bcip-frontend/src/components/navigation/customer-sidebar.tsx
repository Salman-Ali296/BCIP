"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";
import {
    LayoutDashboard,
    ClipboardList,
    PlusCircle,
    MessageSquare,
    User,
    HelpCircle,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface CustomerSidebarProps {
    onNavigate?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const mainNavItems = [
    { label: "Overview",         href: "/customer/dashboard",       icon: LayoutDashboard, color: "text-blue-400"   },
    { label: "My Complaints",    href: "/customer/complaints",      icon: ClipboardList,   color: "text-teal-400"   },
    { label: "Submit Complaint", href: "/customer/complaints/new",  icon: PlusCircle,      color: "text-emerald-400"},
    { label: "Messages",         href: "/customer/messages",        icon: MessageSquare,   color: "text-violet-400", badge: "1" },
    { label: "Profile",          href: "/customer/profile",         icon: User,            color: "text-sky-400"    },
];

const bottomNavItems = [
    { label: "FAQ & Support", href: "/customer/support",   icon: HelpCircle },
    { label: "Settings",      href: "/customer/settings",  icon: Settings   },
];

export function CustomerSidebar({
    onNavigate,
    isCollapsed = false,
    onToggleCollapse,
}: CustomerSidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const displayName = user?.email?.split("@")[0] || "Customer";

    return (
        <aside
            className={`customer-sidebar flex h-full flex-col border-r transition-all duration-300 ${
                isCollapsed ? "w-[72px]" : "w-72 shrink-0"
            }`}
            style={{
                background: "linear-gradient(180deg, #0b1120 0%, #09101b 100%)",
                borderColor: "rgba(255,255,255,0.08)",
            }}
            aria-label="Customer Navigation"
        >
            {/* ── Brand Header ── */}
            <div
                className={`flex h-[72px] items-center border-b ${
                    isCollapsed ? "justify-center px-3" : "justify-between px-4"
                }`}
                style={{ borderColor: "#1e293b" }}
            >
                <Link
                    href="/customer/dashboard"
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400/60"
                    title="BCIP Customer Helpdesk"
                >
                    {isCollapsed ? (
                        /* Collapsed: show icon-only glowing badge */
                        <span                         className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/30">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </span>
                    ) : (
                        <HelpdeskLogo size="md" showText theme="dark" />
                    )}
                </Link>

                {onToggleCollapse && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300 md:flex"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <PanelLeftOpen className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {/* ── User pill (expanded only) ── */}
            {!isCollapsed && user && (
                <div
                    className="mx-3 mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(30,41,59,0.6)", border: "1px solid #1e293b" }}
                >
                    <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
                        style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
                    >
                        {displayName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-200 leading-tight">
                            {displayName}
                        </p>
                        <p className="truncate text-[10px] text-slate-500 leading-tight">
                            {user.email || ""}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Main Nav ── */}
            <nav
                className="flex-1 space-y-0.5 overflow-y-auto px-2 py-5"
                aria-label="Customer main navigation"
            >
                {!isCollapsed && (
                    <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                        Workspace
                    </p>
                )}

                {mainNavItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/customer/dashboard" &&
                            pathname.startsWith(`${item.href}/`));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            title={isCollapsed ? item.label : undefined}
                            aria-current={isActive ? "page" : undefined}
                            className={`group relative flex items-center gap-3 rounded-xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400/60 ${
                                isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
                            } ${
                                isActive
                                    ? "bg-gradient-to-r from-emerald-400/[0.12] to-emerald-400/[0.03] text-white"
                                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                            }`}
                        >
                            {/* Active indicator bar */}
                            {isActive && !isCollapsed && (
                                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-emerald-400" />
                            )}

                            <Icon
                                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                                    isActive
                                        ? "text-emerald-400"
                                        : `${item.color} opacity-60 group-hover:opacity-100`
                                }`}
                                aria-hidden="true"
                            />

                            {!isCollapsed && (
                                <>
                                    <span className={`flex-1 truncate text-xs font-semibold ${isActive ? "text-white" : ""}`}>
                                        {item.label}
                                    </span>
                                    {item.badge && !isActive && (
                                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-400/10 px-1 text-[9px] font-black text-emerald-400">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}

                            {/* Tooltip for collapsed */}
                            {isCollapsed && (
                                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
                                    style={{ border: "1px solid #334155" }}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* ── Bottom Actions ── */}
            <div className="space-y-0.5 px-2 pb-4" style={{ borderTop: "1px solid #1e293b", paddingTop: "12px" }}>
                {!isCollapsed && (
                    <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                        Preferences
                    </p>
                )}

                {bottomNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            title={isCollapsed ? item.label : undefined}
                            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                                isCollapsed ? "justify-center px-0" : ""
                            } ${
                                isActive
                                    ? "bg-slate-800/60 text-slate-200"
                                    : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-300"
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {!isCollapsed && <span>{item.label}</span>}
                            {isCollapsed && (
                                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
                                    style={{ border: "1px solid #334155" }}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}

                <button
                    type="button"
                    onClick={logout}
                    title={isCollapsed ? "Logout" : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-rose-400/70 hover:bg-rose-500/10 hover:text-rose-400 transition-all ${
                        isCollapsed ? "justify-center px-0" : ""
                    }`}
                >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {!isCollapsed && <span>Sign out</span>}
                    {isCollapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
                            style={{ border: "1px solid #334155" }}>
                            Sign out
                        </span>
                    )}
                </button>

                {/* Trust badge (expanded only) */}
                {!isCollapsed && (
                    <div
                        className="mx-1 mt-3 rounded-xl p-3 text-[11px]"
                        style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <p className="font-semibold text-emerald-400">BCIP Verified Portal</p>
                        </div>
                        <p className="text-slate-500 leading-relaxed">
                            Support team available 24/7. All activity is encrypted &amp; audit-logged.
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}
