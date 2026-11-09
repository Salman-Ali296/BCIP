"use client";

import Link from "next/link";
import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";
import { Mail, Building } from "lucide-react";
import { BCIP_CONTACT_EMAIL, BCIP_SOCIAL_LINKS } from "@/lib/brand";

export function EnterpriseFooter() {
    return (
        <footer className="relative overflow-hidden bg-[#0c1524] text-white border-t border-white/10">
            <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center gap-2.5">
                            <HelpdeskLogo size="md" showText={true} theme="dark" />
                        </div>
                        <p className="mt-2 text-xs font-semibold text-[#b8edcf]">
                            AI-Powered Business Complaint Intelligence Platform
                        </p>
                        <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                            Collect, understand, classify, prioritize, route, track, and resolve customer complaints through one intelligent platform.
                        </p>

                        <div className="mt-5 space-y-1.5 text-xs text-slate-400">
                            <a
                                href={`mailto:${BCIP_CONTACT_EMAIL}`}
                                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition"
                            >
                                <Mail className="h-3.5 w-3.5 text-blue-400" />
                                {BCIP_CONTACT_EMAIL}
                            </a>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Building className="h-3.5 w-3.5 text-blue-400" />
                                Centralized Complaint Operations
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-4 flex items-center gap-2">
                            <a
                                href={BCIP_SOCIAL_LINKS.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn"
                                className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition text-[11px] font-bold"
                            >
                                in
                            </a>
                            <a
                                href={BCIP_SOCIAL_LINKS.github}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="GitHub"
                                className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition text-[10px] font-bold"
                            >
                                GH
                            </a>
                            <a
                                href={BCIP_SOCIAL_LINKS.x}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="X"
                                className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition text-[11px] font-bold"
                            >
                                X
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Product */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Product
                        </h3>
                        <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                            <li>
                                <Link href="/#features" className="text-slate-300 hover:text-white transition">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/#how-it-works" className="text-slate-300 hover:text-white transition">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/business/dashboard" className="text-slate-300 hover:text-white transition">
                                    Business Platform
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Customers */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Customers
                        </h3>
                        <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                            <li>
                                <Link href="/complaint/new" className="text-slate-300 hover:text-white transition">
                                    Submit Complaint
                                </Link>
                            </li>
                            <li>
                                <Link href="/support/track" className="text-slate-300 hover:text-white transition">
                                    Track Complaint
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-slate-300 hover:text-white transition">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Business */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Business
                        </h3>
                        <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                            <li>
                                <Link href="/business/dashboard" className="text-slate-300 hover:text-white transition">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/business/analytics" className="text-slate-300 hover:text-white transition">
                                    Analytics
                                </Link>
                            </li>
                            <li>
                                <Link href="/business/complaints" className="text-slate-300 hover:text-white transition">
                                    Complaint Management
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 5: Company */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Company
                        </h3>
                        <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                            <li>
                                <Link href="/about" className="text-slate-300 hover:text-white transition">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-slate-300 hover:text-white transition">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-slate-300 hover:text-white transition">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <p>© 2026 BCIP. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-slate-300 transition">
                            Privacy Policy
                        </Link>
                        <span>·</span>
                        <Link href="/terms" className="hover:text-slate-300 transition">
                            Terms of Service
                        </Link>
                        <span>·</span>
                        <Link href="/support" className="hover:text-slate-300 transition">
                            Support
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
