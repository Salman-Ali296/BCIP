import { Prisma } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError, ErrorCode, Errors } from '../../utils/error';
import {
    normalizeBusinessPlan,
    type BillingInterval,
    type BusinessPlanId,
    type PurchasableBusinessPlanId,
} from './business-plans';
import { requireBillingProfile, type BillingProfile } from './billing-profile.service';

type StripeObject = Record<string, unknown>;
export interface SubscriptionSnapshot {
    id: string;
    status: string;
    customer: string;
    current_period_end?: number;
    cancel_at_period_end: boolean;
    metadata?: Record<string, string>;
}

export interface CheckoutInput {
    plan: PurchasableBusinessPlanId;
    interval: BillingInterval;
}

export interface DemoCheckoutInput {
    plan: string;
    interval: BillingInterval;
}

export function isDemoCheckoutEnabled(): boolean {
    return env.NODE_ENV === 'development';
}

export async function createDemoCheckout(
    tenantId: string,
    input: DemoCheckoutInput,
) {
    if (!isDemoCheckoutEnabled()) {
        throw billingError('Demo checkout is only available in development.', 403);
    }
    const billingProfile = await requireBillingProfile(tenantId);
    const periodEnd = new Date();
    if (input.interval === 'month') {
        periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
    } else {
        periodEnd.setUTCFullYear(periodEnd.getUTCFullYear() + 1);
    }

    await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.findUnique({
            where: { id: tenantId },
            select: { subscriptionPlan: true },
        });
        if (!tenant) throw billingError('Business account not found.', 404);
        const updated = await tx.tenant.updateMany({
            where: {
                id: tenantId,
                isActive: true,
                businessVerified: true,
                stripeSubscriptionId: null,
                OR: [
                    { subscriptionStatus: null },
                    { subscriptionStatus: 'demo_active' },
                    { subscriptionStatus: { notIn: ['active', 'trialing'] } },
                ],
            },
            data: {
                subscriptionStatus: 'demo_active',
                subscriptionPlan: input.plan,
                subscriptionCurrentPeriodEnd: periodEnd,
                subscriptionCancelAtPeriodEnd: false,
            },
        });

        if (updated.count !== 1) {
            throw billingError(
                'Demo checkout is unavailable for this business. Confirm the workspace is verified and has no active Stripe subscription.',
                403,
            );
        }

        const plan = await tx.businessPlan.findUnique({
            where: { slug: input.plan },
            select: { id: true, isActive: true, isPublic: true },
        });
        if (!plan?.isActive || !plan.isPublic) {
            throw billingError('The selected plan is not available.', 404);
        }

        const current = await tx.businessSubscription.findFirst({
            where: { tenantId, status: 'demo_active' },
            orderBy: { createdAt: 'desc' },
        });
        if (current) {
            await tx.businessSubscription.update({
                where: { id: current.id },
                data: {
                    planId: plan.id,
                    billingCycle: input.interval,
                    paymentProvider: 'demo',
                    startDate: new Date(),
                    endDate: periodEnd,
                    nextBillingDate: null,
                    cancelAtPeriodEnd: false,
                    canceledAt: null,
                },
            });
        } else {
            await tx.businessSubscription.create({
                data: {
                    tenantId,
                    planId: plan.id,
                    status: 'demo_active',
                    billingCycle: input.interval,
                    paymentProvider: 'demo',
                    startDate: new Date(),
                    endDate: periodEnd,
                },
            });
        }

        await tx.subscriptionHistory.create({
            data: {
                tenantId,
                previousPlan: tenant.subscriptionPlan,
                newPlan: input.plan,
                action: 'DEMO_ACTIVATED',
                effectiveDate: new Date(),
                details: {
                    billingCycle: input.interval,
                    paymentProcessed: false,
                    billedTo: billingProfile.companyName,
                    billingCountry: billingProfile.country,
                },
            },
        });
    });

    return {
        plan: input.plan,
        interval: input.interval,
        periodEndsAt: periodEnd.toISOString(),
        mode: 'demo' as const,
        paymentProcessed: false as const,
    };
}

