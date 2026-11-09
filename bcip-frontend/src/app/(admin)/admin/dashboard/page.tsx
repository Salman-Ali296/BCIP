'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';
import {
    getDashboardStats,
    getComplaintTrends,
    getCategoryDistribution,
    getPriorityDistribution,
    getRecentActivity,
    getCriticalAlerts,
    type ComplaintTrend,
} from '@/lib/api/admin';

export default function AdminDashboardPage() {
    const {
        data: dashboardData,
        isPending: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const [stats, trends, categoryDist, priorityDist, activity, alerts] =
                await Promise.all([
                getDashboardStats(),
                getComplaintTrends(30),
                getCategoryDistribution(),
                getPriorityDistribution(),
                getRecentActivity(5),
                getCriticalAlerts(),
            ]);
            return { stats, trends, categoryDist, priorityDist, activity, alerts };
        },
    });
    const stats = dashboardData?.stats ?? null;
    const trends = dashboardData?.trends ?? [];
    const categoryDist = dashboardData?.categoryDist ?? [];
    const priorityDist = dashboardData?.priorityDist ?? [];
    const activity = dashboardData?.activity ?? null;
    const alerts = dashboardData?.alerts ?? [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4">
                <p className="text-red-400">
                    {error instanceof Error ? error.message : 'Failed to load dashboard data'}
                </p>
                <button
                    onClick={() => void refetch()}
                    className="mt-2 px-4 py-2 bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl hover:bg-red-400/20 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority.toUpperCase()) {
            case 'CRITICAL':
                return 'bg-red-400/10 text-red-400 border border-red-400/20';
            case 'HIGH':
                return 'bg-orange-400/10 text-orange-400 border border-orange-400/20';
            case 'MEDIUM':
                return 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20';
            case 'LOW':
                return 'bg-blue-400/10 text-blue-400 border border-blue-400/20';
            default:
                return 'bg-white/5 text-slate-400 border border-white/[0.08]';
        }
    };

    const getStatusColor = (status: string) => {
        if (['RESOLVED', 'CLOSED'].includes(status)) return 'text-emerald-400';
        if (['PENDING', 'OPEN'].includes(status)) return 'text-orange-400';
        if (status === 'ESCALATED') return 'text-red-400';
        return 'text-slate-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
        >
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-50">Dashboard</h1>
                <p className="text-slate-400 mt-1">System overview and platform statistics</p>
            </div>

            {/* Critical Alerts */}
            {alerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4 backdrop-blur-xl"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-400">
                                {alerts.length} Critical Alert{alerts.length !== 1 ? 's' : ''}
                            </h3>
                            <p className="text-sm text-red-400/80 mt-1">
                                You have unresolved critical or high-priority complaints requiring
                                attention.
                            </p>
                            <Link
                                href="/admin/moderation"
                                className="inline-block mt-2 text-sm font-medium text-red-400 hover:text-red-300 underline transition"
                            >
                                View Critical Complaints →
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Businesses"
                    value={stats?.totalBusinesses || 0}
                    subtitle={`${stats?.verifiedBusinesses || 0} verified`}
                    icon={Building2}
                    iconColor="from-blue-400 to-blue-500"
                    href="/admin/businesses"
                    delay={0.1}
                />
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    subtitle="Platform-wide"
                    icon={Users}
                    iconColor="from-emerald-400 to-emerald-500"
                    href="/admin/users"
                    delay={0.15}
                />
                <StatCard
                    title="Total Complaints"
                    value={stats?.totalComplaints || 0}
                    subtitle={`${stats?.pendingComplaints || 0} pending`}
                    icon={FileText}
                    iconColor="from-purple-400 to-purple-500"
                    href="/admin/complaints"
                    delay={0.2}
                />
                <StatCard
                    title="Resolved Complaints"
                    value={stats?.resolvedComplaints || 0}
                    subtitle={`${stats?.avgResolutionTimeHours?.toFixed(1) || 0}h avg resolution`}
                    icon={CheckCircle2}
                    iconColor="from-teal-400 to-teal-500"
                    href="/admin/analytics"
                    delay={0.25}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'In Progress', value: stats?.inProgressComplaints || 0, icon: Clock, color: 'blue' },
                    { label: 'High Priority', value: stats?.highPriorityComplaints || 0, icon: AlertTriangle, color: 'orange' },
                    { label: 'Critical', value: stats?.criticalComplaints || 0, icon: AlertCircle, color: 'red' }
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-4 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">{stat.label}</span>
                                <Icon size={16} className="text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold text-slate-50 mt-2">
                                {stat.value}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Complaint Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <h3 className="font-semibold text-slate-50 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-400" />
                        Complaint Trends (30 Days)
                    </h3>
                    <div className="h-64">
                        {trends.length > 0 ? (
                            <SimpleTrendChart data={trends} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600">
                                No trend data available
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Priority Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <h3 className="font-semibold text-slate-50 mb-4">Priority Distribution</h3>
                    <div className="space-y-3">
                        {priorityDist.length > 0 ? (
                            priorityDist.map((item, index) => (
                                <motion.div
                                    key={item.priority}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.55 + index * 0.05 }}
                                >
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-300">{item.priority}</span>
                                        <span className="text-slate-400">
                                            {item.count} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percentage}%` }}
                                            transition={{ delay: 0.55 + index * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                            className={`h-2 rounded-full ${
                                                item.priority === 'CRITICAL'
                                                    ? 'bg-gradient-to-r from-red-400 to-red-500'
                                                    : item.priority === 'HIGH'
                                                      ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                                                      : item.priority === 'MEDIUM'
                                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                                        : 'bg-gradient-to-r from-blue-400 to-blue-500'
                                            }`}
                                        />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center text-slate-600 py-8">
                                No priority data available
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Category Distribution */}
            {categoryDist.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <h3 className="font-semibold text-slate-50 mb-4">
                        Top Complaint Categories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryDist.slice(0, 6).map((item, index) => (
                            <motion.div
                                key={item.category}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.75 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="bg-white/5 border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.08] transition"
                            >
                                <div className="font-medium text-slate-50">{item.category}</div>
                                <div className="text-2xl font-bold text-emerald-400 mt-2">
                                    {item.count}
                                </div>
                                <div className="text-sm text-slate-400">{item.percentage}%</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Complaints */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-50">Recent Complaints</h3>
                        <Link
                            href="/admin/complaints"
                            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {activity?.complaints && activity.complaints.length > 0 ? (
                            activity.complaints.map((complaint, index) => (
                                <motion.div
                                    key={complaint.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.05 + index * 0.05 }}
                                >
                                    <Link
                                        href={`/admin/complaints/${complaint.id}`}
                                        className="block bg-white/5 border border-white/[0.08] rounded-xl p-3 hover:border-emerald-400/30 hover:bg-white/[0.08] transition"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-50 truncate">
                                                    {complaint.title}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {complaint.tenantName} • {complaint.trackingId}
                                                </div>
                                            </div>
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-lg ${getPriorityColor(
                                                    complaint.priority
                                                )}`}
                                            >
                                                {complaint.priority}
                                            </span>
                                        </div>
                                        <div className={`text-xs mt-2 font-medium ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center text-slate-600 py-8">
                                No recent complaints
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Business Registrations */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-50">Recent Business Registrations</h3>
                        <Link
                            href="/admin/businesses"
                            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {activity?.businesses && activity.businesses.length > 0 ? (
                            activity.businesses.map((business, index) => (
                                <motion.div
                                    key={business.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.1 + index * 0.05 }}
                                >
                                    <Link
                                        href={`/admin/businesses/${business.id}`}
                                        className="block bg-white/5 border border-white/[0.08] rounded-xl p-3 hover:border-emerald-400/30 hover:bg-white/[0.08] transition"
                                    >
                                        <div className="font-medium text-slate-50">{business.name}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {business.email}
                                            {business.industry && ` • ${business.industry}`}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-2">
                                            {new Date(business.createdAt).toLocaleDateString()}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center text-slate-600 py-8">
                                No recent registrations
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
    href,
    delay
}: {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
    href: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link
                href={href}
                className="block bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 hover:border-emerald-400/30 hover:bg-white/5 transition backdrop-blur-xl group"
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-slate-400">{title}</p>
                        <p className="text-3xl font-bold text-slate-50 mt-2">{value.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${iconColor} opacity-80 group-hover:opacity-100 transition`}>
                        <Icon size={24} className="text-white" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function SimpleTrendChart({ data }: { data: ComplaintTrend[] }) {
    if (data.length === 0) return null;

    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const displayData = data.slice(-14); // Show last 14 days

    return (
        <div className="h-full flex items-end justify-between gap-1">
            {displayData.map((item, index) => {
                const height = (item.count / maxCount) * 100;
                const date = new Date(item.date);
                const day = date.getDate();

                return (
                    <motion.div
                        key={index}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.5 + index * 0.02, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 flex flex-col items-center group"
                    >
                        <div className="relative flex-1 w-full flex items-end">
                            <div
                                className="w-full bg-gradient-to-t from-emerald-400 to-emerald-500 rounded-t hover:from-emerald-300 hover:to-emerald-400 transition-colors"
                                style={{ height: `${Math.max(height, 2)}%` }}
                                title={`${item.date}: ${item.count} complaints`}
                            />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{day}</div>
                    </motion.div>
                );
            })}
        </div>
    );
}
