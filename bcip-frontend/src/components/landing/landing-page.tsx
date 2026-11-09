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
                BCIP Intelligence
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Operational overview
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
                Review complaint activity and emerging issues.
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
                Recurring issue signals
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
                  Intelligence opportunity:{" "}
                </span>
                Related complaints may indicate a shared operational issue
                that deserves further investigation.
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
            Similar cases linked
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
    title: "Fragmented complaint data",
    description:
      "Complaints across support channels, products, and teams can make it difficult to build a unified view of customer problems.",
  },
  {
    icon: Target,
    number: "02",
    title: "Inconsistent prioritization",
    description:
      "Without clear prioritization criteria, serious complaints may compete for attention with routine service requests.",
  },
  {
    icon: Network,
    number: "03",
    title: "Hidden systemic issues",
    description:
      "Resolving individual cases does not necessarily reveal the shared product, process, or service failure behind them.",
  },
];

/* ============================================================
   CAPABILITIES
   ============================================================ */

const CAPABILITIES = [
  {
    icon: MessageSquare,
    title: "Centralized complaint management",
    description:
      "Maintain structured complaint records, categories, statuses, and assignments within a unified workflow.",
    number: "01",
  },
  {
    icon: BrainCircuit,
    title: "AI-assisted classification",
    description:
      "Use text classification to organize complaint information into supported categories.",
    number: "02",
  },
  {
    icon: Zap,
    title: "Sentiment and urgency analysis",
    description:
      "Surface sentiment signals and apply prioritization rules to support more consistent complaint triage.",
    number: "03",
  },
  {
    icon: GitMerge,
    title: "Related-issue detection",
    description:
      "Use semantic similarity to identify potentially related complaints and investigate recurring patterns.",
    number: "04",
  },
  {
    icon: ClipboardCheck,
    title: "Tracking and resolution workflows",
    description:
      "Follow complaint statuses and assignments so authorized teams can manage cases systematically.",
    number: "05",
  },
  {
    icon: TrendingUp,
    title: "Operational intelligence",
    description:
      "Examine complaint categories, recurring issues, and available resolution metrics to support decisions.",
    number: "06",
  },
];

/* ============================================================
   WORKFLOW
   ============================================================ */