export async function changeSubscriptionPlan(
    tenantId: string,
    input: CheckoutInput,
) {
    const subscription = await getSubscription(tenantId);
    if (subscription.status === 'demo_active') {
        if (!isDemoCheckoutEnabled()) {
            throw billingError('Demo plan changes are only available in development.', 403);
        }
        const periodEnd = new Date();
        if (input.interval === 'month') {
            periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
        } else {
            periodEnd.setUTCFullYear(periodEnd.getUTCFullYear() + 1);
        }
        await prisma.$transaction(async (tx) => {
            const plan = await tx.businessPlan.findUnique({
                where: { slug: input.plan },
                select: { id: true, isActive: true, isPublic: true },
            });
            if (!plan?.isActive || !plan.isPublic) {
                throw billingError('The selected plan is not available.', 404);
            }
            await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    subscriptionPlan: input.plan,
                    subscriptionCurrentPeriodEnd: periodEnd,
                    subscriptionCancelAtPeriodEnd: false,
                },
            });
            await tx.businessSubscription.updateMany({
                where: { tenantId, status: 'demo_active' },
                data: {
                    planId: plan.id,
                    billingCycle: input.interval,
                    endDate: periodEnd,
                    cancelAtPeriodEnd: false,
                    canceledAt: null,
                },
            });
            await tx.subscriptionHistory.create({
                data: {
                    tenantId,
                    previousPlan: subscription.plan,
                    newPlan: input.plan,
                    action: 'DEMO_PLAN_CHANGED',
                    effectiveDate: new Date(),
                    details: { billingCycle: input.interval, paymentProcessed: false },
                },
            });
        });
        return { mode: 'demo' as const, paymentProcessed: false as const, ...(await getSubscription(tenantId)) };
    }

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        throw billingError('An active subscription is required to change plans.', 409);
    }
    if (!subscription.subscriptionId) {
        throw billingError('No billing subscription is registered for this business.', 404);
    }
    const priceId = env.STRIPE_PRICES[input.plan][input.interval];
    if (!priceId || !(await isBusinessPlanPriceConfigured(input.plan, input.interval))) {
        throw billingError('The selected billing period is not configured for checkout.', 503);
    }

    const providerSubscription = await stripeRequest<StripeObject>(
        `subscriptions/${encodeURIComponent(subscription.subscriptionId)}`,
        {},
        'GET',
    );
    const items = providerSubscription.items;
    const itemData = items && typeof items === 'object'
        ? (items as { data?: unknown }).data
        : undefined;
    const firstItem = Array.isArray(itemData) ? itemData[0] : undefined;
    const itemId = firstItem && typeof firstItem === 'object'
        ? (firstItem as { id?: unknown }).id
        : undefined;
    if (typeof itemId !== 'string') {
        throw billingError('The billing provider returned an incomplete subscription.', 502);
    }
    const currentPlan = normalizeBusinessPlan(subscription.plan);
    if (currentPlan === input.plan && subscription.billingCycle === input.interval) {
        return { mode: 'stripe' as const, ...(await getSubscription(tenantId)) };
    }

    await stripeRequest<StripeObject>(
        `subscriptions/${encodeURIComponent(subscription.subscriptionId)}`,
        {
            'items[0][id]': itemId,
            'items[0][price]': priceId,
            proration_behavior: 'create_prorations',
            'metadata[plan]': input.plan,
            'metadata[interval]': input.interval,
        },
        'POST',
        `change-plan-${tenantId}-${input.plan}-${input.interval}-${Date.now()}`,
    );
    return {
        mode: 'stripe' as const,
        activationPending: true as const,
        ...(await getSubscription(tenantId)),
    };
}

interface StripePrice extends StripeObject {
    id?: unknown;
    active?: unknown;
    currency?: unknown;
    unit_amount?: unknown;
    recurring?: {
        interval?: unknown;
        interval_count?: unknown;
    } | null;
}

interface BillingTenant {
    id: string;
    name: string;
    email: string;
    stripeCustomerId: string | null;
}

