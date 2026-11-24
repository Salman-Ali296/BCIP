import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ShieldCheck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Explore how BCIP supports customer experience, operations, and quality teams handling business complaints.",
};

const audiences = [
  {
    id: "customer-experience",
    title: "Customer experience teams",
    description:
      "Give customers a direct way to share an issue, then review the complaint and its progress from a consistent record.",
    icon: Users,
    points: [
      "Public complaint intake without customer accounts",
      "A tracking ID customers can use for status checks",
      "A clear record for business follow-up",
    ],
  },
  {
    id: "operations",
    title: "Operations leaders",
    description:
      "Organize incoming complaints in a business workspace so the right people can review, assign, and follow up on work.",
    icon: BarChart3,
    points: [
      "Shared complaint queues for authorized staff",
      "Status and priority information in the workflow",
      "Operational views for reviewing complaint activity",
    ],
  },
  {
    id: "quality",
    title: "Quality and risk teams",
    description:
      "Use complaint records and available analysis to review recurring concerns and decide what needs further investigation.",
    icon: ShieldCheck,
    points: [
      "Complaint categories and sentiment indicators",
      "Related-issue signals for human review",
      "A workspace with role-based access",
    ],
  },
];

export default function SolutionsPage() {
  return (
    <main className="bg-wash text-slate-950">
      <section className="border-b border-slate-200 bg-ink text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
            Solutions
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A practical complaint workflow for the people who use it.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Customers need a straightforward way to raise and track an issue.
            Business teams need a shared place to review complaints and manage
            follow-up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/complaint/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Open customer portal <ArrowRight size={16} />
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Register a business <Building2 size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-14 sm:py-18 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {audiences.map(({ id, title, description, icon: Icon, points }) => (
          <article
            id={id}
            key={id}
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Icon size={20} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {description}
            </p>
            <ul className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-sm leading-5 text-slate-700"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              See how the workflow fits together
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Follow the customer and business steps from submission through
              review and tracking.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-brand sm:self-auto"
          >
            How it works <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
