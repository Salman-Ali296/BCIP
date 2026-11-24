"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    EnterpriseRole,
    EnterpriseUser,
    EnterpriseComplaint,
    QueueType,
    BusinessUnit,
} from "../types";
import {
    ENTERPRISE_ORG,
    BUSINESS_UNITS,
    PERSONA_USERS,
    ENTERPRISE_COMPLAINTS,
} from "../mock-data";
import {
    escalateWorkspaceComplaint,
    fetchWorkspaceComplaints,
    mapComplaintRow,
    resolveWorkspaceComplaint,
    workspaceComplaintsQueryKey,
} from "../api/workspace-complaints";
import { useOptionalBusinessWorkspace } from "@/features/business-trial/context/business-workspace-context";
import { useAuth } from "@/providers/auth-provider";

interface EnterpriseContextType {
    // Tenant & Organization Context
    organization: typeof ENTERPRISE_ORG;
    businessUnits: BusinessUnit[];
    selectedBusinessUnitId: string;
    setSelectedBusinessUnitId: (id: string) => void;
    activeBusinessUnit: BusinessUnit | undefined;

    // User & Persona Switcher
    currentUser: EnterpriseUser;
    switchRole: (role: EnterpriseRole) => void;

    // Complaints & Queues
    complaints: EnterpriseComplaint[];
    selectedComplaintId: string | null;
    setSelectedComplaintId: (id: string | null) => void;
    selectedComplaint: EnterpriseComplaint | undefined;
    activeQueue: QueueType;
    setActiveQueue: (queue: QueueType) => void;

    /** True inside a business workspace, where complaints come from the API. */
    isLive: boolean;
    isLoadingComplaints: boolean;
    complaintsError: string | null;
    refreshComplaints: () => void;

    // Actions
    escalateComplaint: (id: string, reason: string, targetTeam: string, comment: string) => void;
    resolveComplaint: (id: string, resolutionCode: string, explanation: string) => void;
    assignComplaint: (id: string, agentName: string, agentEmail: string) => void;
    addInternalNote: (id: string, content: string, isRestricted: boolean) => void;
    sendAgentMessage: (id: string, content: string) => void;

    // Global UI State
    commandPaletteOpen: boolean;
    setCommandPaletteOpen: (open: boolean) => void;
    notificationsOpen: boolean;
    setNotificationsOpen: (open: boolean) => void;
    escalateModalComplaintId: string | null;
    setEscalateModalComplaintId: (id: string | null) => void;
    resolveModalComplaintId: string | null;
    setResolveModalComplaintId: (id: string | null) => void;

    // Toast feedback
    toastMessage: string | null;
    showToast: (msg: string) => void;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

const ROLE_LABELS: Record<string, string> = {
    BUSINESS_ADMIN: "Business admin",
    MANAGER: "Manager",
    AGENT: "Agent",
    ESCALATION_AGENT: "Escalation agent",
};

type ComplaintPatch = (complaint: EnterpriseComplaint) => EnterpriseComplaint;

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
    const workspace = useOptionalBusinessWorkspace();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const isLive = Boolean(workspace);

