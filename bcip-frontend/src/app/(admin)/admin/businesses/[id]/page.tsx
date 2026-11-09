'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Users,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Shield,
    TrendingUp,
} from 'lucide-react';
import {
    getBusinessById,
    updateBusinessStatus,
    type BusinessDetail,
} from '@/lib/api/admin';

export default function BusinessDetailPage() {
    const params = useParams();
    const router = useRouter();
    const businessId = params.id as string;

    const [business, setBusiness] = useState<BusinessDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState<
        | { action: 'activate' | 'deactivate' | 'verify' | 'unverify'; title: string; message: string }
        | null
    >(null);

    useEffect(() => {
        if (businessId) {
            loadBusiness();
        }
    }, [businessId]);

    const loadBusiness = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBusinessById(businessId);
            setBusiness(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load business details');
            console.error('Load business error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (isActive: boolean) => {
        try {
            setActionLoading(true);
            await updateBusinessStatus(businessId, { isActive });
            await loadBusiness();
            setShowConfirm(null);
        } catch (err: any) {
            alert(err.message || 'Failed to update business status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerificationChange = async (businessVerified: boolean) => {
        try {
            setActionLoading(true);
            await updateBusinessStatus(businessId, { businessVerified });
            await loadBusiness();
            setShowConfirm(null);
        } catch (err: any) {
            alert(err.message || 'Failed to update verification status');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading business details...</p>
                </div>
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className="space-y-4">
                <Link
                    href="/admin/businesses"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={20} />
                    Back to Businesses
                </Link>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error || 'Business not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/admin/businesses"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft size={20} />
                Back to Businesses
            </Link>

            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building2 size={32} className="text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                            <p className="text-gray-600 mt-1">{business.email}</p>
                            <div className="flex items-center gap-3 mt-3">
                                <span
                                    className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                                        business.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {business.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {business.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                                        business.businessVerified
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {business.businessVerified ? (
                                        <CheckCircle size={14} />
                                    ) : (
                                        <AlertCircle size={14} />
                                    )}
                                    {business.businessVerified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {!business.businessVerified && (
                            <button
                                onClick={() =>
                                    setShowConfirm({
                                        action: 'verify',
                                        title: 'Verify Business',
                                        message: `Are you sure you want to verify ${business.name}? This will grant them full access to the platform.`,
                                    })
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Verify Business
                            </button>
                        )}
                        {business.businessVerified && (
                            <button
                                onClick={() =>
                                    setShowConfirm({
                                        action: 'unverify',
                                        title: 'Revoke Verification',
                                        message: `Are you sure you want to revoke verification for ${business.name}? This may restrict their access.`,
                                    })
                                }
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                            >
                                Revoke Verification
                            </button>
                        )}
                        {business.isActive ? (
                            <button
                                onClick={() =>
                                    setShowConfirm({
                                        action: 'deactivate',
                                        title: 'Deactivate Business',
                                        message: `Are you sure you want to deactivate ${business.name}? Users will not be able to access this workspace.`,
                                    })
                                }
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Deactivate
                            </button>
                        ) : (
                            <button
                                onClick={() =>
                                    setShowConfirm({
                                        action: 'activate',
                                        title: 'Activate Business',
                                        message: `Are you sure you want to activate ${business.name}?`,
                                    })
                                }
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Activate
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Complaints</span>
                        <FileText size={20} className="text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        {business.complaintStats.total}
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending</span>
                        <Clock size={20} className="text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        {business.complaintStats.pending}
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">In Progress</span>
                        <TrendingUp size={20} className="text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        {business.complaintStats.inProgress}
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Resolved</span>
                        <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        {business.complaintStats.resolved}
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Business Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Business Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {business.phone && (
                                <div className="flex items-start gap-3">
                                    <Phone size={20} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-600">Phone</div>
                                        <div className="font-medium text-gray-900">
                                            {business.phone}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {business.website && (
                                <div className="flex items-start gap-3">
                                    <Globe size={20} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-600">Website</div>
                                        <a
                                            href={business.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-purple-600 hover:text-purple-700"
                                        >
                                            {business.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {business.industry && (
                                <div className="flex items-start gap-3">
                                    <Building2 size={20} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-600">Industry</div>
                                        <div className="font-medium text-gray-900">
                                            {business.industry}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {business.teamSize && (
                                <div className="flex items-start gap-3">
                                    <Users size={20} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-600">Team Size</div>
                                        <div className="font-medium text-gray-900">
                                            {business.teamSize}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <MapPin size={20} className="text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-gray-600">Timezone</div>
                                    <div className="font-medium text-gray-900">
                                        {business.timezone}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock size={20} className="text-gray-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-gray-600">Member Since</div>
                                    <div className="font-medium text-gray-900">
                                        {new Date(business.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {business.description && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600 mb-1">Description</div>
                                <div className="text-gray-900">{business.description}</div>
                            </div>
                        )}
                    </div>

                    {/* Users */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Users ({business.users.length})
                        </h2>
                        <div className="space-y-3">
                            {business.users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-purple-600 font-medium text-sm">
                                                {user.fullName[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {user.fullName}
                                            </div>
                                            <div className="text-sm text-gray-600">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                                            {user.role.replace('_', ' ')}
                                        </span>
                                        {user.isActive && user.emailVerified && (
                                            <CheckCircle size={16} className="text-green-600" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Subscription */}
                    {(business.subscriptionStatus || business.subscriptionPlan) && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Subscription
                            </h2>
                            <div className="space-y-3">
                                {business.subscriptionPlan && (
                                    <div>
                                        <div className="text-sm text-gray-600">Plan</div>
                                        <div className="font-medium text-gray-900 capitalize">
                                            {business.subscriptionPlan}
                                        </div>
                                    </div>
                                )}
                                {business.subscriptionStatus && (
                                    <div>
                                        <div className="text-sm text-gray-600">Status</div>
                                        <div className="font-medium text-gray-900 capitalize">
                                            {business.subscriptionStatus}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Performance */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-gray-600">Avg Resolution Time</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {business.complaintStats.avgResolutionHours.toFixed(1)}h
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Resolution Rate</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {business.complaintStats.total > 0
                                        ? Math.round(
                                              (business.complaintStats.resolved /
                                                  business.complaintStats.total) *
                                                  100
                                          )
                                        : 0}
                                    %
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    {business.documents.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Documents ({business.documents.length})
                            </h2>
                            <div className="space-y-2">
                                {business.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="text-sm p-2 border border-gray-200 rounded"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {doc.documentType}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {doc.fileName} • {doc.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {showConfirm.title}
                        </h3>
                        <p className="text-gray-600 mb-6">{showConfirm.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(null)}
                                disabled={actionLoading}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (showConfirm.action === 'activate') {
                                        handleStatusChange(true);
                                    } else if (showConfirm.action === 'deactivate') {
                                        handleStatusChange(false);
                                    } else if (showConfirm.action === 'verify') {
                                        handleVerificationChange(true);
                                    } else if (showConfirm.action === 'unverify') {
                                        handleVerificationChange(false);
                                    }
                                }}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
