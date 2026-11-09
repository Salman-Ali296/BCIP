import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> { }

export function Label({
    className = "",
    ...props
}: LabelProps) {
    return (
        <label
            className={`text-sm font-medium text-gray-900 ${className}`}
            {...props}
        />
    );
}