function billingError(message: string, statusCode: number): AppError {
    return new AppError(ErrorCode.EXTERNAL_SERVICE_ERROR, message, statusCode);
}

async function assertBusinessApprovedForBilling(tenantId: string): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { isActive: true, businessVerified: true },
    });
    if (!tenant) throw billingError('Business account not found.', 404);
    if (!tenant.isActive || !tenant.businessVerified) {
        throw Errors.businessVerificationPending();
    }
}

function requireStripeKey(): string {
    if (!env.STRIPE_SECRET_KEY) {
        throw billingError('Billing is not configured on this server.', 503);
    }
    return env.STRIPE_SECRET_KEY;
}

function frontendUrl(path: string): string {
    let base: URL;
    try {
        base = new URL(env.FRONTEND_URL);
    } catch {
        throw billingError('The frontend billing URL is not configured correctly.', 503);
    }

    if (!['http:', 'https:'].includes(base.protocol)) {
        throw billingError('The frontend billing URL must use HTTP or HTTPS.', 503);
    }

    return new URL(path, base).toString();
}

async function stripeRequest<T extends StripeObject>(
    path: string,
    fields: Record<string, string> = {},
    method: 'GET' | 'POST' = 'POST',
    idempotencyKey?: string,
): Promise<T> {
    const secret = requireStripeKey();
    const url = new URL(`https://api.stripe.com/v1/${path}`);
    const headers = new Headers({ Authorization: `Bearer ${secret}` });
    if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);
    const init: RequestInit = { method, headers, signal: AbortSignal.timeout(15_000) };

    if (method === 'GET') {
        for (const [key, value] of Object.entries(fields)) url.searchParams.set(key, value);
    } else {
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
        init.body = new URLSearchParams(fields);
    }

    let response: Response;
    try {
        response = await fetch(url, init);
    } catch {
        throw billingError('The billing provider could not be reached.', 502);
    }

    let result: unknown;
    try {
        result = await response.json();
    } catch {
        throw billingError('The billing provider returned an invalid response.', 502);
    }

    if (!response.ok || !result || typeof result !== 'object') {
        throw billingError('The billing provider could not complete the request.', 502);
    }

    return result as T;
}

export async function isBusinessPlanPriceConfigured(
    plan: BusinessPlanId,
    interval: BillingInterval,
): Promise<boolean> {
    const priceId = env.STRIPE_PRICES[plan][interval];
    if (!priceId) return false;

    const catalogPlan = await prisma.businessPlan.findUnique({
        where: { slug: plan },
        select: {
            currency: true,
            monthlyPriceCents: true,
            annualPriceCents: true,
            isActive: true,
            isPublic: true,
        },
    });
    const expectedAmount = interval === 'month'
        ? catalogPlan?.monthlyPriceCents
        : catalogPlan?.annualPriceCents;
    if (
        !catalogPlan ||
        !catalogPlan.isActive ||
        !catalogPlan.isPublic ||
        expectedAmount === null ||
        expectedAmount === undefined
    ) {
        return false;
    }

    const price = await stripeRequest<StripePrice>(
        `prices/${encodeURIComponent(priceId)}`,
        {},
        'GET',
    );

    return (
        price.id === priceId &&
        price.active === true &&
        typeof price.currency === 'string' &&
        price.currency.toUpperCase() === catalogPlan.currency.toUpperCase() &&
        price.unit_amount === expectedAmount &&
        price.recurring?.interval === interval &&
        price.recurring.interval_count === 1
    );
}

async function tenantDetails(tenantId: string) {
    const [tenant] = await prisma.$queryRaw<BillingTenant[]>`
        SELECT "id", "name", "email", "stripeCustomerId"
        FROM "tenants"
        WHERE "id" = ${tenantId}
        LIMIT 1
    `;
    if (!tenant) throw billingError('Business account not found.', 404);
    return tenant;
}

