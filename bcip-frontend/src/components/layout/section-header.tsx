import type { ReactNode } from "react";

interface SectionHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function SectionHeader({
    title,
    description,
    action,
}: SectionHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>

            {action && (
                <div className="shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}