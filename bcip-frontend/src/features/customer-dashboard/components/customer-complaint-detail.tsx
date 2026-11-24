"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ApiClientError } from "@/lib/api/client";
import { getCustomerComplaint } from "@/lib/api/customer-complaints";

function formatStatus(status: string): string {
    return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : date.toLocaleString();
}

export function CustomerComplaintDetail({
    complaintId,
}: {
    complaintId: string;
}) {
    const complaintQuery = useQuery({
        queryKey: ["customer-complaint", complaintId],
        queryFn: () => getCustomerComplaint(complaintId),
        enabled: Boolean(complaintId),
    });

    return (
        <section className="mx-auto w-full max-w-4xl space-y-6">
            <Link
                href="/customer/complaints"
                className="inline-flex min-h-10 items-center text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
                Back to my complaints
            </Link>

            {complaintQuery.isLoading && (
                <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600" role="status">
                    Loading complaint…
                </p>
            )}

            {complaintQuery.isError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800" role="alert">
                    {complaintQuery.error instanceof ApiClientError &&
                    complaintQuery.error.status === 404
                        ? "This complaint could not be found or does not belong to your account."
                        : "We couldn’t load this complaint. Please try again."}
                    <button
                        type="button"
                        onClick={() => void complaintQuery.refetch()}
                        className="ml-2 font-semibold underline underline-offset-2"
                    >
                        Retry
                    </button>
                </div>
            )}

            {complaintQuery.data && (
                <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <header className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Tracking ID: {complaintQuery.data.trackingId}
                            </p>
                            <h1 className="mt-2 text-2xl font-bold text-slate-900">
                                {complaintQuery.data.title}
                            </h1>
                        </div>
                        <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                            {formatStatus(complaintQuery.data.status)}
                        </span>
                    </header>

                    <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_16rem]">
                        <div className="space-y-6">
                            <section>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Complaint details
                                </h2>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {complaintQuery.data.description}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Status history
                                </h2>
                                {complaintQuery.data.statusHistory?.length ? (
                                    <ol className="mt-3 space-y-3">
                                        {complaintQuery.data.statusHistory.map((event) => (
                                            <li
                                                key={event.id}
                                                className="flex items-start justify-between gap-4 border-l-2 border-blue-200 pl-3"
                                            >
                                                <span className="text-sm text-slate-800">
                                                    {formatStatus(event.toStatus)}
                                                </span>
                                                <time
                                                    dateTime={event.changedAt}
                                                    className="shrink-0 text-xs text-slate-500"
                                                >
                                                    {formatDate(event.changedAt)}
                                                </time>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="mt-2 text-sm text-slate-600">
                                        No status updates are available yet.
                                    </p>
                                )}
                            </section>
                        </div>

                        <dl className="space-y-4 rounded-lg bg-slate-50 p-4 text-sm">
                            <div>
                                <dt className="text-xs font-medium uppercase text-slate-500">
                                    Category
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {complaintQuery.data.category}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase text-slate-500">
                                    Priority
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {formatStatus(complaintQuery.data.priority)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase text-slate-500">
                                    Submitted
                                </dt>
                                <dd className="mt-1 font-medium text-slate-900">
                                    {formatDate(complaintQuery.data.createdAt)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </article>
            )}
        </section>
    );
}
