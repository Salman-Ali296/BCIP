import { redirect } from "next/navigation";

export default function LegacyDashboardLayout(): never {
    redirect("/business/dashboard");
}
