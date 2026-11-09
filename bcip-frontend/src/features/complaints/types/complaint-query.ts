import type { ComplaintListResponse } from "@/features/complaints/types/complaint-api";

export interface ComplaintListQueryState {
    data: ComplaintListResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}