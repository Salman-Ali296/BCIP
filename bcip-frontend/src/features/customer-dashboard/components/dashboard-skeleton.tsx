export function CustomerDashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse" aria-label="Loading customer dashboard">
            {/* Hero / CTA Skeleton */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-3">
                        <div className="h-4 w-32 rounded bg-slate-200" />
                        <div className="h-7 w-72 rounded bg-slate-200" />
                        <div className="h-4 w-96 rounded bg-slate-100" />
                    </div>
                    <div className="h-12 w-48 rounded-xl bg-slate-200" />
                </div>
            </div>

            {/* Status Metrics Skeleton */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-3 w-24 rounded bg-slate-200" />
                            <div className="h-8 w-8 rounded-lg bg-slate-100" />
                        </div>
                        <div className="h-8 w-14 rounded bg-slate-200" />
                        <div className="h-3 w-32 rounded bg-slate-100" />
                    </div>
                ))}
            </div>

            {/* Action Required Banner Skeleton */}
            <div className="h-28 rounded-2xl border border-slate-200 bg-slate-100" />

            {/* Main Content Skeleton */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-6 w-48 rounded bg-slate-200" />
                    <div className="h-44 rounded-2xl border border-slate-200 bg-white" />
                    <div className="h-44 rounded-2xl border border-slate-200 bg-white" />
                </div>
                <div className="space-y-6">
                    <div className="h-60 rounded-2xl border border-slate-200 bg-white" />
                    <div className="h-60 rounded-2xl border border-slate-200 bg-white" />
                </div>
            </div>
        </div>
    );
}
