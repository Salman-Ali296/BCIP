import Link from "next/link";
import type { Complaint } from "@/features/complaints/types/complaint";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/data-display/status-badge";
import { PriorityBadge } from "@/components/data-display/priority-badge";
export default async function CustomerComplaintDetailsPage({
    params,
}: {
    params: Promise<{ complaintId: string }>;
}) {
    const { complaintId } = await params;
    const complaint: Complaint = {
        id: complaintId,
        trackingId: complaintId,
        title: "Billing issue with recent invoice",
        description:
            "I noticed an unexpected charge on my recent invoice and would like the billing team to review it.",
        category: "BILLING",
        status: "IN_PROGRESS",
        priority: "HIGH",
        sentiment: "negative",
        channel: "text",
        email: "",
        createdAt: Date.parse("September 15, 2026"),
        updatedAt: Date.parse("September 15, 2026"),
    };

    return (
        <section className="p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/customer/complaints"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back to complaints
                    </Link>

                    <h1 className="mt-4 text-2xl font-semibold text-gray-900">
                        Complaint Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Tracking ID: {complaint.trackingId}
                    </p>
                </div>

                <StatusBadge status={complaint.status} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Complaint Information
                        </h2>

                        <div className="mt-5 space-y-5">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Subject
                                </p>

                                <p className="mt-1 text-sm text-gray-900">
                                    {complaint.title}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Category
                                </p>

                                <p className="mt-1 text-sm text-gray-900">
                                    {complaint.category}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Description
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                    {complaint.description}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Complaint Timeline
                        </h2>

                        <div className="mt-5 space-y-5">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Complaint submitted
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {complaint.createdAt}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Complaint is being reviewed
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {complaint.updatedAt}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">
                            Priority
                        </p>

                        {complaint.priority ? (
                            <div className="mt-2">
                                <PriorityBadge priority={complaint.priority} />
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">
                                Not assigned
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}