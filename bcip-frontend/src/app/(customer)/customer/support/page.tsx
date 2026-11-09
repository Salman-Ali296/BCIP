"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    ChevronDown,
    ChevronUp,
    PhoneCall,
    Mail,
    MessageSquare,
    ShieldCheck,
    Clock,
    FileText,
    Mic,
    Zap,
    Scale,
    HelpCircle,
    ArrowRight,
    CheckCircle2,
    Building2,
    Send,
} from "lucide-react";

interface FAQItem {
    id: string;
    category: "filing" | "voice" | "sla" | "escalation" | "security";
    question: string;
    answer: string;
}

const FAQS: FAQItem[] = [
    {
        id: "faq-1",
        category: "sla",
        question: "How does the BCIP 2-Hour SLA commitment work?",
        answer: "Every formal complaint categorized as High or Critical urgency receives verified human specialist triage and official assignment within 120 minutes of submission. Real-time SLA countdown timers are displayed in your customer portal tracker, and automated alerts escalate the ticket if response thresholds approach danger zones.",
    },
    {
        id: "faq-2",
        category: "voice",
        question: "How does the AI Voice Assistant convert audio into a formal grievance?",
        answer: "Our enterprise Natural Language Processing (NLP) pipeline transcribes your recorded voice statement in real time. It extracts key parameters including invoice numbers, financial amounts, incident dates, and emotional urgency. You have full opportunity to review, pause, or edit the transcribed text before submitting.",
    },
    {
        id: "faq-3",
        category: "filing",
        question: "What evidence documents can I attach to my complaint?",
        answer: "You can securely upload PDF contracts, bank statements, invoice receipts, shipment tracking waybills, and image screenshots (JPG, PNG) up to 15 MB per file. All attachments are scanned for malware and stored with AES-256 encryption in dedicated enterprise storage.",
    },
    {
        id: "faq-4",
        category: "filing",
        question: "Can I save a draft and complete my submission later?",
        answer: "Yes. When filling out the Structured Intake Form or using the Voice Assistant, click 'Save Draft' at any time. Your draft is securely saved locally in your browser so you can resume without losing your detailed narrative.",
    },
    {
        id: "faq-5",
        category: "escalation",
        question: "What happens when a complaint is escalated?",
        answer: "Escalations trigger immediate supervisor reassignment. The complaint is moved to the executive escalation queue, senior management is notified, and an immutable audit log entry is created detailing who escalated, the escalation reason (such as SLA Risk or Repeated Complaint), and supervisor action items.",
    },
    {
        id: "faq-6",
        category: "escalation",
        question: "What resolution settlement codes are available?",
        answer: "Resolutions are formally finalized with standardized settlement codes: Full Financial Refund, Partial Settlement Credit, Service Contract Amendment, Account Status Rectification, or Technical Bug Resolution. Each settlement includes an official closure statement signed by the department lead.",
    },
    {
        id: "faq-7",
        category: "security",
        question: "How does enterprise multi-tenant isolation protect our corporate data?",
        answer: "BCIP uses strict logical tenant boundaries. Your company's grievances, internal order references, financial statements, and employee communications are strictly isolated. External parties or unauthorized users cannot discover or query your organization's records under any circumstances.",
    },
    {
        id: "faq-8",
        category: "sla",
        question: "How do I provide post-resolution feedback (CSAT)?",
        answer: "Once your complaint is marked as Resolved, a CSAT rating prompt appears directly in your customer dashboard. You can rate the resolution from 1 to 5 stars, indicate whether your core grievance was satisfactorily resolved, and leave comments that directly impact team quality metrics.",
    },
];

