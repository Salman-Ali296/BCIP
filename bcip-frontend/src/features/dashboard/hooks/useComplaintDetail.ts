"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardComplaint, updateDashboardComplaint } from "@/features/dashboard/services/dashboardService";

export function useComplaintDetail(id: string) { const client = useQueryClient(); const query = useQuery({ queryKey: ["dashboard-complaint", id], queryFn: () => getDashboardComplaint(id), enabled: Boolean(id) }); const update = useMutation({ mutationFn: (payload: { status?: string; priority?: string; assignedToId?: string }) => updateDashboardComplaint(id, payload), onSuccess: () => { client.invalidateQueries({ queryKey: ["dashboard-complaint", id] }); client.invalidateQueries({ queryKey: ["dashboard-complaints"] }); } }); return { ...query, update }; }
