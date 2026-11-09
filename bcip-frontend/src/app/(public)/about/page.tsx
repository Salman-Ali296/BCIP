import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Building2, MessageSquareText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "About BCIP",
    description: "Learn how BCIP helps teams turn customer complaints into operational insight.",
};

const principles = [
    {
        number: "01",
        title: "Listen in one place",
        description: "Give customers a clear way to share what happened, and give teams a structured record to work from.",
        icon: MessageSquareText,
    },
    {
        number: "02",
        title: "Understand the signal",
        description: "Use AI-assisted categorisation, sentiment, priority and similarity to help teams see patterns sooner.",
        icon: BrainCircuit,
    },
    {
        number: "03",
        title: "Keep people accountable",
        description: "Route issues into role-aware workspaces where authorised people review context and own the next step.",
        icon: ShieldCheck,
    },
];

export default function AboutPage() {
    return (
        <main className="overflow-hidden bg-white text-slate-950">
            <section className="bg-[#f4f7fd]">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-28">
                    <div>
                        <span className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-blue-700">
                            About BCIP
                        </span>
                        <h1 className="mt-6 max-w-xl text-5xl font-bold leading-[1.02] tracking-[-.06em] sm:text-6xl">
                            Better listening makes better operations.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                            BCIP is a business complaint intelligence platform designed to help organisations move from scattered feedback to a clearer, more actionable view of customer issues.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-[#2454d6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b43b4]">
                                Talk to our team <ArrowRight size={16} />
                            </Link>
                            <Link href="/#workflow" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                                See how it works
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(16,29,48,.12)]">
                        <Image
                            src="/complaint-intelligence.svg"
                            alt="Illustration of a BCIP complaint operations workspace and sample customer issue trends"
                            width={1440}
                            height={960}
                            className="h-auto w-full"
                        />
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
                <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">The idea behind the platform</p>
                    <h2 className="mt-4 text-3xl font-bold tracking-[-.04em] sm:text-4xl">
                        Treat complaints as more than cases to close.
                    </h2>
                    <p className="mt-5 text-base leading-7 text-slate-600">
                        Each complaint deserves a thoughtful response. Together, complaints can also reveal recurring friction, emerging risks and opportunities to improve the customer experience.
                    </p>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {principles.map(({ number, title, description, icon: Icon }) => (
                        <article key={number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-slate-400">{number}</span>
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon size={19} /></span>
                            </div>
                            <h3 className="mt-9 text-lg font-bold tracking-tight">{title}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="bg-[#101d30] text-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
                    <div className="flex gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#b8edcf]"><Building2 size={22} /></span>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Built for the whole organisation</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                                Customer-facing teams, operations, compliance and leadership can each work from the perspective that fits their role.
                            </p>
                        </div>
                    </div>
                    <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#b8edcf]">
                        Explore pricing <ArrowRight size={15} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
