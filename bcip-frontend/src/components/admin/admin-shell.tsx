'use client';

import { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    Brain,
    BarChart3,
    Flag,
    FileSearch,
    Bell,
    Menu,
    X,
    LogOut,
    ChevronDown,
    BrainCircuit,
    Activity,
    Download,
    Settings2,
    Tag,
    KeyRound,
    Clock3,
    Layers3,
    ShieldCheck,
} from 'lucide-react';
import { getRoleHome, useAuth } from '@/providers/auth-provider';
import '@/app/(admin)/admin-portal.css';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

const NAVIGATION_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Businesses', href: '/admin/businesses', icon: Building2 },
    { label: 'Organizations', href: '/admin/organizations', icon: Layers3 },
    { label: 'Business units', href: '/admin/business-units', icon: Building2 },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Complaints', href: '/admin/complaints', icon: FileText },
    { label: 'Roles & permissions', href: '/admin/roles', icon: KeyRound },
    { label: 'SLA policies', href: '/admin/sla-policies', icon: Clock3 },
    { label: 'AI Configuration', href: '/admin/ai-config', icon: Brain },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Moderation', href: '/admin/moderation', icon: Flag },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileSearch },
    { label: 'System Health', href: '/admin/health', icon: Activity },
    { label: 'Reports', href: '/admin/reports', icon: Download },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Settings', href: '/admin/settings', icon: Settings2 },
];

export function AdminShell({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isLoading, status, error, refreshSession } = useAuth();
    const isSuperAdmin = user?.role.toUpperCase() === 'SUPER_ADMIN';
    const pageTitle =
        NAVIGATION_ITEMS.find(
            (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        )?.label ?? 'Admin workspace';

    useEffect(() => {
        if (isLoading || status === 'error') return;
        if (!user) {
            router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
        } else if (!isSuperAdmin) {
            router.replace(getRoleHome(user.role));
        }
    }, [isLoading, isSuperAdmin, pathname, router, status, user]);

    if (isLoading || status === 'error' || !isSuperAdmin) {
        return (
            <main className="admin-portal flex min-h-screen items-center justify-center px-6">
                <div className="text-center">
                    <span
                        className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                        aria-hidden="true"
                    >
                        <ShieldCheck size={22} />
                    </span>
                    <p className="text-sm font-semibold text-white" role="status">
                        {isLoading
                            ? 'Checking administrator access…'
                            : status === 'error'
                              ? error
                              : 'Redirecting to a secure sign-in…'}
                    </p>
                    {status === 'error' && (
                        <button
                            type="button"
                            onClick={() => void refreshSession()}
                            className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                        >
                            Retry session check
                        </button>
                    )}
                </div>
            </main>
        );
    }

    return (
        <div className="admin-portal min-h-screen">
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.button
                        type="button"
                        aria-label="Close admin navigation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`admin-shell-sidebar fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r transition-all duration-300 ${
                    sidebarOpen ? 'w-72' : 'w-20'
                } ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Logo & Brand */}
                <div className="h-20 flex items-center justify-between px-5 border-b border-white/[0.08]">
                    {sidebarOpen ? (
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-400/20 flex items-center justify-center group-hover:border-emerald-400/40 transition-colors">
                                <BrainCircuit className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-base font-semibold text-white tracking-tight">
                                    BCIP Admin
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                    Intelligence Platform
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] flex items-center justify-center mx-auto transition-colors"
                        >
                            <Menu size={18} className="text-slate-300" />
                            <span className="sr-only">Expand sidebar</span>
                        </button>
                    )}

                    {sidebarOpen && (
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="hidden lg:flex w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] items-center justify-center transition-colors"
                        >
                            <X size={16} className="text-slate-400" />
                            <span className="sr-only">Collapse sidebar</span>
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav aria-label="Admin navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-6">
                    {NAVIGATION_ITEMS.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label={item.label}
                                aria-current={isActive ? 'page' : undefined}
                                title={!sidebarOpen ? item.label : undefined}
                                className="block"
                            >
                                <motion.div
                                    initial={false}
                                    whileHover={{ x: sidebarOpen ? 4 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`
                                        flex items-center gap-3 px-3.5 py-3 rounded-xl
                                        transition-all duration-200
                                        ${
                                            isActive
                                                ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-300'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08]'
                                        }
                                    `}
                                >
                                    <Icon
                                        size={18}
                                        className={`flex-shrink-0 ${
                                            isActive ? 'text-emerald-300' : ''
                                        }`}
                                    />
                                    {sidebarOpen && (
                                        <span className="font-medium text-[13px]">
                                            {item.label}
                                        </span>
                                    )}
                                    {sidebarOpen && item.badge && (
                                        <span className="ml-auto bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                {sidebarOpen && (
                    <div className="p-4 border-t border-white/[0.08]">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-400/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-400 font-semibold text-sm">
                                    {user?.fullName?.[0] || user?.email?.[0] || 'A'}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-slate-300 truncate">
                                    {user?.email}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">
                                    {user?.role?.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.aside>

            {/* Main Content */}
            <motion.div
                className={`min-h-screen transition-[margin] duration-300 ${
                    sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
                }`}
            >
                {/* Top Bar */}
                <header className="h-20 bg-[#0d1322]/80 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30">
                    <div className="h-full flex items-center justify-between px-6 lg:px-8">
                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open admin navigation"
                            className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] flex items-center justify-center transition-colors"
                        >
                            <Menu size={20} className="text-slate-300" />
                        </button>

                        <div className="flex min-w-0 items-center gap-3">
                            <h1 className="truncate text-sm font-semibold text-white sm:text-base">
                                {pageTitle}
                            </h1>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <Link
                                href="/admin/notifications"
                                aria-label="View admin notifications"
                                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] transition-colors hover:border-white/[0.15] hover:bg-white/[0.08]"
                            >
                                <Bell size={18} className="text-slate-300" />
                            </Link>

                            {/* Profile Menu */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    aria-expanded={profileMenuOpen}
                                    aria-label="Open administrator account menu"
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-400/20 flex items-center justify-center">
                                        <span className="text-emerald-400 text-xs font-semibold">
                                            {user?.fullName?.[0] || user?.email?.[0] || 'A'}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className="hidden lg:block text-slate-400"
                                    />
                                </button>

                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setProfileMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-64 bg-[#111b2e] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/50 py-2 z-50 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-white/[0.08]">
                                                    <div className="font-medium text-sm text-white">
                                                        {user?.fullName || user?.email}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {user?.email}
                                                    </div>
                                                    <div className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">
                                                        {user?.role?.replace('_', ' ')}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={logout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 lg:p-8">{children}</main>

                {/* Background Effects */}
                <div
                    aria-hidden="true"
                    className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
                >
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.08] rounded-full blur-[140px]" />
                    <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-violet-500/[0.06] rounded-full blur-[160px]" />
                </div>
            </motion.div>
        </div>
    );
}
