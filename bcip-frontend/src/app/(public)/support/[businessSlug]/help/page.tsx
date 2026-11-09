interface BusinessHelpPageProps {
    params: Promise<{
        businessSlug: string;
    }>;
}

export default async function BusinessHelpPage({
    params,
}: BusinessHelpPageProps) {
    const { businessSlug } = await params;

    return (
        <main className="min-h-screen">
            <h1>Help Center</h1>
            <p>Business: {businessSlug}</p>
            <p>Find answers and support resources.</p>
        </main>
    );
}