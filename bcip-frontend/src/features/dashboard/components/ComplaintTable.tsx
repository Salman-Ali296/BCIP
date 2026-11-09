"use client";

import { ChevronDown, ChevronUp, Eye, Inbox } from "lucide-react";
import { useState } from "react";
import type {
  ComplaintListItem,
  SortDirection,
  SortKey,
} from "@/features/dashboard/types/dashboard.types";
import { StatusBadge } from "@/features/complaints/tracking/components/StatusBadge";

const priorityStyles: Record<string, string> = {
  LOW: "text-slate-600",
  MEDIUM: "text-amber-700",
  HIGH: "text-rose-700",
  CRITICAL: "font-bold text-red-900",
  low: "text-slate-600",
  medium: "text-amber-700",
  high: "text-rose-700",
};

interface ComplaintTableProps {
  complaints: ComplaintListItem[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onOpen: (id: string) => void;
  sortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPage: (page: number) => void;
  onPageSize: (size: 10 | 25 | 50) => void;
}

function SortHeader({
  label,
  active,
  direction,
  onSort,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onSort: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSort}
      className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-700"
    >
      {label}
      {active && (direction === "asc" ? (
        <ChevronUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      ))}
    </button>
  );
}

export function ComplaintTable({
  complaints,
  selectedIds,
  onSelect,
  onSelectAll,
  onOpen,
  sortKey,
  direction,
  onSort,
  page,
  pageSize,
  totalPages,
  onPage,
  onPageSize,
}: ComplaintTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const allSelected =
    complaints.length > 0 &&
    complaints.every((item) => selectedIds.includes(item.id));

  return (
    <section
      aria-label="Complaint results"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      {complaints.length === 0 ? (
        <div className="grid min-h-56 place-items-center px-6 py-10 text-center">
          <div>
            <Inbox className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold text-slate-900">
              No complaints to display
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Try changing the filters or refresh the queue.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-200 xl:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-xs font-semibold text-slate-600">
                {complaints.length} complaints on this page
              </p>
              <button
                type="button"
                onClick={onSelectAll}
                aria-pressed={allSelected}
                className="min-h-11 px-2 text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                {allSelected ? "Deselect page" : "Select page"}
              </button>
            </div>
            <ul className="divide-y divide-slate-100">
              {complaints.map((item) => {
                const customer =
                  item.customerName ?? item.customerEmail ?? "Unknown customer";
                const assignee =
                  item.assignedToName ??
                  (item.assignedToId ? "Assigned" : "Unassigned");

                return (
                  <li key={item.id} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => onSelect(item.id)}
                        aria-label={`Select ${item.trackingId}`}
                        className="mt-1 h-4 w-4 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 pr-1">
                          <span className="font-mono text-xs text-slate-500">
                            {item.trackingId}
                          </span>
                          <span
                            className={`text-xs font-bold ${priorityStyles[item.priority] ?? "text-slate-700"}`}
                          >
                            {String(item.priority).replaceAll("_", " ")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpen(item.id)}
                          className="mt-1 min-h-11 text-left text-sm font-semibold leading-5 text-slate-950 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                        >
                          {item.title}
                        </button>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                          {item.description}
                        </p>
                        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3 text-xs">
                          <div className="min-w-0">
                            <dt className="font-medium text-slate-500">Status</dt>
                            <dd className="mt-1"><StatusBadge status={item.status} /></dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="font-medium text-slate-500">Category</dt>
                            <dd className="mt-1 truncate font-medium text-slate-800">
                              {item.category}
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="font-medium text-slate-500">Customer</dt>
                            <dd className="mt-1 truncate text-slate-800">{customer}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="font-medium text-slate-500">Assigned to</dt>
                            <dd className="mt-1 truncate text-slate-800">{assignee}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-slate-500">Created</dt>
                            <dd className="mt-1 text-slate-800">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                        <button
                          type="button"
                          onClick={() => onOpen(item.id)}
                          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          Open complaint
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onSelectAll}
                      aria-label="Select all visible complaints"
                    />
                  </th>
                  <th className="px-4 py-3">
                    <SortHeader
                      label="Complaint"
                      active={sortKey === "createdAt"}
                      direction={direction}
                      onSort={() => onSort("createdAt")}
                    />
                  </th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">
                    <SortHeader
                      label="Status"
                      active={sortKey === "status"}
                      direction={direction}
                      onSort={() => onSort("status")}
                    />
                  </th>
                  <th className="px-4 py-3">
                    <SortHeader
                      label="Priority"
                      active={sortKey === "priority"}
                      direction={direction}
                      onSort={() => onSort("priority")}
                    />
                  </th>
                  <th className="px-4 py-3">Assigned to</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => onSelect(item.id)}
                        aria-label={`Select ${item.trackingId}`}
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                        aria-expanded={expanded === item.id}
                        className="text-left"
                      >
                        <span className="block font-mono text-xs text-slate-500">
                          {item.trackingId}
                        </span>
                        <span className="mt-1 block font-semibold text-slate-900">
                          {item.title}
                        </span>
                        {expanded === item.id && (
                          <span className="mt-2 block max-w-xs text-xs leading-5 text-slate-600">
                            {item.description}
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">
                      {item.customerName ?? item.customerEmail ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">{item.category}</td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className={`px-4 py-3 align-top font-semibold ${priorityStyles[item.priority] ?? "text-slate-700"}`}>
                      {item.priority}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">
                      {item.assignedToName ?? (item.assignedToId ? "Assigned" : "Unassigned")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-slate-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => onOpen(item.id)}
                        className="inline-flex min-h-11 items-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <label className="text-slate-600">
          Rows
          <select
            value={pageSize}
            onChange={(event) => onPageSize(Number(event.target.value) as 10 | 25 | 50)}
            className="ml-2 min-h-11 rounded-md border border-slate-300 px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="min-h-11 rounded-md border border-slate-300 px-3 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-600">Page {page} of {Math.max(totalPages, 1)}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
            className="min-h-11 rounded-md border border-slate-300 px-3 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}