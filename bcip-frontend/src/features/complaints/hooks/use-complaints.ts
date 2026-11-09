import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createComplaint,
    getComplaint,
    getComplaints,
    updateComplaint,
    type ComplaintListParams,
} from "@/features/complaints/api/complaint-api";
import { complaintQueryKeys } from "./complaint-query-keys";
import type { ComplaintDetailQueryState } from "@/features/complaints/types/complaint-detail-query";
import type { ComplaintListQueryState } from "@/features/complaints/types/complaint-query";
import type {
    CreateComplaintRequest,
    UpdateComplaintRequest,
} from "@/features/complaints/types/complaint-api";

export function useComplaints(
    params: ComplaintListParams = {}
): ComplaintListQueryState {
    const query = useQuery({
        queryKey: complaintQueryKeys.list(params),
        queryFn: () => getComplaints(params),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
}

export function useComplaint(
    complaintId: string
): ComplaintDetailQueryState {
    const query = useQuery({
        queryKey: complaintQueryKeys.detail(complaintId),
        queryFn: () => getComplaint(complaintId),
        enabled: Boolean(complaintId),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
}

export function useCreateComplaint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateComplaintRequest) => createComplaint(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: complaintQueryKeys.all });
        },
    });
}

export function useUpdateComplaint(complaintId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateComplaintRequest) => updateComplaint(complaintId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: complaintQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: complaintQueryKeys.detail(complaintId) });
        },
    });
}