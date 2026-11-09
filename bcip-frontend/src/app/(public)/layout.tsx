import type { ReactNode } from "react";

import { Footer } from "@/components/navigation/footer";
import { EnterpriseNavbar } from "@/components/navigation/enterprise-navbar";

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({
    children,
}: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Public navigation */}
            <EnterpriseNavbar />

            {/* Main page content */}
            <main className="flex-1 pt-20 sm:pt-24">
                {children}
            </main>

            {/* Shared footer */}
            <Footer />
        </div>
    );
}