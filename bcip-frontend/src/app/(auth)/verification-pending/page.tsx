import { redirect } from "next/navigation";

interface VerificationPendingPageProps {
    searchParams: Promise<{
        email?: string;
    }>;
}

export default async function VerificationPendingPage({
    searchParams,
}: VerificationPendingPageProps) {
    const { email } = await searchParams;
    const query = email ? `?email=${encodeURIComponent(email)}` : "";
    redirect(`/verify-email${query}`);
}