    const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState<string>("bu-retail");
    const [currentRole, setCurrentRole] = useState<EnterpriseRole>("SUPPORT_AGENT");
    const [mockComplaints, setMockComplaints] = useState<EnterpriseComplaint[]>(ENTERPRISE_COMPLAINTS);
    // Edits the API can't store yet (notes, messages, reassignment by name) are
    // kept per complaint for this session and layered over the live rows.
    const [localPatches, setLocalPatches] = useState<Record<string, ComplaintPatch[]>>({});
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
        isLive ? null : "BCIP-10482",
    );
    const [activeQueue, setActiveQueue] = useState<QueueType>(isLive ? "ALL" : "MY_WORK");

    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [escalateModalComplaintId, setEscalateModalComplaintId] = useState<string | null>(null);
    const [resolveModalComplaintId, setResolveModalComplaintId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const liveQuery = useQuery({
        queryKey: [...workspaceComplaintsQueryKey, workspace?.businessName ?? ""],
        queryFn: fetchWorkspaceComplaints,
        enabled: isLive,
        refetchInterval: 30_000,
    });

    const complaints = useMemo(() => {
        if (!isLive) return mockComplaints;
        // SLA text is worked out from the current time, and refreshes with each 30s refetch.
        return (liveQuery.data ?? []).map((row) => {
            const mapped = mapComplaintRow(row, workspace?.businessName ?? "");
            return (localPatches[row.id] ?? []).reduce((current, patch) => patch(current), mapped);
        });
    }, [isLive, mockComplaints, liveQuery.data, localPatches, workspace?.businessName]);

    const personaUser = PERSONA_USERS[currentRole] || PERSONA_USERS.SUPPORT_AGENT;
    const currentUser: EnterpriseUser = useMemo(
        () =>
            isLive && user
                ? {
                      ...personaUser,
                      id: user.id,
                      fullName: user.fullName ?? user.email,
                      email: user.email,
                      roleLabel: ROLE_LABELS[user.role] ?? user.role,
                      organization: workspace?.businessName ?? personaUser.organization,
                  }
                : personaUser,
        [isLive, user, personaUser, workspace?.businessName],
    );

    const activeBusinessUnit = useMemo(() => {
        return BUSINESS_UNITS.find((bu) => bu.id === selectedBusinessUnitId);
    }, [selectedBusinessUnitId]);

    const selectedComplaint = useMemo(() => {
        return complaints.find((c) => c.id === selectedComplaintId) ?? (isLive ? complaints[0] : undefined);
    }, [complaints, selectedComplaintId, isLive]);

    const showToast = useCallback((msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    }, []);

    /** Apply a change to one complaint, in mock mode or on top of live data. */
    const patchComplaint = useCallback(
        (id: string, patch: ComplaintPatch) => {
            if (isLive) {
                setLocalPatches((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), patch] }));
            } else {
                setMockComplaints((prev) => prev.map((c) => (c.id === id ? patch(c) : c)));
            }
        },
        [isLive],
    );

    const refreshComplaints = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: workspaceComplaintsQueryKey });
    }, [queryClient]);

    const switchRole = (role: EnterpriseRole) => {
        setCurrentRole(role);
        showToast(`Switched persona to ${PERSONA_USERS[role]?.roleLabel || role}`);
    };

    const auditEntry = (action: string, details: string, c: EnterpriseComplaint, newState?: string) => ({
        id: `aud-${Date.now()}`,
        actorName: currentUser.fullName,
        actorEmail: currentUser.email,
        actorRole: currentUser.roleLabel,
        action,
        details,
        ...(newState ? { previousState: c.status, newState } : {}),
        timestamp: "Just now",
        ipAddress: "",
        businessUnit: c.businessUnit,
    });

    const escalateComplaint = (id: string, reason: string, targetTeam: string, comment: string) => {
        const applyEscalation: ComplaintPatch = (c) => ({
            ...c,
            status: "ESCALATED",
            escalation: {
                isEscalated: true,
                escalatedBy: `${currentUser.fullName} (${currentUser.roleLabel})`,
                escalatedTo: targetTeam,
                reason,
                timestamp: "Just now",
                comment,
            },
            auditTrail: [auditEntry("Escalated complaint", `Escalated to ${targetTeam}. Reason: ${reason}.`, c, "ESCALATED"), ...c.auditTrail],
            internalNotes: [
                {
                    id: `note-${Date.now()}`,
                    authorName: currentUser.fullName,
                    authorRole: currentUser.roleLabel,
                    content: comment ? `Escalated: ${reason}. ${comment}` : `Escalated: ${reason}.`,
                    timestamp: "Just now",
                    isRestricted: true,
                },
                ...c.internalNotes,
            ],
        });

        setEscalateModalComplaintId(null);
        if (!isLive) {
            patchComplaint(id, applyEscalation);
            showToast(`Escalated to ${targetTeam}`);
            return;
        }

        const label = complaints.find((c) => c.id === id)?.trackingId ?? "Complaint";
        escalateWorkspaceComplaint(id, comment ? `${reason}. ${comment}` : reason)
            .then(() => {
                patchComplaint(id, applyEscalation);
                refreshComplaints();
                showToast(`${label} escalated to ${targetTeam}`);
            })
            .catch((error: unknown) =>
                showToast(error instanceof Error ? `Couldn't escalate: ${error.message}` : "Couldn't escalate. Try again."),
            );
    };

    const resolveComplaint = (id: string, resolutionCode: string, explanation: string) => {
        const applyResolution: ComplaintPatch = (c) => ({
            ...c,
            status: "RESOLVED",
            sla: { ...c.sla, status: "ON_TRACK", timeRemainingText: "Resolved", breached: false },
            auditTrail: [auditEntry("Resolved complaint", `${resolutionCode}. ${explanation}`, c, "RESOLVED"), ...c.auditTrail],
            messages: [
                ...c.messages,
                {
                    id: `msg-${Date.now()}`,
                    sender: "SYSTEM",
                    senderName: "BCIP",
                    content: `Marked as resolved: ${explanation}`,
                    timestamp: "Just now",
                },
            ],
        });

        setResolveModalComplaintId(null);
        if (!isLive) {
            patchComplaint(id, applyResolution);
            showToast(`Marked as resolved (${resolutionCode})`);
            return;
        }

        const label = complaints.find((c) => c.id === id)?.trackingId ?? "Complaint";
        resolveWorkspaceComplaint(id)
            .then(() => {
                patchComplaint(id, applyResolution);
                refreshComplaints();
                showToast(`${label} marked as resolved`);
            })
            .catch((error: unknown) =>
                showToast(error instanceof Error ? `Couldn't resolve: ${error.message}` : "Couldn't resolve. Try again."),
            );
    };

    const assignComplaint = (id: string, agentName: string, agentEmail: string) => {
        patchComplaint(id, (c) => ({
            ...c,
            assignedAgent: { id: `usr_${Date.now()}`, name: agentName, email: agentEmail },
            auditTrail: [auditEntry("Reassigned complaint", `Assigned to ${agentName}`, c), ...c.auditTrail],
        }));
        showToast(`Assigned to ${agentName}`);
    };

    const addInternalNote = (id: string, content: string, isRestricted: boolean) => {
        patchComplaint(id, (c) => ({
            ...c,
            internalNotes: [
                {
                    id: `note-${Date.now()}`,
                    authorName: currentUser.fullName,
                    authorRole: currentUser.roleLabel,
                    content,
                    timestamp: "Just now",
                    isRestricted,
                },
                ...c.internalNotes,
            ],
        }));
        showToast("Note added");
    };

    const sendAgentMessage = (id: string, content: string) => {
        patchComplaint(id, (c) => ({
            ...c,
            messages: [
                ...c.messages,
                {
                    id: `msg-${Date.now()}`,
                    sender: "AGENT",
                    senderName: currentUser.fullName,
                    senderRole: currentUser.roleLabel,
                    content,
                    timestamp: "Just now",
                },
            ],
        }));
        showToast("Reply added");
    };

    return (
        <EnterpriseContext.Provider
            value={{
                organization: ENTERPRISE_ORG,
                businessUnits: BUSINESS_UNITS,
                selectedBusinessUnitId,
                setSelectedBusinessUnitId,
                activeBusinessUnit,
                currentUser,
                switchRole,
                complaints,
                selectedComplaintId: selectedComplaint?.id ?? selectedComplaintId,
                setSelectedComplaintId,
                selectedComplaint,
                activeQueue,
                setActiveQueue,
                isLive,
                isLoadingComplaints: isLive && liveQuery.isPending,
                complaintsError: isLive && liveQuery.isError
                    ? liveQuery.error instanceof Error
                        ? liveQuery.error.message
                        : "Complaints couldn't be loaded."
                    : null,
                refreshComplaints,
                escalateComplaint,
                resolveComplaint,
                assignComplaint,
                addInternalNote,
                sendAgentMessage,
                commandPaletteOpen,
                setCommandPaletteOpen,
                notificationsOpen,
                setNotificationsOpen,
                escalateModalComplaintId,
                setEscalateModalComplaintId,
                resolveModalComplaintId,
                setResolveModalComplaintId,
                toastMessage,
                showToast,
            }}
        >
            {children}
        </EnterpriseContext.Provider>
    );
}

export function useEnterprise() {
    const context = useContext(EnterpriseContext);
    if (!context) {
        throw new Error("useEnterprise must be used within an EnterpriseProvider");
    }
    return context;
}
