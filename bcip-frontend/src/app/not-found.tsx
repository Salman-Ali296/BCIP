import Link from "next/link";

export default function NotFound() {
    return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12">
            <section className="max-w-lg text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                    404
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-950">
                    This page could not be found
                </h1>
                <p className="mt-3 text-slate-600">
                    Check the address or return to the BCIP home page.
                </p>
                <Link
                    href="/"
                    className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                    Go to home
                </Link>
            </section>
        </main>
    );
}
