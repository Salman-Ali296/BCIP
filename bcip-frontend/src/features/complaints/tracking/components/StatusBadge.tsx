import type { ComplaintStatus } from "@/features/complaints/types/complaint";

const labels: Record<ComplaintStatus, string> = {
  submitted: "Submitted",
  analyzed: "Analyzed",
  assigned: "Assigned",
  in_review: "In review",
  awaiting_customer: "Awaiting customer",
  resolved: "Resolved",
  acknowledged: "Acknowledged",
  in_progress: "In progress",
  PENDING: "Pending",
  AI_PROCESSING: "Processing",
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING_FOR_CUSTOMER: "Waiting for customer",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REOPENED: "Reopened",
};
const colors: Record<ComplaintStatus, string> = {
  submitted: "bg-blue-100 text-blue-800",
  analyzed: "bg-indigo-100 text-indigo-800",
  assigned: "bg-blue-100 text-blue-800",
  in_review: "bg-amber-100 text-amber-800",
  awaiting_customer: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
  acknowledged: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  PENDING: "bg-amber-100 text-amber-800",
  AI_PROCESSING: "bg-blue-100 text-blue-800",
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  WAITING_FOR_CUSTOMER: "bg-amber-100 text-amber-800",
  ESCALATED: "bg-rose-100 text-rose-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-slate-100 text-slate-700",
  REOPENED: "bg-blue-100 text-blue-800",
};

export function StatusBadge({ status }: { status: ComplaintStatus }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status]}`}>{labels[status]}</span>; }
