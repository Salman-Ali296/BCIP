interface HelpdeskLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

/**
 * HelpdeskLogo
 * Modern vector emblem combining a professional customer support headset
 * with speech signal / chat wave in the BCIP blue & mint palette.
 */
export function HelpdeskLogo({
  size = "md",
  showText = true,
  className = "",
  theme = "auto",
}: HelpdeskLogoProps) {
  const iconDimensions = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  const svgPixelSize = {
    sm: 28,
    md: 32,
    lg: 40,
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* Helpdesk Headset & Support Emblem */}
      <span
        className={`relative grid ${iconDimensions} place-items-center rounded-xl bg-gradient-to-br from-[#2454d6] via-[#1e48ba] to-[#15348d] text-white shadow-md shadow-blue-600/25 shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          width={svgPixelSize}
          height={svgPixelSize}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="p-1.5"
        >
          {/* Headband Arch */}
          <path
            d="M7 16C7 11.0294 11.0294 7 16 7C20.9706 7 25 11.0294 25 16"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Left Earcup */}
          <rect
            x="5.5"
            y="14"
            width="4"
            height="7"
            rx="2"
            fill="white"
          />

          {/* Right Earcup */}
          <rect
            x="22.5"
            y="14"
            width="4"
            height="7"
            rx="2"
            fill="white"
          />

          {/* Microphone Arm */}
          <path
            d="M24 19.5V22C24 23.6569 22.6569 25 21 25H16.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Microphone Head with Mint Green AI Signal Dot */}
          <circle cx="15" cy="25" r="1.8" fill="#b8edcf" />

          {/* Sound / Support Sparkle Pulse */}
          <path
            d="M13.5 12.5C14.2 11.5 15.1 11 16 11C16.9 11 17.8 11.5 18.5 12.5"
            stroke="#b8edcf"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight ${
                size === "lg"
                  ? "text-lg sm:text-xl"
                  : size === "sm"
                  ? "text-xs sm:text-sm"
                  : "text-sm sm:text-base"
              } ${
                theme === "dark"
                  ? "text-white"
                  : theme === "light"
                  ? "text-slate-900"
                  : "text-inherit"
              }`}
            >
              BCIP
            </span>
            <span className="rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-bold text-blue-600 dark:bg-blue-400/20 dark:text-blue-300">
              HELPDESK
            </span>
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight mt-0.5 ${
              theme === "dark"
                ? "text-slate-400"
                : theme === "light"
                ? "text-slate-500"
                : "opacity-75"
            }`}
          >
            Complaint Intelligence Platform
          </span>
        </div>
      )}
    </div>
  );
}

export default HelpdeskLogo;
