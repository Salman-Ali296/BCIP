import { ComplaintSubmissionPage } from "@/features/complaints/submission/pages/ComplaintSubmissionPage";

interface BusinessComplaintPageProps {
    params: Promise<{
        businessSlug: string;
    }>;
}

export default async function BusinessComplaintPage({
    params,
}: BusinessComplaintPageProps) {
    const { businessSlug } = await params;

    return <ComplaintSubmissionPage businessSlug={businessSlug} />;
}