"use client";

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { VerificationCodeInput } from "@/components/auth/verification-code-input";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthIllustration } from "@/components/auth/auth-illustration";
import {
  changeRegistrationEmail,
  completeBusinessRegistration,
  getEmailVerificationPolicy,
  registerAccount,
  requestEmailVerificationCode,
  updateRegistrationAccount,
  verifyEmailCode,
  type BusinessRegistrationResult,
  type EmailVerificationPolicy,
} from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import {
  isDisposableEmailAddress,
  isPersonalEmailAddress,
} from "@/lib/validation/business-email";

type AccountForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
};

type BusinessForm = {
  businessName: string;
  industry: string;
  website: string;
  teamSize: string;
  country: string;
  city: string;
  businessAddress: string;
  description: string;
};

type WizardError = Record<string, string>;

const INITIAL_ACCOUNT: AccountForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
  acceptPrivacyPolicy: false,
};

const INITIAL_BUSINESS: BusinessForm = {
  businessName: "",
  industry: "",
  website: "",
  teamSize: "",
  country: "",
  city: "",
  businessAddress: "",
  description: "",
};

const INDUSTRIES = [
        'Technology',
        'Software & SaaS',
        'IT Services',
        'Healthcare',
        'Pharmaceuticals',
        'Fitness & Wellness',
        'Finance',
        'Banking',
        'Insurance',
        'Real Estate',
        'Retail',
        'E-commerce',
        'Wholesale & Distribution',
        'Food & Beverage',
        'Restaurants & Cafes',
        'Fashion & Apparel',
        'Beauty & Personal Care',
        'Education',
        'Manufacturing',
        'Construction',
        'Automotive',
        'Agriculture',
        'Energy & Utilities',
        'Telecommunications',
        'Media & Entertainment',
        'Marketing & Advertising',
        'Logistics',
        'Transportation',
        'Hospitality',
        'Travel & Tourism',
        'Legal Services',
        'Consulting & Professional Services',
        'Security Services',
        'Government & Public Sector',
        'Non-Profit',
        'Other',
];

const COMPANY_SIZES = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1000",
  "1000+",
];

const COUNTRY_OPTIONS = [
  "Pakistan",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "India",
  "Bangladesh",
  "Turkey",
  "Malaysia",
  "Singapore",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Italy",
  "Spain",
  "Other",
];

const STEPS = [
  { number: 1, title: "Account", description: "Your details" },
  { number: 2, title: "Verify", description: "Confirm your email" },
  { number: 3, title: "Business", description: "Organization profile" },
  { number: 4, title: "Review", description: "Check and submit" },
  { number: 5, title: "Complete", description: "Registration status" },
];

const FIELD_CLASS =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

const STORAGE_KEY = "bcip-business-registration-wizard-v1";

type PersistedWizardState = {
  account: Pick<
    AccountForm,
    "fullName" | "email" | "phone" | "acceptTerms" | "acceptPrivacyPolicy"
  >;
  business: BusinessForm;
  currentStep: number;
  accountCreated: boolean;
  emailVerified: boolean;
  registrationToken: string;
  hasSentCode: boolean;
  returnToReview: boolean;
  confirmationAccepted: boolean;
  completion: BusinessRegistrationResult | null;
};

function isValidVerificationPolicy(policy: EmailVerificationPolicy): boolean {
  return (
    policy.codeLength === 6 &&
    policy.expiresInSeconds > 0 &&
    policy.resendCooldownSeconds >= 0
  );
}

type ApiClientErrorLike = ApiClientError & {
  body?: {
    message?: string;
  };
  data?: {
    message?: string;
  };
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getRequestError(error: unknown, fallback: string): string {
  if (!(error instanceof ApiClientError)) return fallback;

  const apiError = error as ApiClientErrorLike;

  const serverMessage =
    apiError.body?.message ??
    apiError.data?.message ??
    apiError.response?.data?.message ??
    (error.message || undefined);

  switch (apiError.status) {
    case 0:
      return "We couldn't connect to BCIP. Check your connection and try again.";
    case 400:
      return (
        serverMessage ||
        "Some details couldn't be accepted. Review the fields and try again."
      );
    case 401:
      return (
        serverMessage ||
        "Your registration session has expired. Verify your email again."
      );
    case 403:
      return (
        serverMessage ||
        "This action is not allowed for your current registration state."
      );
    case 409:
      return (
        serverMessage ||
        "An account with this email already exists. Sign in or use another address."
      );
    case 429:
      return (
        serverMessage || "Too many attempts. Wait a little before trying again."
      );
    case 503:
      return (
        serverMessage ||
        "This service is temporarily unavailable. Please try again shortly."
      );
    default:
      if (apiError.status >= 500) {
        return serverMessage || fallback;
      }
      return serverMessage || fallback;
  }
}

function getEmailError(value: string): string {
  const email = value.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid business email address.";
  }

  if (isPersonalEmailAddress(email)) {
    return "Use your work email address for business registration.";
  }

  if (isDisposableEmailAddress(email)) {
    return "Temporary email addresses are not accepted.";
  }

  return "";
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;
  return `${localPart[0]}${"*".repeat(Math.max(2, localPart.length - 1))}@${domain}`;
}

