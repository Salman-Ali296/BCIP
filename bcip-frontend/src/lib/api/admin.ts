import { apiClient } from './client';

// ============================================
// Dashboard & Analytics
// ============================================

export interface DashboardStats {
    totalBusinesses: number;
    totalUsers: number;
    totalComplaints: number;
    pendingComplaints: number;
    inProgressComplaints: number;
    resolvedComplaints: number;
    highPriorityComplaints: number;
    criticalComplaints: number;
    avgResolutionTimeHours: number;
    verifiedBusinesses: number;
    unverifiedBusinesses: number;
}

export interface ComplaintTrend {
    date: string;
    count: number;
}

export interface CategoryDistribution {
    category: string;
    count: number;
    percentage: number;
}

export interface PriorityDistribution {
    priority: string;
    count: number;
    percentage: number;
}

export interface RecentActivity {
    complaints: Array<{
        id: string;
        trackingId: string;
        title: string;
        status: string;
        priority: string;
        tenantName: string;
        createdAt: string;
    }>;
    businesses: Array<{
        id: string;
        name: string;
        email: string;
        industry: string | null;
        createdAt: string;
    }>;
}

export interface CriticalAlert {
    id: string;
    trackingId: string;
    title: string;
    priority: string;
    status: string;
    tenantName: string;
    createdAt: string;
    daysOpen: number;
}

export interface FlaggedComplaint extends CriticalAlert {
    reason: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient<{ success: true; data: DashboardStats }>(
        '/api/v1/admin/dashboard/stats'
    );
    return response.data;
}

export async function getComplaintTrends(days: number = 30): Promise<ComplaintTrend[]> {
    const response = await apiClient<{ success: true; data: ComplaintTrend[] }>(
        `/api/v1/admin/dashboard/complaint-trends?days=${days}`
    );
    return response.data;
}

export async function getCategoryDistribution(): Promise<CategoryDistribution[]> {
    const response = await apiClient<{ success: true; data: CategoryDistribution[] }>(
        '/api/v1/admin/dashboard/category-distribution'
    );
    return response.data;
}

export async function getPriorityDistribution(): Promise<PriorityDistribution[]> {
    const response = await apiClient<{ success: true; data: PriorityDistribution[] }>(
        '/api/v1/admin/dashboard/priority-distribution'
    );
    return response.data;
}

export async function getRecentActivity(limit: number = 10): Promise<RecentActivity> {
    const response = await apiClient<{ success: true; data: RecentActivity }>(
        `/api/v1/admin/dashboard/recent-activity?limit=${limit}`
    );
    return response.data;
}

export async function getCriticalAlerts(): Promise<CriticalAlert[]> {
    const response = await apiClient<{ success: true; data: CriticalAlert[] }>(
        '/api/v1/admin/dashboard/critical-alerts'
    );
    return response.data;
}

// ============================================
// Business Management
// ============================================

export interface Business {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    industry: string | null;
    teamSize: string | null;
    isActive: boolean;
    businessVerified: boolean;
    createdAt: string;
    _count: {
        users: number;
        complaints: number;
    };
}

export interface BusinessDetail {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    website: string | null;
    industry: string | null;
    teamSize: string | null;
    description: string | null;
    logoUrl: string | null;
    timezone: string;
    isActive: boolean;
    businessVerified: boolean;
    subscriptionStatus: string | null;
    subscriptionPlan: string | null;
    createdAt: string;
    updatedAt: string;
    users: Array<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        accountType: string;
        isActive: boolean;
        emailVerified: boolean;
    }>;
    complaintStats: {
        total: number;
        pending: number;
        inProgress: number;
        resolved: number;
        avgResolutionHours: number;
    };
    documents: Array<{
        id: string;
        documentType: string;
        fileName: string;
        status: string;
        createdAt: string;
    }>;
}

