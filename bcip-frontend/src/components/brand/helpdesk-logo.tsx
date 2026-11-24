import { BrandLogo, BrandMark } from "./brand-logo";

interface HelpdeskLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

const HEIGHTS = { sm: 26, md: 30, lg: 36 } as const;

/**
 * Older name for the BCIP logo, still imported by several shells and headers.
 * It now renders the same BrandLogo used everywhere else, so the site has one logo.
 * `theme` describes the background: "dark" means a dark background (white logo).
 */
export function HelpdeskLogo({
  size = "md",
  showText = true,
  className = "",
  theme = "auto",
}: HelpdeskLogoProps) {
  const variant = theme === "dark" ? "light" : "dark";
  const height = HEIGHTS[size];

  if (!showText) {
    return (
      <span className={`inline-flex shrink-0 ${className}`} role="img" aria-label="BCIP">
        <BrandMark size={height} bubble={variant === "light" ? "#FFFFFF" : "#201239"} />
      </span>
    );
  }

  return <BrandLogo variant={variant} height={height} className={className} showTagline={size !== "sm"} />;
}

export default HelpdeskLogo;
