import styles from "./auth-illustration.module.css";

// Brand colours taken from /public/images/BCIP-logo.svg.
const ORANGE = "#E59A1E";
const TEAL = "#0E9F9A";
const MINT = "#9ADFDB";
const INK = "#201239";
const VIOLET = "#6b42d8";

const CARDS = [
    { className: `${styles.card} ${styles.card1}`, title: 58, tag: "Critical", tagFill: "#c34255", tagWidth: 42 },
    { className: `${styles.card} ${styles.card2}`, title: 72, tag: "High", tagFill: ORANGE, tagWidth: 30 },
    { className: `${styles.card} ${styles.card3}`, title: 50, tag: "Medium", tagFill: TEAL, tagWidth: 40 },
];

const QUEUE_ROWS = [
    { className: styles.queueRow, y: 170, dot: "#c34255", width: 92 },
    { className: `${styles.queueRow} ${styles.queueRow2}`, y: 197, dot: ORANGE, width: 76 },
    { className: `${styles.queueRow} ${styles.queueRow3}`, y: 224, dot: TEAL, width: 104 },
];

/**
 * Side-panel scene for the sign-in and registration pages: a support agent
 * at a laptop while new complaints arrive, get a priority, and join the queue.
 * Decorative only; the caption next to it carries the meaning.
 */
