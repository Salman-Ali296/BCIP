"use client";

import { useState } from "react";
import {
    X,
    Shield,
    Sparkles,
    Send,
    Paperclip,
    FileText,
    CheckCircle2,
    Info,
} from "lucide-react";
import type { CustomerComplaint } from "../types";
import { ComplaintProgressTracker } from "./complaint-progress-tracker";

interface ComplaintDetailModalProps {
    complaint: CustomerComplaint | null;
    isOpen: boolean;
    onClose: () => void;
    onSendMessage?: (complaintId: string, text: string) => void;
}

export function ComplaintDetailModal({
    complaint,
    isOpen,
    onClose,
    onSendMessage,
}: ComplaintDetailModalProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "messages" | "attachments">("overview");
    const [newMessage, setNewMessage] = useState("");

    if (!isOpen || !complaint) return null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage?.(complaint.id, newMessage);
        setNewMessage("");
    };

    const getStatusTheme = (status: CustomerComplaint["status"]) => {
        switch (status) {
            case "Resolved":
                return "bg-emerald-50 text-emerald-800 border-emerald-200";
            case "Awaiting Response":
                return "bg-amber-50 text-amber-800 border-amber-200";
            case "In Progress":
                return "bg-blue-50 text-blue-800 border-blue-200";
            default:
                return "bg-slate-50 text-slate-800 border-slate-200";
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
        >
            <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                {complaint.id}
                            </span>
                            <span className="rounded bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                {complaint.category}
                            </span>
                            <span
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusTheme(
                                    complaint.status
                                )}`}
                            >
                                ● {complaint.status}
                            </span>
                            <span className="text-xs text-slate-500">
                                Priority: <strong className="text-slate-800">{complaint.priority}</strong>
                            </span>
                        </div>
                        <h2 id="detail-modal-title" className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                            {complaint.subject}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                        aria-label="Close details"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Status Reassurance Banner */}
                <div className="border-b border-blue-100 bg-blue-50/80 px-6 py-3 text-xs text-blue-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>
                            <strong>Current Status: {complaint.status}</strong> — Your complaint is currently assigned to and handled by{" "}
                            <strong>{complaint.assignedTeam}</strong>.
                        </span>
                    </div>
                    <span className="text-slate-500 hidden sm:inline">Last update: {complaint.lastUpdate}</span>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 bg-white px-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`border-b-2 py-3 px-3 text-xs font-semibold transition ${
                            activeTab === "overview"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Overview & Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("timeline")}
                        className={`border-b-2 py-3 px-3 text-xs font-semibold transition ${
                            activeTab === "timeline"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Timeline ({complaint.timeline.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("messages")}
                        className={`border-b-2 py-3 px-3 text-xs font-semibold transition flex items-center gap-1.5 ${
                            activeTab === "messages"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <span>Communication</span>
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-bold">
                            {complaint.messages.length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("attachments")}
                        className={`border-b-2 py-3 px-3 text-xs font-semibold transition ${
                            activeTab === "attachments"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Attachments ({complaint.attachments.length})
                    </button>
                </div>

                {/* Modal Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Visual Progress Tracker */}
                            <ComplaintProgressTracker
                                currentStep={complaint.currentProgressStep}
                                complaintId={complaint.id}
                                statusLabel={complaint.status}
                            />

                            {/* Complaint Information Cards */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Assigned Handler
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {complaint.assignedTeam}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {complaint.assignedAgent || "Operations specialist queued"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Reference & Submitted Date
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {complaint.referenceNumber || "Direct web portal submission"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Submitted on {complaint.submittedDate}
                                    </p>
                                </div>
                            </div>

                            {/* Description Statement */}
                            <div className="rounded-xl border border-slate-200 p-5 bg-white">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Customer Statement
                                </h4>
                                <p className="mt-2 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                                    {complaint.description}
                                </p>
                            </div>

                            {/* AI Transparency Callout */}
                            {complaint.aiTransparency && (
                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-indigo-600" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                                            Platform Routing Intelligence
                                        </h4>
                                    </div>
                                    <ul className="mt-2 space-y-1.5 text-xs text-indigo-950">
                                        <li>• {complaint.aiTransparency.categoryNote}</li>
                                        <li>• {complaint.aiTransparency.priorityNote}</li>
                                        <li>• {complaint.aiTransparency.patternNote}</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "timeline" && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900">Milestone Audit Log</h3>
                            <ol className="relative space-y-6 border-l-2 border-slate-200 pl-6 ml-2">
                                {complaint.timeline.map((event) => (
                                    <li key={event.id} className="relative">
                                        <span className="absolute -left-[33px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 ring-4 ring-white">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {event.date} — {event.timestamp}
                                                </span>
                                                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                                                    {event.actorName}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-sm font-semibold text-slate-900">
                                                {event.title}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-0.5">
                                                {event.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {activeTab === "messages" && (
                        <div className="flex flex-col h-[400px]">
                            {/* Message Thread */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                {complaint.messages.map((msg) => {
                                    const isCustomer = msg.sender === "customer";
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[11px] font-semibold text-slate-600">
                                                    {msg.senderName}
                                                </span>
                                                {msg.senderRole && (
                                                    <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] text-blue-800">
                                                        {msg.senderRole}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400">
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                                    isCustomer
                                                        ? "bg-blue-600 text-white rounded-br-xs"
                                                        : "bg-slate-100 text-slate-800 border border-slate-200/60 rounded-bl-xs"
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Secure Message Composer */}
                            <form
                                onSubmit={handleSend}
                                className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2"
                            >
                                <button
                                    type="button"
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                    title="Attach document or screenshot"
                                    aria-label="Attach file"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Write a message to Payment Operations..."
                                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
                                >
                                    <span>Send</span>
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "attachments" && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900">Submitted Documents & Proof</h3>
                            {complaint.attachments.length === 0 ? (
                                <p className="text-xs text-slate-500">No attachments were uploaded with this case.</p>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {complaint.attachments.map((att) => (
                                        <div
                                            key={att.id}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-slate-50 hover:bg-white transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-6 w-6 text-blue-600" />
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-900">{att.name}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {att.size} • {att.uploadedAt}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-blue-600 hover:underline cursor-pointer">
                                                View
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span>Protected by enterprise customer privacy policy</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
