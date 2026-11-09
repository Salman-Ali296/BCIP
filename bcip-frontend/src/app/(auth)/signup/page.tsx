"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
    UserRound,
} from "lucide-react";
import { registerAccount } from "@/lib/api/auth";
import {
    isPersonalEmailAddress,
    isDisposableEmailAddress,
    isSuspiciousDomain
} from "@/lib/validation/business-email";

type SignupData = {
    companyName: string;
    businessEmail: string;
    industry: string;
    teamSize: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
};

const initialData: SignupData = {
    companyName: "",
    businessEmail: "",
    industry: "",
    teamSize: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
};

const steps = [
    {
        number: 1,
        title: "Business",
        description: "Workspace details",
    },
    {
        number: 2,
        title: "Account",
        description: "Administrator access",
    },
    {
        number: 3,
        title: "Finish",
        description: "Verify & choose a plan",
    },
];

const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";

const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormFieldProps = {
    id: string;
    label: string;
    icon?: ReactNode;
    hint?: string;
    error?: string;
    children: ReactNode;
};

function FormField({
    id,
    label,
    icon,
    hint,
    error,
    children,
}: FormFieldProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                        {icon}
                    </span>
                )}

                <div className={icon ? "[&_input]:pl-12" : ""}>
                    {children}
                </div>
            </div>

            {error ? (
                <p className="mt-2 text-xs font-medium text-red-500">
                    {error}
                </p>
            ) : hint ? (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

type SelectFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    required?: boolean;
};

function SelectField({
    id,
    label,
    value,
    onChange,
    options,
    required = false,
}: SelectFieldProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                {label}
            </label>

            <select
                id={id}
                value={value}
                required={required}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className={inputClassName}
            >
                <option value="">
                    Select an option
                </option>

                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();

    const [currentStep, setCurrentStep] =
        useState(1);

    const [formData, setFormData] =
        useState<SignupData>(initialData);

    const [error, setError] = useState("");
    
    const [emailError, setEmailError] = useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    function validateEmailLive(emailValue: string) {
        const email = emailValue.trim().toLowerCase();

        if (!email) {
            setEmailError("");
            return;
        }

        if (!emailPattern.test(email)) {
            setEmailError("Enter a valid business email address, such as name@company.com.");
            return;
        }

        if (isPersonalEmailAddress(email)) {
            setEmailError("Use your work email address. Personal email addresses aren’t allowed for business registration.");
            return;
        }

        if (isDisposableEmailAddress(email)) {
            setEmailError("Temporary or disposable email addresses are not allowed. Please use your company email address.");
            return;
        }

        if (isSuspiciousDomain(email)) {
            setEmailError("This email domain looks invalid or fake. Please use your official company email.");
            return;
        }

        setEmailError("");
    }

    function updateField<K extends keyof SignupData>(
        field: K,
        value: SignupData[K]
    ) {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));

        // Agar email field update ho rahi hai to live validate karein
        if (field === "businessEmail") {
            validateEmailLive(value as string);
        }

        setError("");
    }

    /*
     * =========================================================
     * EMAIL VALIDATION (For Final Check on Submit/Next)
     * =========================================================
     */
    function validateBusinessEmail(
        emailValue: string
    ): boolean {
        const email = emailValue
            .trim()
            .toLowerCase();

        if (!email) {
            setError(
                "Please enter your business email address."
            );

            return false;
        }

        if (!emailPattern.test(email)) {
            setError(
                "Enter a valid business email address, such as name@company.com."
            );

            return false;
        }

        if (isPersonalEmailAddress(email)) {
            setError(
                "Use your work email address. Personal email addresses aren’t allowed for business registration."
            );
            return false;
        }

        if (isDisposableEmailAddress(email)) {
            setError(
                "Temporary or disposable email addresses are not allowed. Please use your company email address."
            );
            return false;
        }

        if (isSuspiciousDomain(email)) {
            setError(
                "This email domain looks invalid or fake. Please use your official company email."
            );
            return false;
        }

        return true;
    }

    /*
     * =========================================================
     * STEP VALIDATION
     * =========================================================
     */
    function validateStep(): boolean {
        setError("");

        if (currentStep === 1) {
            const companyName =
                formData.companyName.trim();

            if (companyName.length < 3) {
                setError(
                    "Enter a valid business or organization name."
                );

                return false;
            }

            if (
                !validateBusinessEmail(
                    formData.businessEmail
                )
            ) {
                return false;
            }

            if (!formData.industry) {
                setError(
                    "Choose the industry that best describes your business."
                );

                return false;
            }
        }

        if (currentStep === 2) {
            if (
                formData.fullName.trim()
                    .length < 3
            ) {
                setError(
                    "Enter the full name of the business administrator."
                );

                return false;
            }

            if (
                formData.password.length < 12
            ) {
                setError(
                    "Your password must contain at least 12 characters."
                );

                return false;
            }

            if (
                !/[A-Z]/.test(
                    formData.password
                )
            ) {
                setError(
                    "Password must contain at least one uppercase letter."
                );

                return false;
            }

            if (
                !/[a-z]/.test(
                    formData.password
                )
            ) {
                setError(
                    "Password must contain at least one lowercase letter."
                );

                return false;
            }

            if (
                !/\d/.test(
                    formData.password
                )
            ) {
                setError(
                    "Password must contain at least one number."
                );

                return false;
            }

            if (
                !/[^A-Za-z0-9]/.test(
                    formData.password
                )
            ) {
                setError(
                    "Password must contain at least one special character."
                );

                return false;
            }

            if (
                formData.password !==
                formData.confirmPassword
            ) {
                setError(
                    "Your passwords do not match."
                );

                return false;
            }
        }

        if (
            currentStep === 3 &&
            !formData.acceptTerms
        ) {
            setError(
                "You must accept the terms and privacy policy to continue."
            );

            return false;
        }

        return true;
    }

    /*
     * =========================================================
     * NEXT BUTTON
     * =========================================================
     */
    function handleNext() {
        const valid = validateStep();

        if (!valid) {
            return;
        }

        setCurrentStep((step) =>
            Math.min(step + 1, 3)
        );
    }

    /*
     * =========================================================
     * BACK BUTTON
     * =========================================================
     */
    function handleBack() {
        setError("");

        setCurrentStep((step) =>
            Math.max(step - 1, 1)
        );
    }

    /*
     * =========================================================
     * FINAL SUBMIT
     * =========================================================
     */
    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (currentStep < 3) {
            handleNext();
            return;
        }

        if (!validateStep()) {
            return;
        }

        const email = formData.businessEmail
            .trim()
            .toLowerCase();

        if (!validateBusinessEmail(email)) {
            setCurrentStep(1);
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const registration =
                await registerAccount({
                    accountType: "BUSINESS",
                    email,
                    password: formData.password,
                    fullName: formData.fullName.trim(),
                    businessName: formData.companyName.trim(),
                    industry: formData.industry,
                    teamSize: formData.teamSize || undefined,
                });

            if (
                registration.verificationRequired
            ) {
                router.push(
                    `/verify-email?email=${encodeURIComponent(
                        email
                    )}`
                );

                return;
            }

            router.push(
                `/login?email=${encodeURIComponent(
                    email
                )}`
            );
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    // Determine if the "Continue" button should be disabled on Step 1
    const isStep1Invalid = 
        formData.companyName.trim().length < 3 || 
        !formData.businessEmail.trim() || 
        !!emailError || 
        !formData.industry;

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-4 sm:px-6 sm:py-6 lg:flex lg:items-center lg:justify-center lg:p-10">
            <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:min-h-[720px] lg:grid-cols-[0.88fr_1.12fr]">

                {/* =================================================
                    LEFT BRAND PANEL
                ================================================= */}
                <section className="relative overflow-hidden bg-[#21113b] px-7 py-9 text-white sm:px-10 sm:py-11 lg:flex lg:flex-col lg:px-14 lg:py-14">

                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(168,85,247,0.24),transparent_28%),radial-gradient(circle_at_15%_90%,rgba(124,58,237,0.18),transparent_36%)]"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute -right-16 top-[27%] size-72 rounded-full border border-violet-200/10 bg-violet-400/5"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute -bottom-20 -left-12 size-64 rounded-full border border-violet-200/10 bg-violet-300/5"
                    />

                    <Link
                        href="/"
                        className="relative z-10 inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
                    >
                        <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-violet-500 text-lg font-extrabold text-white shadow-lg shadow-violet-950/30">
                            B
                        </span>

                        <span>
                            <strong className="block text-xl font-bold tracking-tight">
                                BCIP
                            </strong>

                            <span className="mt-0.5 block text-xs text-slate-300">
                                Business Complaint Intelligence Platform
                            </span>
                        </span>
                    </Link>

                    <div className="relative z-10 mt-14 max-w-md lg:mt-24">

                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
                            <Sparkles className="size-3.5" />
                            Create your business workspace
                        </div>

                        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                            Better complaint resolution starts here.
                        </h1>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300 sm:text-base">
                            Set up your BCIP workspace,
                            invite your team, and gain
                            clearer visibility into
                            customer concerns.
                        </p>

                        <div className="mt-10 space-y-4">
                            {[
                                "Dedicated and isolated business workspace",
                                "Business administrator account setup",
                                "Email verification before platform access",
                            ].map(
                                (
                                    feature,
                                    index
                                ) => (
                                    <div
                                        key={
                                            feature
                                        }
                                        className="flex items-start gap-3 text-sm leading-6 text-slate-200"
                                        style={{
                                            animationDelay: `${index * 120}ms`,
                                        }}
                                    >
                                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-violet-400/15 text-violet-300">
                                            <CheckCircle2 className="size-3.5" />
                                        </span>

                                        {feature}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto flex items-center gap-2 pt-14 text-xs text-slate-400">
                        <ShieldCheck className="size-4 text-violet-400" />

                        Your workspace begins with
                        secure account verification.
                    </div>
                </section>

                {/* =================================================
                    RIGHT FORM PANEL
                ================================================= */}
                <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
                    <div className="w-full max-w-xl">

                        {/* Mobile logo */}
                        <Link
                            href="/"
                            className="mb-8 inline-flex items-center gap-2.5 lg:hidden"
                        >
                            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-violet-500 text-sm font-extrabold text-white">
                                B
                            </span>

                            <span className="font-bold tracking-tight text-slate-900">
                                BCIP
                            </span>
                        </Link>

                        <p className="text-sm font-semibold text-violet-700">
                            Create your workspace
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            Register your business
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Complete the details below
                            to create your BCIP
                            administrator account.
                        </p>

                        {/* =================================================
                            PROGRESS INDICATOR
                        ================================================= */}
                        <div className="mt-8">
                            <div className="flex items-start justify-between">

                                {steps.map(
                                    (step) => {
                                        const isCompleted =
                                            currentStep >
                                            step.number;

                                        const isActive =
                                            currentStep ===
                                            step.number;

                                        return (
                                            <div
                                                key={
                                                    step.number
                                                }
                                                className="relative z-10 flex flex-1 flex-col items-center last:flex-none"
                                            >
                                                <div className="flex w-full items-center">

                                                    <span
                                                        className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-all duration-300 ${
                                                            isCompleted
                                                                ? "bg-violet-600 text-white"
                                                                : isActive
                                                                  ? "bg-[#28123e] text-white ring-4 ring-violet-100"
                                                                  : "bg-slate-100 text-slate-400"
                                                        }`}
                                                    >
                                                        {isCompleted ? (
                                                            <Check className="size-4" />
                                                        ) : (
                                                            step.number
                                                        )}
                                                    </span>

                                                    {step.number !==
                                                        3 && (
                                                        <span className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                            <span
                                                                className={`block h-full bg-violet-500 transition-all duration-500 ${
                                                                    currentStep >
                                                                    step.number
                                                                        ? "w-full"
                                                                        : "w-0"
                                                                }`}
                                                            />
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-2 w-full">
                                                    <p
                                                        className={`text-xs font-semibold ${
                                                            isActive
                                                                ? "text-slate-800"
                                                                : "text-slate-400"
                                                        }`}
                                                    >
                                                        {
                                                            step.title
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">
                                                        {
                                                            step.description
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* =================================================
                            FORM
                        ================================================= */}
                        <form
                            className="mt-9"
                            onSubmit={
                                handleSubmit
                            }
                            noValidate
                        >

                            {/* General Error */}
                            {error && (
                                <div
                                    role="alert"
                                    aria-live="polite"
                                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            {/* =================================================
                                STEP 1
                            ================================================= */}
                            {currentStep === 1 && (
                                <div
                                    key="business-step"
                                    className="space-y-5"
                                >

                                    <FormField
                                        id="business-name"
                                        label="Business or organization name"
                                        icon={
                                            <Building2 className="size-4" />
                                        }
                                    >
                                        <input
                                            id="business-name"
                                            type="text"
                                            value={
                                                formData.companyName
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "companyName",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            minLength={
                                                3
                                            }
                                            maxLength={
                                                120
                                            }
                                            placeholder="e.g. Acme Holdings"
                                            autoComplete="organization"
                                            className={
                                                inputClassName
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        id="business-email"
                                        label="Work email address"
                                        icon={
                                            <Mail className={`size-4 ${emailError ? 'text-red-400' : ''}`} />
                                        }
                                        hint="Use your company email. Personal addresses such as Gmail, Yahoo, Outlook.com, and Hotmail aren't accepted."
                                        error={emailError}
                                    >
                                        <input
                                            id="business-email"
                                            type="email"
                                            inputMode="email"
                                            value={
                                                formData.businessEmail
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "businessEmail",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            maxLength={
                                                254
                                            }
                                            placeholder="name@company.com"
                                            autoComplete="email"
                                            className={`${inputClassName} ${
                                                emailError 
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/50" 
                                                    : ""
                                            }`}
                                        />
                                    </FormField>

                                    <div className="grid gap-5 sm:grid-cols-2">

                                        <SelectField
                                            id="industry"
                                            label="Industry"
                                            value={
                                                formData.industry
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                updateField(
                                                    "industry",
                                                    value
                                                )
                                            }
                                            required
                                            options={[
                                                "Banking & Finance",
                                                "Retail & E-commerce",
                                                "Telecommunications",
                                                "Healthcare",
                                                "Travel & Logistics",
                                                "Education & Government",
                                                "Other",
                                            ]}
                                        />

                                        <SelectField
                                            id="team-size"
                                            label="Team size"
                                            value={
                                                formData.teamSize
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                updateField(
                                                    "teamSize",
                                                    value
                                                )
                                            }
                                            options={[
                                                "1–50 employees",
                                                "51–200 employees",
                                                "201–500 employees",
                                                "501–1000 employees",
                                                "1000+ employees",
                                            ]}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                STEP 2
                            ================================================= */}
                            {currentStep === 2 && (
                                <div
                                    key="account-step"
                                    className="space-y-5"
                                >

                                    <FormField
                                        id="full-name"
                                        label="Administrator full name"
                                        icon={
                                            <UserRound className="size-4" />
                                        }
                                    >
                                        <input
                                            id="full-name"
                                            type="text"
                                            value={
                                                formData.fullName
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "fullName",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            minLength={
                                                3
                                            }
                                            placeholder="e.g. Sarah Ahmed"
                                            autoComplete="name"
                                            className={
                                                inputClassName
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        id="password"
                                        label="Create password"
                                        icon={
                                            <LockKeyhole className="size-4" />
                                        }
                                    >
                                        <input
                                            id="password"
                                            type="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "password",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            minLength={
                                                12
                                            }
                                            placeholder="Create a secure password"
                                            autoComplete="new-password"
                                            className={
                                                inputClassName
                                            }
                                        />
                                    </FormField>

                                    <FormField
                                        id="confirm-password"
                                        label="Confirm password"
                                        icon={
                                            <LockKeyhole className="size-4" />
                                        }
                                    >
                                        <input
                                            id="confirm-password"
                                            type="password"
                                            value={
                                                formData.confirmPassword
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "confirmPassword",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            placeholder="Repeat your password"
                                            autoComplete="new-password"
                                            className={
                                                inputClassName
                                            }
                                        />
                                    </FormField>
                                </div>
                            )}

                            {/* =================================================
                                STEP 3
                            ================================================= */}
                            {currentStep === 3 && (
                                <div
                                    key="finish-step"
                                    className="space-y-5"
                                >

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                                        <h3 className="font-semibold text-slate-900">
                                            Review registration
                                        </h3>

                                        <div className="mt-4 space-y-3 text-sm">

                                            <div>
                                                <span className="text-slate-500">
                                                    Business
                                                </span>

                                                <p className="font-medium text-slate-800">
                                                    {
                                                        formData.companyName
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <span className="text-slate-500">
                                                    Business email
                                                </span>

                                                <p className="break-all font-medium text-slate-800">
                                                    {
                                                        formData.businessEmail
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <span className="text-slate-500">
                                                    Administrator
                                                </span>

                                                <p className="font-medium text-slate-800">
                                                    {
                                                        formData.fullName
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.acceptTerms
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "acceptTerms",
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                            className="mt-1 size-4 accent-violet-600"
                                        />

                                        <span>
                                            I agree to the
                                            Terms of
                                            Service and
                                            Privacy
                                            Policy.
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* =================================================
                                NAVIGATION BUTTONS
                            ================================================= */}
                            <div className="mt-8 flex items-center justify-between gap-4">

                                {/* BACK */}
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={
                                            handleBack
                                        }
                                        disabled={
                                            isSubmitting
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="size-4" />

                                        Back
                                    </button>
                                ) : (
                                    <span />
                                )}

                                {/* NEXT */}
                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={
                                            handleNext
                                        }
                                        disabled={
                                            isSubmitting || 
                                            (currentStep === 1 && isStep1Invalid)
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#28123e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#28123e]"
                                    >
                                        Continue

                                        <ArrowRight className="size-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#28123e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-900 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting
                                            ? "Creating account..."
                                            : "Create workspace"}

                                        {!isSubmitting && (
                                            <ArrowRight className="size-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}