function getPasswordStrength(password: string): number {
  if (!password) return 0;

  return [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

function passwordStrengthLabel(strength: number): string {
  if (strength < 2) return "Needs work";
  if (strength < 4) return "Good";
  return "Strong";
}

function validateAccount(
  form: AccountForm,
  accountCreated: boolean,
): WizardError {
  const errors: WizardError = {};
  const name = form.fullName.trim();

  if (name.length < 3 || name.length > 120) {
    errors.fullName = "Enter a name between 3 and 120 characters.";
  }

  if (form.phone.trim().length < 7 || form.phone.trim().length > 30) {
    errors.phone = "Enter a phone number between 7 and 30 characters.";
  }

  if (!accountCreated) {
    const emailError = getEmailError(form.email);
    if (emailError) errors.email = emailError;

    if (form.password.length < 12 || form.password.length > 128) {
      errors.password = "Use a password between 12 and 128 characters.";
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "The passwords do not match.";
    }

    if (!form.acceptTerms) {
      errors.acceptTerms = "Accept the Terms of Service to continue.";
    }

    if (!form.acceptPrivacyPolicy) {
      errors.acceptPrivacyPolicy = "Accept the Privacy Policy to continue.";
    }
  }

  return errors;
}

function validateBusiness(form: BusinessForm): WizardError {
  const errors: WizardError = {};

  if (
    form.businessName.trim().length < 3 ||
    form.businessName.trim().length > 120
  ) {
    errors.businessName = "Enter a business name between 3 and 120 characters.";
  }

  if (!INDUSTRIES.includes(form.industry)) {
    errors.industry = "Choose an industry.";
  }

  if (!COMPANY_SIZES.includes(form.teamSize)) {
    errors.teamSize = "Choose a company size.";
  }

  if (form.country.trim().length < 2 || form.country.trim().length > 100) {
    errors.country = "Enter a country.";
  }

  if (form.city.trim().length < 2 || form.city.trim().length > 100) {
    errors.city = "Enter a city.";
  }

  if (form.businessAddress.trim().length > 500) {
    errors.businessAddress = "The address must be 500 characters or fewer.";
  }

  if (form.description.trim().length > 2000) {
    errors.description = "The description must be 2,000 characters or fewer.";
  }

  if (form.website.trim()) {
    try {
      const website = new URL(form.website.trim());

      if (
        !["http:", "https:"].includes(website.protocol) ||
        website.username ||
        website.password
      ) {
        errors.website = "Use a valid HTTP or HTTPS website URL.";
      }
    } catch {
      errors.website = "Enter a valid website URL.";
    }
  }

  return errors;
}

function Field({
  id,
  label,
  error,
  hint,
  required = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-800"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-violet-700">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs leading-5 text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SummarySection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export default function BusinessRegistrationWizard() {
  const [account, setAccount] = useState<AccountForm>(INITIAL_ACCOUNT);
  const [business, setBusiness] = useState<BusinessForm>(INITIAL_BUSINESS);
  const [currentStep, setCurrentStep] = useState(1);
  const [isWorking, setIsWorking] = useState(false);
  const [isPolicyLoading, setIsPolicyLoading] = useState(true);
  const [verificationPolicy, setVerificationPolicy] =
    useState<EmailVerificationPolicy | null>(null);
  const [policyError, setPolicyError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [registrationToken, setRegistrationToken] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [hasSentCode, setHasSentCode] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [returnToReview, setReturnToReview] = useState(false);
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);
  const [completion, setCompletion] =
    useState<BusinessRegistrationResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<WizardError>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const restoredRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((remaining) => Math.max(remaining - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

 useEffect(() => {
  if (restoredRef.current) return;

  restoredRef.current = true;

  let cancelled = false;

  void Promise.resolve().then(() => {
    if (cancelled) return;

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedWizardState>;

        if (parsed.account) {
          setAccount((previous) => ({
            ...previous,
            ...parsed.account,
            password: "",
            confirmPassword: "",
          }));
        }

        if (parsed.business) {
          setBusiness((previous) => ({
            ...previous,
            ...parsed.business,
          }));
        }

        const nextAccountCreated = Boolean(parsed.accountCreated);
        const nextEmailVerified = Boolean(parsed.emailVerified);

        const nextRegistrationToken =
          nextEmailVerified && typeof parsed.registrationToken === "string"
            ? parsed.registrationToken
            : "";

        setAccountCreated(nextAccountCreated);
        setEmailVerified(nextEmailVerified);
        setRegistrationToken(nextRegistrationToken);
        setHasSentCode(Boolean(parsed.hasSentCode));
        setReturnToReview(Boolean(parsed.returnToReview));
        setConfirmationAccepted(Boolean(parsed.confirmationAccepted));
        setCompletion(parsed.completion ?? null);

        let step = Number(parsed.currentStep ?? 1);

        if (!Number.isFinite(step)) step = 1;

        step = Math.min(Math.max(Math.trunc(step), 1), 5);

        if (!nextAccountCreated && step > 1) {
          step = 1;
        }

        if (!nextEmailVerified) {
          setRegistrationToken("");
        }

        if (nextEmailVerified && !nextRegistrationToken) {
          setEmailVerified(false);

          if (step > 2) step = 2;
        }

        if (step === 5 && !parsed.completion) {
          step = nextRegistrationToken ? 4 : 3;
        }

        setCurrentStep(step);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  });

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    if (!isHydrated) return;

    const state: PersistedWizardState = {
      account: {
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        acceptTerms: account.acceptTerms,
        acceptPrivacyPolicy: account.acceptPrivacyPolicy,
      },
      business,
      currentStep,
      accountCreated,
      emailVerified,
      registrationToken,
      hasSentCode,
      returnToReview,
      confirmationAccepted,
      completion,
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors.
    }
  }, [
    isHydrated,
    account.fullName,
    account.email,
    account.phone,
    account.acceptTerms,
    account.acceptPrivacyPolicy,
    business,
    currentStep,
    accountCreated,
    emailVerified,
    registrationToken,
    hasSentCode,
    returnToReview,
    confirmationAccepted,
    completion,
  ]);

const loadVerificationPolicy = useCallback(() => {
  return getEmailVerificationPolicy()
    .then((result) => {
      if (!result || !isValidVerificationPolicy(result)) {
        setPolicyError("Invalid email verification policy.");
        return;
      }

      setVerificationPolicy(result);
      setPolicyError("");
    })
    .catch((error: unknown) => {
      setPolicyError(
        error instanceof Error
          ? error.message
          : "Unable to load verification policy."
      );
    })
    .finally(() => {
      setIsPolicyLoading(false);
    });
}, []);

useEffect(() => {
  void loadVerificationPolicy();
}, [loadVerificationPolicy]);
  function updateAccount<K extends keyof AccountForm>(
    field: K,
    value: AccountForm[K],
  ) {
    const nextAccount = { ...account, [field]: value };
    const errors = validateAccount(nextAccount, accountCreated);

    setAccount(nextAccount);
    setFieldErrors((previous) => ({
      ...previous,
      [field]: errors[field] ?? "",
      ...(field === "password"
        ? { confirmPassword: errors.confirmPassword ?? "" }
        : {}),
    }));
    setErrorMessage("");
  }

  function updateBusiness<K extends keyof BusinessForm>(
    field: K,
    value: BusinessForm[K],
  ) {
    const nextBusiness = { ...business, [field]: value };
    const errors = validateBusiness(nextBusiness);

    setBusiness(nextBusiness);
    setFieldErrors((previous) => ({
      ...previous,
      [field]: errors[field] ?? "",
    }));
    setErrorMessage("");
  }

  async function sendCode(email: string): Promise<boolean> {
    setStatusMessage("");
    setErrorMessage("");

    try {
      await requestEmailVerificationCode(email);
      setHasSentCode(true);
      setCode("");
      setCooldown(verificationPolicy?.resendCooldownSeconds ?? 0);
      setStatusMessage(
        "If this email is eligible for verification, a 6-digit code has been sent.",
      );
      setErrorMessage("");
      return true;
    } catch (error: unknown) {
      setErrorMessage(
        getRequestError(
          error,
          "We couldn't send a verification code. Please try again.",
        ),
      );
      return false;
    }
  }

  async function handleAccountContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isWorking || !verificationPolicy) return;

    const errors = validateAccount(account, accountCreated);
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) return;

    setIsWorking(true);
    setErrorMessage("");

    if (accountCreated) {
      if (registrationToken && emailVerified) {
        try {
          await updateRegistrationAccount(
            registrationToken,
            account.fullName.trim(),
            account.phone.trim(),
          );

          setCurrentStep(returnToReview ? 4 : 3);
          setReturnToReview(false);
        } catch (error: unknown) {
          setErrorMessage(
            getRequestError(
              error,
              "We couldn't save your account details. Please try again.",
            ),
          );
        } finally {
          setIsWorking(false);
        }

        return;
      }

      setCurrentStep(2);
      setIsWorking(false);
      return;
    }

    const normalizedEmail = account.email.trim().toLowerCase();

    try {
      const result = await registerAccount({
        accountType: "BUSINESS",
        email: normalizedEmail,
        password: account.password,
        fullName: account.fullName.trim(),
        phone: account.phone.trim(),
        termsAccepted: true,
        privacyPolicyAccepted: true,
        documents: [],
        policies: [],
      });

      if (!result.verificationRequired) {
        setErrorMessage(
          "This email is already linked to an account. Sign in, or use another business email to register.",
        );
        return;
      }

      setAccount((previous) => ({
        ...previous,
        email: normalizedEmail,
        password: "",
        confirmPassword: "",
      }));

      setAccountCreated(true);
      setCurrentStep(2);
      setStatusMessage("Account created. Requesting verification code...");

      await sendCode(normalizedEmail);
    } catch (error: unknown) {
      setErrorMessage(
        getRequestError(
          error,
          "We couldn't create your account. Review your details and try again.",
        ),
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function continueAfterVerification(token = registrationToken) {
    if (!token) return;

    setIsWorking(true);
    setErrorMessage("");

    try {
      await updateRegistrationAccount(
        token,
        account.fullName.trim(),
        account.phone.trim(),
      );

      setCurrentStep(returnToReview ? 4 : 3);
      setReturnToReview(false);
      setCode("");
    } catch (error: unknown) {
      setErrorMessage(
        getRequestError(
          error,
          "Your email is verified, but we couldn't save your account details yet.",
        ),
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleVerificationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isWorking) return;

    if (!hasSentCode) {
      setIsWorking(true);
      await sendCode(account.email.trim().toLowerCase());
      setIsWorking(false);
      return;
    }

    if (code.length !== 6) {
      setErrorMessage("Enter the complete 6-digit code.");
      return;
    }

    setIsWorking(true);
    setErrorMessage("");

    try {
      const result = await verifyEmailCode(
        account.email.trim().toLowerCase(),
        code,
      );

      if (!result.emailVerified || !result.registrationToken) {
        setErrorMessage(
          "Your email was verified, but we couldn't continue business registration. Please contact BCIP support.",
        );
        return;
      }

      setEmailVerified(true);
      setRegistrationToken(result.registrationToken);

      await continueAfterVerification(result.registrationToken);
    } catch (error: unknown) {
      setErrorMessage(
        getRequestError(
          error,
          "That code is invalid or expired. Check your inbox or request a new code.",
        ),
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isWorking) return;

    const normalizedEmail = newEmail.trim().toLowerCase();
    const validationError = getEmailError(normalizedEmail);

    if (validationError) {
      setFieldErrors({ newEmail: validationError });
      return;
    }

    if (!emailChangePassword) {
      setErrorMessage(
        "Enter your current password to change the registration email.",
      );
      return;
    }

    setIsWorking(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      await changeRegistrationEmail(
        account.email.trim().toLowerCase(),
        normalizedEmail,
        emailChangePassword,
      );

      setAccount((previous) => ({
        ...previous,
        email: normalizedEmail,
        password: "",
        confirmPassword: "",
      }));

      setEmailChangePassword("");
      setNewEmail("");
      setRegistrationToken("");
      setEmailVerified(false);
      setHasSentCode(false);
      setCode("");
      setCooldown(0);
      setShowEmailChange(false);

      setStatusMessage(
        `Email updated. Requesting a verification code for ${maskEmail(normalizedEmail)}.`,
      );

      await sendCode(normalizedEmail);
    } catch (error: unknown) {
      setErrorMessage(
        getRequestError(
          error,
          "We couldn't change the registration email. Check the address and try again.",
        ),
      );
    } finally {
      setIsWorking(false);
    }
  }

  function handleBusinessContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateBusiness(business);
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) return;

    setErrorMessage("");
    setCurrentStep(4);
  }

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isWorking || !registrationToken) return;

    if (!confirmationAccepted) {
      setErrorMessage(
        "Confirm that the registration information is accurate and authorized.",
      );
      return;
    }

    const errors = validateBusiness(business);
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setCurrentStep(3);
      setErrorMessage("Review the business information before submitting.");
      return;
    }

    setIsWorking(true);
    setErrorMessage("");

    try {
      const result = await completeBusinessRegistration(registrationToken, {
        businessName: business.businessName.trim(),
        industry: business.industry,
        website: business.website.trim() || undefined,
        // Options are shown as "501–1000" (en dash); the backend schema expects "501-1000".
        teamSize: business.teamSize.replace(/–/g, "-"),
        phone: account.phone.trim(),
        country: business.country.trim(),
        city: business.city.trim(),
        businessAddress: business.businessAddress.trim() || undefined,
        description: business.description.trim() || undefined,
        confirmationAccepted: true,
      });

      setCompletion(result);
      setCurrentStep(5);
      setCode("");

      setAccount((previous) => ({
        ...previous,
        password: "",
        confirmPassword: "",
      }));

      setEmailChangePassword("");
    } catch (error: unknown) {
      setErrorMessage(
        getRequestError(
          error,
          "We couldn't submit your registration. Please review the information and try again.",
        ),
      );
    } finally {
      setIsWorking(false);
    }
  }

  function editAccount() {
    setReturnToReview(true);
    setCurrentStep(1);
    setErrorMessage("");
  }

  function editBusiness() {
    setCurrentStep(3);
    setErrorMessage("");
  }

  const passwordStrength = getPasswordStrength(account.password);
  const codeExpiryMinutes = verificationPolicy
    ? Math.ceil(verificationPolicy.expiresInSeconds / 60)
    : 10;

  return (
    <main className="min-h-[100dvh] w-full bg-white font-sans text-slate-900">
      <div className="grid w-full overflow-hidden bg-white lg:min-h-[100dvh] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <aside
          aria-label="BCIP platform information"
          className="relative overflow-hidden bg-ink px-5 py-6 text-white sm:px-8 sm:py-8 lg:flex lg:flex-col lg:px-14 lg:py-14"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_85%_18%,rgba(168,85,247,0.24),transparent_30%),radial-gradient(circle_at_15%_90%,rgba(124,58,237,0.18),transparent_34%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-20 top-[32%] size-80 rounded-full border border-violet-200/10"
          />
          <div
            aria-hidden="true"
            className="absolute -right-4 top-[46%] size-52 rounded-full border border-violet-200/10"
          />

          <Link
            href="/"
            aria-label="Go to BCIP home page"
            className="relative z-10 inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
          >
            <BrandLogo variant="light" height={38} priority />
          </Link>

          <div className="relative z-10 mt-6 max-w-md sm:mt-8 lg:mt-16">
            <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-5xl">
              Set up your complaint desk.
            </h2>
            <p className="mt-3 max-w-sm text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6 lg:mt-5 lg:text-base lg:leading-7">
              Tell us about your business and you&apos;ll get your own complaint
              page, a sorted queue, and room to add your team.
            </p>
          </div>

          <div className="relative z-10 mt-10 hidden w-full max-w-md lg:block">
            <AuthIllustration />
          </div>
          <div className="relative z-10 mt-10 hidden items-center gap-2 border-t border-white/15 pt-5 text-xs leading-5 text-slate-400 lg:mt-auto lg:flex">
            <span className="size-2 shrink-0 rounded-full bg-violet-400" />
            Registration is reviewed before a business workspace is enabled.
            Email verification alone does not grant dashboard access.
          </div>
        </aside>

        <section className="flex min-w-0 flex-col bg-white px-5 py-6 sm:px-8 sm:py-8 lg:px-14 lg:py-12">
          <header className="mx-auto flex w-full max-w-3xl justify-end gap-4">
            <p className="text-right text-xs text-slate-600 sm:text-sm">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-violet-700 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </header>

          <div className="mx-auto my-auto w-full max-w-3xl py-6 sm:py-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                Business registration
              </p>
              <div className="mt-6" aria-label="Registration progress">
                <ol className="grid grid-cols-5 gap-2">
                  {STEPS.map((step) => {
                    const completed = currentStep > step.number;
                    const active = currentStep === step.number;

                    return (
                      <li
                        key={step.number}
                        aria-current={active ? "step" : undefined}
                        className="min-w-0"
                      >
                        <div className="flex items-center">
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                              completed
                                ? "border-violet-700 bg-violet-700 text-white"
                                : active
                                  ? "border-deep bg-deep text-white"
                                  : "border-slate-300 bg-white text-slate-500"
                            }`}
                          >
                            {completed ? (
                              <Check className="size-4" aria-hidden="true" />
                            ) : (
                              step.number
                            )}
                          </span>
                          {step.number < STEPS.length && (
                            <span
                              aria-hidden="true"
                              className={`ml-1 h-px flex-1 ${
                                completed ? "bg-violet-700" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                        <p
                          className={`mt-2 truncate text-[11px] font-semibold sm:text-xs ${
                            active ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="mt-0.5 hidden text-[10px] text-slate-500 xl:block">
                          {step.description}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            {policyError && (
              <div
                role="alert"
                className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              >
                <span>{policyError}</span>
                <button
                  type="button"
                  onClick={() => void loadVerificationPolicy()}
                  disabled={isPolicyLoading}
                  className="rounded-md font-semibold underline underline-offset-4 disabled:opacity-60"
                >
                  Try again
                </button>
              </div>
            )}

            {errorMessage && (
              <p
                role="alert"
                aria-live="polite"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {errorMessage}
              </p>
            )}

            {statusMessage && (
              <p
                role="status"
                aria-live="polite"
                className="mb-5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-950"
              >
                {statusMessage}
              </p>
            )}

            {currentStep === 1 && (
              <section aria-labelledby="account-heading">
                <h1
                  id="account-heading"
                  className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
                >
                  Let&apos;s create your account.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Start with your basic information. This account will manage
                  your organization&apos;s BCIP workspace.
                </p>

                <form
                  className="mt-7 space-y-4"
                  onSubmit={handleAccountContinue}
                  noValidate
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id="full-name"
                      label="Full name"
                      error={fieldErrors.fullName}
                      required
                    >
                      <input
                        id="full-name"
                        autoComplete="name"
                        maxLength={120}
                        value={account.fullName}
                        onChange={(event) =>
                          updateAccount("fullName", event.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.fullName)}
                        aria-describedby={
                          fieldErrors.fullName ? "full-name-error" : undefined
                        }
                        className={FIELD_CLASS}
                      />
                    </Field>

                    <Field
                      id="business-phone"
                      label="Phone number"
                      error={fieldErrors.phone}
                      required
                    >
                      <input
                        id="business-phone"
                        type="tel"
                        autoComplete="tel"
                        maxLength={30}
                        value={account.phone}
                        onChange={(event) =>
                          updateAccount("phone", event.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-describedby={
                          fieldErrors.phone ? "business-phone-error" : undefined
                        }
                        className={FIELD_CLASS}
                      />
                    </Field>
                  </div>

                  <Field
                    id="business-email"
                    label="Business email"
                    error={fieldErrors.email}
                    hint="Use an address you can access to verify and manage this workspace."
                    required
                  >
                    <input
                      id="business-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={254}
                      value={account.email}
                      readOnly={accountCreated}
                      onChange={(event) => {
                        updateAccount("email", event.target.value);
                        const emailError = getEmailError(event.target.value);
                        setFieldErrors((previous) => ({
                          ...previous,
                          email: emailError,
                        }));
                      }}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={
                        fieldErrors.email ? "business-email-error" : undefined
                      }
                      className={FIELD_CLASS}
                    />
                    {accountCreated && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(2);
                          setShowEmailChange(true);
                          setNewEmail(account.email);
                          setEmailChangePassword("");
                          setErrorMessage("");
                        }}
                        className="mt-2 text-xs font-semibold text-violet-700 underline underline-offset-4"
                      >
                        Change email address
                      </button>
                    )}
                  </Field>

                  {!accountCreated && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          id="registration-password"
                          label="Password"
                          error={fieldErrors.password}
                          required
                        >
                          <div className="relative">
                            <input
                              id="registration-password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              maxLength={128}
                              value={account.password}
                              onChange={(event) =>
                                updateAccount("password", event.target.value)
                              }
                              aria-invalid={Boolean(fieldErrors.password)}
                              aria-describedby={
                                fieldErrors.password
                                  ? "registration-password-error password-strength"
                                  : "password-strength"
                              }
                              className={`${FIELD_CLASS} pr-11`}
                            />
                            <button
                              type="button"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              onClick={() =>
                                setShowPassword((visible) => !visible)
                              }
                              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate-500 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                          <div
                            id="password-strength"
                            className="mt-2 flex items-center gap-2"
                            aria-live="polite"
                          >
                            <span
                              className="flex flex-1 gap-1"
                              aria-hidden="true"
                            >
                              {[1, 2, 3, 4].map((level) => (
                                <span
                                  key={level}
                                  className={`h-1.5 flex-1 rounded-full ${
                                    passwordStrength >= level
                                      ? passwordStrength >= 4
                                        ? "bg-emerald-600"
                                        : "bg-violet-600"
                                      : "bg-slate-200"
                                  }`}
                                />
                              ))}
                            </span>
                            <span className="text-xs text-slate-600">
                              {account.password
                                ? passwordStrengthLabel(passwordStrength)
                                : "12 characters or more"}
                            </span>
                          </div>
                        </Field>

                        <Field
                          id="confirm-password"
                          label="Confirm password"
                          error={fieldErrors.confirmPassword}
                          required
                        >
                          <div className="relative">
                            <input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              maxLength={128}
                              value={account.confirmPassword}
                              onChange={(event) =>
                                updateAccount(
                                  "confirmPassword",
                                  event.target.value,
                                )
                              }
                              aria-invalid={Boolean(
                                fieldErrors.confirmPassword,
                              )}
                              aria-describedby={
                                fieldErrors.confirmPassword
                                  ? "confirm-password-error"
                                  : undefined
                              }
                              className={`${FIELD_CLASS} pr-11`}
                            />
                            <button
                              type="button"
                              aria-label={
                                showConfirmPassword
                                  ? "Hide confirm password"
                                  : "Show confirm password"
                              }
                              onClick={() =>
                                setShowConfirmPassword((visible) => !visible)
                              }
                              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate-500 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                        </Field>
                      </div>

                      <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                        <label className="flex items-start gap-3 text-sm leading-5 text-slate-700">
                          <input
                            type="checkbox"
                            checked={account.acceptTerms}
                            onChange={(event) =>
                              updateAccount("acceptTerms", event.target.checked)
                            }
                            aria-invalid={Boolean(fieldErrors.acceptTerms)}
                            aria-describedby={
                              fieldErrors.acceptTerms
                                ? "terms-error"
                                : undefined
                            }
                            className="mt-0.5 size-4 rounded border-slate-300 accent-violet-600"
                          />
                          <span>
                            I accept the{" "}
                            <Link
                              href="/terms"
                              className="font-semibold text-violet-700 underline underline-offset-2"
                            >
                              Terms of Service
                            </Link>
                            .
                            {fieldErrors.acceptTerms && (
                              <span
                                id="terms-error"
                                className="mt-1 block text-xs text-red-700"
                              >
                                {fieldErrors.acceptTerms}
                              </span>
                            )}
                          </span>
                        </label>

                        <label className="flex items-start gap-3 text-sm leading-5 text-slate-700">
                          <input
                            type="checkbox"
                            checked={account.acceptPrivacyPolicy}
                            onChange={(event) =>
                              updateAccount(
                                "acceptPrivacyPolicy",
                                event.target.checked,
                              )
                            }
                            aria-invalid={Boolean(
                              fieldErrors.acceptPrivacyPolicy,
                            )}
                            aria-describedby={
                              fieldErrors.acceptPrivacyPolicy
                                ? "privacy-error"
                                : undefined
                            }
                            className="mt-0.5 size-4 rounded border-slate-300 accent-violet-600"
                          />
                          <span>
                            I accept the{" "}
                            <Link
                              href="/privacy"
                              className="font-semibold text-violet-700 underline underline-offset-2"
                            >
                              Privacy Policy
                            </Link>
                            .
                            {fieldErrors.acceptPrivacyPolicy && (
                              <span
                                id="privacy-error"
                                className="mt-1 block text-xs text-red-700"
                              >
                                {fieldErrors.acceptPrivacyPolicy}
                              </span>
                            )}
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={
                        isWorking || isPolicyLoading || !verificationPolicy
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isWorking && (
                        <LoaderCircle
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}
                      {accountCreated
                        ? "Continue"
                        : "Continue to email verification"}
                      {!isWorking && (
                        <ArrowRight className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {currentStep === 2 && (
              <section aria-labelledby="verification-heading">
                <h1
                  id="verification-heading"
                  className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
                >
                  Verify your email address.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {emailVerified
                    ? "Your email is verified. Continue to finish setting up your business registration."
                    : `Enter the six-digit code sent to ${maskEmail(account.email)}. It expires in ${codeExpiryMinutes} minutes.`}
                </p>

                {emailVerified ? (
                  <div className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="mt-0.5 size-5 shrink-0 text-emerald-700"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold text-emerald-950">
                          Email verified
                        </p>
                        <p className="mt-1 text-sm leading-6 text-emerald-900">
                          {errorMessage ||
                            "Your verified registration can now continue."}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void continueAfterVerification()}
                      disabled={isWorking}
                      className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-deep px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {isWorking ? "Saving…" : "Continue registration"}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <>
                    <form
                      className="mt-7 space-y-5"
                      onSubmit={handleVerificationSubmit}
                      noValidate
                    >
                      {hasSentCode && (
                        <div>
                          <span className="mb-3 block text-sm font-medium text-slate-800">
                            6-digit verification code
                          </span>
                          <div
                            role="group"
                            aria-label="6-digit email verification code"
                          >
                            <VerificationCodeInput
                              value={code}
                              onChange={(value) => {
                                setCode(value);
                                setErrorMessage("");
                              }}
                              disabled={isWorking}
                              error={Boolean(errorMessage)}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={
                          isWorking ||
                          (!hasSentCode && cooldown > 0) ||
                          (hasSentCode && code.length !== 6)
                        }
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isWorking && (
                          <LoaderCircle
                            className="size-4 animate-spin"
                            aria-hidden="true"
                          />
                        )}
                        {isWorking
                          ? "Please wait…"
                          : hasSentCode
                            ? "Verify email"
                            : "Send verification code"}
                      </button>
                    </form>

                    {hasSentCode && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsWorking(true);
                          void sendCode(
                            account.email.trim().toLowerCase(),
                          ).finally(() => setIsWorking(false));
                        }}
                        disabled={isWorking || cooldown > 0}
                        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cooldown > 0 ? (
                          <>
                            <Clock3 className="size-4" aria-hidden="true" />
                            Resend code in {cooldown}s
                          </>
                        ) : (
                          "Resend code"
                        )}
                      </button>
                    )}

                    {showEmailChange ? (
                      <form
                        onSubmit={handleEmailChange}
                        className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <Field
                          id="new-business-email"
                          label="New business email"
                          error={fieldErrors.newEmail}
                          required
                        >
                          <input
                            id="new-business-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            maxLength={254}
                            value={newEmail}
                            onChange={(event) => {
                              setNewEmail(event.target.value);
                              setFieldErrors({
                                newEmail: getEmailError(event.target.value),
                              });
                              setErrorMessage("");
                            }}
                            aria-invalid={Boolean(fieldErrors.newEmail)}
                            aria-describedby={
                              fieldErrors.newEmail
                                ? "new-business-email-error"
                                : undefined
                            }
                            className={FIELD_CLASS}
                          />
                        </Field>

                        <div className="mt-4">
                          <Field
                            id="email-change-password"
                            label="Current password"
                            required
                            hint="This is required to protect your registration email change."
                          >
                            <input
                              id="email-change-password"
                              type="password"
                              autoComplete="current-password"
                              value={emailChangePassword}
                              onChange={(event) => {
                                setEmailChangePassword(event.target.value);
                                setErrorMessage("");
                              }}
                              className={FIELD_CLASS}
                            />
                          </Field>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowEmailChange(false);
                              setFieldErrors({});
                              setErrorMessage("");
                              setNewEmail("");
                              setEmailChangePassword("");
                            }}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isWorking}
                            className="rounded-lg bg-deep px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {isWorking ? "Updating…" : "Update email"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setNewEmail(account.email);
                          setEmailChangePassword("");
                          setShowEmailChange(true);
                          setErrorMessage("");
                        }}
                        className="mt-4 w-full text-center text-sm font-semibold text-violet-700 underline underline-offset-4"
                      >
                        Change email address
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setErrorMessage("");
                  }}
                  disabled={isWorking}
                  className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back to account details
                </button>
              </section>
            )}

            {currentStep === 3 && (
              <section aria-labelledby="business-heading">
                <h1
                  id="business-heading"
                  className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
                >
                  Tell us about your business.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  These details help BCIP configure a complaint workspace for
                  your organization.
                </p>

                <form
                  className="mt-7 space-y-4"
                  onSubmit={handleBusinessContinue}
                  noValidate
                >
                  <Field
                    id="business-name"
                    label="Business name"
                    error={fieldErrors.businessName}
                    required
                  >
                    <input
                      id="business-name"
                      autoComplete="organization"
                      maxLength={120}
                      value={business.businessName}
                      onChange={(event) =>
                        updateBusiness("businessName", event.target.value)
                      }
                      aria-invalid={Boolean(fieldErrors.businessName)}
                      aria-describedby={
                        fieldErrors.businessName
                          ? "business-name-error"
                          : undefined
                      }
                      className={FIELD_CLASS}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id="industry"
                      label="Industry"
                      error={fieldErrors.industry}
                      required
                    >
                      <input
                        id="industry"
                        list="industry-options"
                        value={business.industry}
                        onChange={(event) =>
                          updateBusiness("industry", event.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.industry)}
                        aria-describedby={
                          fieldErrors.industry ? "industry-error" : undefined
                        }
                        className={FIELD_CLASS}
                      />
                      <datalist id="industry-options">
                        {INDUSTRIES.map((industry) => (
                          <option key={industry} value={industry} />
                        ))}
                      </datalist>
                    </Field>

                    <Field
                      id="company-size"
                      label="Company size"
                      error={fieldErrors.teamSize}
                      required
                    >
                      <select
                        id="company-size"
                        value={business.teamSize}
                        onChange={(event) =>
                          updateBusiness("teamSize", event.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.teamSize)}
                        aria-describedby={
                          fieldErrors.teamSize
                            ? "company-size-error"
                            : undefined
                        }
                        className={FIELD_CLASS}
                      >
                        <option value="">Select company size</option>
                        {COMPANY_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field
                    id="website"
                    label="Company website"
                    error={fieldErrors.website}
                    hint="Optional. Include https:// or http://."
                  >
                    <input
                      id="website"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      maxLength={2048}
                      value={business.website}
                      onChange={(event) =>
                        updateBusiness("website", event.target.value)
                      }
                      aria-invalid={Boolean(fieldErrors.website)}
                      aria-describedby={
                        fieldErrors.website ? "website-error" : undefined
                      }
                      className={FIELD_CLASS}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id="country"
                      label="Country"
                      error={fieldErrors.country}
                      required
                    >
                      <input
                        id="country"
                        list="country-options"
                        autoComplete="country-name"
                        maxLength={100}
                        value={business.country}
                        onChange={(event) =>
                          updateBusiness("country", event.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.country)}
                        aria-describedby={
                          fieldErrors.country ? "country-error" : undefined
                        }
                        className={FIELD_CLASS}
                      />
                      <datalist id="country-options">
                        {COUNTRY_OPTIONS.map((country) => (
                          <option key={country} value={country} />
                        ))}
                      </datalist>
                    </Field>

                    <Field
                      id="city"
                      label="City"
                      error={fieldErrors.city}
                      required
                    >
                      <input
                        id="city"
                        autoComplete="address-level2"
                        maxLength={100}
                        value={business.city}
                        onChange={(event) =>
                          updateBusiness("city", event.target.value)
                        }
                        aria-invalid={Boolean(fieldErrors.city)}
                        aria-describedby={
                          fieldErrors.city ? "city-error" : undefined
                        }
                        className={FIELD_CLASS}
                      />
                    </Field>
                  </div>

                  <Field
                    id="business-address"
                    label="Business address"
                    error={fieldErrors.businessAddress}
                    hint="Optional. Do not include personal or sensitive information."
                  >
                    <input
                      id="business-address"
                      autoComplete="street-address"
                      maxLength={500}
                      value={business.businessAddress}
                      onChange={(event) =>
                        updateBusiness("businessAddress", event.target.value)
                      }
                      aria-invalid={Boolean(fieldErrors.businessAddress)}
                      aria-describedby={
                        fieldErrors.businessAddress
                          ? "business-address-error"
                          : undefined
                      }
                      className={FIELD_CLASS}
                    />
                  </Field>

                  <Field
                    id="business-description"
                    label="Business description"
                    error={fieldErrors.description}
                    hint="Optional. Share a short overview of your organization."
                  >
                    <textarea
                      id="business-description"
                      rows={3}
                      maxLength={2000}
                      value={business.description}
                      onChange={(event) =>
                        updateBusiness("description", event.target.value)
                      }
                      aria-invalid={Boolean(fieldErrors.description)}
                      aria-describedby={
                        fieldErrors.description
                          ? "business-description-error"
                          : undefined
                      }
                      className={`${FIELD_CLASS} resize-y`}
                    />
                  </Field>

                  <div className="flex items-center justify-between gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      <ArrowLeft className="size-4" aria-hidden="true" />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-deep px-5 py-3 text-sm font-semibold text-white hover:bg-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                    >
                      Review registration
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </section>
            )}

            {currentStep === 4 && (
              <section aria-labelledby="review-heading">
                <h1
                  id="review-heading"
                  className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
                >
                  Review your business details.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Check the information below before submitting your
                  registration for approval.
                </p>

                <form
                  className="mt-7 space-y-4"
                  onSubmit={handleRegistrationSubmit}
                  noValidate
                >
                  <SummarySection
                    title="1. Account information"
                    onEdit={editAccount}
                  >
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <SummaryValue
                        label="Full name"
                        value={account.fullName}
                      />
                      <SummaryValue
                        label="Business email"
                        value={account.email}
                      />
                      <SummaryValue
                        label="Phone number"
                        value={account.phone}
                      />
                    </dl>
                  </SummarySection>

                  <SummarySection
                    title="2. Business information"
                    onEdit={editBusiness}
                  >
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <SummaryValue
                        label="Business name"
                        value={business.businessName}
                      />
                      <SummaryValue
                        label="Industry"
                        value={business.industry}
                      />
                      <SummaryValue
                        label="Company size"
                        value={business.teamSize}
                      />
                      <SummaryValue label="Website" value={business.website} />
                      <SummaryValue
                        label="Description"
                        value={business.description}
                      />
                    </dl>
                  </SummarySection>

                  <SummarySection
                    title="3. Contact information"
                    onEdit={editBusiness}
                  >
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <SummaryValue label="Country" value={business.country} />
                      <SummaryValue label="City" value={business.city} />
                      <SummaryValue
                        label="Business address"
                        value={business.businessAddress}
                      />
                    </dl>
                  </SummarySection>

                  <p className="rounded-lg bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
                    File uploads are not available in this registration flow. A
                    Super Admin reviews the submitted business details before
                    access is approved.
                  </p>

                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">
                    <input
                      type="checkbox"
                      checked={confirmationAccepted}
                      onChange={(event) => {
                        setConfirmationAccepted(event.target.checked);
                        setErrorMessage("");
                      }}
                      aria-invalid={Boolean(
                        errorMessage && !confirmationAccepted,
                      )}
                      className="mt-1 size-4 rounded border-slate-300 accent-violet-600"
                    />
                    <span>
                      I confirm that the information provided is accurate and
                      that I am authorized to register this business on the BCIP
                      platform.
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={isWorking}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                    >
                      <ArrowLeft className="size-4" aria-hidden="true" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isWorking}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-deep px-5 py-3 text-sm font-semibold text-white hover:bg-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isWorking && (
                        <LoaderCircle
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}
                      {isWorking ? "Submitting…" : "Submit Registration"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {currentStep === 5 && completion && (
              <section
                aria-labelledby="confirmation-heading"
                aria-live="polite"
              >
                <div className="grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                </div>
                <h1
                  id="confirmation-heading"
                  className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
                >
                  Welcome to BCIP,{" "}
                  {account.fullName.trim().split(/\s+/)[0] || "there"}.
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Thank you for taking the first step with us. We’re glad you’re
                  here. BCIP gives your team a clearer place to understand
                  customer concerns, respond with care, and learn from every
                  conversation.
                </p>

                <div className="mt-7 space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Application reference
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
                      {completion.registrationReferenceId}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">
                        Email verification
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        {completion.emailVerified ? (
                          <CheckCircle2 className="size-4 text-emerald-700" />
                        ) : (
                          <Clock3 className="size-4 text-amber-700" />
                        )}
                        {completion.emailVerified ? "Verified" : "Not verified"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">
                        Business approval
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        {completion.businessApprovalStatus === "APPROVED" ? (
                          <CheckCircle2 className="size-4 text-emerald-700" />
                        ) : (
                          <Clock3 className="size-4 text-amber-700" />
                        )}
                        {completion.businessApprovalStatus === "APPROVED"
                          ? "Approved"
                          : "Pending review"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-violet-950">
                    <BadgeCheck className="size-4" aria-hidden="true" />
                    Your next step
                  </p>
                  <p className="mt-2 text-sm leading-6 text-violet-950">
                    {completion.businessApprovalStatus !== "APPROVED"
                      ? "Your business details are safely submitted and awaiting review. You can sign in now to compare plans; checkout, the Starter trial, and workspace access remain locked until approval."
                      : "Your business is approved. Sign in to compare plans, choose the right fit for your team, and explore the 14-day Starter trial."}
                  </p>
                </div>

                <Link
                  href={`/login?email=${encodeURIComponent(
                    account.email.trim().toLowerCase(),
                  )}&returnTo=%2Fbusiness%2Fupgrade`}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-deep px-5 py-3 text-sm font-semibold text-white hover:bg-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                >
                  {completion.businessApprovalStatus === "APPROVED"
                    ? "Sign in and explore plans"
                    : "Sign in and view plans"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </section>
            )}
          </div>

          <footer className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
            <ShieldCheck
              className="size-4 shrink-0 text-violet-700"
              aria-hidden="true"
            />
            Your password is protected and email verification is separate from
            business approval.
          </footer>
        </section>
      </div>
    </main>
  );
}
