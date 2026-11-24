import type { ReactNode } from "react";

import { Footer } from "@/components/navigation/footer";
interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({
    children,
}: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Main page content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Shared footer */}
            <Footer />
        </div>
    );
}