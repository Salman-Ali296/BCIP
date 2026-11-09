interface BcipLogoProps {
    light?: boolean;
    compact?: boolean;
}

export function BcipLogo({
    light = false,
    compact = false,
}: BcipLogoProps) {
    return (
        <span className="inline-flex items-center gap-3">
            <svg
                aria-hidden="true"
                viewBox="0 0 44 44"
                className="h-11 w-11 shrink-0"
                fill="none"
            >
                <rect x="1" y="1" width="42" height="42" rx="13" fill="#2454D6" />
                <path d="M12 15.5C12 13.567 13.567 12 15.5 12h13a5.5 5.5 0 0 1 0 11H18v6.5H12v-14Z" fill="white" fillOpacity=".96" />
                <path d="M18 18h7M18 21.5h4" stroke="#2454D6" strokeWidth="1.8" strokeLinecap="round" />
                <path d="m24.5 29 3.3-3.3 2.3 2.3 4.4-4.4" stroke="#B8EDCF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="34.5" cy="23.5" r="1.5" fill="#B8EDCF" />
            </svg>
            {!compact && (
                <span className="text-left">
                    <span className={`block text-[15px] font-black tracking-[-.03em] ${light ? "text-white" : "text-[var(--ink)]"}`}>
                        BCIP
                    </span>
                    <span className={`mt-0.5 block text-[8px] font-bold uppercase tracking-[.15em] ${light ? "text-white/55" : "text-[var(--muted)]"}`}>
                        Complaint intelligence
                    </span>
                </span>
            )}
        </span>
    );
}
