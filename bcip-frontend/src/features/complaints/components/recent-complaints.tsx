import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

export function RecentComplaints() {
    return (
        <section className="overflow-hidden rounded-2xl border border-[#101d30]/8 bg-white shadow-[0_4px_18px_rgba(17,28,45,0.04)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#101d30]/8 px-5 py-4 sm:px-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2454d6]">Your activity</p>
                    <h2 className="mt-1 text-base font-semibold text-[#101d30]">Recent complaints</h2>
                </div>
                <Link
                    href="/customer/complaints"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2454d6] transition hover:text-[#1b43b4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2454d6]"
                >
                    View all
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
            <div className="grid min-h-52 place-items-center px-6 py-8 text-center">
                <div className="max-w-sm">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#edf2ff] text-[#2454d6]">
                        <ClipboardList className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-[#101d30]">Complaint activity is not connected yet</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5e6b7d]">
                        Your complaint history will appear here once customer activity is available in the portal.
                    </p>
                </div>
            </div>
        </section>
    );
}