const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Capture",
    icon: MessageSquare,
    description:
      "Collect complaints through the available submission workflow and organize the submitted information.",
  },
  {
    number: "02",
    title: "Analyze",
    icon: BrainCircuit,
    description:
      "Apply available classification, sentiment analysis, similarity detection, and prioritization logic.",
  },
  {
    number: "03",
    title: "Investigate",
    icon: FileSearch,
    description:
      "Review complaint details, identify related cases, and direct attention toward emerging issues.",
  },
  {
    number: "04",
    title: "Improve",
    icon: TrendingUp,
    description:
      "Use aggregated complaint information to understand recurring problems and inform operational decisions.",
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
      "Payments, delivery delays, returns, and product quality.",
  },
  {
    icon: LandmarkIcon,
    title: "Banking & Financial Services",
    examples:
      "Transaction disputes, account access, and billing issues.",
  },
  {
    icon: Network,
    title: "Telecommunications",
    examples:
      "Connectivity failures, recurring outages, and billing disputes.",
  },
  {
    icon: ShieldCheck,
    title: "Healthcare",
    examples:
      "Appointment access, administrative services, and patient feedback.",
  },
  {
    icon: Workflow,
    title: "Logistics & Supply Chain",
    examples:
      "Shipment tracking, fulfillment delays, and delivery problems.",
  },
  {
    icon: Layers3,
    title: "Technology & SaaS",
    examples:
      "Product defects, account problems, and recurring support issues.",
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
    title: "Organizational separation",
    description:
      "A multi-tenant architecture can keep participating organizations' data logically separated when implemented and configured correctly.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based permissions",
    description:
      "Access policies help restrict complaint information and operations to appropriately authorized users.",
  },
  {
    icon: ClipboardCheck,
    title: "Traceable workflows",
    description:
      "Recorded complaint statuses and timestamps can support accountability and case-history review.",
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
                Complaint intelligence for service teams
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="landing-hero__title mt-6 max-w-4xl text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-[4.3rem]"
            >
              Turn every complaint into
              <br className="hidden sm:block" />
              <span> a clearer way forward.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="landing-hero__description mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
            >
              Bring customer issues together, understand what needs attention,
              and help your team spot recurring problems through one complaint
              management platform.
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
                Get started

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
                Structured workflows
              </span>

              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                AI-assisted insights
              </span>
            </motion.div>
          </div>

          <ProductPreview />
        </div>

        <div className="landing-hero__capabilities relative mx-auto mt-12 max-w-[1120px] border-t px-5 pt-6 sm:px-8">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em]">
            One intelligence workflow. Multiple operational perspectives.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              { icon: MessageSquare, label: "Complaint management" },
              { icon: BrainCircuit, label: "AI-assisted analysis" },
              { icon: GitMerge, label: "Related-issue detection" },
              { icon: TrendingUp, label: "Operational reporting" },
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
              description="A support team can close an individual case while the underlying product defect, billing error, or service failure continues to affect other customers."
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
                  The missing layer: complaint intelligence
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  BCIP is designed to connect structured case management
                  with AI-assisted analysis, helping teams investigate
                  patterns that individual complaints may not reveal.
                </p>
              </div>

              <a
                href="#capabilities"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                Explore capabilities
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
          Platform capabilities
        </span>

        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
          Turn customer feedback into
          <span className="text-slate-500"> better decisions.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400">
          BCIP gives businesses a clearer way to manage complaints,
          understand recurring issues, and keep teams focused on the
          problems that matter most.
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
                Clearer visibility into customer complaints.
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Keep every complaint organised and give your team the
                context they need to understand what customers are
                experiencing.
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
            Built for teams that take customer feedback seriously.
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Clearer information. Better visibility. More confident decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Business-focused complaint management
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
              title="A connected workflow for complaint intelligence."
              description="Turn submitted complaints into structured information that teams can review, investigate, and use to identify recurring problems."
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
                  <Eyebrow>Intelligence in context</Eyebrow>

                  <h3 className="mt-5 max-w-md text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    One complaint is a case. Related complaints can reveal a pattern.
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
                    Semantic similarity can help identify complaints
                    describing related issues, even when customers use
                    different wording. Teams can review those connections
                    to investigate potential common causes.
                  </p>

                  <div className="mt-7 flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/10">
                      <GitMerge className="h-4 w-4 text-emerald-400" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Related-issue discovery
                      </p>

                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        Similarity indicates a potential relationship,
                        not proof of a shared root cause.
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
                      Potential recurring issue
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Shipment tracking and notification delays
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
              eyebrow="Industry applications"
              title="Built around the problems complex service teams face."
              description="Complaint intelligence can support organizations where recurring customer issues affect service quality, operational efficiency, and customer trust."
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
              <Eyebrow>Enterprise architecture</Eyebrow>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                Designed with organizational separation and controlled access in mind.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-400">
                Enterprise complaint management requires more than a
                dashboard. Organizations need appropriate data
                boundaries, permission controls, and traceable workflows.
              </p>

              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                Explore BCIP
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
              Don&apos;t just manage complaints.
              <span className="block mt-2 text-emerald-400">
                Understand what causes them.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Explore how BCIP combines complaint management,
              AI-assisted analysis, and recurring-issue discovery to
              support better-informed operational decisions.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-4 text-sm font-semibold text-[#06130e] transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Explore the platform

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#capabilities"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-7 py-4 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                Review capabilities
              </a>
            </div>

            <p className="mt-6 text-xs text-slate-600">
              AI-assisted insights support investigation and decision-making;
              findings should be reviewed in their operational context.
            </p>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}