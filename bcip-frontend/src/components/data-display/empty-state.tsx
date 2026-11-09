import type { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
                {title}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {description}
            </p>
            
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}