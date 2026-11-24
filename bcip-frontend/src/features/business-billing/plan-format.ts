import type { BillingInterval, BusinessPlanCatalogItem } from "@/lib/api/business-billing";

export function formatMoney(amountCents: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amountCents / 100);
}

/** Headline price: monthly price, or the per-month equivalent of a yearly plan. */
export function headlinePrice(plan: BusinessPlanCatalogItem, interval: BillingInterval): string | null {
    if (plan.customPricing) return null;
    const amount = plan.pricing.amountCents[interval];
    if (!amount) return null;
    const perMonth = interval === "year" ? Math.round(amount / 12) : amount;
    return formatMoney(perMonth, plan.pricing.currency);
}

export function billedLine(plan: BusinessPlanCatalogItem, interval: BillingInterval): string {
    if (plan.customPricing) return "Pricing agreed with our team";
    const amount = plan.pricing.amountCents[interval];
    if (!amount) return "Pricing not configured";
    return interval === "year"
        ? `Billed ${formatMoney(amount, plan.pricing.currency)} once a year`
        : "Billed monthly, cancel anytime";
}

export function yearlySavingsCents(plan: BusinessPlanCatalogItem): number {
    const { month, year } = plan.pricing.amountCents;
    if (!month || !year) return 0;
    return Math.max(0, month * 12 - year);
}

export function formatLimit(limit: number | null, unit?: string): string {
    if (limit === null) return "Unlimited";
    const value = limit.toLocaleString("en-US");
    return unit ? `${value} ${unit}` : value;
}

export function formatStorage(limitMb: number | null): string {
    if (limitMb === null) return "Unlimited";
    return limitMb >= 1024 ? `${Math.round(limitMb / 1024)} GB` : `${limitMb} MB`;
}

export function formatRetention(days: number | null): string {
    if (days === null) return "Unlimited";
    if (days % 365 === 0) return `${days / 365} ${days === 365 ? "year" : "years"}`;
    if (days % 30 === 0) return `${days / 30} months`;
    return `${days} days`;
}

export function intervalLabel(interval: BillingInterval): string {
    return interval === "month" ? "Monthly" : "Yearly";
}

export function addInterval(from: Date, interval: BillingInterval): Date {
    const next = new Date(from);
    if (interval === "month") next.setMonth(next.getMonth() + 1);
    else next.setFullYear(next.getFullYear() + 1);
    return next;
}

export function formatDate(value: Date | string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}
