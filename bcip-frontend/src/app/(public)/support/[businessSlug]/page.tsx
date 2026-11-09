interface BusinessSupportPageProps {
    params: Promise<{
        businessSlug: string;
    }>;
}

export default async function BusinessSupportPage({
    params,
}: BusinessSupportPageProps) {
    const { businessSlug } = await params;

    return (
        <main className="min-h-screen">
            <h1>Business Support</h1>
            <p>Business: {businessSlug}</p>
        </main>
    );
}