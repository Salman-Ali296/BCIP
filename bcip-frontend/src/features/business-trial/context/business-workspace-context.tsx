"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BusinessPlan } from "@/lib/api/business-billing";

export interface BusinessWorkspace {
    businessName: string;
    plan: BusinessPlan;
    isTrial: boolean;
    trialDaysRemaining: number | null;
    complaintPortalUrl: string | null;
}

const BusinessWorkspaceContext = createContext<BusinessWorkspace | null>(null);

export function BusinessWorkspaceProvider({
    value,
    children,
}: {
    value: BusinessWorkspace;
    children: ReactNode;
}) {
    return (
        <BusinessWorkspaceContext.Provider value={value}>
            {children}
        </BusinessWorkspaceContext.Provider>
    );
}

export function useBusinessWorkspace(): BusinessWorkspace {
    const workspace = useContext(BusinessWorkspaceContext);
    if (!workspace) {
        throw new Error("Business workspace context is unavailable.");
    }
    return workspace;
}

export function useOptionalBusinessWorkspace(): BusinessWorkspace | null {
    return useContext(BusinessWorkspaceContext);
}