async function getOrCreateCustomer(tenantId: string): Promise<string> {
    const tenant = await tenantDetails(tenantId);
    if (tenant.stripeCustomerId) return tenant.stripeCustomerId;

    const customer = await stripeRequest<{ id?: unknown }>('customers', {
        email: tenant.email,
        name: tenant.name,
        'metadata[tenantId]': tenant.id,
    }, 'POST', `tenant-customer-${tenant.id}`);
    if (typeof customer.id !== 'string') {
        throw billingError('The billing provider did not return a customer ID.', 502);
    }

    await prisma.$executeRaw`
        UPDATE "tenants"
        SET "stripeCustomerId" = ${customer.id}
        WHERE "id" = ${tenant.id}
    `;
    return customer.id;
}

/** Keeps the provider's customer record aligned with the invoice details the business entered. */
async function syncCustomerBillingDetails(customerId: string, profile: BillingProfile) {
    const fields: Record<string, string> = {
        name: profile.companyName,
        email: profile.billingEmail,
        'address[line1]': profile.addressLine1,
        'address[city]': profile.city,
        'address[postal_code]': profile.postalCode,
        'address[country]': profile.country,
        'metadata[billingContact]': profile.contactName,
    };
    if (profile.addressLine2) fields['address[line2]'] = profile.addressLine2;
    if (profile.state) fields['address[state]'] = profile.state;
    if (profile.phone) fields.phone = profile.phone;
    if (profile.taxId) fields['metadata[taxId]'] = profile.taxId;
    await stripeRequest(`customers/${encodeURIComponent(customerId)}`, fields);
}

export async function createCheckoutSession(tenantId: string, input: CheckoutInput) {
    await assertBusinessApprovedForBilling(tenantId);
    const priceId = env.STRIPE_PRICES[input.plan][input.interval];
    if (!priceId) {
        throw billingError('The selected plan is not configured for checkout.', 503);
    }

    const subscription = await getSubscription(tenantId);
    if (subscription.status === 'active' || subscription.status === 'trialing') {
        throw billingError(
            'This business already has an active subscription. Use the billing portal to manage it.',
            409,
        );
    }

    const billingProfile = await requireBillingProfile(tenantId);

    if (!(await isBusinessPlanPriceConfigured(input.plan, input.interval))) {
        throw billingError(
            'The configured billing price does not match the published plan price. Checkout is unavailable until it is corrected.',
            503,
        );
    }

    const customerId = await getOrCreateCustomer(tenantId);
    await syncCustomerBillingDetails(customerId, billingProfile);
    const session = await stripeRequest<{ id?: unknown; url?: unknown }>('checkout/sessions', {
        mode: 'subscription',
        customer: customerId,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        success_url: frontendUrl('/business/upgrade?checkout=success'),
        cancel_url: frontendUrl('/business/upgrade?checkout=cancelled'),
        'metadata[tenantId]': tenantId,
        'metadata[plan]': input.plan,
        'metadata[interval]': input.interval,
        'subscription_data[metadata][tenantId]': tenantId,
        'subscription_data[metadata][plan]': input.plan,
        'subscription_data[metadata][interval]': input.interval,
    });

    if (typeof session.id !== 'string' || typeof session.url !== 'string') {
        throw billingError('The billing provider did not return a checkout URL.', 502);
    }
    return { id: session.id, url: session.url };
}

export async function createPortalSession(tenantId: string) {
    await assertBusinessApprovedForBilling(tenantId);
    const tenant = await tenantDetails(tenantId);
    if (!tenant.stripeCustomerId) {
        throw billingError('No billing customer is registered for this business.', 404);
    }

    const session = await stripeRequest<{ url?: unknown }>('billing_portal/sessions', {
        customer: tenant.stripeCustomerId,
        return_url: frontendUrl('/business/upgrade'),
    });
    if (typeof session.url !== 'string') {
        throw billingError('The billing provider did not return a portal URL.', 502);
    }
    return { url: session.url };
}

