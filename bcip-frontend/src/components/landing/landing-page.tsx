"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileSearch,
  GitMerge,
  Layers3,
  MessageSquare,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";

import { LandingNavbar } from "./landing-navbar";
import { LandingFooter } from "./landing-footer";

/* ============================================================
   DESIGN SYSTEM
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`max-w-3xl ${
        center ? "mx-auto text-center" : ""
      }`}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {eyebrow}
      </div>

      <h2 className="mt-5 text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[3.1rem]">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   REUSABLE UI
   ============================================================ */

function GridBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/[0.09] blur-[140px]"
      />
    </>
  );
}

function Eyebrow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
      <span className="h-px w-6 bg-emerald-400/70" />
      {children}
    </div>
  );
}

function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white ${className}`}
    >
      {children}
    </div>
  );
}

/* ============================================================
   ILLUSTRATIVE PRODUCT DATA
   ============================================================ */

const CASES = [
  {
    id: "CMP-2847",
    title: "Payment deducted, order not confirmed",
    category: "Payments",
    priority: "Critical",
    status: "Investigating",
    dot: "bg-red-400",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
  {
    id: "CMP-2846",
    title: "Shipment tracking has not updated",
    category: "Delivery",
    priority: "High",
    status: "Assigned",
    dot: "bg-amber-400",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    id: "CMP-2845",
    title: "Account inaccessible after password reset",
    category: "Account",
    priority: "Medium",
    status: "In progress",
    dot: "bg-blue-400",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
  },
];

const PATTERNS = [
  {
    title: "Payment processing failures",
    detail: "Related complaints",
    count: "09",
    color: "text-red-700",
    bar: "bg-red-400",
    width: "74%",
  },
  {
    title: "Delivery tracking delays",
    detail: "Related complaints",
    count: "14",
    color: "text-amber-700",
    bar: "bg-amber-400",
    width: "91%",
  },
  {
    title: "Account access problems",
    detail: "Related complaints",
    count: "06",
    color: "text-cyan-700",
    bar: "bg-cyan-400",
    width: "48%",
  },
];

/* ============================================================
   PRODUCT INTERFACE
   ============================================================ */

function ProductPreview() {
  return (
    <div className="landing-product-preview relative mx-auto w-full max-w-[940px]">
      <div
        aria-hidden="true"
        className="absolute -inset-5 rounded-[30px] bg-violet-300/30 blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        className="landing-product-window relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-violet-950/10"
      >
        {/* Application header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-violet-200 bg-violet-50">
              <BrainCircuit className="h-4 w-4 text-violet-700" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-900">
                BCIP
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-500">
              Illustrative preview
            </span>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          {/* Welcome */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Complaint overview
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                What came in this week and what needs a reply.
              </p>
            </div>

            <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] text-slate-500 sm:flex">
              <Clock3 className="h-3 w-3" />
              Sample reporting period
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Open cases",
                value: "186",
                icon: MessageSquare,
                color: "text-cyan-700",
              },
              {
                label: "High priority",
                value: "42",
                icon: CircleAlert,
                color: "text-amber-700",
              },
              {
                label: "In progress",
                value: "67",
                icon: Workflow,
                color: "text-violet-700",
              },
              {
                label: "Issue patterns",
                value: "14",
                icon: GitMerge,
                color: "text-emerald-700",
              },
            ].map((metric) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <Icon
                    className={`h-4 w-4 ${metric.color}`}
                  />

                  <p className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                    {metric.value}
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    {metric.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Complaint table */}
          <Surface className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Recent complaints
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Sample complaint records
                </p>
              </div>

              <Search className="h-4 w-4 text-slate-500" />
            </div>

            <div className="divide-y divide-slate-100">
              {CASES.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-violet-50/60 sm:px-4"
                >
                  <div className="hidden h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 sm:grid">
                    <ClipboardCheck className="h-4 w-4 text-slate-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-slate-800 sm:text-xs">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {item.id} · {item.category}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold ${item.badge}`}
                  >
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </Surface>

          {/* Intelligence panel */}
          <Surface className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-700" />

              <p className="text-xs font-semibold text-slate-900">
                Repeat problems this week
              </p>

              <span className="ml-auto rounded-full bg-violet-50 px-2 py-1 text-[9px] text-violet-700">
                Illustrative
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {PATTERNS.map((pattern) => (
                <div key={pattern.title}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium text-slate-700">
                      {pattern.title}
                    </p>

                    <span
                      className={`text-[10px] font-semibold ${pattern.color}`}
                    >
                      {pattern.count}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${pattern.bar}`}
                      style={{ width: pattern.width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-violet-100 bg-violet-50/60 p-3">
              <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />

              <p className="text-[10px] leading-5 text-slate-600">
                <span className="font-semibold text-violet-800">
                  Worth a look:{" "}
                </span>
                14 delivery complaints mention tracking that hasn&apos;t
                updated. It may be one courier issue, not 14 separate ones.
              </p>
            </div>
          </Surface>
        </div>
      </motion.div>

      {/* Floating annotation */}
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="absolute -right-2 top-[29%] hidden items-center gap-2 rounded-xl border border-violet-100 bg-white p-3 shadow-xl shadow-violet-950/10 sm:flex lg:-right-8"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50">
          <GitMerge className="h-4 w-4 text-violet-700" />
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-900">
            Pattern detection
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            3 complaints linked
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   PROBLEM SECTION
   ============================================================ */

const PROBLEMS = [
  {
    icon: Layers3,
    number: "01",
    title: "Complaints arrive everywhere",
    description:
      "Some come by email, some through the website, some by phone. Nobody has the full list, so nobody knows how many are still open.",
  },
  {
    icon: Target,
    number: "02",
    title: "Urgent cases wait in line",
    description:
      "A fraud report and a late parcel sit in the same inbox, in the order they arrived. The serious one waits its turn.",
  },
  {
    icon: Network,
    number: "03",
    title: "The same problem keeps coming back",
    description:
      "Agents close each case on its own. The broken checkout behind fifty of them stays broken.",
  },
];

/* ============================================================
   CAPABILITIES
   ============================================================ */

const CAPABILITIES = [
  {
    icon: MessageSquare,
    title: "Complaint inbox",
    description:
      "One list of every complaint, with its status, category, priority and the person handling it.",
    number: "01",
  },
  {
    icon: BrainCircuit,
    title: "Automatic categories",
    description:
      "Each complaint is sorted into billing, delivery, refund, technical support and the rest as soon as it arrives.",
    number: "02",
  },
  {
    icon: Zap,
    title: "Priority and sentiment",
    description:
      "Angry wording, or words like fraud, legal or unsafe, push a complaint up the list.",
    number: "03",
  },
  {
    icon: GitMerge,
    title: "Duplicate check",
    description:
      "New complaints are compared with your recent ones, so twenty reports of one outage show up as one problem.",
    number: "04",
  },
  {
    icon: ClipboardCheck,
    title: "Tracking for customers",
    description:
      "Customers follow their case with a tracking ID. Your team sees every status change and when it happened.",
    number: "05",
  },
  {
    icon: TrendingUp,
    title: "Reports",
    description:
      "Complaint volume, top categories and average resolution time for whatever period you pick.",
    number: "06",
  },
];

/* ============================================================
   WORKFLOW
   ============================================================ */

const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Submit",
    icon: MessageSquare,
    description:
      "The customer fills in your complaint page, attaches photos or a PDF if they have them, and gets a tracking ID by email.",
  },
  {
    number: "02",
    title: "Sort",
    icon: BrainCircuit,
    description:
      "BCIP adds a category, sentiment and priority, and checks your last 100 complaints for a duplicate.",
  },
  {
    number: "03",
    title: "Handle",
    icon: FileSearch,
    description:
      "It goes to the agent with the fewest open cases. They work it, or escalate it if a senior person needs to step in.",
  },
  {
    number: "04",
    title: "Resolve",
    icon: TrendingUp,
    description:
      "The customer sees the outcome on their tracking page and can rate how it was handled.",
  },
];

/* ============================================================
   INDUSTRIES
   ============================================================ */

const INDUSTRIES = [
  {
    icon: Building2,
    title: "Retail & E-commerce",
    examples:
      "Payments taken for orders that never confirmed, late deliveries, returns.",
  },
  {
    icon: LandmarkIcon,
    title: "Banking & Financial Services",
    examples:
      "Failed transfers, card disputes, locked accounts.",
  },
  {
    icon: Network,
    title: "Telecommunications",
    examples:
      "Outages that keep coming back, overcharged bills.",
  },
  {
    icon: ShieldCheck,
    title: "Healthcare",
    examples:
      "Appointment problems, billing queries, front-desk service.",
  },
  {
    icon: Workflow,
    title: "Logistics & Supply Chain",
    examples:
      "Stuck shipments and tracking that doesn't update.",
  },
  {
    icon: Layers3,
    title: "Technology & SaaS",
    examples:
      "Login failures, billing errors, bugs that keep returning.",
  },
];

function LandmarkIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 10h18L12 4 3 10Z" />
      <path d="M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18M2 19h20" />
    </svg>
  );
}

/* ============================================================
   ENTERPRISE PRINCIPLES
   ============================================================ */

const ENTERPRISE_PRINCIPLES = [
  {
    icon: Building2,
    title: "Separate workspaces",
    description:
      "Every query is limited to your business, so one company can't see another's complaints or customers.",
  },
  {
    icon: ShieldCheck,
    title: "Roles",
    description:
      "Admins, managers, agents and escalation agents each get their own permissions.",
  },
  {
    icon: ClipboardCheck,
    title: "Case history",
    description:
      "Each status change is saved with the time it happened, so you can see how a case moved.",
  },
];

/* ============================================================
   LANDING PAGE
   ============================================================ */

export function LandingPage() {
  return (
    <main className="landing-page-shell min-h-screen overflow-hidden bg-[#0b1120] text-slate-100 antialiased selection:bg-violet-200 selection:text-violet-950">
      <LandingNavbar />

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="landing-hero relative isolate overflow-hidden">
        <div aria-hidden="true" className="landing-hero__orb landing-hero__orb--left" />
        <div aria-hidden="true" className="landing-hero__orb landing-hero__orb--right" />

        <div className="landing-hero__content relative mx-auto max-w-[1120px] px-5 sm:px-8">
          <div className="landing-hero__copy mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="landing-hero__eyebrow inline-flex items-center gap-2 rounded-full border px-3.5 py-2"
            >
              <Sparkles className="h-3.5 w-3.5" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] sm:text-xs">
                Complaint management for support teams
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="landing-hero__title mt-6 max-w-4xl text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-[4.3rem]"
            >
              Every complaint in one queue,
              <br className="hidden sm:block" />
              <span> sorted by what can&apos;t wait.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="landing-hero__description mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
            >
              Customers file complaints on your own BCIP page. Before your team
              opens one, it already has a category, a priority and a duplicate
              check, and the customer has a tracking ID to follow it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="landing-hero__actions mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/register"
                className="landing-hero__primary group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                Start free trial

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="landing-hero__secondary inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold transition"
              >
                See how it works

                <ChevronRight className="h-4 w-4" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="landing-hero__proof mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs"
            >
              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                14-day free trial
              </span>

              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                No credit card needed
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="landing-hero__proof mt-4 text-sm"
            >
              Here to file or track a complaint?{" "}
              <Link
                href="/support"
                className="font-semibold underline underline-offset-4 transition hover:opacity-80"
              >
                Go to the customer portal
              </Link>
            </motion.p>
          </div>

          <ProductPreview />
        </div>

        <div className="landing-hero__capabilities relative mx-auto mt-12 max-w-[1120px] border-t px-5 pt-6 sm:px-8">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em]">
            What your team gets
          </p>

          <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              { icon: MessageSquare, label: "Complaint inbox" },
              { icon: BrainCircuit, label: "Automatic triage" },
              { icon: GitMerge, label: "Duplicate check" },
              { icon: TrendingUp, label: "Reports" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-2.5 text-center sm:justify-start"
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          THE BUSINESS PROBLEM
      ====================================================== */}

      <section className="border-y border-white/[0.05] bg-[#0e1726] py-24 lg:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="The problem"
              title="Resolving a complaint isn't the same as solving the problem."
              description="Your team can close a case while the billing bug or courier issue behind it keeps hitting other customers."
            />
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PROBLEMS.map((problem, index) => {
              const Icon = problem.icon;

              return (
                <Reveal key={problem.number} delay={index * 0.09}>
                  <article className="group h-full rounded-2xl border border-white/[0.07] bg-[#0b1320] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20 sm:p-7">
                    <div className="flex items-center justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.025] transition group-hover:border-emerald-400/20 group-hover:bg-emerald-400/[0.06]">
                        <Icon className="h-5 w-5 text-slate-300 group-hover:text-emerald-400" />
                      </div>

                      <span className="text-xs font-mono text-slate-600">
                        {problem.number}
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-semibold text-white">
                      {problem.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {problem.description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-400/10">
                <BrainCircuit className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">
                  Where BCIP fits
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  BCIP keeps the case-by-case work and adds a view across
                  cases: which categories are growing, and which complaints
                  are really about the same thing.
                </p>
              </div>

              <a
                href="#capabilities"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                See what it does
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================================================
          PLATFORM CAPABILITIES
      ====================================================== */}

{/* =========================================================
    BUSINESS CAPABILITIES
========================================================= */}
<section
  id="capabilities"
  className="scroll-mt-24 border-t border-white/[0.06] py-24 lg:py-32"
>
  <div className="mx-auto max-w-[1280px] px-5 sm:px-8">

    {/* Section heading */}
    <Reveal>
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
          What it does
        </span>

        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
          Built for the people
          <span className="text-slate-500"> who answer complaints.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400">
          BCIP does the sorting, so your team spends its time on replies
          and fixes instead of reading every complaint to decide where it
          goes.
        </p>
      </div>
    </Reveal>

    {/* Main capability cards */}
    <div className="mt-16 grid gap-5 lg:grid-cols-12">

      {/* Large featured card */}
      <Reveal className="lg:col-span-7">
        <article className="group relative h-full min-h-[360px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1514] p-8 sm:p-10">

          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/[0.06] blur-3xl" />

          <div className="relative flex h-full flex-col">

            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.07]">
                {(() => {
                  const Icon = CAPABILITIES[0]?.icon;
                  return Icon ? (
                    <Icon className="h-5 w-5 text-emerald-400" />
                  ) : null;
                })()}
              </div>

              <span className="text-xs font-mono text-slate-700">
                01
              </span>
            </div>

            <div className="mt-auto pt-16">
              <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
                See every open complaint and who owns it.
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Filter by status, priority or agent. Unassigned and
                escalated cases stand out, so nothing sits forgotten in a
                shared inbox.
              </p>
            </div>
          </div>
        </article>
      </Reveal>

      {/* Right cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">

        {CAPABILITIES.slice(1, 3).map((capability, index) => {
          const Icon = capability.icon;

          return (
            <Reveal
              key={capability.number}
              delay={(index + 1) * 0.07}
            >
              <article className="group rounded-[24px] border border-white/[0.07] bg-white/[0.018] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[0.13] hover:bg-white/[0.03]">

                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                    <Icon className="h-[18px] w-[18px] text-slate-300 transition-colors group-hover:text-emerald-400" />
                  </div>

                  <span className="text-[10px] font-mono text-slate-700">
                    {capability.number}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-semibold text-white">
                  {capability.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {capability.description}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>

    {/* Bottom capabilities */}
    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

      {CAPABILITIES.slice(3).map((capability, index) => {
        const Icon = capability.icon;

        return (
          <Reveal
            key={capability.number}
            delay={(index + 3) * 0.05}
          >
            <article className="group h-full rounded-[24px] border border-white/[0.07] bg-white/[0.018] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[0.13] hover:bg-white/[0.03]">

              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.035]">
                  <Icon className="h-[18px] w-[18px] text-slate-400 transition-colors group-hover:text-emerald-400" />
                </div>

                <span className="text-[10px] font-mono text-slate-700">
                  {capability.number}
                </span>
              </div>

              <h3 className="mt-5 text-base font-semibold text-white">
                {capability.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {capability.description}
              </p>
            </article>
          </Reveal>
        );
      })}
    </div>

    {/* Trust statement */}
    <Reveal delay={0.2}>
      <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-medium text-slate-300">
            Your team can change every AI suggestion.
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Nothing is sent to a customer until a person approves it.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          A person reviews every case
        </div>

      </div>
    </Reveal>

  </div>
</section>
      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-white/[0.05] bg-[#0e1726] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="From complaint to resolution."
              description="What happens between a customer pressing submit and your team closing the case."
            />
          </Reveal>

          <div className="relative mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <Reveal key={step.number} delay={index * 0.09}>
                  <article className="relative h-full">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06]">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>

                      <span className="text-xs font-mono text-emerald-400/70">
                        STEP {step.number}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {step.description}
                    </p>

                    {index < WORKFLOW_STEPS.length - 1 && (
                      <ChevronRight className="absolute right-0 top-3 hidden h-5 w-5 text-slate-700 lg:block" />
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-16 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1320]">
              <div className="grid lg:grid-cols-2">
                <div className="p-7 sm:p-10">
                  <Eyebrow>Duplicate check</Eyebrow>

                  <h3 className="mt-5 max-w-md text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    One complaint is a case. Twenty about the same thing is a problem.
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
                    Customers describe the same issue in different words.
                    BCIP compares meaning rather than keywords, so
                    &ldquo;parcel never came&rdquo; and &ldquo;order not
                    delivered&rdquo; end up linked.
                  </p>

                  <div className="mt-7 flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/10">
                      <GitMerge className="h-4 w-4 text-emerald-400" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Flagged, not merged
                      </p>

                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        Similar doesn&apos;t always mean the same cause, so
                        your team makes the call.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] bg-white/[0.015] p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white">
                      Example complaint cluster
                    </p>

                    <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-2.5 py-1 text-[10px] text-violet-300">
                      Illustrative
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      {
                        title: "My shipment has not moved for three days.",
                        id: "CMP-101",
                      },
                      {
                        title: "The delivery tracking page is still outdated.",
                        id: "CMP-102",
                      },
                      {
                        title: "I haven't received any shipment updates.",
                        id: "CMP-103",
                      },
                    ].map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#101a2a] p-3"
                      >
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.04]">
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] leading-5 text-slate-300">
                            {item.title}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-600">
                            {item.id}
                          </p>
                        </div>

                        {index > 0 && (
                          <GitMerge className="h-4 w-4 shrink-0 text-violet-400" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-violet-400/15 bg-violet-400/[0.04] p-4">
                    <p className="text-xs font-semibold text-violet-300">
                      Likely the same problem
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Courier tracking not updating
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================================================
          INDUSTRY APPLICATIONS
      ====================================================== */}

      <section id="industries" className="scroll-mt-24 py-24 lg:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Who it's for"
              title="Businesses that get more complaints than they can track."
              description="These are the kinds of businesses we designed the categories around."
            />
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((industry, index) => {
              const Icon = industry.icon;

              return (
                <Reveal key={industry.title} delay={index * 0.06}>
                  <article className="group flex h-full gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 transition hover:border-emerald-400/20 hover:bg-white/[0.03] sm:p-6">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.025] transition group-hover:border-emerald-400/20">
                      <Icon className="h-5 w-5 text-slate-300 transition group-hover:text-emerald-400" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {industry.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {industry.examples}
                      </p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          ENTERPRISE ARCHITECTURE PRINCIPLES
      ====================================================== */}

      <section className="border-y border-white/[0.05] bg-[#0e1726] py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal>
            <div>
              <Eyebrow>Security and access</Eyebrow>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                Your complaints stay inside your business.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-400">
                Each business gets its own workspace. Staff see only what
                their role allows, and those checks run on the server, not
                just in the browser.
              </p>

              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                Create your workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="space-y-4">
            {ENTERPRISE_PRINCIPLES.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.title} delay={index * 0.08}>
                  <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-[#0b1320] p-5 sm:p-6">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-400/[0.07]">
                      <Icon className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative isolate overflow-hidden py-28 sm:py-36">
        <GridBackground />

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07]">
              <BrainCircuit className="h-7 w-7 text-emerald-400" />
            </div>

            <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Try it on your own complaints.
              <span className="block mt-2 text-emerald-400">
                Free for 14 days.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Set up your complaint page, invite your team and see where
              complaints pile up. You don&apos;t need a credit card to start.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-4 text-sm font-semibold text-[#06130e] transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Start free trial

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-7 py-4 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                See pricing
              </a>
            </div>

            <p className="mt-6 text-xs text-slate-600">
              AI suggestions are a starting point. Your team makes the final call.
            </p>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
