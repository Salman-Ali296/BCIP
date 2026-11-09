"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeBulkOperation } from "@/features/dashboard/services/dashboardService";
import type { BulkOperation } from "@/features/dashboard/types/dashboard.types";

export function useBulkOperations() { const client = useQueryClient(); return useMutation({ mutationFn: (operation: BulkOperation) => executeBulkOperation(operation), onSuccess: () => client.invalidateQueries({ queryKey: ["dashboard-complaints"] }) }); }
