import { ComplaintListSkeleton } from "@/features/complaints/components/complaint-list-skeleton";
interface ComplaintListErrorProps {
    message?: string;
}

export function ComplaintListError({
    message = "Unable to load complaints.",
}: ComplaintListErrorProps) {
    return (
        <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
            {message}
        </div>
    );
}