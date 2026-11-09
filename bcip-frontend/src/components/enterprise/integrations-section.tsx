"use client";

import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Layers,
  Mail,
  MessageSquare,
  Network,
  Radio,
  Server,
  Share2,
  Terminal,
  Zap,
} from "lucide-react";

const integrationsList = [
  {
    category: "CRM & Customer 360",
    name: "CRM Connectors",
    description: "Ingest customer tier, contract ARR, and account manager assignments to prioritize complaints by business value.",
    direction: "Bi-directional Sync",
    type: "Enterprise Ingestion",
    icon: Database,
  },
  {
    category: "Helpdesk & Ticketing",
    name: "Helpdesk & Service Desk",
    description: "Route escalations to Zendesk, Freshdesk, or Jira Service Management while keeping BCIP as the intelligence master.",
    direction: "2-Way Ticket Sync",
    type: "Operational Handoff",
    icon: Layers,
  },
  {
    category: "Inbound Messaging",
    name: "Email & Web Forms",
    description: "Parse incoming support emails and custom web complaint forms into structured operational records in milliseconds.",
    direction: "Inbound Pipeline",
    type: "Intake Channel",
    icon: Mail,
  },
  {
    category: "Live Support & Chat",
    name: "Omnichannel Support",
    description: "Capture transcribed customer support chat logs and call notes into the centralized semantic deduplication engine.",
    direction: "Streaming Intake",
    type: "Intake Channel",
    icon: MessageSquare,
  },
  {
    category: "Data Warehouse & Lake",
    name: "Data Warehouse Pipelines",
    description: "Export daily complaint logs, sentiment scores, and resolution timelines into Snowflake, BigQuery, or Amazon Redshift.",
    direction: "Scheduled Export",
    type: "Analytical Pipeline",
    icon: Server,
  },
  {
    category: "Business Intelligence",
    name: "BI Dashboards & Telemetry",
    description: "Feed complaint trends, category velocity, and SLA breach rates directly into Tableau, Power BI, or Looker models.",
    direction: "SQL / API Feed",
    type: "Executive Reporting",
    icon: Share2,
  },
  {
    category: "Developer Platform",
    name: "Secure REST API",
    description: "Full programmatic access to complaint creation, status updates, team assignment, and AI confidence telemetry.",
    direction: "Authenticated REST",
    type: "Developer Tools",
    icon: Code2,
  },
  {
    category: "Real-Time Eventing",
    name: "Event Webhooks",
    description: "Subscribe to instant webhooks for critical SLA warnings, high-urgency disputes, or duplicate cluster triggers.",
    direction: "Signed HTTP Push",
    type: "Real-Time Automation",
    icon: Radio,
  },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="section bg-[#f8fafc] border-b border-slate-200">
      <div className="container-x">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="eyebrow">
            <span className="status-dot" />
            Enterprise Interoperability
          </div>
          <h2 className="heading-xl mt-4 text-[#101d30]">
            Connect BCIP to the systems
            <br />
            <span className="text-[#2454d6]">your teams already use.</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            BCIP fits seamlessly into your technology stack. Ingest grievances from existing intake points,
            route work to departmental queues, and feed enriched dispute intelligence back into your data lake.
          </p>
        </div>

        {/* 8 Integrations Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {integrationsList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#2454d6]/10 text-[#2454d6]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-900">{item.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-[#2454d6]">{item.direction}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium">
                    {item.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Developer Banner */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shrink-0">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                REST API & Webhook Specifications Available
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Complies with OpenAPI 3.0 standards. Authenticated via scoped tenant API bearer tokens.
              </p>
            </div>
          </div>

          <a
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shrink-0"
          >
            Request API Sandbox <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
