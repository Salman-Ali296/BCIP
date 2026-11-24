import { BrandLogo, BrandMark } from "./brand-logo";

interface BcipLogoProps {
    light?: boolean;
    compact?: boolean;
}

/** Older name for the BCIP logo; renders the shared BrandLogo. */
export function BcipLogo({
    light = false,
    compact = false,
}: BcipLogoProps) {
    if (compact) {
        return (
            <span className="inline-flex shrink-0" role="img" aria-label="BCIP">
                <BrandMark size={40} bubble={light ? "#FFFFFF" : "#201239"} />
            </span>
        );
    }
    return <BrandLogo variant={light ? "light" : "dark"} height={40} />;
}
