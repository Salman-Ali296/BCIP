'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { getFlaggedComplaints } from '@/lib/api/admin';

export default function ModerationPage() {
    const {
        data: flaggedData,
        isPending: loading,
        isFetching,
        error,
        refetch,
    } = useQuery({
        queryKey: ['admin-flagged-complaints'],
        queryFn: getFlaggedComplaints,
    });
    const flagged = flaggedData ?? [];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'bg-red-400/10 text-red-400 border-red-400/30';
            case 'HIGH':
                return 'bg-orange-400/10 text-orange-400 border-orange-400/30';
            default:
                return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50">Moderation Queue</h1>
                    <p className="text-slate-400 mt-1">
                        Review flagged and critical complaints requiring attention
                    </p>
                </div>
                <button
                    onClick={() => void refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 rounded-xl hover:bg-emerald-400/20 disabled:opacity-50 transition"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Alert */}
            {flagged.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4 backdrop-blur-xl"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-semibold text-red-400">
                                {flagged.length} Complaint{flagged.length !== 1 ? 's' : ''} Require
                                Attention
                            </h3>
                            <p className="text-sm text-red-400/80 mt-1">
                                These complaints are either critical priority, escalated, or have been
                                open for an extended period.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Error */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4"
                >
                    <p className="text-red-400">
                        {error instanceof Error ? error.message : 'Failed to load flagged complaints'}
                    </p>
                </motion.div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading flagged complaints...</p>
                    </div>
                </div>
            ) : flagged.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-12 text-center backdrop-blur-xl"
                >
                    <AlertTriangle size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-50 mb-2">
                        No Flagged Complaints
                    </h3>
                    <p className="text-slate-400">
                        All complaints are within acceptable parameters. Great job!
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {flagged.map((complaint, index) => (
                        <motion.div
                            key={complaint.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className={`bg-[#0d1322] rounded-2xl border-2 p-6 backdrop-blur-xl ${getPriorityColor(
                                complaint.priority
                            )}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${getPriorityColor(
                                                complaint.priority
                                            )}`}
                                        >
                                            {complaint.priority}
                                        </span>
                                        <span className="text-sm text-slate-400">
                                            {complaint.trackingId}
                                        </span>
                                        <span className="text-sm text-slate-400">
                                            Open for {complaint.daysOpen} days
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-50 mb-1">
                                        {complaint.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-3">
                                        {complaint.tenantName}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-400">
                                            Status: <strong className="text-slate-300">{complaint.status.replace('_', ' ')}</strong>
                                        </span>
                                        <span className="text-slate-400">
                                            Created: {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="mt-3 bg-white/5 rounded-xl px-3 py-2 text-sm border border-white/[0.08]">
                                        <strong className="text-slate-300">Reason:</strong>{' '}
                                        <span className="text-slate-400">{complaint.reason}</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/admin/complaints/${complaint.id}`}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400/10 border border-emerald-400/20 rounded-xl hover:bg-emerald-400/20 text-emerald-400 text-sm font-medium whitespace-nowrap transition"
                                >
                                    <Eye size={16} />
                                    Review
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
