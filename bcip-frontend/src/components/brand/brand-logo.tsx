// The BCIP logo: the speech-bubble mark from /public/images/BCIP-logo*.svg,
// with the name and tagline set as real text so they stay readable at any
// size (inside the SVG the tagline shrank to a few pixels).
// "dark" is for light backgrounds, "light" for dark panels.
const COLORS = {
    dark: { bubble: "#201239", name: "#201239", tagline: "#0E9F9A" },
    light: { bubble: "#FFFFFF", name: "#FFFFFF", tagline: "#9ADFDB" },
} as const;

interface BrandLogoProps {
    variant?: keyof typeof COLORS;
    /** Height of the mark in px; the text scales with it. */
    height?: number;
    className?: string;
    /** Kept for existing callers; the logo no longer loads an image. */
    priority?: boolean;
    /** Hide the tagline, e.g. in tight headers. */
    showTagline?: boolean;
}

/**
 * Just the speech-bubble mark from the logo, for small spaces such as a
 * collapsed sidebar. `bubble` is the bubble colour; the three bars keep
 * the logo's orange, teal and mint.
 */
export function BrandMark({
    size = 28,
    bubble = "#FFFFFF",
    className = "",
}: {
    size?: number;
    bubble?: string;
    className?: string;
}) {
    return (
        <svg
            viewBox="16 36 208 180"
            width={size}
            height={size}
            className={className}
            aria-hidden="true"
        >
            <path
                d="M60 40H180A40 40 0 0 1 220 80V140A40 40 0 0 1 180 180H100L58 212 66 180H60A40 40 0 0 1 20 140V80A40 40 0 0 1 60 40Z"
                fill={bubble}
            />
            <rect x="58" y="76" width="124" height="20" rx="10" fill="#E59A1E" />
            <rect x="58" y="106" width="94" height="20" rx="10" fill="#0E9F9A" />
            <rect x="58" y="136" width="62" height="20" rx="10" fill="#9ADFDB" />
        </svg>
    );
}

export function BrandLogo({
    variant = "dark",
    height = 36,
    className = "",
    showTagline = true,
}: BrandLogoProps) {
    const colors = COLORS[variant];
    const nameSize = Math.max(16, Math.round(height * 0.56));

    return (
        <span
            className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}
            role="img"
            aria-label="BCIP, Business Complaint Intelligence Platform"
        >
            <BrandMark size={height} bubble={colors.bubble} />
            <span className="flex flex-col leading-none" aria-hidden="true">
                <span
                    className="font-extrabold tracking-[-0.02em]"
                    style={{ color: colors.name, fontSize: nameSize }}
                >
                    BCIP
                </span>
                {showTagline && (
                    <span
                        className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: colors.tagline }}
                    >
                        Complaint Intelligence
                    </span>
                )}
            </span>
        </span>
    );
}
