"use client";

import Image from "next/image";

export function SignInHeroVisual() {
    return (
        <div
            className="signin-hero-visual"
            role="img"
            aria-label="Illustrative BCIP complaint analytics dashboard showing a live complaint queue and sentiment trends"
        >
            <Image
                src="/images/triage-dashboard-preview.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 760px) 88vw, 520px"
                className="signin-hero-visual__image"
            />
        </div>
    );
}