export interface BusinessFilters {
    search?: string;
    isActive?: boolean;
    businessVerified?: boolean;
    industry?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export async function getBusinesses(filters: BusinessFilters = {}): Promise<{
    data: Business[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    const response = await apiClient<{
        success: true;
        data: Business[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/v1/admin/businesses?${params.toString()}`);

    return { data: response.data, pagination: response.pagination };
}

export async function getBusinessById(id: string): Promise<BusinessDetail> {
    const response = await apiClient<{ success: true; data: BusinessDetail }>(
        `/api/v1/admin/businesses/${id}`
    );
    return response.data;
}

export async function updateBusinessStatus(
    id: string,
    data: { isActive?: boolean; businessVerified?: boolean }
): Promise<void> {
    await apiClient(`/api/v1/admin/businesses/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function getIndustries(): Promise<string[]> {
    const response = await apiClient<{ success: true; data: string[] }>(
        '/api/v1/admin/businesses/industries'
    );
    return response.data;
}

// ============================================
// User Management
// ============================================

export interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    accountType: string;
    emailVerified: boolean;
    isActive: boolean;
    tenantName: string;
    createdAt: string;
    lastLoginAt: string | null;
}

export interface UserDetail {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    accountType: string;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
    tenant: {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        businessVerified: boolean;
    };
    team: {
        id: string;
        name: string;
    } | null;
    assignedComplaintsCount: number;
    resolvedComplaintsCount: number;
}

export interface UserFilters {
    search?: string;
    role?: string;
    accountType?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    tenantId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export async function getUsers(filters: UserFilters = {}): Promise<{
    data: User[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    const response = await apiClient<{
        success: true;
        data: User[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/v1/admin/users?${params.toString()}`);

    return { data: response.data, pagination: response.pagination };
}

export async function getUserById(id: string): Promise<UserDetail> {
    const response = await apiClient<{ success: true; data: UserDetail }>(
        `/api/v1/admin/users/${id}`
    );
    return response.data;
}

export async function updateUserRole(id: string, role: string): Promise<void> {
    await apiClient(`/api/v1/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
    });
}

export async function toggleUserStatus(id: string, isActive: boolean): Promise<void> {
    await apiClient(`/api/v1/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
    });
}

export async function getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    byRole: Array<{ role: string; count: number }>;
    byAccountType: Array<{ accountType: string; count: number }>;
}> {
    const response = await apiClient<{
        success: true;
        data: {
            totalUsers: number;
            activeUsers: number;
            verifiedUsers: number;
            byRole: Array<{ role: string; count: number }>;
            byAccountType: Array<{ accountType: string; count: number }>;
        };
    }>('/api/v1/admin/users/stats');
    return response.data;
}

// ============================================
// Complaint Monitoring
// ============================================

export interface AdminComplaint {
    id: string;
    trackingId: string;
    title: string;
    status: string;
    priority: string;
    aiSentiment: string | null;
    aiCategory: string | null;
    tenantName: string;
    customerEmail: string | null;
    assignedToName: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AdminComplaintDetail extends AdminComplaint {
    description: string;
    source: string;
    aiCategoryConfidence: number | null;
    aiSentimentScore: number | null;
    aiPriority: string | null;
    aiSummary: string | null;
    suggestedResponse: string | null;
    isDuplicate: boolean;
    duplicateOfId: string | null;
    resolutionNotes: string | null;
    resolutionType: string | null;
    resolvedAt: string | null;
    tenant: {
        id: string;
        name: string;
        email: string;
    };
    customer: {
        id: string;
        fullName: string | null;
        email: string | null;
        phone: string | null;
    } | null;
    assignedTo: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    } | null;
    category: {
        id: string;
        name: string;
    } | null;
    attachments: Array<{
        id: string;
        fileName: string;
        originalName: string | null;
        fileUrl: string;
        mimeType: string;
        fileSize: number | null;
        uploadedAt: string;
    }>;
    statusHistory: Array<{
        id: string;
        fromStatus: string | null;
        toStatus: string;
        comment: string | null;
        changedBy: {
            fullName: string;
            email: string;
        } | null;
        changedAt: string;
    }>;
    aiProcesses: Array<{
        id: string;
        modelName: string;
        processingType: string;
        status: string;
        confidenceScore: number | null;
        createdAt: string;
        completedAt: string | null;
    }>;
}

export interface ComplaintFilters {
    search?: string;
    status?: string;
    priority?: string;
    sentiment?: string;
    tenantId?: string;
    categoryId?: string;
    aiCategory?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export async function getAdminComplaints(filters: ComplaintFilters = {}): Promise<{
    data: AdminComplaint[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    const response = await apiClient<{
        success: true;
        data: AdminComplaint[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/v1/admin/complaints?${params.toString()}`);

    return { data: response.data, pagination: response.pagination };
}

export async function getAdminComplaintById(id: string): Promise<AdminComplaintDetail> {
    const response = await apiClient<{ success: true; data: AdminComplaintDetail }>(
        `/api/v1/admin/complaints/${id}`
    );
    return response.data;
}

export async function getFlaggedComplaints(): Promise<FlaggedComplaint[]> {
    const response = await apiClient<{
        success: true;
        data: Array<Omit<FlaggedComplaint, 'daysOpen'>>;
    }>('/api/v1/admin/complaints/flagged');
    return response.data.map((complaint) => ({
        ...complaint,
        daysOpen: Math.max(
            0,
            Math.floor(
                (Date.now() - new Date(complaint.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24),
            ),
        ),
    }));
}

export async function getComplaintCategories(): Promise<string[]> {
    const response = await apiClient<{ success: true; data: string[] }>(
        '/api/v1/admin/complaints/categories'
    );
    return response.data;
}

// ============================================
// Configuration & Categories
// ============================================

export interface CategoryConfig {
    id: string;
    name: string;
    description: string | null;
    aiLabel: string | null;
    keywords: string[];
    defaultPriority: string;
    isActive: boolean;
    tenantId: string;
    tenantName: string;
    complaintCount: number;
}

export async function getCategories(): Promise<CategoryConfig[]> {
    const response = await apiClient<{ success: true; data: CategoryConfig[] }>(
        '/api/v1/admin/config/categories'
    );
    return response.data;
}

export async function getCategoryById(id: string): Promise<CategoryConfig> {
    const response = await apiClient<{ success: true; data: CategoryConfig }>(
        `/api/v1/admin/config/categories/${id}`
    );
    return response.data;
}

export async function createCategory(data: {
    name: string;
    description?: string;
    aiLabel?: string;
    keywords?: string[];
    defaultPriority?: string;
    tenantId: string;
}): Promise<CategoryConfig> {
    const response = await apiClient<{ success: true; data: CategoryConfig }>(
        '/api/v1/admin/config/categories',
        {
            method: 'POST',
            body: JSON.stringify(data),
        }
    );
    return response.data;
}

export async function updateCategory(
    id: string,
    data: {
        name?: string;
        description?: string | null;
        aiLabel?: string | null;
        keywords?: string[];
        defaultPriority?: string;
        isActive?: boolean;
    }
): Promise<CategoryConfig> {
    const response = await apiClient<{ success: true; data: CategoryConfig }>(
        `/api/v1/admin/config/categories/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify(data),
        }
    );
    return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
    await apiClient(`/api/v1/admin/config/categories/${id}`, {
        method: 'DELETE',
    });
}

// ============================================
// AI Configuration
// ============================================

export async function getAISettings(): Promise<{
    aiEnabled: boolean;
    duplicateThreshold: number;
    autoProcessAI: boolean;
}> {
    const response = await apiClient<{
        success: true;
        data: {
            aiEnabled: boolean;
            duplicateThreshold: number;
            autoProcessAI: boolean;
        };
    }>('/api/v1/admin/ai/settings');
    return response.data;
}

export async function getAIProcessingStats(): Promise<{
    totalProcessed: number;
    successRate: number;
    avgConfidence: number;
    byType: Array<{ type: string; count: number }>;
}> {
    const response = await apiClient<{
        success: true;
        data: {
            totalProcessed: number;
            successRate: number;
            avgConfidence: number;
            byType: Array<{ type: string; count: number }>;
        };
    }>('/api/v1/admin/ai/processing-stats');
    return response.data;
}
