export const BUSINESS_TRIAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export interface BusinessTrialPeriod {
    acceptedAt: Date;
    expiresAt: Date;
    plan?: string;
}

export function createBusinessTrialPeriod(
    acceptedAt: Date,
    plan = 'starter',
): BusinessTrialPeriod {
    return {
        acceptedAt,
        expiresAt: new Date(acceptedAt.getTime() + BUSINESS_TRIAL_DURATION_MS),
        plan,
    };
}

export function getBusinessTrialState(
    period: BusinessTrialPeriod,
    now: Date = new Date(),
) {
    const active = period.acceptedAt <= now && now < period.expiresAt;

    return {
        acceptedAt: period.acceptedAt,
        expiresAt: period.expiresAt,
        plan: period.plan ?? 'starter',
        active,
        daysRemaining: active
            ? Math.ceil((period.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
            : 0,
    };
}
