"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  FileText,
  ScanLine,
  Headphones,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Typewriter hook — cycles through phrases
───────────────────────────────────────────── */
function useTypewriter(phrases: string[], speed = 55, pause = 1800) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else {
      timeout = setTimeout(() => {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % phrases.length);
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return phrases[phraseIdx].slice(0, charIdx);
}

/* ─────────────────────────────────────────────
   Animate-on-scroll hook
───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─────────────────────────────────────────────
   Action card data
───────────────────────────────────────────── */
const ACTION_CARDS = [
  {
    href: "/support/report",
    color: "blue",
    icon: Sparkles,
    badge: null,
    title: "Report an Issue",
    tagline: "Submit a formal complaint",
    description:
      "Tell us what went wrong. Attach files, reference an order, and our AI instantly categorises and prioritises your case.",
    steps: [
      "Describe your issue in plain language",
      "Attach screenshots or documents",
      "AI detects category & severity",
      "Receive a tracking ID instantly",
    ],
    cta: "Launch Complaint Form",
    gradient: "from-lilac via-lilac-soft to-transparent",
    ring: "ring-brand/20",
    hover: "hover:border-brand hover:shadow-brand/15",
    textColor: "text-brand",
    iconBg: "bg-lilac ring-brand/20",
    stepColor: "text-brand",
    dot: "bg-brand-glow",
  },
  {
    href: "/support/report/voice",
    color: "purple",
    icon: Mic,
    badge: "AI Voice",
    title: "Speak Your Complaint",
    tagline: "Talk — we'll handle the rest",
    description:
      "Skip typing. Record your grievance in your own voice. Our NLP engine transcribes, extracts urgency, and routes your case automatically.",
    steps: [
      "Hit record — speak naturally",
      "AI transcribes in real-time",
      "Intent & severity auto-detected",
      "Review transcript before submitting",
    ],
    cta: "Start Voice Recording",
    gradient: "from-lilac via-lilac-soft to-transparent",
    ring: "ring-brand/20",
    hover: "hover:border-brand hover:shadow-brand/15",
    textColor: "text-brand",
    iconBg: "bg-lilac ring-brand/20",
    stepColor: "text-brand",
    dot: "bg-brand-glow",
  },
  {
    href: "/support/track",
    color: "emerald",
    icon: ScanLine,
    badge: null,
    title: "Track Your Case",
    tagline: "Live status, every step",
    description:
      "Already submitted? Monitor milestones, read agent responses, accept or dispute resolutions, and rate your experience.",
    steps: [
      "Enter your complaint tracking ID",
      "See live SLA countdown & status",
      "Read agent notes & updates",
      "Accept resolution or escalate",
    ],
    cta: "Open Tracking Portal",
    gradient: "from-success-soft via-success-soft to-transparent",
    ring: "ring-success/20",
    hover: "hover:border-success/30 hover:shadow-success/15",
    textColor: "text-success",
    iconBg: "bg-success-soft ring-success/20",
    stepColor: "text-success",
    dot: "bg-success",
  },
];

const TRUST_BADGES = [
  { icon: Clock,        label: "2-Hour SLA",       sub: "Critical cases assigned within 120 min",         color: "text-brand",    bg: "bg-lilac"   },
  { icon: ShieldCheck,  label: "Human Oversight",   sub: "AI flags, humans decide every outcome",          color: "text-success", bg: "bg-success-soft"},
  { icon: Zap,          label: "Instant Triage",    sub: "AI categorises your complaint in seconds",        color: "text-warning",   bg: "bg-warning-soft"  },
  { icon: CheckCircle2, label: "Audit Logged",       sub: "Every action timestamped & immutable",           color: "text-brand",  bg: "bg-lilac" },
];

/* ─────────────────────────────────────────────
   Main page component
───────────────────────────────────────────── */
export default function SupportHome() {
  const router = useRouter();
  const [trackQuery, setTrackQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const mounted = useSyncExternalStore(subscribeToNothing, () => true, () => false);

  const heroText = useTypewriter([
    "Submit a complaint in 60 seconds.",
    "Speak — our AI handles the rest.",
    "Track every update in real-time.",
    "Your issue, resolved with accountability.",
  ]);

  const { ref: cardsRef, visible: cardsVisible } = useInView();
  const { ref: trustRef, visible: trustVisible } = useInView();
  const { ref: howRef,  visible: howVisible  } = useInView();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackQuery.trim();
    router.push(cleanId ? `/support/track/${cleanId}` : "/support/track");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-wash to-wash text-ink font-sans overflow-x-hidden">

      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-line px-6 py-20 sm:py-28 lg:px-8">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-40 right-0 -z-10 transform-gpu blur-3xl sm:-top-80">
          <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-brand to-success opacity-15"
            style={{ clipPath: "polygon(74.1% 44.1%,100% 61.6%,97.5% 26.9%,85.5% 0.1%,80.7% 2%,72.5% 32.5%,60.2% 62.4%,52.4% 68.1%,47.5% 58.3%,45.2% 34.5%,27.5% 76.7%,0.1% 64.9%,17.9% 100%,27.6% 76.8%,76.1% 97.7%,74.1% 44.1%)" }} />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 -z-10 transform-gpu blur-3xl">
          <div className="aspect-[1155/678] w-[50rem] bg-gradient-to-tr from-brand to-brand-glow opacity-10"
            style={{ clipPath: "polygon(0 0,50% 20%,100% 60%,80% 100%,20% 90%)" }} />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-brand-soft bg-lilac px-4 py-1.5 text-xs font-semibold text-brand transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Enterprise Grievance &amp; SLA Resolution System
          </div>

          {/* Static headline */}
          <h1 className={`mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            Your Voice,{" "}
            <span className="bg-gradient-to-r from-brand via-success to-success bg-clip-text text-transparent">
              Your Rights
            </span>
          </h1>

          {/* Typewriter line */}
          <div className={`mt-4 h-10 flex items-center justify-center transition-all duration-700 delay-200 ${mounted ? "opacity-100" : "opacity-0"}`}>
            <p className="text-lg sm:text-xl font-semibold text-ink">
              {heroText}
              <span className="ml-0.5 inline-block w-0.5 h-5 bg-brand-glow animate-pulse align-middle" />
            </p>
          </div>

          <p className={`mt-4 text-sm sm:text-base leading-relaxed text-muted max-w-2xl mx-auto transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Powered by AI triage and human accountability — from the moment you submit
            to the moment your issue is resolved.
          </p>

          {/* Track bar */}
          <form
            onSubmit={handleTrackSubmit}
            className={`mt-10 mx-auto max-w-xl transition-all duration-700 delay-[400ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-line bg-lilac-soft p-2 shadow-2xl backdrop-blur-md focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/20 transition">
              <div className="flex items-center gap-2 pl-3 flex-1">
                <Search className="h-4.5 w-4.5 text-muted shrink-0" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Already have a case? Enter Tracking ID (e.g. BCIP-9042)"
                  className="w-full bg-transparent text-sm text-ink placeholder-faint focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink hover:bg-brand active:scale-95 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-brand/15"
              >
                Track Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-subtle text-center">
              No account needed to track · Tracking IDs arrive via email after submission
            </p>
          </form>
        </div>
      </section>

      {/* ── "WHAT CAN YOU DO?" LABEL ──────────────── */}
      <div className="mx-auto max-w-6xl px-6 pt-16 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-wash" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-subtle">
            What can you do here?
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-wash" />
        </div>
      </div>

      {/* ── ACTION CARDS ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div
          ref={cardsRef}
          className="grid gap-6 md:grid-cols-3"
        >
          {ACTION_CARDS.map((card, i) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === i;

            return (
              <Link
                key={card.href}
                href={card.href}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ transitionDelay: `${i * 80}ms` }}
                className={`group relative flex flex-col rounded-3xl border border-line bg-white overflow-hidden shadow-xl transition-all duration-500 ${card.hover} hover:shadow-xl hover:-translate-y-2
                  ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                {/* Gradient wash that animates in on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />

                {/* Top glow line */}
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
                  card.color === "blue"   ? "via-brand-glow"   :
                  card.color === "purple" ? "via-brand-glow" : "via-success"
                } to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />

                <div className="relative p-7 flex flex-col h-full">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex rounded-2xl p-3.5 ${card.iconBg} ring-1 ${card.ring} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className={`h-6 w-6 ${card.textColor}`} />
                    </span>
                    {card.badge && (
                      <span className={`rounded-full border border-current/20 bg-current/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${card.textColor}`}>
                        {card.badge}
                      </span>
                    )}
                  </div>

                  {/* Title + tagline */}
                  <div className="mt-5">
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${card.textColor} mb-1`}>
                      {card.tagline}
                    </p>
                    <h2 className="text-xl font-extrabold text-ink leading-snug group-hover:text-ink transition">
                      {card.title}
                    </h2>
                  </div>

                  {/* Description — always visible */}
                  <p className="mt-3 text-sm leading-relaxed text-muted flex-1">
                    {card.description}
                  </p>

                  {/* ── Animated step-by-step tooltip box ── */}
                  <div className={`mt-5 overflow-hidden transition-all duration-500 ease-in-out ${isHovered ? "max-h-56 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="rounded-2xl border border-line bg-lilac-soft backdrop-blur-sm p-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">
                        How it works
                      </p>
                      {card.steps.map((step, si) => (
                        <div
                          key={si}
                          className="flex items-start gap-2.5"
                          style={{ transitionDelay: `${si * 60}ms` }}
                        >
                          <span className={`mt-1 h-5 w-5 shrink-0 rounded-full ${
                            card.color === "blue"   ? "bg-lilac text-brand"   :
                            card.color === "purple" ? "bg-lilac text-brand" : "bg-success-soft text-success"
                          } flex items-center justify-center text-[10px] font-black`}>
                            {si + 1}
                          </span>
                          <span className="text-xs text-ink-soft leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA row */}
                  <div className={`mt-5 flex items-center gap-2 text-xs font-bold ${card.textColor} transition-all duration-300`}>
                    <span>{card.cta}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Static helper text under cards */}
        <p className="mt-6 text-center text-xs text-faint">
          Hover a card to see exactly how each option works · No login required to submit
        </p>
      </section>

      {/* ── HOW IT WORKS STRIP ──────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-6 lg:px-8">
        <div
          ref={howRef}
          className={`rounded-3xl border border-line bg-white backdrop-blur-sm p-8 sm:p-10 transition-all duration-700 ${howVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-center text-xs font-bold uppercase tracking-widest text-subtle mb-8">
            From complaint to resolution — in 4 steps
          </h2>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-lilac via-lilac-soft to-success-soft hidden md:block" />

            <div className="grid gap-8 md:grid-cols-4 relative">
              {[
                { n: "01", icon: FileText,     color: "text-brand",    bg: "bg-lilac",    label: "You submit",      desc: "Type or speak your complaint with supporting details" },
                { n: "02", icon: Sparkles,     color: "text-brand",  bg: "bg-lilac",  label: "AI triages",      desc: "NLP instantly classifies category, severity & sentiment" },
                { n: "03", icon: Headphones,   color: "text-warning",   bg: "bg-warning-soft",   label: "Agent responds",  desc: "A human specialist is assigned and contacts you within SLA" },
                { n: "04", icon: CheckCircle2, color: "text-success", bg: "bg-success-soft", label: "Issue resolved",   desc: "Resolution confirmed, audit log closed, CSAT collected" },
              ].map((s, i) => {
                const SIcon = s.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} ring-1 ring-line shadow-lg`}>
                      <SIcon className={`h-5 w-5 ${s.color}`} />
                      <span className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-lilac-soft border border-line text-[9px] font-black ${s.color}`}>
                        {s.n}
                      </span>
                    </div>
                    <h3 className={`mt-4 text-sm font-bold ${s.color}`}>{s.label}</h3>
                    <p className="mt-1 text-xs text-subtle leading-relaxed max-w-[140px]">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div
          ref={trustRef}
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 ${trustVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {TRUST_BADGES.map((badge, i) => {
            const BIcon = badge.icon;
            return (
              <div
                key={i}
                style={{ transitionDelay: `${i * 80}ms` }}
                className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-5 hover:border-line-strong transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${badge.bg}`}>
                  <BIcon className={`h-4.5 w-4.5 ${badge.color}`} />
                </span>
                <div>
                  <p className={`text-sm font-bold ${badge.color}`}>{badge.label}</p>
                  <p className="mt-0.5 text-[11px] text-subtle leading-snug">{badge.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER CTA ──────────────────────────────── */}
      <section className="border-t border-line px-6 py-12 text-center">
        <p className="text-xs text-faint">
          Need a business account?{" "}
          <Link href="/login" className="text-brand hover:underline font-semibold">
            Sign in to the Business Platform →
          </Link>
        </p>
        <p className="mt-2 text-[11px] text-faint">
          BCIP · AI-Powered Complaint Intelligence · All interactions are encrypted and audit-logged
        </p>
      </section>
    </div>
  );
}