export async function getSubscription(tenantId: string) {
    const [tenant] = await prisma.$queryRaw<Array<{
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        subscriptionStatus: string | null;
        subscriptionPlan: string | null;
        subscriptionCurrentPeriodEnd: Date | null;
        subscriptionCancelAtPeriodEnd: boolean;
    }>>`
        SELECT "stripeCustomerId", "stripeSubscriptionId", "subscriptionStatus",
               "subscriptionPlan", "subscriptionCurrentPeriodEnd",
               "subscriptionCancelAtPeriodEnd"
        FROM "tenants"
        WHERE "id" = ${tenantId}
        LIMIT 1
    `;
    if (!tenant) throw billingError('Business account not found.', 404);
    const record = await prisma.businessSubscription.findFirst({
        where: { tenantId },
        orderBy: { startDate: 'desc' },
        include: { plan: { select: { name: true, features: true } } },
    });
    const expiresAt = tenant.subscriptionCurrentPeriodEnd;
    const rawStatus = tenant.subscriptionStatus?.toLowerCase();
    const status = expiresAt &&
        expiresAt <= new Date() &&
        ['active', 'trialing', 'demo_active'].includes(rawStatus ?? '')
        ? 'expired'
        : tenant.subscriptionStatus;
    return {
        customerId: tenant.stripeCustomerId,
        subscriptionId: tenant.stripeSubscriptionId,
        status,
        plan: tenant.subscriptionPlan,
        currentPeriodEnd: tenant.subscriptionCurrentPeriodEnd,
        cancelAtPeriodEnd: tenant.subscriptionCancelAtPeriodEnd,
        billingCycle: record?.billingCycle ?? null,
        startDate: record?.startDate ?? null,
        planName: record?.plan.name ?? null,
        paymentProvider: record?.paymentProvider ?? null,
        features: businessPlanFeatures(record?.plan.features ?? null),
    };
}

function businessPlanFeatures(value: Prisma.JsonValue | null): Record<string, boolean> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, boolean] =>
            typeof entry[1] === 'boolean',
        ),
    );
}

export async function getBillingHistory(tenantId: string) {
    const subscription = await getSubscription(tenantId);
    if (!subscription.customerId) return [];
    const response = await stripeRequest<StripeObject>(
        'invoices',
        { customer: subscription.customerId, limit: '100' },
        'GET',
    );
    const entries = Array.isArray(response.data) ? response.data : [];
    return entries.flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return [];
        const invoice = entry as StripeObject;
        if (typeof invoice.id !== 'string') return [];
        return [{
            id: invoice.id,
            status: typeof invoice.status === 'string' ? invoice.status : 'unknown',
            amountPaid: typeof invoice.amount_paid === 'number' ? invoice.amount_paid : null,
            currency: typeof invoice.currency === 'string' ? invoice.currency.toUpperCase() : null,
            createdAt: typeof invoice.created === 'number'
                ? new Date(invoice.created * 1000).toISOString()
                : null,
            hostedInvoiceUrl: typeof invoice.hosted_invoice_url === 'string'
                ? invoice.hosted_invoice_url
                : null,
        }];
    });
}

async function updateSubscription(tenantId: string, cancelAtPeriodEnd: boolean) {
    await tenantDetails(tenantId);
    const current = await getSubscription(tenantId);
    if (current.status === 'demo_active') {
        if (!isDemoCheckoutEnabled()) {
            throw billingError('Demo plan management is only available in development.', 403);
        }
        await prisma.$transaction(async (tx) => {
            await tx.tenant.update({
                where: { id: tenantId },
                data: { subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd },
            });
            await tx.businessSubscription.updateMany({
                where: { tenantId, status: 'demo_active' },
                data: { cancelAtPeriodEnd, canceledAt: null },
            });
            await tx.subscriptionHistory.create({
                data: {
                    tenantId,
                    previousPlan: current.plan,
                    newPlan: current.plan,
                    action: cancelAtPeriodEnd ? 'DEMO_CANCEL_SCHEDULED' : 'DEMO_CANCEL_REVOKED',
                    effectiveDate: new Date(),
                    details: { effectiveAt: current.currentPeriodEnd?.toISOString() ?? null },
                },
            });
        });
        return getSubscription(tenantId);
    }

    const [subscription] = await prisma.$queryRaw<Array<{ stripeSubscriptionId: string | null }>>`
        SELECT "stripeSubscriptionId"
        FROM "tenants"
        WHERE "id" = ${tenantId}
        LIMIT 1
    `;
    if (!subscription?.stripeSubscriptionId) {
        throw billingError('No subscription is registered for this business.', 404);
    }

    const updated = parseSubscription(await stripeRequest<StripeObject>(
        `subscriptions/${encodeURIComponent(subscription.stripeSubscriptionId)}`,
        { cancel_at_period_end: String(cancelAtPeriodEnd) },
    ));
    await saveSubscription(updated, tenantId);
    return getSubscription(tenantId);
}

