interface SuccessMessageProps {
    message: string;
}

export function SuccessMessage({
    message,
}: SuccessMessageProps) {
    return (
        <div
            className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
}