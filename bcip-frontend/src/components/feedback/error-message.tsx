interface ErrorMessageProps {
    message?: string;
}

export function ErrorMessage({
    message = "Something went wrong. Please try again.",
}: ErrorMessageProps) {
    return (
        <div
            className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
        >
            {message}
        </div>
    );
}