export function cancelSubscription(tenantId: string) {
    return updateSubscription(tenantId, true);
}

export function resumeSubscription(tenantId: string) {
    return updateSubscription(tenantId, false);
}

async function saveSubscription(subscription: SubscriptionSnapshot, tenantId?: string) {
    const resolvedTenantId = tenantId ?? subscription.metadata?.tenantId;
    if (!resolvedTenantId || typeof subscription.id !== 'string' ||
        typeof subscription.customer !== 'string' || typeof subscription.status !== 'string' ||
        typeof subscription.cancel_at_period_end !== 'boolean') {
        throw billingError('The subscription event is missing required account details.', 400);
    }

    const periodEnd = typeof subscription.current_period_end === 'number'
        ? new Date(subscription.current_period_end * 1000)
        : null;
    const requestedPlan = typeof subscription.metadata?.plan === 'string'
        ? normalizeBusinessPlan(subscription.metadata.plan)
        : undefined;
    if (subscription.metadata?.plan && !requestedPlan) {
        throw billingError('The subscription contains an unsupported business plan.', 400);
    }
    const status = normalizeStripeSubscriptionStatus(subscription.status);
    const interval = subscription.metadata?.interval === 'month' ||
        subscription.metadata?.interval === 'year'
        ? subscription.metadata.interval
        : null;

    await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.findUnique({
            where: { id: resolvedTenantId },
            select: { subscriptionPlan: true },
        });
        if (!tenant) throw billingError('Business account not found.', 404);
        const planSlug = requestedPlan ?? normalizeBusinessPlan(tenant.subscriptionPlan);
        if (!planSlug) throw billingError('The subscription does not identify a valid plan.', 400);
        const plan = await tx.businessPlan.findUnique({
            where: { slug: planSlug },
            select: { id: true },
        });
        if (!plan) throw billingError('The subscription plan is not available.', 404);

        const existing = await tx.businessSubscription.findUnique({
            where: { providerReference: subscription.id },
            select: { planId: true, status: true },
        });
        const canceledAt = status === 'canceled' || status === 'expired' ? new Date() : null;
        const record = await tx.businessSubscription.upsert({
            where: { providerReference: subscription.id },
            create: {
                tenantId: resolvedTenantId,
                planId: plan.id,
                status,
                billingCycle: interval,
                paymentProvider: 'stripe',
                providerReference: subscription.id,
                startDate: new Date(),
                endDate: periodEnd,
                nextBillingDate: status === 'active' || status === 'trialing' ? periodEnd : null,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                canceledAt,
            },
            update: {
                planId: plan.id,
                status,
                billingCycle: interval ?? undefined,
                endDate: periodEnd,
                nextBillingDate: status === 'active' || status === 'trialing' ? periodEnd : null,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                canceledAt,
            },
            select: { id: true },
        });
        const updated = await tx.tenant.updateMany({
            where: { id: resolvedTenantId },
            data: {
                stripeCustomerId: subscription.customer,
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: status,
                subscriptionPlan: planSlug,
                subscriptionCurrentPeriodEnd: periodEnd,
                subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
        });
        if (updated.count !== 1) throw billingError('Business account not found.', 404);

        if (!existing || existing.planId !== plan.id || existing.status !== status) {
            await tx.subscriptionHistory.create({
                data: {
                    tenantId: resolvedTenantId,
                    previousPlan: existing ? tenant.subscriptionPlan : null,
                    newPlan: planSlug,
                    action: !existing
                        ? 'ACTIVATED'
                        : status === 'canceled' || status === 'expired'
                            ? 'CANCELED'
                            : existing.planId !== plan.id
                                ? 'PLAN_CHANGED'
                                : 'STATUS_CHANGED',
                    effectiveDate: new Date(),
                    details: { status, billingCycle: interval, subscriptionRecordId: record.id },
                },
            });
        }
    });
}

