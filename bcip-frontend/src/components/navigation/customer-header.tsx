"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";
import {
    Menu,
    Search,
    Bell,
    ChevronDown,
    X,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    Settings,
    HelpCircle,
    LogOut,
    PlusCircle,
} from "lucide-react";
import { INITIAL_NOTIFICATIONS, CUSTOMER_PROFILE, INITIAL_COMPLAINTS, RESOLVED_COMPLAINTS } from "@/features/customer-dashboard/mock-data";
import type { CustomerNotification, CustomerComplaint } from "@/features/customer-dashboard/types";
import { useAuth } from "@/providers/auth-provider";

function getCustomerScreenInfo(pathname: string) {
    if (pathname === "/customer/complaints/new") {
        return {
            breadcrumb: "Helpdesk / Intake",
            title: "Submit a Complaint",
            subtitle: "Provide issue details and evidence for instant AI triage & routing",
            badge: "Intake",
            showNewBtn: false,
        };
    }
    if (pathname.startsWith("/customer/complaints")) {
        return {
            breadcrumb: "Helpdesk / Tickets",
            title: "My Complaints",
            subtitle: "Track live status, responses, SLA progress, and resolutions",
            badge: "Active Register",
            showNewBtn: true,
        };
    }
    if (pathname.startsWith("/customer/messages")) {
        return {
            breadcrumb: "Helpdesk / Messages",
            title: "Support Messages",
            subtitle: "Communicate directly with assigned resolution and operations specialists",
            badge: "Messages",
            showNewBtn: true,
        };
    }
    if (pathname.startsWith("/customer/profile") || pathname.startsWith("/customer/settings")) {
        return {
            breadcrumb: "Helpdesk / Account",
            title: "Profile & Settings",
            subtitle: "Manage personal details, notification preferences, and verification",
            badge: "Settings",
            showNewBtn: true,
        };
    }
    if (pathname.startsWith("/customer/notifications")) {
        return {
            breadcrumb: "Helpdesk / Alerts",
            title: "Notifications",
            subtitle: "Review complaint updates, status shifts, and agent responses",
            badge: "Alerts",
            showNewBtn: true,
        };
    }
    return {
        breadcrumb: "Overview",
        title: "Overview",
        subtitle: "Track progress, see updates, and take the next step on your complaints",
        badge: "Active Session",
        showNewBtn: true,
    };
}

interface CustomerHeaderProps {
    onMenuClick?: () => void;
    onSelectComplaint?: (complaint: CustomerComplaint) => void;
}

