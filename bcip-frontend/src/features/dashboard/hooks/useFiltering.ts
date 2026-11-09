"use client";

import { useMemo, useState } from "react";
import type { ComplaintListItem, FilterState } from "@/features/dashboard/types/dashboard.types";
import { filterComplaints } from "@/features/dashboard/utils/filterUtils";

const initialFilters: FilterState = { search: "", statuses: [], priorities: [], categories: [], assignedTo: "all", page: 1, pageSize: 25 };
export function useFiltering(complaints: ComplaintListItem[]) { const [filters, setFilters] = useState<FilterState>(initialFilters); const filteredComplaints = useMemo(() => filterComplaints(complaints, filters), [complaints, filters]); const updateFilters = (patch: Partial<FilterState>) => setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 })); const resetFilters = () => setFilters(initialFilters); return { filters, filteredComplaints, updateFilters, resetFilters }; }
