"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { saveBillingProfile, type BillingProfile } from "@/lib/api/business-billing";
import { ApiClientError } from "@/lib/api/client";

const COUNTRY_CODES = [
    "PK", "AE", "SA", "QA", "KW", "OM", "BH", "GB", "US", "CA", "AU", "NZ", "IE", "DE", "FR", "NL",
    "BE", "ES", "IT", "SE", "NO", "DK", "FI", "CH", "AT", "PL", "PT", "TR", "EG", "ZA", "NG", "KE",
    "IN", "BD", "LK", "MY", "SG", "ID", "PH", "TH", "JP", "KR", "CN", "HK", "BR", "MX",
];

type FieldName = keyof Omit<BillingProfile, "updatedAt">;
type Errors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(profile: BillingProfile): Errors {
    const errors: Errors = {};
    if (profile.companyName.trim().length < 2) errors.companyName = "Enter the company name that should appear on invoices.";
    if (profile.contactName.trim().length < 2) errors.contactName = "Enter the person who receives invoices.";
    if (!EMAIL_PATTERN.test(profile.billingEmail.trim())) errors.billingEmail = "Enter a valid billing email address.";
    if (profile.phone && !/^[+()\d.\-\s]{7,30}$/.test(profile.phone.trim())) errors.phone = "Enter a valid phone number.";
    if (profile.addressLine1.trim().length < 3) errors.addressLine1 = "Enter the street address.";
    if (profile.city.trim().length < 2) errors.city = "Enter the city.";
    if (profile.postalCode.trim().length < 2) errors.postalCode = "Enter the postal code.";
    if (!/^[A-Z]{2}$/.test(profile.country)) errors.country = "Choose a country.";
    return errors;
}

export const INPUT_CLASS =
    "mt-2 block w-full rounded-xl border border-line bg-wash px-4 py-3 text-sm text-ink placeholder:text-subtle outline-none transition focus:border-brand-soft focus:bg-wash focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-rose-200";

