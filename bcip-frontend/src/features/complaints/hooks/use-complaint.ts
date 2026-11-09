import { useQuery } from "@tanstack/react-query";
import { getComplaint } from "@/features/complaints/api/complaint-api";
import { complaintQueryKeys } from "./complaint-query-keys";

export function useComplaint(complaintId: string) {
    return useQuery({
        queryKey: complaintQueryKeys.detail(complaintId),
        queryFn: () => getComplaint(complaintId),
        enabled: Boolean(complaintId),
    });
}