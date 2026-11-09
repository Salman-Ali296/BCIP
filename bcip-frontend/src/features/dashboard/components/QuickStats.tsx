import {
  AlertTriangle,
  Clock3,
  Inbox,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserX,
  Zap,
} from "lucide-react";
import type { DashboardStats } from "@/features/dashboard/types/dashboard.types";

interface ExtendedDashboardStats extends DashboardStats {
  reputationScore?: number;
  slaCompliance?: number;
}

export function QuickStats({
  stats,
  onOpen,
}: {
  stats: ExtendedDashboardStats;
  onOpen: () => void;
}) {
  const cards = [
    {
      label: "Open Queue",
      subtext: "Live active complaints",
      value: stats.totalOpen,
      change: "+2 this hour",
      icon: Inbox,
      gradient: "from-blue-600/10 to-indigo-600/5",
      accent: "text-blue-700 bg-blue-100/80 border-blue-200",
      action: onOpen,
    },
    {
      label: "Critical Urgency",
      subtext: "Immediate SLA attention",
      value: stats.highPriority,
      change: stats.highPriority > 0 ? "Needs triage" : "Under control",
      icon: AlertTriangle,
      gradient: "from-rose-600/10 to-orange-600/5",
      accent: "text-rose-700 bg-rose-100/80 border-rose-200",
      action: undefined,
    },
    {
      label: "Unassigned Queue",
      subtext: "Awaiting specialist",
      value: stats.unassigned,
      change: "Auto-routing enabled",
      icon: UserX,
      gradient: "from-amber-600/10 to-yellow-600/5",
      accent: "text-amber-700 bg-amber-100/80 border-amber-200",
      action: undefined,
    },
    {
      label: "Reputation & Risk Score",
      subtext: "Proposal SLA & CSAT Index",
      value: "94 / 100",
      badge: "Low Risk",
      change: "+3.2% vs last month",
      icon: ShieldCheck,
      gradient: "from-emerald-600/10 to-teal-600/5",
      accent: "text-emerald-700 bg-emerald-100/80 border-emerald-200",
      action: undefined,
    },
    {
      label: "AI Triage Rate",
      subtext: "Zero-latency NLP routing",
      value: "99.4%",
      badge: "BERT Active",
      change: "28ms inference avg",
      icon: Zap,
      gradient: "from-purple-600/10 to-indigo-600/5",
      accent: "text-purple-700 bg-purple-100/80 border-purple-200",
      action: undefined,
    },
  ];

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            onClick={card.action}
            role={card.action ? "button" : undefined}
            tabIndex={card.action ? 0 : undefined}
            onKeyDown={(e) => {
              if (card.action && (e.key === "Enter" || e.key === " ")) {
                card.action();
              }
            }}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs transition-all hover:shadow-md hover:border-blue-300 ${
              card.action ? "cursor-pointer" : ""
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-40 transition-opacity group-hover:opacity-70`}
            />
            <div className="relative flex items-center justify-between">
              <span
                className={`inline-flex rounded-xl border p-2 shadow-2xs ${card.accent}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {card.badge && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {card.badge}
                </span>
              )}
            </div>

            <div className="relative mt-3.5">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {card.label}
              </p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {card.value}
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <TrendingUp className="h-3 w-3 text-emerald-600 inline" />
                {card.change}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

