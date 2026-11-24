'use client';

import { useMemo, useState, type ElementType, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Clock,
    FileText,
    RefreshCw,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    getDashboardStats,
    getComplaintTrends,
    getCategoryDistribution,
    getPriorityDistribution,
    getBusinesses,
    type ComplaintTrend,
} from '@/lib/api/admin';

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const RANGES = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
] as const;

const ACCENTS = {
    sky: { icon: 'from-sky-400 to-blue-500', hover: 'hover:border-sky-400/30' },
    emerald: { icon: 'from-emerald-400 to-teal-500', hover: 'hover:border-emerald-400/30' },
    violet: { icon: 'from-violet-400 to-purple-500', hover: 'hover:border-violet-400/30' },
    teal: { icon: 'from-teal-400 to-emerald-500', hover: 'hover:border-teal-400/30' },
} as const;

type AccentKey = keyof typeof ACCENTS;

type PriorityTheme = { bar: string; chip: string; hex: string };

const PRIORITY_STYLES: Record<string, PriorityTheme> = {
    CRITICAL: {
        bar: 'from-red-400 to-red-500',
        chip: 'bg-red-400/10 text-red-400 border-red-400/20',
        hex: '#f87171',
    },
    HIGH: {
        bar: 'from-orange-400 to-orange-500',
        chip: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
        hex: '#fb923c',
    },
    MEDIUM: {
        bar: 'from-amber-400 to-yellow-500',
        chip: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
        hex: '#fbbf24',
    },
    LOW: {
        bar: 'from-sky-400 to-blue-500',
        chip: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
        hex: '#38bdf8',
    },
};

const FALLBACK_PRIORITY: PriorityTheme = {
    bar: 'from-slate-400 to-slate-500',
    chip: 'bg-white/5 text-slate-400 border-white/10',
    hex: '#94a3b8',
};

function priorityStyle(priority?: string | null): PriorityTheme {
    if (!priority) return FALLBACK_PRIORITY;
    return PRIORITY_STYLES[priority.toUpperCase()] ?? FALLBACK_PRIORITY;
}

const nf = new Intl.NumberFormat('en-US');
const fmt = (n: number | null | undefined): string => nf.format(n ?? 0);

