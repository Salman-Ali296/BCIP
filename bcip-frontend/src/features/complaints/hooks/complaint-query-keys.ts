import type { ComplaintListParams } from "@/features/complaints/api/complaint-api";

export const complaintQueryKeys = {
    all: ["complaints"] as const,

    lists: () => [...complaintQueryKeys.all, "list"] as const,

    list: (params?: ComplaintListParams) =>
        [...complaintQueryKeys.lists(), params ?? {}] as const,

    details: () => [...complaintQueryKeys.all, "detail"] as const,

    detail: (complaintId: string) =>
        [...complaintQueryKeys.details(), complaintId] as const,
};