export function AuthIllustration({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 440 300"
            className={`${styles.scene} ${className}`}
            role="img"
            aria-label="A support agent at a laptop while new complaints arrive, get a priority tag and move into the queue"
        >
            {/* Soft backdrop */}
            <circle cx="140" cy="176" r="118" fill="white" fillOpacity="0.04" />
            <circle cx="140" cy="176" r="82" fill="white" fillOpacity="0.035" />

            {/* A customer's message floating in, drawn like the logo bubble */}
            <g className={styles.float}>
                <path
                    d="M38 52h52a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12H62l-12 9 2-9h-14a12 12 0 0 1-12-12V64a12 12 0 0 1 12-12Z"
                    fill="white"
                    fillOpacity="0.95"
                />
                <rect x="38" y="63" width="44" height="6" rx="3" fill={ORANGE} />
                <rect x="38" y="72" width="33" height="6" rx="3" fill={TEAL} />
                <rect x="38" y="81" width="22" height="6" rx="3" fill={MINT} />
            </g>

            {/* Desk */}
            <rect x="40" y="250" width="216" height="9" rx="4.5" fill="#3b2766" />
            <rect x="58" y="259" width="7" height="34" rx="3" fill="#30205a" />
            <rect x="230" y="259" width="7" height="34" rx="3" fill="#30205a" />

            {/* Chair */}
            <rect x="90" y="148" width="100" height="104" rx="22" fill="#30205a" />

            {/* Body */}
            <path d="M98 250v-44c0-20 16-34 42-34s42 14 42 34v44Z" fill={VIOLET} />
            <path d="M126 172l14 18 14-18" fill="none" stroke="#f8f5ff" strokeWidth="3" strokeLinejoin="round" />
            <rect x="133" y="158" width="14" height="16" rx="5" fill="#d99a72" />

            {/* Head */}
            <g className={styles.head}>
                <circle cx="140" cy="134" r="27" fill="#f2c29b" />
                <path d="M113 132c0-19 12-31 28-31 15 0 26 10 26 27-7-6-16-9-27-9-10 0-19 4-27 13Z" fill="#2a1a12" />
                <g className={styles.eyes}>
                    <circle cx="130" cy="138" r="2.6" fill="#2a1a12" />
                    <circle cx="150" cy="138" r="2.6" fill="#2a1a12" />
                </g>
                <path d="M133 149c4 3.5 10 3.5 14 0" fill="none" stroke="#a5583c" strokeWidth="2.2" strokeLinecap="round" />
                {/* Headset */}
                <path d="M111 136c0-20 13-34 29-34s29 14 29 34" fill="none" stroke={ORANGE} strokeWidth="4" strokeLinecap="round" />
                <rect x="106" y="130" width="9" height="16" rx="4.5" fill={ORANGE} />
                <rect x="165" y="130" width="9" height="16" rx="4.5" fill={ORANGE} />
                <path d="M110 145c0 9 8 14 18 14" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="129" cy="159" r="3" fill={MINT} />
            </g>

            {/* Arms reaching the keyboard */}
            <g className={styles.hands}>
                <path d="M106 200c-6 18-2 32 12 40" fill="none" stroke={VIOLET} strokeWidth="15" strokeLinecap="round" />
                <path d="M174 200c6 18 2 32-12 40" fill="none" stroke={VIOLET} strokeWidth="15" strokeLinecap="round" />
                <circle cx="121" cy="242" r="7" fill="#f2c29b" />
                <circle cx="159" cy="242" r="7" fill="#f2c29b" />
            </g>

            {/* Laptop lid, seen from behind, with the logo mark */}
            <path d="M100 208h80l6 42H94Z" fill="#e7e1f3" />
            <path d="M94 250h92v4H94Z" fill="#cfc4e6" />
            <g transform="translate(126 219) scale(0.12)">
                <path d="M60 40H180A40 40 0 0 1 220 80V140A40 40 0 0 1 180 180H100L58 212 66 180H60A40 40 0 0 1 20 140V80A40 40 0 0 1 60 40Z" fill={INK} />
                <rect x="58" y="76" width="124" height="20" rx="10" fill={ORANGE} />
                <rect x="58" y="106" width="94" height="20" rx="10" fill={TEAL} />
                <rect x="58" y="136" width="62" height="20" rx="10" fill={MINT} />
            </g>

            {/* Queue panel */}
            <g className={styles.float} style={{ animationDelay: "-3s" }}>
                <rect x="252" y="44" width="172" height="216" rx="16" fill="white" />
                <text x="268" y="70" fontSize="11" fontWeight="700" fill={INK}>
                    New complaints
                </text>
                <circle cx="404" cy="66" r="4" fill={ORANGE} />

                {/* The arriving card slot; three cards take turns */}
                {CARDS.map((card) => (
                    <g key={card.tag} className={card.className}>
                        <rect x="264" y="80" width="148" height="48" rx="9" fill="#f8f5ff" stroke="#e3d8fb" />
                        <rect x="276" y="92" width={card.title} height="6" rx="3" fill={INK} fillOpacity="0.8" />
                        <rect x="276" y="104" width="86" height="5" rx="2.5" fill="#a39db0" />
                        <rect x="276" y="114" width="60" height="5" rx="2.5" fill="#cfc1ee" />
                        <g className={styles.tag}>
                            <rect x={404 - card.tagWidth} y="89" width={card.tagWidth} height="14" rx="7" fill={card.tagFill} />
                            <text
                                x={404 - card.tagWidth / 2}
                                y="99"
                                fontSize="8"
                                fontWeight="700"
                                fill="white"
                                textAnchor="middle"
                            >
                                {card.tag}
                            </text>
                        </g>
                    </g>
                ))}

                <line x1="264" y1="146" x2="412" y2="146" stroke="#ebe6f2" />
                <text x="268" y="161" fontSize="9" fontWeight="600" fill="#706b80">
                    Your queue
                </text>

                {QUEUE_ROWS.map((row) => (
                    <g key={row.y} className={row.className}>
                        <rect x="264" y={row.y} width="148" height="20" rx="6" fill="#f2edff" />
                        <circle cx="275" cy={row.y + 10} r="3.5" fill={row.dot} />
                        <rect x="284" y={row.y + 7.5} width={row.width} height="5" rx="2.5" fill={INK} fillOpacity="0.55" />
                    </g>
                ))}

                {/* Resolved tick */}
                <g className={styles.check}>
                    <circle cx="404" cy="180" r="11" fill={TEAL} />
                    <path d="M398.5 180.5l3.8 3.8 7-7.5" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </g>
            </g>
        </svg>
    );
}
