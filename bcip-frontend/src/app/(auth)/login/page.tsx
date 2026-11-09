"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, AuthRequestError } from "@/providers/auth-provider";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from "lucide-react";

function LoginForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") ?? "");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter your email address and password.");
            return;
        }

        setIsLoading(true);

        try {
            const returnTo = searchParams.get("returnTo");
            await login(email.trim().toLowerCase(), password, {
                rememberMe,
                returnTo,
            });
        } catch (err) {
            if (err instanceof AuthRequestError) {
                if (err.code === "EMAIL_NOT_VERIFIED") {
                    setError("Verify your email address before signing in. Enter your 6-digit code on the email verification page.");
                } else if (err.code === "BUSINESS_VERIFICATION_PENDING") {
                    setError("Your business account is awaiting verification. Contact BCIP support if you have already verified your work email.");
                } else if (err.code === "ACCOUNT_SUSPENDED") {
                    setError("This account is inactive. Contact your organization administrator or BCIP support.");
                } else if (err.code === "INVALID_CREDENTIALS") {
                    setError("The email address or password is incorrect.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("We couldn’t connect to the sign-in service. Check your connection and try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-4 font-sans text-slate-900 sm:px-6 sm:py-6 lg:flex lg:items-center lg:justify-center lg:p-10">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] lg:min-h-[700px] lg:grid-cols-[1.05fr_0.95fr]">
                {/* Left: Brand panel */}
                <section
                    aria-label="BCIP platform information"
                    className="relative overflow-hidden bg-[#21113b] px-7 py-9 text-white sm:px-10 sm:py-11 lg:flex lg:flex-col lg:px-14 lg:py-14"
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
                            <ShieldCheck className="size-3.5" />
                            Secure enterprise workspace
                        </div>

                        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                            Every concern,
                            <br />
                            clearly understood.
                        </h1>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300 sm:text-base">
                            Access your workspace to manage complaints, track
                            resolutions, and support better customer outcomes.
                        </p>

                        <div className="mt-10 space-y-4">
                            {[
                                "Centralized complaint management",
                                "AI-assisted operational intelligence",
                                "Secure role-based workspace access",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 text-sm text-slate-200"
                                >
                                    <span className="size-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.75)]" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 mt-14 flex items-center gap-2 text-xs text-slate-400 lg:mt-auto">
                        <span className="size-2 rounded-full bg-violet-400" />
                        Clarity for every customer conversation
                    </div>
                </section>

                {/* Right: Login form */}
                <section
                    aria-labelledby="login-heading"
                    className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 sm:py-14 lg:px-14"
                >
                    <div className="w-full max-w-md">
                        <Link
                            href="/"
                            aria-label="Go to BCIP home page"
                            className="mb-10 inline-flex items-center gap-2.5 lg:hidden"
                        >
                            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-violet-500 text-sm font-extrabold text-white">
                                B
                            </span>
                            <span className="font-bold tracking-tight">BCIP</span>
                        </Link>

                        <p className="text-sm font-semibold text-violet-700">
                            Welcome back
                        </p>

                        <h2
                            id="login-heading"
                            className="mt-2 text-3xl font-bold tracking-tight text-slate-900"
                        >
                            Sign in to your account
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Enter your credentials to continue to the BCIP
                            workspace.
                        </p>

                        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Work email address
                                </label>

                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        aria-invalid={Boolean(error)}
                                        autoComplete="email"
                                        placeholder="name@company.com"
                                        required
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-semibold text-violet-700 hover:text-violet-900 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        aria-invalid={Boolean(error)}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        required
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((current) => !current)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) =>
                                        setRememberMe(event.target.checked)
                                    }
                                    className="size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                />
                                Keep me signed in
                            </label>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#28123e] px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/15 transition hover:bg-[#3b1a5d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? "Signing in..." : "Sign in securely"}

                                {!isLoading && <ArrowRight className="size-4" />}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-violet-700 hover:text-violet-900 hover:underline"
                            >
                                Create an account
                            </Link>
                        </p>

                        <p className="mt-10 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">
                            By signing in, you agree to your organization&apos;s
                            platform-access and security policies.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <main className="grid min-h-screen place-items-center bg-slate-100 px-4 text-sm text-slate-600">
                    <p role="status">Loading sign-in…</p>
                </main>
            }
        >
            <LoginForm />
        </Suspense>
    );
}