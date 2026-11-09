'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    Building2,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    getBusinesses,
    getIndustries,
    type Business,
    type BusinessFilters,
} from '@/lib/api/admin';

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [industries, setIndustries] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [filters, setFilters] = useState<BusinessFilters>({
        search: '',
        isActive: undefined,
        businessVerified: undefined,
        industry: undefined,
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        loadIndustries();
    }, []);

    useEffect(() => {
        loadBusinesses();
    }, [filters]);

    const loadIndustries = async () => {
        try {
            const data = await getIndustries();
            setIndustries(data);
        } catch (err) {
            console.error('Failed to load industries:', err);
        }
    };

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getBusinesses(filters);
            setBusinesses(result.data);
            setPagination(result.pagination);
        } catch (err: any) {
            setError(err.message || 'Failed to load businesses');
            console.error('Load businesses error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleFilterChange = (key: keyof BusinessFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            isActive: undefined,
            businessVerified: undefined,
            industry: undefined,
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    };

    const activeFilterCount = [
        filters.isActive !== undefined,
        filters.businessVerified !== undefined,
        filters.industry !== undefined,
    ].filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and monitor registered businesses
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={filters.search}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Filter size={20} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Active Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={
                                        filters.isActive === undefined
                                            ? ''
                                            : filters.isActive
                                              ? 'true'
                                              : 'false'
                                    }
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'isActive',
                                            e.target.value === ''
                                                ? undefined
                                                : e.target.value === 'true'
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">All</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            {/* Verification Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification
                                </label>
                                <select
                                    value={
                                        filters.businessVerified === undefined
                                            ? ''
                                            : filters.businessVerified
                                              ? 'true'
                                              : 'false'
                                    }
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'businessVerified',
                                            e.target.value === ''
                                                ? undefined
                                                : e.target.value === 'true'
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">All</option>
                                    <option value="true">Verified</option>
                                    <option value="false">Unverified</option>
                                </select>
                            </div>

                            {/* Industry */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Industry
                                </label>
                                <select
                                    value={filters.industry || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'industry',
                                            e.target.value || undefined
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">All Industries</option>
                                    {industries.map((industry) => (
                                        <option key={industry} value={industry}>
                                            {industry}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {activeFilterCount > 0 && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading businesses...</p>
                    </div>
                </div>
            ) : businesses.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No businesses found
                    </h3>
                    <p className="text-gray-600">
                        {filters.search || activeFilterCount > 0
                            ? 'Try adjusting your search or filters'
                            : 'No businesses have registered yet'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Business
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Industry
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Users
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Complaints
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {businesses.map((business) => (
                                        <tr
                                            key={business.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <Building2
                                                            size={20}
                                                            className="text-purple-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {business.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {business.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {business.industry || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Users size={16} />
                                                    {business._count.users}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <FileText size={16} />
                                                    {business._count.complaints}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit ${
                                                            business.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {business.isActive ? (
                                                            <CheckCircle size={12} />
                                                        ) : (
                                                            <XCircle size={12} />
                                                        )}
                                                        {business.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {business.businessVerified && (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 w-fit">
                                                            <CheckCircle size={12} />
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(business.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/businesses/${business.id}`}
                                                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-sm text-gray-600">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                {pagination.total} businesses
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-medium">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
