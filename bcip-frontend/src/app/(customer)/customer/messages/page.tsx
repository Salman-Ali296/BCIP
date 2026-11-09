"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Send,
    Paperclip,
    ArrowLeft,
} from "lucide-react";
import { INITIAL_COMPLAINTS } from "@/features/customer-dashboard/mock-data";
import type { CustomerComplaint } from "@/features/customer-dashboard/types";

export default function CustomerMessagesPage() {
    const [complaints, setComplaints] = useState<CustomerComplaint[]>(INITIAL_COMPLAINTS);
    const [selectedId, setSelectedId] = useState(INITIAL_COMPLAINTS[0].id);
    const [inputMessage, setInputMessage] = useState("");

    const activeComplaint = complaints.find((c) => c.id === selectedId) || complaints[0];

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        setComplaints((prev) =>
            prev.map((c) => {
                if (c.id === selectedId) {
                    return {
                        ...c,
                        messages: [
                            ...c.messages,
                            {
                                id: `msg-${Date.now()}`,
                                sender: "customer",
                                senderName: "Alex Morgan",
                                content: inputMessage,
                                timestamp: "Just now",
                            },
                        ],
                    };
                }
                return c;
            })
        );
        setInputMessage("");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/customer/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Dashboard
                        </Link>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-blue-600">Secure Messages</span>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Support Messages
                    </h1>
                    <p className="text-xs text-slate-500">
                        Direct communication threads with assigned dispute handlers and operations specialists.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden min-h-[580px]">
                {/* Threads Sidebar */}
                <div className="border-r border-slate-200 bg-slate-50/50 p-4 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                        Active Inquiries ({complaints.length})
                    </p>
                    <div className="space-y-1.5">
                        {complaints.map((c) => {
                            const isSelected = c.id === selectedId;
                            const lastMsg = c.messages[c.messages.length - 1];
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setSelectedId(c.id)}
                                    className={`w-full text-left rounded-xl p-3 transition ${
                                        isSelected
                                            ? "bg-white shadow-sm border border-slate-200 text-slate-900"
                                            : "hover:bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-blue-600">{c.id}</span>
                                        <span className="text-[10px] text-slate-400">{c.lastUpdate}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-800 truncate mt-1">
                                        {c.subject}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {lastMsg ? lastMsg.content : "No messages yet"}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Conversation Body */}
                <div className="flex flex-col justify-between p-6">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-600">{activeComplaint.id}</span>
                                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                                    {activeComplaint.assignedTeam}
                                </span>
                            </div>
                            <h2 className="text-base font-bold text-slate-900 mt-1">{activeComplaint.subject}</h2>
                        </div>
                        <Link
                            href="/customer/dashboard"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            View on Dashboard
                        </Link>
                    </div>

                    {/* Messages Thread */}
                    <div className="flex-1 overflow-y-auto space-y-4 py-6 pr-2">
                        {activeComplaint.messages.map((m) => {
                            const isCustomer = m.sender === "customer";
                            return (
                                <div
                                    key={m.id}
                                    className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-slate-600">{m.senderName}</span>
                                        {m.senderRole && (
                                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                                                {m.senderRole}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                                    </div>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                            isCustomer
                                                ? "bg-blue-600 text-white rounded-br-xs"
                                                : "bg-slate-100 text-slate-800 rounded-bl-xs"
                                        }`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Message Composer */}
                    <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-4 flex items-center gap-3">
                        <button
                            type="button"
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="Attach screenshot or receipt"
                        >
                            <Paperclip className="h-5 w-5" />
                        </button>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={`Reply to ${activeComplaint.assignedTeam}...`}
                            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
                        >
                            <span>Send</span>
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
