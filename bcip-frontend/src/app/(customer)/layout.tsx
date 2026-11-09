import type { ReactNode } from "react";

import { CustomerShell } from "@/components/navigation/customer-shell";
import "./customer-portal.css";

interface CustomerLayoutProps {
    children: ReactNode;
}

export default function CustomerLayout({
    children,
}: CustomerLayoutProps) {
    return <CustomerShell>{children}</CustomerShell>;
}