export default function FAQAndSupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [expandedFaq, setExpandedFaq] = useState<string | null>("faq-1");

    // Contact Support Drawer Form
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactMessage, setContactMessage] = useState("");
    const [contactSent, setContactSent] = useState(false);

    const filteredFaqs = useMemo(() => {
        return FAQS.filter((faq) => {
            const matchesCat = selectedCategory === "all" || faq.category === selectedCategory;
            const matchesSearch =
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactEmail || !contactMessage) return;
        setContactSent(true);
        setTimeout(() => {
            setContactName("");
            setContactEmail("");
            setContactMessage("");
            setContactSent(false);
        }, 4000);
    };

    return (
        <div className="space-y-10 pb-16 font-sans">
            {/* Top Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 sm:p-12 text-white shadow-xl">
                <div className="relative z-10 max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
                        <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                        Enterprise Knowledge Base & Support Center
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                        FAQ & Customer Support
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        Find instant guidance on complaint intake, voice transcription, 2-hour SLA commitments,
                        and escalation governance. Alternatively, connect directly with our 24/7 dedicated support desk.
                    </p>

                    {/* Global FAQ Search Bar */}
                    <div className="pt-2">
                        <div className="relative max-w-xl">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search questions, SLA terms, voice guidelines, refunds..."
                                className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Direct Support Channels Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <PhoneCall className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">24/7 Priority Hotline</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Direct phone line for Platinum accounts</p>
                    </div>
                    <p className="font-mono text-xs font-bold text-blue-600">+1 (800) 555-BCIP</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <Mail className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Concierge Support Email</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Rapid triage under 30 minutes</p>
                    </div>
                    <p className="font-mono text-xs font-bold text-purple-600 truncate">
                        support@bcip-resolution.com
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <MessageSquare className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">In-Portal Messaging</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Chat with assigned case specialists</p>
                    </div>
                    <Link
                        href="/customer/messages"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                    >
                        Open Message Thread
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Scale className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Ombudsman Office</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Independent dispute arbitration</p>
                    </div>
                    <p className="text-xs font-semibold text-amber-700">ombudsman@bcip-platform.org</p>
                </div>
            </div>

            {/* Main Content Layout: FAQs (Left) + Contact Form (Right) */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left 2 Columns: Categorized FAQs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: "all", label: "All Questions" },
                            { key: "sla", label: "SLAs & Timelines" },
                            { key: "voice", label: "Voice Assistant" },
                            { key: "filing", label: "Filing & Evidence" },
                            { key: "escalation", label: "Escalations" },
                            { key: "security", label: "Security & Isolation" },
                        ].map((cat) => (
                            <button
                                key={cat.key}
                                type="button"
                                onClick={() => setSelectedCategory(cat.key)}
                                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                                    selectedCategory === cat.key
                                        ? "bg-blue-600 text-white shadow-xs font-bold"
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Accordion FAQ Items */}
                    <div className="space-y-3">
                        {filteredFaqs.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 space-y-2">
                                <HelpCircle className="mx-auto h-8 w-8 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-700">No matching FAQs found</p>
                                <p className="text-xs">Try adjusting your search keywords or category filter.</p>
                            </div>
                        ) : (
                            filteredFaqs.map((faq) => {
                                const isExpanded = expandedFaq === faq.id;
                                return (
                                    <div
                                        key={faq.id}
                                        className="rounded-2xl border border-slate-200 bg-white transition shadow-xs overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                                            className="w-full flex items-center justify-between p-4.5 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
                                        >
                                            <span className="flex items-center gap-3 pr-2">
                                                <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                                                {faq.question}
                                            </span>
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* SLA Guarantees Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Enterprise Resolution Standards
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-3 text-xs">
                            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-blue-600">
                                    <Clock className="h-4 w-4" />
                                    <span>2-Hour Initial Triage</span>
                                </div>
                                <p className="text-slate-500 text-[11px] leading-normal">
                                    Guaranteed specialist assignment within 120 minutes of formal submission.
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Human Governance</span>
                                </div>
                                <p className="text-slate-500 text-[11px] leading-normal">
                                    All financial refunds and contract settlements require officer sign-off.
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-purple-600">
                                    <Scale className="h-4 w-4" />
                                    <span>Audit Integrity</span>
                                </div>
                                <p className="text-slate-500 text-[11px] leading-normal">
                                    Every investigation step is recorded in an immutable compliance ledger.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact Support Form */}
                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="space-y-1">
                            <span className="inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                <Mail className="h-5 w-5" />
                            </span>
                            <h3 className="text-base font-bold text-slate-900">Request Support Callback</h3>
                            <p className="text-xs text-slate-500">
                                Need direct assistance with a case? Submit your inquiry to our duty manager.
                            </p>
                        </div>

                        {contactSent ? (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center space-y-2">
                                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                                <h4 className="text-sm font-bold text-emerald-900">Request Received</h4>
                                <p className="text-xs text-emerald-700">
                                    A senior support coordinator has been dispatched to your inquiry.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Your Name</label>
                                    <input
                                        type="text"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                        placeholder="e.g. Sarah Jenkins"
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Corporate Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="sarah.jenkins@company.com"
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Message / Incident Reference <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                        placeholder="Briefly state your inquiry or mention incident ID..."
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    Send Inquiry to Duty Desk
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Quick Portal Action Card */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 space-y-3">
                        <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                            Quick Portal Actions
                        </h4>
                        <div className="space-y-2">
                            <Link
                                href="/customer/complaints/new"
                                className="flex items-center justify-between rounded-xl bg-white p-3 text-xs font-semibold text-slate-800 border border-slate-200 hover:border-blue-400 transition"
                            >
                                <span>Register New Grievance</span>
                                <ArrowRight className="h-4 w-4 text-blue-600" />
                            </Link>
                            <Link
                                href="/customer/dashboard"
                                className="flex items-center justify-between rounded-xl bg-white p-3 text-xs font-semibold text-slate-800 border border-slate-200 hover:border-blue-400 transition"
                            >
                                <span>Track Active Incidents</span>
                                <ArrowRight className="h-4 w-4 text-blue-600" />
                            </Link>
                            <Link
                                href="/customer/complaints"
                                className="flex items-center justify-between rounded-xl bg-white p-3 text-xs font-semibold text-slate-800 border border-slate-200 hover:border-blue-400 transition"
                            >
                                <span>View Complaint Ledger</span>
                                <ArrowRight className="h-4 w-4 text-blue-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
