import { redirect } from "next/navigation";

interface DemoCheckoutRedirectProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Legacy URL: demo and paid activation now share the single checkout flow. */
export default async function BusinessDemoCheckoutPage({ searchParams }: DemoCheckoutRedirectProps) {
    const params = await searchParams;
    const query = new URLSearchParams();
    for (const key of ["plan", "interval"]) {
        const value = params[key];
        if (typeof value === "string") query.set(key, value);
    }
    redirect(`/business/checkout${query.size ? `?${query.toString()}` : ""}`);
}
