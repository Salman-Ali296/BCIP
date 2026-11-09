"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getComplaintByTrackingId, subscribeToComplaintUpdates } from "@/features/complaints/tracking/services/trackingService";
import type { TrackedComplaint } from "@/features/complaints/tracking/services/trackingService";

export function useComplaintTracking(trackingId: string) {
    const queryClient = useQueryClient();
    const query = useQuery({ queryKey: ["complaint-tracking", trackingId], queryFn: () => getComplaintByTrackingId(trackingId), enabled: Boolean(trackingId), refetchInterval: 30_000, staleTime: 15_000 });

    useEffect(() => {
        if (!trackingId) return;
        return subscribeToComplaintUpdates(trackingId, (complaint) => queryClient.setQueryData(["complaint-tracking", trackingId], complaint));
    }, [queryClient, trackingId]);

    return query;
}

export type { TrackedComplaint };
