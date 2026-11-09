export type AuthRole = "customer" | "businessowner" | "escalator" | "admin";

export interface RoleConfig {
    id: AuthRole;
    name: string;
    backendRole: string;
    accountType: string;
    title: string;
    badge: string;
    tagline: string;
    description: string;
    dashboardUrl: string;
    accentColor: string; // Tailwind class
    badgeClass: string;
    borderClass: string;
    activeTabClass: string;
    gradientClass: string;
    features: string[];
    perks: { icon: string; title: string; desc: string }[];
}

export const ROLES_CONFIG: Record<AuthRole, RoleConfig> = {
    customer: {
        id: "customer",
        name: "Customer",
        backendRole: "CUSTOMER",
        accountType: "CUSTOMER",
        title: "Customer Resolution Portal",
        badge: "Consumer Access",
        tagline: "Track & Resolve Personal Complaints",
        description:
            "Submit complaints with multi-modal attachments, follow real-time AI status updates, and communicate directly with official business resolution teams.",
        dashboardUrl: "/customer/dashboard",
        accentColor: "#0284c7", // Sky 600
        badgeClass: "border-sky-400/30 bg-sky-50 text-sky-700",
        borderClass: "border-sky-500/40 focus:border-sky-500 ring-sky-500/20",
        activeTabClass: "bg-sky-600 text-white shadow-md shadow-sky-600/30",
        gradientClass: "from-sky-500/20 via-blue-500/10 to-transparent",
        features: [
            "Submit voice and text complaints with image evidence",
            "Real-time ticket tracker with AI urgency status",
            "Direct two-way messaging with business resolution staff",
            "Official resolution certificates and rating system",
        ],
        perks: [
            { icon: "Ticket", title: "Live Tracking", desc: "Instant status updates on every complaint" },
            { icon: "Shield", title: "Consumer Rights", desc: "Enforce standard business SLA resolution" },
            { icon: "MessageSquare", title: "Direct Chat", desc: "Converse directly with assigned case officers" },
        ],
    },
    businessowner: {
        id: "businessowner",
        name: "Business Owner",
        backendRole: "BUSINESS_ADMIN",
        accountType: "BUSINESS",
        title: "Business Workspace Sign In",
        badge: "Enterprise & SME Workspace",
        tagline: "Complaint Triage & Team Operations",
        description:
            "Deploy AI complaint triage, configure automated SLA response timers, assign employee handlers, and track operational performance metrics.",
        dashboardUrl: "/business/dashboard",
        accentColor: "#2454d6", // Royal Blue
        badgeClass: "border-blue-400/30 bg-blue-50 text-[#2454d6]",
        borderClass: "border-blue-500/40 focus:border-blue-500 ring-blue-500/20",
        activeTabClass: "bg-[#2454d6] text-white shadow-md shadow-blue-900/30",
        gradientClass: "from-indigo-500/20 via-blue-500/10 to-transparent",
        features: [
            "AI-powered automatic complaint categorization & urgency rating",
            "Semantic duplicate clustering (≥0.80 cosine similarity)",
            "Automated SLA countdown timers and priority routing",
            "Team assignees, private staff notes & public customer responses",
        ],
        perks: [
            { icon: "BrainCircuit", title: "AI Triage", desc: "Bilingual English & Urdu NLP parsing" },
            { icon: "Building2", title: "Multi-Agent Hub", desc: "Assign staff & supervise response quality" },
            { icon: "BarChart3", title: "SLA Analytics", desc: "Track first-contact resolution & satisfaction" },
        ],
    },
    escalator: {
        id: "escalator",
        name: "Escalator",
        backendRole: "ESCALATION_AGENT",
        accountType: "ESCALATION_AGENT",
        title: "Priority Escalation Desk",
        badge: "Specialized Dispute Resolution",
        tagline: "Breached SLAs & Arbitration",
        description:
            "Dedicated high-authority portal for reviewing breached SLAs, complex multi-department disputes, executive arbitration, and regulatory compliance.",
        dashboardUrl: "/business/dashboard",
        accentColor: "#d97706", // Amber 600
        badgeClass: "border-amber-400/30 bg-amber-50 text-amber-800",
        borderClass: "border-amber-500/40 focus:border-amber-500 ring-amber-500/20",
        activeTabClass: "bg-amber-600 text-white shadow-md shadow-amber-900/30",
        gradientClass: "from-amber-500/20 via-orange-500/10 to-transparent",
        features: [
            "Priority queue with dynamic SLA breach countdown indicators",
            "Cross-department mediation tools and supervisor overrides",
            "Binding resolution issuance with compensation authorizations",
            "Audit logging for every escalation action and communication",
        ],
        perks: [
            { icon: "Zap", title: "High Urgency Radar", desc: "Instant alerts on breached SLA deadlines" },
            { icon: "Scale", title: "Arbitration Power", desc: "Issue binding resolution directives" },
            { icon: "ShieldAlert", title: "Compliance Audit", desc: "Full evidentiary log for legal review" },
        ],
    },
    admin: {
        id: "admin",
        name: "Admin",
        backendRole: "SUPER_ADMIN",
        accountType: "EMPLOYEE",
        title: "Platform Administration",
        badge: "Super Admin Governance",
        tagline: "Platform Governance & Health",
        description:
            "Full administrative authority over platform tenants, business verification, PostgreSQL multi-tenant isolation, audit trails, and AI telemetry.",
        dashboardUrl: "/admin/dashboard",
        accentColor: "#7c3aed", // Violet 600
        badgeClass: "border-purple-400/30 bg-purple-50 text-purple-700",
        borderClass: "border-purple-500/40 focus:border-purple-500 ring-purple-500/20",
        activeTabClass: "bg-purple-600 text-white shadow-md shadow-purple-900/30",
        gradientClass: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
        features: [
            "Tenant directory & enterprise business onboarding verification",
            "System-wide health telemetry and FastAPI NLP connection logs",
            "Platform RBAC role definitions and user account governance",
            "Immutable audit logs with IP tracking and correlation IDs",
        ],
        perks: [
            { icon: "ShieldCheck", title: "Multi-Tenant Control", desc: "Manage and verify enterprise tenants" },
            { icon: "Activity", title: "Telemetry & Logs", desc: "Monitor live NLP model latency and uptime" },
            { icon: "Lock", title: "Zero Trust RBAC", desc: "Enforce strict security and isolation" },
        ],
    },
};

export function isValidRole(role: string | null | undefined): role is AuthRole {
    return role === "customer" || role === "businessowner" || role === "escalator" || role === "admin";
}

export function normalizeRole(role: string | null | undefined): AuthRole {
    if (!role) return "customer";
    const lower = role.toLowerCase().replace(/[-_ ]/g, "");
    if (lower === "businessowner" || lower === "business" || lower === "businessadmin" || lower === "owner") {
        return "businessowner";
    }
    if (lower === "escalator" || lower === "escalationagent" || lower === "escalation") {
        return "escalator";
    }
    if (lower === "admin" || lower === "superadmin") {
        return "admin";
    }
    return "customer";
}
