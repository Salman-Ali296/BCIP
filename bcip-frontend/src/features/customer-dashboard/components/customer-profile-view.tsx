"use client";

import { useState } from "react";
import Link from "next/link";
import {
    User,
    Building2,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Clock,
    Award,
    CheckCircle2,
    KeyRound,
    Smartphone,
    Globe,
    Bell,
    FileText,
    ArrowRight,
    Save,
    ExternalLink,
    Lock,
    Laptop,
    Download,
    ChevronRight,
} from "lucide-react";

export function CustomerProfileView() {
    const [activeTab, setActiveTab] = useState<"info" | "contract" | "notifications" | "security">("info");

    // Profile form state
    const [firstName, setFirstName] = useState("Sarah");
    const [lastName, setLastName] = useState("Jenkins");
    const [email, setEmail] = useState("sarah.jenkins@apexlogistics.com");
    const [phone, setPhone] = useState("+1 (555) 234-8900");
    const [title, setTitle] = useState("VP of Procurement & Global Logistics");
    const [company, setCompany] = useState("Apex Global Logistics Inc.");
    const [department, setDepartment] = useState("Corporate Supply Chain");
    const [timezone, setTimezone] = useState("America/New_York (UTC-05:00)");
    const [language, setLanguage] = useState("English (US)");
    const [saveToast, setSaveToast] = useState("");

    // Notification toggles
    const [emailUpdates, setEmailUpdates] = useState(true);
    const [slaAlerts, setSlaAlerts] = useState(true);
    const [smsMilestones, setSmsMilestones] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [prefChannel, setPrefChannel] = useState("In-Portal Messaging");

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveToast("Profile changes saved successfully.");
        setTimeout(() => setSaveToast(""), 3500);
    };

    return (
        <div className="space-y-8 pb-16 font-sans">
            {/* Enterprise Customer Hero Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-black text-white shadow-lg shadow-blue-600/30">
                            SJ
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                                    {firstName} {lastName}
                                </h1>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Verified Corporate Account
                                </span>
                            </div>

                            <p className="text-sm font-semibold text-slate-600">
                                {title} &bull; <span className="text-slate-900">{company}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-mono">
                                <span>Customer ID: <strong className="text-slate-800">CUST-84920</strong></span>
                                <span>&bull;</span>
                                <span>Tier: <strong className="text-blue-600">Platinum Enterprise SLA</strong></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/customer/complaints/new"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition"
                        >
                            Submit Grievance
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/customer/support"
                            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition"
                        >
                            FAQ & Support
                        </Link>
                    </div>
                </div>

                {/* Account Metrics Bar */}
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
                        <span className="text-xs text-slate-500 font-medium">Total Grievances</span>
                        <p className="mt-1 text-2xl font-black text-slate-900">6</p>
                    </div>

                    <div className="rounded-xl bg-blue-50/60 p-4 border border-blue-200/60">
                        <span className="text-xs text-blue-700 font-medium">Active Investigation</span>
                        <p className="mt-1 text-2xl font-black text-blue-900">1</p>
                    </div>

                    <div className="rounded-xl bg-emerald-50/60 p-4 border border-emerald-200/60">
                        <span className="text-xs text-emerald-700 font-medium">Resolved & Settled</span>
                        <p className="mt-1 text-2xl font-black text-emerald-900">5</p>
                    </div>

                    <div className="rounded-xl bg-purple-50/60 p-4 border border-purple-200/60">
                        <span className="text-xs text-purple-700 font-medium">CSAT Satisfaction</span>
                        <p className="mt-1 text-2xl font-black text-purple-900">4.8 / 5.0</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 shadow-xs">
                <button
                    type="button"
                    onClick={() => setActiveTab("info")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition ${
                        activeTab === "info"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <User className="h-4 w-4" />
                    Profile Details
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("contract")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition ${
                        activeTab === "contract"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <Building2 className="h-4 w-4" />
                    Enterprise Contract & SLA
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("notifications")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition ${
                        activeTab === "notifications"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <Bell className="h-4 w-4" />
                    Notification Channels
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition ${
                        activeTab === "security"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <ShieldCheck className="h-4 w-4" />
                    Security & MFA
                </button>
            </div>

            {/* TAB 1: PROFILE DETAILS */}
            {activeTab === "info" && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-xs space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Personal & Professional Identity</h3>
                                <p className="text-xs text-slate-500">
                                    Your verified enterprise credentials attached to complaint investigations.
                                </p>
                            </div>
                            {saveToast && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {saveToast}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Corporate Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                    />
                                    <span className="absolute right-3 top-2.5 text-emerald-600 text-xs font-bold">
                                        Verified
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Direct Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Job Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Department</label>
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Organization Name</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Default Timezone</label>
                                <input
                                    type="text"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition"
                            >
                                <Save className="h-4 w-4" />
                                Save Profile Changes
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* TAB 2: ENTERPRISE CONTRACT & SLA */}
            {activeTab === "contract" && (
                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-xs space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Enterprise Service Agreement</h3>
                            <p className="text-xs text-slate-500">
                                Master agreement details governing incident triage, escalation protocols, and financial remedy.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                    Contract Reference
                                </span>
                                <p className="font-mono text-base font-black text-slate-900">MSA-2025-GL-891</p>
                                <p className="text-xs text-slate-500">Effective: Jan 2025 &ndash; Dec 2027</p>
                            </div>

                            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-2">
                                <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
                                    SLA Guarantee Tier
                                </span>
                                <p className="text-base font-black text-blue-950">Tier 1 Platinum</p>
                                <p className="text-xs text-blue-700">120-Minute Triage &bull; 24h Resolution</p>
                            </div>

                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
                                <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                                    Ombudsman Protection
                                </span>
                                <p className="text-base font-black text-emerald-950">Active Escrow</p>
                                <p className="text-xs text-emerald-700">Independent Dispute Review</p>
                            </div>
                        </div>

                        {/* Dedicated Client Partner Contact Card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                            <h4 className="text-sm font-bold text-slate-900">Dedicated Enterprise Account Director</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                                        DV
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900 text-sm">David Vance</h5>
                                        <p className="text-xs text-slate-500">Senior Client Partner &bull; Global Financial Solutions</p>
                                        <p className="text-xs font-mono text-blue-600 mt-0.5">d.vance@bcip-resolution.com</p>
                                    </div>
                                </div>

                                <Link
                                    href="/customer/messages"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                                >
                                    Message Partner
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: NOTIFICATION PREFERENCES */}
            {activeTab === "notifications" && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-xs space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Communication & Notification Preferences</h3>
                        <p className="text-xs text-slate-500">
                            Configure how and when you receive milestone alerts for active grievances.
                        </p>
                    </div>

                    <div className="space-y-4 divide-y divide-slate-100">
                        <div className="flex items-center justify-between pt-3">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-slate-900">Email Case Updates</h4>
                                <p className="text-xs text-slate-500">
                                    Receive instantaneous notifications when a specialist posts a response or updates status.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={emailUpdates}
                                onChange={(e) => setEmailUpdates(e.target.checked)}
                                className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-slate-900">SLA Warning Alerts</h4>
                                <p className="text-xs text-slate-500">
                                    Get notified if an incident resolution timer reaches &apos;At Risk&apos; status (30 minutes remaining).
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={slaAlerts}
                                onChange={(e) => setSlaAlerts(e.target.checked)}
                                className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-slate-900">SMS Milestone Alerts</h4>
                                <p className="text-xs text-slate-500">
                                    Receive direct SMS notifications for Critical incidents and formal resolution offers.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={smsMilestones}
                                onChange={(e) => setSmsMilestones(e.target.checked)}
                                className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-slate-900">Weekly Executive Digest</h4>
                                <p className="text-xs text-slate-500">
                                    Receive a weekly consolidated summary report of all company complaints and SLAs.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={weeklyDigest}
                                onChange={(e) => setWeeklyDigest(e.target.checked)}
                                className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: SECURITY & MFA */}
            {activeTab === "security" && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-xs space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Security & Credentials</h3>
                        <p className="text-xs text-slate-500">
                            Authentication settings, multi-factor verification, and active browser sessions.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-800">Two-Factor Authentication (2FA)</span>
                                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                                    Active
                                </span>
                            </div>
                            <p className="text-xs text-emerald-700">
                                Secured via hardware FIDO2 token & Authenticator App (TOTP).
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">Password Health</span>
                                <span className="text-xs text-slate-500 font-mono">Last updated: 24 days ago</span>
                            </div>
                            <p className="text-xs text-slate-600">
                                Meets enterprise complexity requirements (16+ chars, special characters).
                            </p>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="space-y-3 pt-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Workstation Sessions</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 text-xs">
                                <div className="flex items-center gap-3">
                                    <Laptop className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-bold text-slate-900">Windows 11 &bull; Chrome Desktop</p>
                                        <p className="text-slate-500 text-[11px]">New York, US &bull; IP: 198.51.100.42 (Current Session)</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                    This Device
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 text-xs">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="h-5 w-5 text-slate-500" />
                                    <div>
                                        <p className="font-bold text-slate-900">Apple iPhone 15 Pro &bull; Mobile Safari</p>
                                        <p className="text-slate-500 text-[11px]">New York, US &bull; Active 2 hours ago</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-rose-600 hover:underline"
                                >
                                    Revoke
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
