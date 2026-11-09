import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles = {
    default: "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]",
    success: "border-green-200 bg-[var(--success-soft)] text-[var(--success)]",
    warning: "border-amber-200 bg-[var(--warning-soft)] text-[var(--warning)]",
    danger: "border-red-200 bg-[var(--danger-soft)] text-[var(--danger)]",
    info: "border-blue-200 bg-[var(--info-soft)] text-[var(--info)]",
};

export function Badge({
    variant = "default",
    className = "",
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}   