function shortDate(value: string | number | Date): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.45, ease: 'easeOut' },
    }),
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
    const [rangeDays, setRangeDays] = useState<number>(30);

    const {
        data,
        isPending,
        isFetching,
        error,
        refetch,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ['admin-dashboard', rangeDays],
        queryFn: async () => {
            const [stats, trends, categoryDist, priorityDist] = await Promise.all([
                getDashboardStats(),
                getComplaintTrends(rangeDays),
                getCategoryDistribution(),
                getPriorityDistribution(),
            ]);
            return { stats, trends, categoryDist, priorityDist };
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const businessesQuery = useQuery({
        queryKey: ['admin-dashboard-businesses'],
        queryFn: () =>
            getBusinesses({
                page: 1,
                limit: 5,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            }),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const stats = data?.stats ?? null;
    const trends = data?.trends ?? [];
    const categoryDist = data?.categoryDist ?? [];
    const priorityDist = data?.priorityDist ?? [];
    const recentBusinesses = businessesQuery.data?.data ?? [];
    const isRefreshing = isFetching || businessesQuery.isFetching;

    const resolutionRate = useMemo(() => {
        const total = stats?.totalComplaints ?? 0;
        if (!total) return 0;
        return Math.round(((stats?.resolvedComplaints ?? 0) / total) * 100);
    }, [stats]);

    const lastUpdated =
        dataUpdatedAt && dataUpdatedAt > 0
            ? new Date(dataUpdatedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '—';

    /* ---------------------------- states --------------------------- */

    if (isPending) return <DashboardSkeleton />;

    if (error) {
        return (
            <div className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-400" />
                        <div className="flex-1">
                            <h2 className="font-semibold text-red-400">
                                Couldn&apos;t load the dashboard
                            </h2>
                            <p className="mt-1 text-sm text-red-200/90">
                                We couldn&apos;t load the platform overview. Check your connection and try again.
                            </p>
                            <button
                                type="button"
                                onClick={() => void refetch()}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-400/20"
                            >
                                <RefreshCw size={14} />
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1440px] space-y-6">
            <header className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/50 p-5 shadow-2xl shadow-black/20 sm:p-7">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-32 -z-10 size-80 rounded-full bg-emerald-400/10 blur-3xl"
                />
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                            <Building2 size={13} aria-hidden />
                            BCIP · Admin console
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Platform overview
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                            A high-level view of platform activity. Complaint data is shown as aggregates only.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div
                            role="group"
                            aria-label="Trend range"
                            className="flex rounded-xl border border-white/10 bg-black/20 p-1"
                        >
                            {RANGES.map((range) => {
                                const active = rangeDays === range.days;
                                return (
                                    <button
                                        key={range.days}
                                        type="button"
                                        onClick={() => setRangeDays(range.days)}
                                        aria-pressed={active}
                                        className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                                            active
                                                ? 'bg-emerald-300 text-slate-950 shadow-sm'
                                                : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                void refetch();
                                void businessesQuery.refetch();
                            }}
                            disabled={isRefreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={14}
                                className={isRefreshing ? 'animate-spin' : undefined}
                            />
                            Refresh data
                        </button>
                    </div>
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-white/[0.08] pt-4 text-xs text-slate-400">
                    <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                    Last refreshed at {lastUpdated}
                </div>
            </header>

            {/* --------------------------- KPI cards --------------------------- */}
            <section
                aria-label="Key metrics"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                <StatCard
                    index={1}
                    title="Total Businesses"
                    value={stats?.totalBusinesses}
                    subtitle={`${fmt(stats?.verifiedBusinesses)} verified`}
                    icon={Building2}
                    accent="sky"
                    href="/admin/businesses"
                />
                <StatCard
                    index={2}
                    title="Total Users"
                    value={stats?.totalUsers}
                    subtitle="Across all roles"
                    icon={Users}
                    accent="emerald"
                    href="/admin/users"
                />
                <StatCard
                    index={3}
                    title="Total Complaints"
                    value={stats?.totalComplaints}
                    subtitle={`${fmt(stats?.pendingComplaints)} pending`}
                    icon={FileText}
                    accent="violet"
                    href="/admin/analytics"
                />
                <StatCard
                    index={4}
                    title="Resolved"
                    value={stats?.resolvedComplaints}
                    subtitle={`${resolutionRate}% resolution rate`}
                    icon={CheckCircle2}
                    accent="teal"
                    href="/admin/analytics"
                />
            </section>

            {/* ------------------------ Secondary stats ------------------------ */}
            <section aria-label="Workload" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MiniStat
                    index={5}
                    label="In progress"
                    value={stats?.inProgressComplaints}
                    icon={Clock}
                    tone="text-sky-400"
                />
                <MiniStat
                    index={6}
                    label="High priority"
                    value={stats?.highPriorityComplaints}
                    icon={AlertTriangle}
                    tone="text-orange-400"
                />
                <MiniStat
                    index={7}
                    label="Critical"
                    value={stats?.criticalComplaints}
                    icon={AlertCircle}
                    tone="text-red-400"
                />
            </section>

            {/* ---------------------------- Charts ---------------------------- */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <SectionCard
                    index={8}
                    className="xl:col-span-2"
                    title="Complaint volume"
                    subtitle={`Last ${rangeDays} days`}
                    icon={TrendingUp}
                    action={
                        <Link
                            href="/admin/analytics"
                            className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
                        >
                            Analytics →
                        </Link>
                    }
                >
                    <TrendChart data={trends} />
                </SectionCard>

                <SectionCard index={9} title="Priority split" subtitle="All complaints">
                    <PriorityDonut
                        data={priorityDist}
                        total={stats?.totalComplaints ?? 0}
                    />
                </SectionCard>
            </div>

            {/* ------------------------ Categories ---------------------------- */}
            {categoryDist.length > 0 && (
                <SectionCard
                    index={10}
                    title="Top complaint categories"
                    subtitle="Ranked by volume"
                >
                    <CategoryBars data={categoryDist.slice(0, 6)} />
                </SectionCard>
            )}

            {/* ------------------- Pending registrations ---------------------- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                <SectionCard
                    index={11}
                    title="Recent business registrations"
                    subtitle="Business metadata only · no complaint records"
                    icon={Building2}
                    action={
                        <Link
                            href="/admin/businesses"
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-300/10 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                        >
                            View businesses <span aria-hidden="true">→</span>
                        </Link>
                    }
                >
                    {businessesQuery.isPending ? (
                        <div className="space-y-3" role="status" aria-label="Loading recent businesses">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-14 animate-pulse rounded-xl bg-white/[0.06]"
                                />
                            ))}
                        </div>
                    ) : businessesQuery.error ? (
                        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4">
                            <p className="text-sm font-medium text-red-200">
                                Recent registrations could not be loaded.
                            </p>
                            <button
                                type="button"
                                onClick={() => void businessesQuery.refetch()}
                                className="mt-2 rounded-md text-sm font-semibold text-red-100 underline decoration-red-200/50 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
                            >
                                Try again
                            </button>
                        </div>
                    ) : recentBusinesses.length > 0 ? (
                        <ul className="divide-y divide-white/[0.08]">
                            {recentBusinesses.map((business) => (
                                <li key={business.id}>
                                    <Link
                                        href={`/admin/businesses/${business.id}`}
                                        className="group flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold text-slate-100 group-hover:text-white">
                                                {business.name}
                                            </span>
                                            <span className="mt-1 block truncate text-xs text-slate-300">
                                                {business.industry || 'Industry not provided'}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-right">
                                            <span
                                                className={`block rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                    business.businessVerified
                                                        ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200'
                                                        : 'border-amber-300/25 bg-amber-300/10 text-amber-200'
                                                }`}
                                            >
                                                {business.businessVerified ? 'Verified' : 'Pending'}
                                            </span>
                                            <span className="mt-1 block text-xs text-slate-400">
                                                {shortDate(business.createdAt)}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyState message="No business registrations are available yet." />
                    )}
                </SectionCard>

                <SectionCard
                    index={12}
                    title="Quick access"
                    subtitle="Common platform tasks"
                    icon={Users}
                >
                    <div className="space-y-2">
                        {[
                            { href: '/admin/users', label: 'Manage business users', icon: Users },
                            { href: '/admin/businesses', label: 'Review businesses', icon: Building2 },
                            { href: '/admin/analytics', label: 'View platform analytics', icon: TrendingUp },
                        ].map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 transition hover:border-emerald-300/25 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                            >
                                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
                                    <Icon size={16} aria-hidden />
                                </span>
                                <span className="flex-1 text-sm font-medium text-slate-200 group-hover:text-white">
                                    {label}
                                </span>
                                <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-200" aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Building blocks                                                    */
/* ------------------------------------------------------------------ */

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    accent,
    href,
    index,
}: {
    title: string;
    value: number | null | undefined;
    subtitle: string;
    icon: ElementType;
    accent: AccentKey;
    href: string;
    index: number;
}) {
    const theme = ACCENTS[accent];

    return (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={index}>
            <Link
                href={href}
                className={`group relative block overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-slate-900/95 to-slate-950/80 p-5 shadow-lg shadow-black/10 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-xl ${theme.hover} hover:from-slate-800/95`}
            >
                <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${theme.icon}`}
                />
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                            {title}
                        </p>
                        <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight text-white">
                            {fmt(value)}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-400">{subtitle}</p>
                    </div>
                    <span
                        aria-hidden
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.icon} shadow-lg shadow-black/20 transition group-hover:scale-105`}
                    >
                        <Icon size={18} className="text-white" />
                    </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-300 transition group-hover:text-white">
                    View details
                    <ArrowUpRight size={13} aria-hidden="true" />
                </span>
            </Link>
        </motion.div>
    );
}

function MiniStat({
    label,
    value,
    icon: Icon,
    tone,
    index,
}: {
    label: string;
    value: number | null | undefined;
    icon: ElementType;
    tone: string;
    index: number;
}) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index}
            className="rounded-2xl border border-white/[0.12] bg-slate-950/45 p-4 shadow-lg shadow-black/10 backdrop-blur-xl"
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    {label}
                </span>
                <Icon size={15} className={tone} aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-50">
                {fmt(value)}
            </p>
        </motion.div>
    );
}

function SectionCard({
    title,
    subtitle,
    icon: Icon,
    action,
    children,
    className = '',
    index = 0,
}: {
    title: string;
    subtitle?: string;
    icon?: ElementType;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    index?: number;
}) {
    return (
        <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index}
            className={`rounded-2xl border border-white/[0.12] bg-gradient-to-br from-slate-900/85 to-slate-950/75 p-5 shadow-xl shadow-black/10 backdrop-blur-xl ${className}`}
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                        {Icon && (
                            <span className="grid size-7 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
                                <Icon size={15} aria-hidden />
                            </span>
                        )}
                        {title}
                    </h2>
                    {subtitle && <p className="mt-0.5 text-xs text-slate-300">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </motion.section>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/[0.14] text-sm text-slate-300">
            {message}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Trend chart (area + line, responsive)                              */
/* ------------------------------------------------------------------ */

function TrendChart({ data }: { data: ComplaintTrend[] }) {
    const [hovered, setHovered] = useState<number | null>(null);

    const points = useMemo(
        () => data.slice(-Math.min(data.length, 30)),
        [data],
    );

    if (points.length === 0) {
        return <EmptyState message="No trend data for this period" />;
    }

    const W = 600;
    const H = 200;
    const PAD_X = 6;
    const PAD_TOP = 14;
    const PAD_BOTTOM = 8;

    const max = Math.max(...points.map((p) => p.count), 1);
    const plotH = H - PAD_TOP - PAD_BOTTOM;
    const stepX = points.length > 1 ? (W - PAD_X * 2) / (points.length - 1) : 0;

    const px = (i: number) => PAD_X + i * stepX;
    const py = (v: number) => PAD_TOP + plotH - (v / max) * plotH;

    const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(2)} ${py(p.count).toFixed(2)}`)
        .join(' ');

    const areaPath = `${linePath} L ${px(points.length - 1).toFixed(2)} ${(
        PAD_TOP + plotH
    ).toFixed(2)} L ${PAD_X} ${(PAD_TOP + plotH).toFixed(2)} Z`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1];
    const tooltipLeftPct =
        hovered !== null
            ? ((px(hovered) - PAD_X) / (W - PAD_X * 2)) * 100
            : 0;

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="h-56 w-full overflow-visible"
                role="img"
                aria-label={`Complaint volume over ${points.length} days`}
            >
                <defs>
                    <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {gridLines.map((g) => (
                    <line
                        key={g}
                        x1={0}
                        x2={W}
                        y1={PAD_TOP + plotH * g}
                        y2={PAD_TOP + plotH * g}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                    />
                ))}

                <motion.path
                    d={areaPath}
                    fill="url(#trend-fill)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                />
                <motion.path
                    d={linePath}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.25, duration: 0.9, ease: 'easeOut' }}
                />

                {hovered !== null && (
                    <>
                        <line
                            x1={px(hovered)}
                            x2={px(hovered)}
                            y1={PAD_TOP}
                            y2={PAD_TOP + plotH}
                            stroke="rgba(52,211,153,0.4)"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            vectorEffect="non-scaling-stroke"
                        />
                        <circle
                            cx={px(hovered)}
                            cy={py(points[hovered].count)}
                            r={4}
                            fill="#0d1322"
                            stroke="#34d399"
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                        />
                    </>
                )}
            </svg>

            {/* hover hit-areas */}
            <div className="absolute inset-x-0 top-0 flex h-56">
                {points.map((point, i) => (
                    <button
                        key={point.date}
                        type="button"
                        tabIndex={-1}
                        aria-label={`${shortDate(point.date)}: ${point.count} complaints`}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(i)}
                        onBlur={() => setHovered(null)}
                        className="h-full flex-1 cursor-default focus:outline-none"
                    />
                ))}
            </div>

            {/* tooltip */}
            {hovered !== null && (
                <div
                    className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-white/10 bg-ink px-2.5 py-1.5 text-xs shadow-xl"
                    style={{
                        left: `${tooltipLeftPct}%`,
                    }}
                >
                    <p className="font-semibold text-slate-100">
                        {points[hovered].count} complaints
                    </p>
                    <p className="text-slate-300">{shortDate(points[hovered].date)}</p>
                </div>
            )}

            {/* x-axis */}
            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>{shortDate(points[0].date)}</span>
                {points.length > 2 && (
                    <span>{shortDate(points[Math.floor(points.length / 2)].date)}</span>
                )}
                <span>{shortDate(points[points.length - 1].date)}</span>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Priority donut                                                     */
/* ------------------------------------------------------------------ */

function PriorityDonut({
    data,
    total,
}: {
    data: { priority: string; count: number; percentage: number }[];
    total: number;
}) {
    if (data.length === 0) {
        return <EmptyState message="No priority data available" />;
    }

    const R = 42;
    const C = 2 * Math.PI * R;

    const segments = data.map((item) => {
        const length = (Math.max(item.percentage, 0) / 100) * C;
        const segment = { ...item, length };
        return segment;
    });

    const sum = data.reduce((acc, d) => acc + d.count, 0);

    return (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative h-40 w-40 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                    <g transform="rotate(-90 50 50)">
                        <circle
                            cx="50"
                            cy="50"
                            r={R}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="12"
                        />
                        {segments.map((seg, i) => (
                            <motion.circle
                                key={seg.priority}
                                cx="50"
                                cy="50"
                                r={R}
                                fill="none"
                                stroke={priorityStyle(seg.priority).hex}
                                strokeWidth="12"
                                strokeDasharray={`${seg.length} ${C - seg.length}`}                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                            />
                        ))}
                    </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold tabular-nums text-slate-50">
                        {fmt(sum || total)}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
                        total
                    </span>
                </div>
            </div>

            <ul className="w-full space-y-2.5">
                {data.map((item) => {
                    const theme = priorityStyle(item.priority);
                    return (
                        <li key={item.priority} className="flex items-center gap-2.5 text-sm">
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: theme.hex }}
                                aria-hidden
                            />
                            <span className="flex-1 truncate text-slate-300">
                                {item.priority}
                            </span>
                            <span className="tabular-nums text-slate-300">
                                {fmt(item.count)}
                            </span>
                            <span className="w-10 text-right text-xs tabular-nums text-slate-400">
                                {item.percentage}%
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Category bars                                                      */
/* ------------------------------------------------------------------ */

function CategoryBars({
    data,
}: {
    data: { category: string; count: number; percentage: number }[];
}) {
    const max = Math.max(...data.map((d) => d.percentage), 1);

    return (
        <ul className="space-y-3.5">
            {data.map((item, i) => (
                <li key={item.category}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate font-medium text-slate-300">
                            {item.category}
                        </span>
                        <span className="shrink-0 tabular-nums text-slate-300">
                            {fmt(item.count)}
                            <span className="ml-1.5 text-xs text-slate-400">
                                {item.percentage}%
                            </span>
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.percentage / max) * 100}%` }}
                            transition={{
                                delay: 0.15 + i * 0.06,
                                duration: 0.7,
                                ease: 'easeOut',
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function DashboardSkeleton() {
    const block = 'animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]';

    return (
        <div className="space-y-6" role="status" aria-label="Loading dashboard">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-7 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
                    <div className="h-4 w-56 animate-pulse rounded-lg bg-white/[0.04]" />
                </div>
                <div className="h-10 w-48 animate-pulse rounded-xl bg-white/[0.04]" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`${block} h-32`} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`${block} h-24`} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className={`${block} h-72 xl:col-span-2`} />
                <div className={`${block} h-72`} />
            </div>

            <div className={`${block} h-56`} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className={`${block} h-64`} />
                <div className={`${block} h-64`} />
            </div>

            <span className="sr-only">Loading dashboard data…</span>
        </div>
    );
}