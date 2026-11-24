import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ClipboardList, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how customers submit and track a complaint and how business teams review it in BCIP.",
};

const steps = [
  {
    title: "Find the business",
    description:
      "Search the customer portal directory and choose the business you need to contact.",
    icon: Search,
  },
  {
    title: "Submit the complaint",
    description:
      "Describe what happened, provide your contact details, and attach supporting evidence if you have it. No customer account is required.",
    icon: ClipboardList,
  },
  {
    title: "Keep the tracking ID",
    description:
      "After submission, use the tracking ID on the customer portal to check the complaint status.",
    icon: ArrowRight,
  },
  {
    title: "Business team reviews it",
    description:
      "Authorized business staff review the complaint in their workspace and manage the follow-up.",
    icon: Building2,
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-wash text-slate-950">
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
            How it works
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            From a customer concern to a tracked business response.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            BCIP connects a public complaint portal with a business workspace.
            Customers can submit and follow a complaint without signing up;
            businesses handle the review process in their workspace.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-18 lg:px-8">
        <ol className="grid gap-4 md:grid-cols-2">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <li
              key={title}
              className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="shrink-0">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={20} />
                </span>
                <span className="mt-3 block text-center font-mono text-xs font-semibold text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Choose your next step
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Customers can open the portal. Business owners can start
              registration and verification.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/complaint/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-brand"
            >
              Customer portal <ArrowRight size={16} />
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Register a business <Building2 size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
