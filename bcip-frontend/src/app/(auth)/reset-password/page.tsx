import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AuthCard, AuthLayout, SecurityNotice } from "@/components/auth";

export default function ResetPasswordPage() {
    return (
        <AuthLayout>
            <AuthCard
                heading="Password reset unavailable"
                supportingText="BCIP cannot update your password because password-reset requests are not currently supported."
                badge="Account Recovery"
                footer={
                    <div className="space-y-4">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Sign In
                        </Link>
                        <SecurityNotice />
                    </div>
                }
            >
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                    Contact your BCIP administrator for help restoring access. No password was changed.
                </p>
            </AuthCard>
        </AuthLayout>
    );
}
