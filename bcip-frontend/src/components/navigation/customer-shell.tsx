"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    PlusCircle,
    MessageSquare,
    User,
} from "lucide-react";
import { CustomerHeader } from "@/components/navigation/customer-header";
import { CustomerSidebar } from "@/components/navigation/customer-sidebar";
import { getRoleHome, useAuth } from "@/providers/auth-provider";

interface CustomerShellProps {
    children: ReactNode;
}

export function CustomerShell({ children }: CustomerShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, status, error, refreshSession } = useAuth();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
        } else if (status === "authenticated" && user?.role !== "CUSTOMER") {
            router.replace(getRoleHome(user?.role));
        }
    }, [pathname, router, status, user]);

    if (status === "error") {
        return (
            <main className="customer-portal grid min-h-screen place-items-center px-6">
                <div className="max-w-md text-center">
                    <p className="text-sm text-slate-600" role="alert">{error}</p>
                    <button
                        type="button"
                        onClick={() => void refreshSession()}
                        className="mt-4 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
                    >
                        Retry session check
                    </button>
                </div>
            </main>
        );
    }

    if (status !== "authenticated" || user?.role !== "CUSTOMER") {
        return (
            <div className="customer-portal grid min-h-screen place-items-center" role="status" aria-live="polite">
                <span className="h-11 w-11 animate-spin rounded-full border-[3px] border-violet-700 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="customer-portal min-h-screen antialiased md:flex md:flex-row">
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-[#21113b]/60 backdrop-blur-xs md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Desktop / Mobile Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <CustomerSidebar
                    onNavigate={() => setSidebarOpen(false)}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            </div>

            {/* Main Application Shell Content */}
            <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-16 md:pb-0">
                <CustomerHeader
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
                    {children}
                </main>

                {/* Mobile Bottom Navigation Bar */}
                <nav
                    className="customer-mobile-nav fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t px-2 backdrop-blur-md md:hidden"
                    aria-label="Mobile bottom navigation"
                >
                    <Link
                        href="/customer/dashboard"
                        className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
                            pathname === "/customer/dashboard"
                                ? "text-violet-700"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Overview</span>
                    </Link>

                    <Link
                        href="/customer/complaints"
                        className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
                            pathname.startsWith("/customer/complaints") && pathname !== "/customer/complaints/new"
                                ? "text-violet-700"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <ClipboardList className="h-5 w-5" />
                        <span>Complaints</span>
                    </Link>

                    <Link
                        href="/customer/complaints/new"
                        className="flex flex-col items-center justify-center -mt-5 h-12 w-12 rounded-full bg-violet-700 text-white shadow-lg shadow-violet-900/25 active:scale-95 transition"
                        aria-label="Submit new complaint"
                    >
                        <PlusCircle className="h-6 w-6" />
                    </Link>

                    <Link
                        href="/customer/messages"
                        className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
                            pathname === "/customer/messages"
                                ? "text-violet-700"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <MessageSquare className="h-5 w-5" />
                        <span>Messages</span>
                    </Link>

                    <Link
                        href="/customer/profile"
                        className={`flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
                            pathname === "/customer/profile"
                                ? "text-violet-700"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}