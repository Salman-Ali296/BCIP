import { ComplaintTrackingPage } from "@/features/complaints/tracking/pages/ComplaintTrackingPage";

interface ComplaintTrackingRouteProps { params: Promise<{ trackingId: string }> }

export default async function ComplaintTrackingRoute({ params }: ComplaintTrackingRouteProps) {
    const { trackingId } = await params;
    return <ComplaintTrackingPage trackingId={trackingId} />;
}