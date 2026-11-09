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
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface CustomerSidebarProps {
    onNavigate?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const mainNavItems = [
    { label: "Overview", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "My Complaints", href: "/customer/complaints", icon: ClipboardList },
    { label: "Submit Complaint", href: "/customer/complaints/new", icon: PlusCircle },
    { label: "Messages", href: "/customer/messages", icon: MessageSquare, badge: "1" },
    { label: "Profile", href: "/customer/profile", icon: User },
];

const bottomNavItems = [
    { label: "FAQ & Support", href: "/customer/support", icon: HelpCircle },
    { label: "Settings", href: "/customer/settings", icon: Settings },
];

export function CustomerSidebar({
    onNavigate,
    isCollapsed = false,
    onToggleCollapse,
}: CustomerSidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside
            className={`customer-sidebar flex h-full flex-col border-r border-slate-800 bg-[#21113b] text-white transition-all duration-300 ${
                isCollapsed ? "w-20" : "w-72 shrink-0"
            }`}
            aria-label="Customer Navigation"
        >
            {/* Logo / Brand Header */}
            <div className="flex h-[76px] items-center justify-between border-b border-slate-800 px-4">
                <Link
                    href="/customer/dashboard"
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
                    title="BCIP Customer Helpdesk"
                >
                    <HelpdeskLogo
                        size="md"
                        showText={!isCollapsed}
                        theme="dark"
                    />
                </Link>

                {onToggleCollapse && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:block transition"
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

            {/* Navigation links */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6" aria-label="Customer main navigation">
                {!isCollapsed && (
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Workspace
                    </p>
                )}
                {mainNavItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/customer/dashboard" && pathname.startsWith(`${item.href}/`));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            title={isCollapsed ? item.label : undefined}
                            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 ${
                                isActive
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-950/30 font-bold"
                                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                            } ${isCollapsed ? "justify-center px-0" : ""}`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon
                                className={`h-4.5 w-4.5 shrink-0 ${
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                                }`}
                                aria-hidden="true"
                            />
                            {!isCollapsed && (
                                <span className="flex-1 truncate">{item.label}</span>
                            )}
                            {!isCollapsed && item.badge && !isActive && (
                                <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold text-slate-300">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-slate-800 p-3 space-y-1">
                {!isCollapsed && (
                    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${
                                isActive ? "bg-slate-800 text-white font-bold" : ""
                            } ${isCollapsed ? "justify-center px-0" : ""}`}
                        >
                            <Icon className="h-4 w-4 text-slate-400 group-hover:text-slate-200 shrink-0" aria-hidden="true" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                <button
                    type="button"
                    onClick={logout}
                    title={isCollapsed ? "Logout" : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors ${
                        isCollapsed ? "justify-center px-0" : ""
                    }`}
                >
                    <LogOut className="h-4 w-4 text-rose-400 shrink-0" aria-hidden="true" />
                    {!isCollapsed && <span>Logout</span>}
                </button>

                {!isCollapsed && (
                    <div className="mt-3 rounded-xl bg-slate-800/60 p-3 text-[11px] leading-relaxed text-slate-400 border border-slate-700/50">
                        <p className="font-semibold text-slate-300">BCIP Verified Portal</p>
                        <p className="mt-0.5">Need help? Support team is available 24/7.</p>
                    </div>
                )}
            </div>
        </aside>
    );
}