import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

interface LegalSection {
    title: string;
    children: ReactNode;
}

interface LegalPageProps {
    title: string;
    description: string;
    sections: LegalSection[];
}

export function LegalPage({ title, description, sections }: LegalPageProps) {
    return (
        <main className="bg-[#f6f8fb] text-slate-950">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-slate-600">
                        <FileText size={13} /> BCIP policies
                    </span>
                    <h1 className="mt-5 text-4xl font-bold tracking-[-.055em] sm:text-5xl">{title}</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
                    <p className="mt-6 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
                        This is starter content for the BCIP project. Have qualified counsel review and adapt it to the actual product, hosting, data practices and applicable requirements before production use.
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[240px_1fr] lg:px-8 lg:py-20">
                <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-28">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">On this page</p>
                    <nav className="mt-4 grid gap-2">
                        {sections.map((section, index) => (
                            <a key={section.title} href={`#section-${index + 1}`} className="text-sm text-slate-600 transition hover:text-blue-700">
                                {section.title}
                            </a>
                        ))}
                    </nav>
                    <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
                        Contact BCIP <ArrowRight size={14} />
                    </Link>
                </aside>

                <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-2 shadow-sm sm:px-10">
                    {sections.map((section, index) => (
                        <section key={section.title} id={`section-${index + 1}`} className="scroll-mt-28 border-b border-slate-100 py-8 last:border-0">
                            <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
                            <div className="prose-policy mt-3 space-y-3 text-sm leading-7 text-slate-600">{section.children}</div>
                        </section>
                    ))}
                </div>
            </section>
        </main>
    );
}
