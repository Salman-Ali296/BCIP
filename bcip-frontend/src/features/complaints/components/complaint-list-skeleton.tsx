import { Skeleton } from "@/components/ui/skeleton";

export function ComplaintListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-lg border p-4 space-y-3"
                >
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            ))}
        </div>
    );
}