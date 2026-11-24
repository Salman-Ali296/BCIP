import type { HTMLAttributes } from "react";

type PageContainerProps = HTMLAttributes<HTMLElement>;

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