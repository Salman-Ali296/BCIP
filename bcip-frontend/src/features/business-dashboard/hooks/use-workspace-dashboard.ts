"use client";

import { useQuery } from "@tanstack/react-query";
import {
    businessDashboardQueryKey,
    getBusinessDashboard,
    type BusinessDashboardFilters,
} from "@/lib/api/business-dashboard";
import { useBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";

/**
 * GET /api/v1/analytics/dashboard for the signed-in business.
 * Shared by Overview, Analytics and Categories so they cache the same response.
 */
export function useWorkspaceDashboard(range: BusinessDashboardFilters["range"]) {
    const workspace = useBusinessWorkspace();
    const filters: BusinessDashboardFilters = {
        range,
        grouping: range === "90d" ? "week" : "day",
        page: 1,
        sort: "newest",
    };

    return useQuery({
        queryKey: businessDashboardQueryKey(workspace.businessName, filters),
        queryFn: () => getBusinessDashboard(filters),
    });
}
