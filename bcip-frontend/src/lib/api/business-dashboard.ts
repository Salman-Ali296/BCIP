import { apiClient } from "@/lib/api/client";

export type DashboardRange = "today" | "7d" | "30d" | "90d" | "custom";
export type DashboardGrouping = "day" | "week" | "month";

export interface BusinessDashboardFilters {
    range: DashboardRange;
    grouping: DashboardGrouping;
    startDate?: string;
    endDate?: string;
    search?: string;
    sort?: "newest" | "oldest";
    status?: string;
    priority?: string;
    category?: string;
    page?: number;
}

export function businessDashboardQueryKey(
    workspaceName: string,
    filters: BusinessDashboardFilters,
) {
    return [
        "business-dashboard",
        workspaceName,
        filters.range,
        filters.grouping,
        filters.startDate ?? "",
        filters.endDate ?? "",
        filters.search ?? "",
        filters.sort ?? "newest",
        filters.status ?? "",
        filters.priority ?? "",
        filters.category ?? "",
        filters.page ?? 1,
    ] as const;
}

interface MetricComparison {
    value: number;
    previousValue?: number;
    changePercent?: number | null;
}

export interface BusinessDashboardData {
    entitlements: {
        plan: string | null;
        source: "trial" | "subscription" | null;
        trial: {
            active: boolean;
            acceptedAt: string;
            expiresAt: string;
            plan: string;
            daysRemaining: number;
        } | null;
        features: Record<string, boolean>;
        limits: {
            complaintsPerMonth: number | null;
            teamMembers: number | null;
            aiAnalysesPerMonth: number | null;
            storageMb: number | null;
        } | null;
    };
    visibility: {
        scope: "tenant" | "assigned";
    };
    period: {
        range: DashboardRange;
        grouping: DashboardGrouping;
        from: string;
        to: string;
        previousFrom: string;
        previousTo: string;
    };
    kpis: {
        totalComplaints: MetricComparison;
        workspaceComplaintCount: number;
        openComplaints: MetricComparison;
        highPriorityComplaints: MetricComparison;
        averageResolutionHours: number | null;
        resolvedComplaints: MetricComparison;
    };
    trend: Array<{ bucket: string; received: number; resolved: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
    priorityDistribution: Array<{ priority: string; count: number }>;
    sentiment: {
        sampleSize: number;
        distribution: Array<{ sentiment: string; count: number }>;
    };
    categories: Array<{ name: string; count: number; previousCount: number }>;
    ai: {
        analysis: "available" | "no_data";
        urgent: Array<{
            id: string;
            trackingId: string;
            title: string;
            priority: string;
            aiPriority: string | null;
            aiPriorityScore: number | null;
            aiUrgencyScore: number | null;
            status: string;
            createdAt: string;
        }>;
        duplicateCount: number;
        duplicates: Array<{
            id: string;
            trackingId: string;
            title: string;
            duplicateSimilarity: number | null;
            duplicateOf: { id: string; trackingId: string; title: string } | null;
            createdAt: string;
        }>;
        priorityRecommendations: Array<{
            id: string;
            trackingId: string;
            title: string;
            priority: string;
            aiPriority: string | null;
            aiPriorityScore: number | null;
            aiSummary: string | null;
        }>;
        insights: {
            complaintChangePercent: number | null;
            negativeSentimentCount: number;
            analyzedSentimentCount: number;
            leadingCategory: { name: string; count: number; previousCount: number } | null;
        };
    } | null;
    attention: Array<{
        id: string;
        trackingId: string;
        title: string;
        status: string;
        priority: string;
        aiSentiment: string | null;
        aiCategory: string | null;
        dueAt: string | null;
        createdAt: string;
        assignedTo: { id: string; fullName: string } | null;
    }>;
    recent: {
        items: Array<{
            id: string;
            trackingId: string;
            title: string;
            status: string;
            priority: string;
            aiSentiment: string | null;
            aiCategory: string | null;
            categoryName: string | null;
            createdAt: string;
            assignedTo: { id: string; fullName: string } | null;
            customer: { fullName: string | null } | null;
        }>;
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    teamPerformance: {
        activeMembers: number;
        members: Array<{
            id: string;
            name: string;
            role: string;
            team: string | null;
            openAssigned: number;
            highPriorityAssigned: number;
            resolvedInPeriod: number;
        }>;
    } | null;
}

export async function getBusinessDashboard(
    filters: BusinessDashboardFilters,
): Promise<BusinessDashboardData> {
    const params = new URLSearchParams({
        range: filters.range,
        grouping: filters.grouping,
        page: String(filters.page ?? 1),
        limit: "8",
        sort: filters.sort ?? "newest",
    });
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.category) params.set("category", filters.category);

    const response = await apiClient<{ success: true; data: BusinessDashboardData }>(
        `/api/v1/analytics/dashboard?${params.toString()}`,
        { method: "GET", cache: "no-store" },
    );
    return response.data;
}
