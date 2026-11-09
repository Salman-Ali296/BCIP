"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
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

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
    const [selectedBusinessUnitId, setSelectedBusinessUnitId] = useState<string>("bu-retail");
    const [currentRole, setCurrentRole] = useState<EnterpriseRole>("SUPPORT_AGENT");
    const [complaints, setComplaints] = useState<EnterpriseComplaint[]>(ENTERPRISE_COMPLAINTS);
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>("BCIP-10482");
    const [activeQueue, setActiveQueue] = useState<QueueType>("MY_WORK");

    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [escalateModalComplaintId, setEscalateModalComplaintId] = useState<string | null>(null);
    const [resolveModalComplaintId, setResolveModalComplaintId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const currentUser = PERSONA_USERS[currentRole] || PERSONA_USERS.SUPPORT_AGENT;

    const activeBusinessUnit = useMemo(() => {
        return BUSINESS_UNITS.find((bu) => bu.id === selectedBusinessUnitId);
    }, [selectedBusinessUnitId]);

    const selectedComplaint = useMemo(() => {
        return complaints.find((c) => c.id === selectedComplaintId);
    }, [complaints, selectedComplaintId]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const switchRole = (role: EnterpriseRole) => {
        setCurrentRole(role);
        showToast(`Switched persona to ${PERSONA_USERS[role]?.roleLabel || role}`);
    };

    const escalateComplaint = (id: string, reason: string, targetTeam: string, comment: string) => {
        setComplaints((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    const newAudit = {
                        id: `aud-${Date.now()}`,
                        actorName: currentUser.fullName,
                        actorEmail: currentUser.email,
                        actorRole: currentUser.roleLabel,
                        action: "Escalated complaint",
                        details: `Escalated to ${targetTeam}. Reason: ${reason}.`,
                        previousState: c.status,
                        newState: "ESCALATED",
                        timestamp: "Just now",
                        ipAddress: "10.240.12.84",
                        businessUnit: c.businessUnit,
                    };
                    return {
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
                        auditTrail: [newAudit, ...c.auditTrail],
                        internalNotes: [
                            {
                                id: `note-${Date.now()}`,
                                authorName: currentUser.fullName,
                                authorRole: currentUser.roleLabel,
                                content: `Formal escalation initiated: ${reason}. Comment: ${comment}`,
                                timestamp: "Just now",
                                isRestricted: true,
                            },
                            ...c.internalNotes,
                        ],
                    };
                }
                return c;
            })
        );
        showToast(`Complaint ${id} escalated to ${targetTeam}`);
        setEscalateModalComplaintId(null);
    };

    const resolveComplaint = (id: string, resolutionCode: string, explanation: string) => {
        setComplaints((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    const newAudit = {
                        id: `aud-${Date.now()}`,
                        actorName: currentUser.fullName,
                        actorEmail: currentUser.email,
                        actorRole: currentUser.roleLabel,
                        action: "Resolved complaint",
                        details: `Resolution code: ${resolutionCode}. ${explanation}`,
                        previousState: c.status,
                        newState: "RESOLVED",
                        timestamp: "Just now",
                        ipAddress: "10.240.12.84",
                        businessUnit: c.businessUnit,
                    };
                    return {
                        ...c,
                        status: "RESOLVED",
                        sla: {
                            ...c.sla,
                            status: "ON_TRACK",
                            timeRemainingText: "Resolved within SLA",
                        },
                        auditTrail: [newAudit, ...c.auditTrail],
                        messages: [
                            ...c.messages,
                            {
                                id: `msg-${Date.now()}`,
                                sender: "SYSTEM",
                                senderName: "BCIP Resolution Desk",
                                content: `This complaint has been officially resolved: ${explanation}`,
                                timestamp: "Just now",
                            },
                        ],
                    };
                }
                return c;
            })
        );
        showToast(`Complaint ${id} marked as resolved (${resolutionCode})`);
        setResolveModalComplaintId(null);
    };

    const assignComplaint = (id: string, agentName: string, agentEmail: string) => {
        setComplaints((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    return {
                        ...c,
                        assignedAgent: { id: `usr_${Date.now()}`, name: agentName, email: agentEmail },
                        auditTrail: [
                            {
                                id: `aud-${Date.now()}`,
                                actorName: currentUser.fullName,
                                actorEmail: currentUser.email,
                                actorRole: currentUser.roleLabel,
                                action: "Reassigned complaint",
                                details: `Assigned to ${agentName} (${agentEmail})`,
                                timestamp: "Just now",
                                ipAddress: "10.240.12.84",
                                businessUnit: c.businessUnit,
                            },
                            ...c.auditTrail,
                        ],
                    };
                }
                return c;
            })
        );
        showToast(`Complaint ${id} assigned to ${agentName}`);
    };

    const addInternalNote = (id: string, content: string, isRestricted: boolean) => {
        setComplaints((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    return {
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
                    };
                }
                return c;
            })
        );
        showToast("Internal note logged to secure audit ledger.");
    };

    const sendAgentMessage = (id: string, content: string) => {
        setComplaints((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    return {
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
                    };
                }
                return c;
            })
        );
        showToast("Response sent to customer portal.");
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
                selectedComplaintId,
                setSelectedComplaintId,
                selectedComplaint,
                activeQueue,
                setActiveQueue,
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
