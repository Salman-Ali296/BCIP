import { redirect } from "next/navigation";

export default async function LegacyBusinessComplaintPage({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<never> {
    const { id } = await params;
    redirect(`/business/complaints/${encodeURIComponent(id)}`);
}