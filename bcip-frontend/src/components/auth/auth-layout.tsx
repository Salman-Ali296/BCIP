"use client";

import React, { ReactNode } from "react";
import { BrandPanel } from "./brand-panel";

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-[#f8fafc] text-slate-900 font-sans antialiased overflow-x-hidden">
            {/* Left Column: Brand & Intelligence Visualization Panel */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full min-h-screen sticky top-0">
                <BrandPanel />
            </div>

            {/* Right Column: Authentication Screen Area */}
            <main
                id="main-content"
                className="flex-1 lg:col-span-7 xl:col-span-7 2xl:col-span-8 flex flex-col justify-center items-center py-10 sm:py-16 px-4 sm:px-8 lg:px-12 min-h-screen"
            >
                <div className="w-full max-w-[480px] flex flex-col justify-center">
                    {children}
                </div>
            </main>
        </div>
    );
}
