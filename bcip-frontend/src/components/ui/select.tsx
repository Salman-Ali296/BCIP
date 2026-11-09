import type { SelectHTMLAttributes } from "react";

interface SelectProps
    extends SelectHTMLAttributes<HTMLSelectElement> { }

export function Select({
    className = "",
    children,
    ...props
}: SelectProps) {
    return (
        <select
            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}