export function CustomerHeader({
    onMenuClick,
    onSelectComplaint,
}: CustomerHeaderProps) {
    const pathname = usePathname();
    const screenInfo = getCustomerScreenInfo(pathname);
    const { logout } = useAuth();

    const [notifications, setNotifications] = useState<CustomerNotification[]>(INITIAL_NOTIFICATIONS);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);

    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Filter complaints for live search
    const allComplaints = [...INITIAL_COMPLAINTS, ...RESOLVED_COMPLAINTS];
    const searchResults = searchQuery.trim()
        ? allComplaints.filter((c) => {
              const q = searchQuery.toLowerCase();
              return (
                  c.id.toLowerCase().includes(q) ||
                  c.subject.toLowerCase().includes(q) ||
                  c.category.toLowerCase().includes(q) ||
                  c.status.toLowerCase().includes(q)
              );
          })
        : [];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleSelectNotification = (notif: CustomerNotification) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        const match = allComplaints.find((c) => c.id === notif.complaintId);
        if (match && onSelectComplaint) {
            onSelectComplaint(match);
        }
        setNotifOpen(false);
    };

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
            <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
                {/* Left: Mobile hamburger & Screen-Aware Title / Breadcrumbs */}
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            type="button"
                            onClick={onMenuClick}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                            aria-label="Open customer navigation"
                        >
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <HelpdeskLogo size="sm" showText={false} />
                    </div>

                    <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {screenInfo.breadcrumb}
                            </span>
                            {screenInfo.badge && (
                                <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-2 py-0.2 text-[10px] font-bold text-blue-700 border border-blue-200/60">
                                    {screenInfo.badge}
                                </span>
                            )}
                        </div>
                        <h1 className="truncate text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                            {screenInfo.title}
                        </h1>
                        <p className="truncate text-xs text-slate-500 hidden sm:block leading-tight mt-0.5">
                            {screenInfo.subtitle}
                        </p>
                    </div>
                </div>

                {/* Right: Screen action, Search, Notifications, Avatar */}
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                    {screenInfo.showNewBtn && (
                        <Link
                            href="/customer/complaints/new"
                            className="hidden lg:inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm shadow-blue-500/20 transition"
                        >
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>New Complaint</span>
                        </Link>
                    )}
                    {/* Live Search Input */}
                    <div ref={searchRef} className="relative hidden md:block w-64 lg:w-80">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                placeholder="Search your complaints..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9.5 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchFocused && searchQuery.trim() && (
                            <div className="absolute right-0 top-full mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                                <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                    {searchResults.length} Match{searchResults.length === 1 ? "" : "es"} found
                                </div>
                                {searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-500">
                                        No complaints matching &ldquo;{searchQuery}&rdquo;
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-y-auto space-y-1 mt-1">
                                        {searchResults.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    onSelectComplaint?.(item);
                                                    setSearchFocused(false);
                                                    setSearchQuery("");
                                                }}
                                                className="w-full flex flex-col text-left rounded-xl p-2.5 hover:bg-slate-50 transition"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-[11px] font-bold text-blue-600">
                                                        {item.id}
                                                    </span>
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                                                    {item.subject}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Category: {item.category}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notifications Button & Dropdown */}
                    <div ref={notifRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setNotifOpen(!notifOpen)}
                            aria-label={`Notifications, ${unreadCount} unread`}
                            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                            <Bell className="h-4.5 w-4.5" aria-hidden="true" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {notifOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-blue-700">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllRead}
                                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                                    {notifications.map((notif) => (
                                        <button
                                            key={notif.id}
                                            type="button"
                                            onClick={() => handleSelectNotification(notif)}
                                            className={`w-full text-left p-3.5 flex items-start gap-3 transition hover:bg-slate-50 ${
                                                !notif.isRead ? "bg-blue-50/40" : ""
                                            }`}
                                        >
                                            <span className="mt-0.5 shrink-0">
                                                {notif.type === "action_required" ? (
                                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-amber-700">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                    </span>
                                                ) : notif.type === "resolution" ? (
                                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    </span>
                                                ) : (
                                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-blue-700">
                                                        <Clock className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="text-xs font-bold text-slate-900 truncate">
                                                        {notif.title}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-600 leading-tight mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-400">
                                                        {notif.timestamp}
                                                    </span>
                                                    <span className="text-[10px] text-blue-600 font-mono">
                                                        {notif.complaintId}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="border-t border-slate-100 p-2.5 text-center bg-slate-50/50">
                                    <Link
                                        href="/customer/notifications"
                                        onClick={() => setNotifOpen(false)}
                                        className="text-xs font-semibold text-blue-600 hover:underline"
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Avatar Dropdown */}
                    <div ref={profileRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 sm:px-2.5 sm:py-1.5 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 transition"
                            aria-label="User account menu"
                        >
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-xs">
                                {CUSTOMER_PROFILE.avatar}
                            </span>
                            <div className="hidden sm:block text-left">
                                <span className="block text-xs font-bold text-slate-900 leading-tight">
                                    {CUSTOMER_PROFILE.name}
                                </span>
                                <span className="block text-[10px] text-slate-500 leading-tight">
                                    {CUSTOMER_PROFILE.id}
                                </span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
                        </button>

                        {/* User Menu Dropdown */}
                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50">
                                <div className="border-b border-slate-100 p-2.5">
                                    <p className="text-xs font-bold text-slate-900">{CUSTOMER_PROFILE.name}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{CUSTOMER_PROFILE.email}</p>
                                    <span className="mt-1.5 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                        {CUSTOMER_PROFILE.accountTier}
                                    </span>
                                </div>

                                <div className="py-1 space-y-0.5">
                                    <Link
                                        href="/customer/profile"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100"
                                    >
                                        <User className="h-4 w-4 text-slate-500" />
                                        Profile Details
                                    </Link>
                                    <Link
                                        href="/customer/settings"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100"
                                    >
                                        <Settings className="h-4 w-4 text-slate-500" />
                                        Settings
                                    </Link>
                                    <Link
                                        href="/customer/support"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100"
                                    >
                                        <HelpCircle className="h-4 w-4 text-slate-500" />
                                        FAQ & Support
                                    </Link>
                                </div>

                                <div className="border-t border-slate-100 pt-1">
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50"
                                    >
                                        <LogOut className="h-4 w-4 text-rose-500" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}