function normalizeStripeSubscriptionStatus(status: string): string {
    switch (status) {
        case 'active':
        case 'trialing':
        case 'past_due':
        case 'canceled':
            return status;
        case 'incomplete':
            return 'pending';
        case 'incomplete_expired':
            return 'expired';
        case 'unpaid':
            return 'past_due';
        default:
            return 'pending';
    }
}

export async function handleStripeEvent(event: StripeObject): Promise<void> {
    if (typeof event.type !== 'string' || !event.data || typeof event.data !== 'object') {
        throw billingError('The billing provider sent a malformed event.', 400);
    }

    const object = (event.data as { object?: unknown }).object;
    if (!object || typeof object !== 'object') {
        throw billingError('The billing provider sent a malformed event.', 400);
    }

    const payload = object as StripeObject;
    if (event.type === 'checkout.session.completed') {
        const metadata = payload.metadata;
        const tenantId = metadata && typeof metadata === 'object'
            ? (metadata as Record<string, unknown>).tenantId
            : undefined;
        const subscriptionId = payload.subscription;
        if (typeof tenantId !== 'string' || typeof subscriptionId !== 'string') {
            throw billingError('The completed checkout is missing account metadata.', 400);
        }

        const subscription = parseSubscription(await stripeRequest<StripeObject>(
            `subscriptions/${encodeURIComponent(subscriptionId)}`, {}, 'GET',
        ));
        await saveSubscription(subscription, tenantId);
        return;
    }

    if (!['customer.subscription.created', 'customer.subscription.updated',
        'customer.subscription.deleted'].includes(event.type)) return;

    await saveSubscription(parseSubscription(payload));
}

function parseSubscription(value: StripeObject): SubscriptionSnapshot {
    const { id, status, customer, current_period_end: periodEnd,
        cancel_at_period_end: cancelAtPeriodEnd, metadata } = value;
    if (typeof id !== 'string' || typeof status !== 'string' ||
        typeof customer !== 'string' || typeof cancelAtPeriodEnd !== 'boolean') {
        throw billingError('The billing provider returned an incomplete subscription.', 502);
    }

    const stringMetadata = metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? Object.fromEntries(
            Object.entries(metadata).filter((entry): entry is [string, string] =>
                typeof entry[1] === 'string'),
        )
        : undefined;

    return {
        id,
        status,
        customer,
        ...(typeof periodEnd === 'number' ? { current_period_end: periodEnd } : {}),
        cancel_at_period_end: cancelAtPeriodEnd,
        ...(stringMetadata ? { metadata: stringMetadata } : {}),
    };
}

export function verifyStripeSignature(
    rawBody: Buffer,
    signatureHeader: string | undefined,
    webhookSecret = env.STRIPE_WEBHOOK_SECRET,
): boolean {
    if (!signatureHeader || !webhookSecret) return false;
    const entries = signatureHeader.split(',').map(part => part.split('=', 2));
    const timestamp = entries.find(([key]) => key === 't')?.[1];
    const signatures = entries.filter(([key]) => key === 'v1').map(([, value]) => value);
    if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;

    const timestampSeconds = Number(timestamp);
    if (!Number.isSafeInteger(timestampSeconds) ||
        Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;

    const expected = createHmac('sha256', webhookSecret)
        .update(`${timestamp}.`)
        .update(rawBody)
        .digest();

    return signatures.some(signature => {
        if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
        const actual = Buffer.from(signature, 'hex');
        return actual.length === expected.length && timingSafeEqual(actual, expected);
    });
}

export function parseStripeEvent(rawBody: Buffer): StripeObject {
    try {
        const parsed: unknown = JSON.parse(rawBody.toString('utf8'));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Invalid event shape');
        }
        return parsed as StripeObject;
    } catch {
        throw billingError('The billing provider sent invalid JSON.', 400);
    }
}
