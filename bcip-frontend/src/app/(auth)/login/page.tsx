"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, AuthRequestError } from "@/providers/auth-provider";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthIllustration } from "@/components/auth/auth-illustration";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
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
                } else if (err.code === "RATE_LIMITED" || err.status === 429) {
                    setError("Too many wrong attempts from this network. Wait 15 minutes, then try again, or reset your password.");
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
        <main className="min-h-[100dvh] w-full bg-white font-sans text-slate-900">
            <div className="grid w-full overflow-hidden bg-white lg:min-h-[100dvh] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                {/* Left: Brand panel */}
                <section
                    aria-label="BCIP platform information"
                    className="relative overflow-hidden bg-ink px-6 py-7 text-white sm:px-10 sm:py-11 lg:flex lg:flex-col lg:px-14 lg:py-14"
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

                    <div className="relative z-10 mt-7 max-w-md sm:mt-10 lg:mt-16">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                            Your queue is
                            <br />
                            waiting for you.
                        </h1>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                            Sign in to see what came in since you left, what&apos;s
                            urgent, and what&apos;s waiting on your team.
                        </p>
                    </div>

                    <div className="relative z-10 mt-10 hidden w-full max-w-lg sm:block lg:mt-12">
                        <AuthIllustration />
                    </div>

                    <div className="relative z-10 mt-10 hidden items-center gap-2 text-xs text-slate-400 lg:mt-auto lg:flex">
                        <span className="size-2 rounded-full bg-violet-400" />
                        New complaints get a category and priority before anyone opens them.
                    </div>
                </section>

                {/* Right: Login form */}
                <section
                    aria-labelledby="login-heading"
                    className="flex min-w-0 items-center justify-center bg-white px-5 py-9 sm:px-10 sm:py-14 lg:px-14"
                >
                    <div className="w-full max-w-md">
                        <Link
                            href="/"
                            aria-label="Go to BCIP home page"
                            className="mb-10 inline-flex items-center gap-2.5 lg:hidden"
                        >
                            <BrandLogo height={30} />
                        </Link>

                        <p className="text-sm font-semibold text-violet-700">
                            Welcome back
                        </p>

                        <h2
                            id="login-heading"
                            className="mt-2 text-3xl font-bold tracking-tight text-slate-900"
                        >
                            Sign in to BCIP
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Use the email and password you registered your
                            business with.
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
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-deep px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/15 transition hover:bg-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? "Signing in..." : "Sign in"}

                                {!isLoading && <ArrowRight className="size-4" />}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-violet-700 hover:text-violet-900 hover:underline"
                            >
                                Create a business workspace
                            </Link>
                        </p>

                        <p className="mt-10 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">
                            Filed a complaint as a customer?{" "}
                            <Link
                                href="/support/track"
                                className="font-semibold text-violet-700 hover:underline"
                            >
                                Track it here
                            </Link>
                            . No account needed.
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