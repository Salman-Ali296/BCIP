import type { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
}

export function StatCard({
    label,
    value,
    description,
    icon,
}: StatCardProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {value}
                    </p>

                    {description && (
                        <p className="mt-1 text-sm text-gray-500">
                            {description}
                        </p>
                    )}
                </div>

                {icon && (
                    <div
                        className="rounded-md bg-gray-100 p-2 text-gray-700"
                        aria-hidden="true"
                    >
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}