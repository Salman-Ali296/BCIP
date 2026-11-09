"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardComplaints } from "@/features/dashboard/services/dashboardService";
import type { FilterState } from "@/features/dashboard/types/dashboard.types";

export function useComplaintsList(filters: Pick<FilterState, "page" | "pageSize" | "statuses" | "priorities" | "categories" | "search" | "assignedTo">) {
    return useQuery({
        queryKey: ["dashboard-complaints", filters],
        queryFn: () => getDashboardComplaints({
            page: filters.page,
            limit: filters.pageSize,
            status: filters.statuses.length ? filters.statuses.join(",") : undefined,
            priority: filters.priorities.length ? filters.priorities.join(",") : undefined,
            category: filters.categories.length ? filters.categories.join(",") : undefined,
            search: filters.search.trim() || undefined,
            assignedTo: filters.assignedTo === "all" ? undefined : filters.assignedTo,
        }),
        refetchInterval: 5_000,
        placeholderData: (previous) => previous,
    });
}
