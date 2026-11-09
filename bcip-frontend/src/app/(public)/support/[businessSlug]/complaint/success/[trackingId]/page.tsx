export default async function BusinessComplaintSuccessPage({
    params,
}: {
    params: Promise<{ businessSlug: string; trackingId: string }>;
}) {
    // Await the params object (Required in Next.js 15+)
    const { businessSlug, trackingId } = await params;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                {/* Success Icon */}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                        className="h-8 w-8 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Title & Description */}
                <h1 className="text-2xl font-bold text-slate-900">
                    Complaint Submitted Successfully
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Your complaint has been registered and is being processed.
                </p>

                {/* Tracking ID Box */}
                <div className="mt-6 rounded-lg bg-slate-50 p-4 border border-slate-100">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Tracking ID
                    </p>
                    <p className="mt-1 text-lg font-bold text-indigo-600 font-mono">
                        {trackingId}
                    </p>
                </div>

                {/* Business Info */}
                <p className="mt-4 text-sm text-slate-600">
                    Business: <span className="font-semibold text-slate-900">{businessSlug}</span>
                </p>

                <p className="mt-6 text-xs text-slate-500">
                    You will receive updates via email and SMS.
                </p>
            </div>
        </main>
    );
}