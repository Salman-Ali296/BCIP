'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    FileText,
    Eye,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from 'lucide-react';
import {
    getAdminComplaints,
    getComplaintCategories,
    type AdminComplaint,
    type ComplaintFilters,
} from '@/lib/api/admin';

const STATUSES = [
    'PENDING',
    'AI_PROCESSING',
    'OPEN',
    'IN_PROGRESS',
    'WAITING_FOR_CUSTOMER',
    'ESCALATED',
    'RESOLVED',
    'CLOSED',
    'REOPENED',
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SENTIMENTS = ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED'];

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState<ComplaintFilters>({
        search: '',
        status: undefined,
        priority: undefined,
        sentiment: undefined,
        aiCategory: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadComplaints();
    }, [filters]);

    const loadCategories = async () => {
        try {
            const data = await getComplaintCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const loadComplaints = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getAdminComplaints(filters);
            setComplaints(result.data);
            setPagination(result.pagination);
        } catch (err: any) {
            setError(err.message || 'Failed to load complaints');
            console.error('Load complaints error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleFilterChange = (key: keyof ComplaintFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: undefined,
            priority: undefined,
            sentiment: undefined,
            aiCategory: undefined,
            dateFrom: undefined,
            dateTo: undefined,
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    };

    const activeFilterCount = [
        filters.status !== undefined,
        filters.priority !== undefined,
        filters.sentiment !== undefined,
        filters.aiCategory !== undefined,
        filters.dateFrom !== undefined,
        filters.dateTo !== undefined,
    ].filter(Boolean).length;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return 'bg-red-400/10 text-red-400 border border-red-400/20';
            case 'HIGH':
                return 'bg-orange-400/10 text-orange-400 border border-orange-400/20';
            case 'MEDIUM':
                return 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20';
            case 'LOW':
                return 'bg-blue-400/10 text-blue-400 border border-blue-400/20';
            default:
                return 'bg-white/5 text-gray-400 border border-white/[0.08]';
        }
    };

    const getStatusColor = (status: string) => {
        if (['RESOLVED', 'CLOSED'].includes(status)) return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20';
        if (['PENDING', 'OPEN', 'AI_PROCESSING'].includes(status))
            return 'bg-orange-400/10 text-orange-400 border border-orange-400/20';
        if (status === 'ESCALATED') return 'bg-red-400/10 text-red-400 border border-red-400/20';
        return 'bg-blue-400/10 text-blue-400 border border-blue-400/20';
    };

    const getSentimentColor = (sentiment: string | null) => {
        if (!sentiment) return 'bg-white/5 text-gray-400 border border-white/[0.08]';
        switch (sentiment) {
            case 'POSITIVE':
                return 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20';
            case 'NEGATIVE':
                return 'bg-red-400/10 text-red-400 border border-red-400/20';
            case 'MIXED':
                return 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20';
            default:
                return 'bg-white/5 text-gray-400 border border-white/[0.08]';
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
                    <h1 className="text-2xl font-bold text-slate-50">Complaint Monitoring</h1>
                    <p className="text-slate-400 mt-1">
                        Monitor and oversee all platform complaints
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-6 backdrop-blur-xl"
            >
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Search by tracking ID, title, or description..."
                                value={filters.search}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-emerald-400 hover:bg-emerald-400/20 transition"
                    >
                        <Filter size={20} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="bg-emerald-400 text-[#0b1120] text-xs px-2 py-0.5 rounded-full font-medium">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/[0.08]"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) =>
                                        handleFilterChange('status', e.target.value || undefined)
                                    }
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                                >
                                    <option value="">All Statuses</option>
                                    {STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={filters.priority || ''}
                                    onChange={(e) =>
                                        handleFilterChange('priority', e.target.value || undefined)
                                    }
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                                >
                                    <option value="">All Priorities</option>
                                    {PRIORITIES.map((priority) => (
                                        <option key={priority} value={priority}>
                                            {priority}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Sentiment
                                </label>
                                <select
                                    value={filters.sentiment || ''}
                                    onChange={(e) =>
                                        handleFilterChange('sentiment', e.target.value || undefined)
                                    }
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                                >
                                    <option value="">All Sentiments</option>
                                    {SENTIMENTS.map((sentiment) => (
                                        <option key={sentiment} value={sentiment}>
                                            {sentiment}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={filters.aiCategory || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'aiCategory',
                                            e.target.value || undefined
                                        )
                                    }
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateFrom || ''}
                                    onChange={(e) =>
                                        handleFilterChange('dateFrom', e.target.value || undefined)
                                    }
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={(e) =>
                                        handleFilterChange('dateTo', e.target.value || undefined)
                                    }
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                                />
                            </div>
                        </div>
                        {activeFilterCount > 0 && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {/* Results */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4"
                >
                    <p className="text-red-400">{error}</p>
                </motion.div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading complaints...</p>
                    </div>
                </div>
            ) : complaints.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0d1322] rounded-2xl border border-white/[0.08] p-12 text-center"
                >
                    <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-50 mb-2">
                        No complaints found
                    </h3>
                    <p className="text-slate-400">
                        {filters.search || activeFilterCount > 0
                            ? 'Try adjusting your search or filters'
                            : 'No complaints have been submitted yet'}
                    </p>
                </motion.div>
            ) : (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-[#0d1322] rounded-2xl border border-white/[0.08] overflow-hidden backdrop-blur-xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/[0.08]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Complaint
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Business
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Sentiment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.08]">
                                    {complaints.map((complaint, index) => (
                                        <motion.tr
                                            key={complaint.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * index, duration: 0.3 }}
                                            className="hover:bg-white/5 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-slate-50">
                                                        {complaint.title}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {complaint.trackingId}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {complaint.tenantName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {complaint.aiCategory || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex text-xs px-2.5 py-1 rounded-lg ${getPriorityColor(
                                                        complaint.priority
                                                    )}`}
                                                >
                                                    {complaint.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex text-xs px-2.5 py-1 rounded-lg ${getStatusColor(
                                                        complaint.status
                                                    )}`}
                                                >
                                                    {complaint.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {complaint.aiSentiment ? (
                                                    <span
                                                        className={`inline-flex text-xs px-2.5 py-1 rounded-lg ${getSentimentColor(
                                                            complaint.aiSentiment
                                                        )}`}
                                                    >
                                                        {complaint.aiSentiment}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/complaints/${complaint.id}`}
                                                    className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center justify-between bg-[#0d1322] rounded-2xl border border-white/[0.08] p-4"
                        >
                            <div className="text-sm text-slate-400">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                {pagination.total} complaints
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-2 bg-white/5 border border-white/[0.08] rounded-xl hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={20} className="text-slate-400" />
                                </button>
                                <span className="text-sm font-medium text-slate-300">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-3 py-2 bg-white/5 border border-white/[0.08] rounded-xl hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={20} className="text-slate-400" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </motion.div>
    );
}
