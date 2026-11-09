import type { ComplaintResponse } from "@/features/complaints/types/complaint-api";

export interface ComplaintDetailQueryState {
    data: ComplaintResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}