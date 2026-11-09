"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { QuickStats } from "@/features/dashboard/components/QuickStats";
import { FilterBar } from "@/features/dashboard/components/FilterBar";
import { SortControls } from "@/features/dashboard/components/SortControls";
import { BulkActions } from "@/features/dashboard/components/BulkActions";
import { ComplaintTable } from "@/features/dashboard/components/ComplaintTable";
import { ComplaintDetail } from "@/features/dashboard/components/ComplaintDetail";
import { useComplaintsList } from "@/features/dashboard/hooks/useComplaintsList";
import { useFiltering } from "@/features/dashboard/hooks/useFiltering";
import { sortComplaints } from "@/features/dashboard/utils/sortUtils";
import { exportComplaintsCsv } from "@/features/dashboard/services/dashboardService";
import type { SortDirection, SortKey } from "@/features/dashboard/types/dashboard.types";
import type { ComplaintListItem } from "@/features/dashboard/types/dashboard.types";

export function DashboardPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const initialComplaints: ComplaintListItem[] = [];
  const filtering = useFiltering(initialComplaints);
  const query = useComplaintsList(filtering.filters);

  const complaints: ComplaintListItem[] = query.data?.data ?? [];
  const filtered = sortComplaints(complaints, sortKey, direction);
  const total = query.data?.pagination.total ?? filtered.length;

  const stats = useMemo(
    () => ({
      totalOpen: complaints.filter((item) =>
        ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER"].includes(item.status)
      ).length,
      averageResolutionTime: "1h 48m",
      highPriority: complaints.filter((item) =>
        ["HIGH", "CRITICAL"].includes(item.priority)
      ).length,
      unassigned: complaints.filter((item) => !item.assignedToId).length,
      todayNew: complaints.filter(
        (item) =>
          new Date(item.createdAt).toDateString() === new Date().toDateString()
      ).length,
      reputationScore: 94,
      slaCompliance: 98.2,
    }),
    [complaints]
  );

  function sort(nextKey: SortKey) {
    setDirection(
      sortKey === nextKey ? (direction === "asc" ? "desc" : "asc") : "desc"
    );
    setSortKey(nextKey);
  }

  function exportCsv() {
    const blob = new Blob([exportComplaintsCsv(filtered)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "enterprise_complaints.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1540px] space-y-6">
        <DashboardHeader
          onRefresh={() => {
            void query.refetch();
            setLastUpdated(new Date());
          }}
          onExport={exportCsv}
          refreshing={query.isFetching}
          lastUpdated={lastUpdated}
        />

        <QuickStats
          stats={stats}
          onOpen={() => filtering.updateFilters({ statuses: ["OPEN"] })}
        />

        {/* Quick Triage Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Quick Views:
          </span>
          <button
            type="button"
            onClick={() => filtering.resetFilters()}
            className="rounded-lg bg-slate-200/80 hover:bg-slate-300/80 px-3 py-1 font-semibold text-slate-800 transition"
          >
            All Tickets ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => filtering.updateFilters({ priorities: ["CRITICAL", "HIGH"] })}
            className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 font-semibold transition"
          >
            Critical Urgency ({stats.highPriority})
          </button>
          <button
            type="button"
            onClick={() => filtering.updateFilters({ statuses: ["OPEN"] })}
            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 font-semibold transition"
          >
            Open Queue ({stats.totalOpen})
          </button>
          <button
            type="button"
            onClick={() => filtering.updateFilters({ assignedTo: "unassigned" })}
            className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 font-semibold transition"
          >
            Unassigned ({stats.unassigned})
          </button>
        </div>

        <FilterBar
          filters={filtering.filters}
          update={filtering.updateFilters}
          reset={filtering.resetFilters}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BulkActions
            selectedIds={selectedIds}
            onComplete={() => setSelectedIds([])}
          />
          <SortControls
            sortKey={sortKey}
            direction={direction}
            onChange={sort}
          />
        </div>

        {query.isError ? (
          <p
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-xs"
            role="alert"
          >
            {query.error instanceof Error
              ? query.error.message
              : "Unable to load complaints."}
          </p>
        ) : query.isLoading ? (
          <div
            className="h-96 animate-pulse rounded-2xl bg-white shadow-xs"
            role="status"
            aria-label="Loading complaints"
          />
        ) : (
          <ComplaintTable
            complaints={filtered}
            selectedIds={selectedIds}
            onSelect={(id) =>
              setSelectedIds((current) =>
                current.includes(id)
                  ? current.filter((item) => item !== id)
                  : [...current, id]
              )
            }
            onSelectAll={() =>
              setSelectedIds((current) =>
                current.length === filtered.length
                  ? []
                  : filtered.map((item) => item.id)
              )
            }
            onOpen={setSelectedComplaint}
            sortKey={sortKey}
            direction={direction}
            onSort={sort}
            page={filtering.filters.page}
            pageSize={filtering.filters.pageSize}
            totalPages={
              query.data?.pagination.pages ??
              Math.ceil(total / filtering.filters.pageSize)
            }
            onPage={(page) => filtering.updateFilters({ page })}
            onPageSize={(pageSize) => filtering.updateFilters({ pageSize })}
          />
        )}
      </div>

      {selectedComplaint && (
        <>
          <button
            type="button"
            aria-label="Close detail overlay"
            onClick={() => setSelectedComplaint(null)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity"
          />
          <ComplaintDetail
            complaintId={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
          />
        </>
      )}
    </main>
  );
}

