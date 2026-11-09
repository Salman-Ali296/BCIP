import type { HTMLAttributes } from "react";

interface PageContainerProps extends HTMLAttributes<HTMLElement> { }

export function PageContainer({
    className = "",
    children,
    ...props
}: PageContainerProps) {
    return (
        <section
            className={`p-6 md:p-8 ${className}`}
            {...props}
        >
            {children}
        </section>
    );
}