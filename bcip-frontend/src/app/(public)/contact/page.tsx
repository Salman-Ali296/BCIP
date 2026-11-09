import type { Metadata } from "next";
import { ArrowUpRight, Mail, MessageSquareText } from "lucide-react";

import { BCIP_CONTACT_EMAIL, BCIP_SOCIAL_LINKS } from "@/lib/brand";

export const metadata: Metadata = {
    title: "Contact",
    description: "Contact BCIP to discuss a product walkthrough, pricing or support.",
};

const enquiryTypes = [
    { title: "Product & pricing", subject: "BCIP product and pricing enquiry", description: "Discuss your complaint workflows, team needs and a possible evaluation." },
    { title: "Support", subject: "BCIP support request", description: "Share the page or workflow you need help with and a short description of the issue." },
    { title: "Partnerships", subject: "BCIP partnership enquiry", description: "Get in touch about a collaboration, integration or project conversation." },
];

export default function ContactPage() {
    return (
        <main className="min-h-[70vh] bg-[#f6f8fb] text-slate-950">
            <section className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-28">
                <div>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-blue-700">
                        Contact BCIP
                    </span>
                    <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-[-.06em] sm:text-6xl">
                        Let’s start with your customer workflow.
                    </h1>
                    <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                        Tell us what your team wants to improve. We’ll help you explore whether BCIP is a fit and what a sensible next step could look like.
                    </p>

                    <a href={`mailto:${BCIP_CONTACT_EMAIL}`} className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><Mail size={19} /></span>
                        <span>
                            <span className="block text-xs font-semibold text-slate-500">Email</span>
                            <span className="mt-1 block text-sm font-bold text-slate-900">{BCIP_CONTACT_EMAIL}</span>
                        </span>
                        <ArrowUpRight size={17} className="ml-5 text-slate-400" />
                    </a>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <a href={BCIP_SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                            <span className="text-xs font-black">in</span> LinkedIn
                        </a>
                        <a href={BCIP_SOCIAL_LINKS.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                            <span className="text-[10px] font-black">GH</span> GitHub
                        </a>
                    </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(16,29,48,.08)] sm:p-9">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#101d30] text-white"><MessageSquareText size={19} /></span>
                        <div>
                            <h2 className="font-bold">How can we help?</h2>
                            <p className="mt-1 text-sm text-slate-500">Choose a topic to start an email conversation.</p>
                        </div>
                    </div>
                    <div className="mt-3 divide-y divide-slate-100">
                        {enquiryTypes.map((item) => (
                            <a key={item.title} href={`mailto:${BCIP_CONTACT_EMAIL}?subject=${encodeURIComponent(item.subject)}`} className="group flex items-start justify-between gap-4 py-5">
                                <span>
                                    <span className="block font-semibold text-slate-900">{item.title}</span>
                                    <span className="mt-1.5 block text-sm leading-6 text-slate-600">{item.description}</span>
                                </span>
                                <ArrowUpRight size={17} className="mt-1 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-700" />
                            </a>
                        ))}
                    </div>
                    <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                        Email opens in your email app. Please avoid including sensitive customer or account data in an initial enquiry.
                    </p>
                </div>
            </section>
        </main>
    );
}
