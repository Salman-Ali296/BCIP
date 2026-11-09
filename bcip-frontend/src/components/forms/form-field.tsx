import type { ReactNode } from "react";

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    children: ReactNode;
}

export function FormField({
    label,
    htmlFor,
    error,
    children,
}: FormFieldProps) {
    const errorId = `${htmlFor}-error`;

    return (
        <div className="space-y-2">
            <label
                htmlFor={htmlFor}
                className="text-sm font-medium text-gray-900"
            >
                {label}
            </label>

            {children}

            {error && (
                <p
                    id={errorId}
                    className="text-sm text-red-600"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}