interface BusinessComplaintTrackingPageProps {
    params: Promise<{
        businessSlug: string;
        trackingId: string;
    }>;
}

export default async function BusinessComplaintTrackingPage({
    params,
}: BusinessComplaintTrackingPageProps) {
    const { businessSlug, trackingId } = await params;

    return (
        <main className="min-h-screen">
            <h1>Track Complaint</h1>
            <p>Business: {businessSlug}</p>
            <p>Tracking ID: {trackingId}</p>
        </main>
    );
}