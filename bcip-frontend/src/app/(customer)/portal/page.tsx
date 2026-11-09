import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data-display/stat-card";
import { RecentComplaints } from "@/features/complaints/components/recent-complaints";

export default function CustomerDashboardPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Customer Dashboard"
                description="Overview of your complaints and support activity."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Complaints"
                    value={0}
                    description="All submitted complaints"
                />

                <StatCard
                    label="Open"
                    value={0}
                    description="Currently being handled"
                />

                <StatCard
                    label="Resolved"
                    value={0}
                    description="Successfully resolved"
                />

                <StatCard
                    label="Needs Attention"
                    value={0}
                    description="Requires your response"
                />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
                <Link
                    href="/customer/complaints/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Submit Complaint
                </Link>

                <Link
                    href="/customer/complaints"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                    View My Complaints
                </Link>
            </div>

            <div className="mt-8">
                <RecentComplaints />
            </div>

            {/* ───── Quick Help / Support CTA ───── */}
            <div className="mt-8 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900">
                            Need help with a complaint?
                        </h3>
                        <p className="mt-1 text-sm text-blue-700">
                            Our support team is here 24/7 to assist you.
                        </p>
                    </div>

                    <Link
                        href="/support"
                        className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </PageContainer>
    );
}