function Field({
    id,
    label,
    optional,
    error,
    children,
    className = "",
}: {
    id: string;
    label: string;
    optional?: boolean;
    error?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-ink">
                {label}
                {optional && <span className="text-xs font-normal text-subtle">Optional</span>}
            </label>
            {children}
            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

interface BillingDetailsFormProps {
    initial: BillingProfile;
    submitLabel: string;
    onSaved: (profile: BillingProfile) => void;
    onCancel?: () => void;
}

export function BillingDetailsForm({ initial, submitLabel, onSaved, onCancel }: BillingDetailsFormProps) {
    const [profile, setProfile] = useState<BillingProfile>(initial);
    const [errors, setErrors] = useState<Errors>({});
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const countries = useMemo(() => {
        const names = new Intl.DisplayNames(["en"], { type: "region" });
        const [first, ...rest] = COUNTRY_CODES;
        const sorted = rest
            .map((code) => ({ code, name: names.of(code) ?? code }))
            .sort((a, b) => a.name.localeCompare(b.name));
        return [{ code: first, name: names.of(first) ?? first }, ...sorted];
    }, []);

    function update<K extends FieldName>(key: K, value: BillingProfile[K]) {
        setProfile((current) => ({ ...current, [key]: value }));
        if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    }

    function inputProps(key: FieldName) {
        return {
            id: `billing-${key}`,
            "aria-invalid": errors[key] ? true : undefined,
            "aria-describedby": errors[key] ? `billing-${key}-error` : undefined,
            className: INPUT_CLASS,
        };
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors = validate(profile);
        setErrors(nextErrors);
        setFormError("");
        if (Object.keys(nextErrors).length) {
            setFormError("Check the highlighted fields.");
            return;
        }
        setSaving(true);
        try {
            const saved = await saveBillingProfile(profile);
            onSaved(saved.profile);
        } catch (error: unknown) {
            setFormError(
                error instanceof ApiClientError && error.status === 400
                    ? error.message
                    : "We couldn’t save your billing details. Please try again.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={submit} noValidate>
            <fieldset className="grid gap-5 sm:grid-cols-2" disabled={saving}>
                <legend className="sr-only">Billing details</legend>
                <Field id="billing-companyName" label="Company name on invoices" error={errors.companyName} className="sm:col-span-2">
                    <input {...inputProps("companyName")} autoComplete="organization" maxLength={160} value={profile.companyName} onChange={(event) => update("companyName", event.target.value)} />
                </Field>
                <Field id="billing-contactName" label="Billing contact" error={errors.contactName}>
                    <input {...inputProps("contactName")} autoComplete="name" maxLength={120} value={profile.contactName} onChange={(event) => update("contactName", event.target.value)} />
                </Field>
                <Field id="billing-billingEmail" label="Billing email" error={errors.billingEmail}>
                    <input {...inputProps("billingEmail")} type="email" autoComplete="email" maxLength={254} value={profile.billingEmail} onChange={(event) => update("billingEmail", event.target.value)} />
                </Field>
                <Field id="billing-addressLine1" label="Street address" error={errors.addressLine1} className="sm:col-span-2">
                    <input {...inputProps("addressLine1")} autoComplete="address-line1" maxLength={200} value={profile.addressLine1} onChange={(event) => update("addressLine1", event.target.value)} />
                </Field>
                <Field id="billing-addressLine2" label="Suite, floor or building" optional error={errors.addressLine2} className="sm:col-span-2">
                    <input {...inputProps("addressLine2")} autoComplete="address-line2" maxLength={200} value={profile.addressLine2 ?? ""} onChange={(event) => update("addressLine2", event.target.value || null)} />
                </Field>
                <Field id="billing-city" label="City" error={errors.city}>
                    <input {...inputProps("city")} autoComplete="address-level2" maxLength={100} value={profile.city} onChange={(event) => update("city", event.target.value)} />
                </Field>
                <Field id="billing-state" label="State / province" optional error={errors.state}>
                    <input {...inputProps("state")} autoComplete="address-level1" maxLength={100} value={profile.state ?? ""} onChange={(event) => update("state", event.target.value || null)} />
                </Field>
                <Field id="billing-postalCode" label="Postal code" error={errors.postalCode}>
                    <input {...inputProps("postalCode")} autoComplete="postal-code" maxLength={20} value={profile.postalCode} onChange={(event) => update("postalCode", event.target.value)} />
                </Field>
                <Field id="billing-country" label="Country" error={errors.country}>
                    <select {...inputProps("country")} autoComplete="country" value={profile.country} onChange={(event) => update("country", event.target.value)}>
                        <option value="" className="bg-white">Choose a country</option>
                        {countries.map((country) => (
                            <option key={country.code} value={country.code} className="bg-white">{country.name}</option>
                        ))}
                    </select>
                </Field>
                <Field id="billing-phone" label="Billing phone" optional error={errors.phone}>
                    <input {...inputProps("phone")} type="tel" autoComplete="tel" maxLength={30} value={profile.phone ?? ""} onChange={(event) => update("phone", event.target.value || null)} />
                </Field>
                <Field id="billing-taxId" label="Tax ID (NTN / VAT)" optional error={errors.taxId}>
                    <input {...inputProps("taxId")} maxLength={40} value={profile.taxId ?? ""} onChange={(event) => update("taxId", event.target.value || null)} />
                </Field>
            </fieldset>

            {formError && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{formError}</p>}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                {onCancel && (
                    <button type="button" onClick={onCancel} disabled={saving} className="min-h-12 rounded-xl px-5 text-sm font-semibold text-ink-soft transition hover:text-ink">
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-sm font-semibold text-white transition hover:bg-brand disabled:opacity-60"
                >
                    {saving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
                    {saving ? "Saving…" : submitLabel}
                </button>
            </div>
        </form>
    );
}

export function BillingAddressSummary({ profile }: { profile: BillingProfile }) {
    const country = useMemo(() => {
        try {
            return new Intl.DisplayNames(["en"], { type: "region" }).of(profile.country) ?? profile.country;
        } catch {
            return profile.country;
        }
    }, [profile.country]);
    return (
        <address className="not-italic text-sm leading-6 text-ink-soft">
            <span className="block font-semibold text-ink">{profile.companyName}</span>
            <span className="block">{profile.contactName} · {profile.billingEmail}</span>
            <span className="block">
                {[profile.addressLine1, profile.addressLine2].filter(Boolean).join(", ")}
            </span>
            <span className="block">
                {[profile.city, profile.state, profile.postalCode].filter(Boolean).join(", ")} · {country}
            </span>
            {profile.taxId && <span className="block text-muted">Tax ID {profile.taxId}</span>}
        </address>
    );
}
