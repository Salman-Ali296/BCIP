import Link from "next/link";

interface ComplaintSuccessPageProps {
    params: Promise<{
        trackingId: string;
    }>;
}

export default async function ComplaintSuccessPage({
    params,
}: ComplaintSuccessPageProps) {
    const { trackingId } = await params;

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-16">
            <div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Submitted successfully</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-950">Your complaint is in the queue</h1>
                <p className="mt-3 text-slate-600">Keep this tracking ID for future updates.</p>
                <p className="mt-6 rounded-lg bg-slate-100 px-4 py-3 font-mono text-lg font-semibold text-slate-900">{trackingId}</p>
                <Link href="/complaint" className="mt-6 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Track another complaint</Link>
            </div>
        </main>
    );
}