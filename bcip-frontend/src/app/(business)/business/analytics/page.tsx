"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export default function BusinessAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");

  return (
    <div className="space-y-6">
      {/* Page Header with Time Range Switcher & Export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101d30]">
            Operational Analytics
          </h1>
          <p className="mt-1 text-xs text-[#5e6b7d]">
            Complaint intake velocity, category distribution, SLA compliance, and team resolution metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Pills */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold">
            {(["7D", "30D", "90D"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`rounded-lg px-3 py-1 transition ${
                  timeRange === r
                    ? "bg-[#2454d6] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r === "7D" ? "7 Days" : r === "30D" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Complaints",
            value: "1,284",
            change: "+4.2%",
            changeType: "neutral",
            subtext: "vs previous 30 days",
          },
          {
            label: "SLA Compliance",
            value: "98.4%",
            change: "+1.2%",
            changeType: "positive",
            subtext: "Target: ≥95.0%",
          },
          {
            label: "Avg. Resolution Time",
            value: "18.4h",
            change: "-2.1h",
            changeType: "positive",
            subtext: "Target: <24.0h",
          },
          {
            label: "Duplicate Rate",
            value: "11.1%",
            change: "142 linked",
            changeType: "neutral",
            subtext: "Semantic cluster links",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {kpi.label}
            </span>
            <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#101d30]">
              {kpi.value}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span
                className={`font-semibold ${
                  kpi.changeType === "positive"
                    ? "text-emerald-700"
                    : "text-blue-700"
                }`}
              >
                {kpi.change}
              </span>
              <span className="text-slate-400">{kpi.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section: Velocity Over Time + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Velocity Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#101d30]">
                Complaint Intake Velocity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily volume received across Web, Email, API, and Support channels.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-500">
              Daily Avg: 42.8
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="mt-6 pt-2">
            <div className="grid grid-cols-7 gap-3 items-end h-36">
              {[
                { day: "Mon", count: 38, pct: "58%" },
                { day: "Tue", count: 46, pct: "70%" },
                { day: "Wed", count: 41, pct: "62%" },
                { day: "Thu", count: 54, pct: "82%" },
                { day: "Fri", count: 49, pct: "75%" },
                { day: "Sat", count: 28, pct: "42%" },
                { day: "Sun", count: 24, pct: "36%" },
              ].map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-2 group">
                  <span className="font-mono text-[10px] font-semibold text-slate-500 group-hover:text-[#2454d6] transition">
                    {item.count}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-28 flex items-end">
                    <div
                      className="w-full bg-[#2454d6] group-hover:bg-[#1b43b4] transition-all rounded-t-lg"
                      style={{ height: item.pct }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak intake window: Thursday 14:00 - 18:00 UTC</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Ingested with &lt; 250ms latency
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-[#101d30]">
              Category Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion of complaints by detected operational domain.
            </p>
          </div>

          <div className="space-y-3.5 my-4">
            {[
              { name: "Billing & Invoicing", count: 436, pct: 34, color: "bg-[#2454d6]" },
              { name: "Order & Logistics", count: 346, pct: 27, color: "bg-emerald-600" },
              { name: "Account & Identity", count: 270, pct: 21, color: "bg-indigo-600" },
              { name: "Platform & Integration", count: 232, pct: 18, color: "bg-slate-500" },
            ].map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <span className="font-mono text-slate-500">
                    {cat.count} cases ({cat.pct}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            Top emerging root cause: <em>Automated payment gateway batch timeouts (ACH #8841)</em>.
          </div>
        </div>
      </div>

      {/* Team Throughput & SLA Performance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#101d30]">
            Team Resolution & SLA Throughput
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of active queue workload and historical resolution by functional department.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Team Department</th>
                <th className="py-2.5 px-3">Active Assigned</th>
                <th className="py-2.5 px-3">Resolved (30D)</th>
                <th className="py-2.5 px-3">Avg First Response</th>
                <th className="py-2.5 px-3">Avg Resolution</th>
                <th className="py-2.5 px-3 text-right">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {[
                {
                  team: "Billing Operations",
                  active: 28,
                  resolved: 382,
                  firstResponse: "1.4h",
                  resolution: "14.2h",
                  sla: "99.1%",
                },
                {
                  team: "Tier 2 Support",
                  active: 34,
                  resolved: 312,
                  firstResponse: "2.1h",
                  resolution: "19.8h",
                  sla: "97.8%",
                },
                {
                  team: "Identity & SecOps",
                  active: 12,
                  resolved: 248,
                  firstResponse: "0.8h",
                  resolution: "8.4h",
                  sla: "99.6%",
                },
                {
                  team: "Logistics Dispatch",
                  active: 12,
                  resolved: 200,
                  firstResponse: "2.6h",
                  resolution: "21.0h",
                  sla: "96.4%",
                },
              ].map((row) => (
                <tr key={row.team} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">{row.team}</td>
                  <td className="py-3 px-3 font-mono">{row.active} cases</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{row.resolved}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{row.firstResponse}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{row.resolution}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {row.sla}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}