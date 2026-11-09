interface LoadingProps {
    label?: string;
}

export function Loading({
    label = "Loading...",
}: LoadingProps) {
    return (
        <div
            className="flex items-center gap-2 text-sm text-gray-600"
            role="status"
            aria-live="polite"
        >
            <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
                aria-hidden="true"
            />

            <span>{label}</span>
        </div>
    );
}