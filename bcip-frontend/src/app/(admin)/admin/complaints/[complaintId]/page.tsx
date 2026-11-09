interface AdminComplaintDetailPageProps {
    params: Promise<{
        complaintId: string;
    }>;
}

export default async function AdminComplaintDetailPage({
    params,
}: AdminComplaintDetailPageProps) {
    const { complaintId } = await params;

    return (
        <main className="min-h-screen">
            <h1>Complaint Details</h1>
            <p>Complaint ID: {complaintId}</p>
        </main>
    );
}