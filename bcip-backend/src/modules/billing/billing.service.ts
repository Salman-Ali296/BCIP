import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError, ErrorCode } from '../../utils/error';

type StripeObject = Record<string, unknown>;
type BillingPlan = keyof typeof env.STRIPE_PRICES;
type BillingInterval = 'month' | 'year';

export interface SubscriptionSnapshot {
    id: string;
    status: string;
    customer: string;
    current_period_end?: number;
    cancel_at_period_end: boolean;
    metadata?: Record<string, string>;
}

export interface CheckoutInput {
    plan: BillingPlan;
    interval: BillingInterval;
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

export async function createCheckoutSession(tenantId: string, input: CheckoutInput) {
    const priceId = env.STRIPE_PRICES[input.plan][input.interval];
    if (!priceId) {
        throw billingError('The selected plan is not configured for checkout.', 503);
    }

    const customerId = await getOrCreateCustomer(tenantId);
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
    return {
        customerId: tenant.stripeCustomerId,
        subscriptionId: tenant.stripeSubscriptionId,
        status: tenant.subscriptionStatus,
        plan: tenant.subscriptionPlan,
        currentPeriodEnd: tenant.subscriptionCurrentPeriodEnd,
        cancelAtPeriodEnd: tenant.subscriptionCancelAtPeriodEnd,
    };
}

async function updateSubscription(tenantId: string, cancelAtPeriodEnd: boolean) {
    await tenantDetails(tenantId);
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
    const plan = typeof subscription.metadata?.plan === 'string'
        ? subscription.metadata.plan
        : undefined;

    const updated = await prisma.$executeRaw`
        UPDATE "tenants"
        SET "stripeCustomerId" = ${subscription.customer},
            "stripeSubscriptionId" = ${subscription.id},
            "subscriptionStatus" = ${subscription.status},
            "subscriptionPlan" = COALESCE(${plan ?? null}, "subscriptionPlan"),
            "subscriptionCurrentPeriodEnd" = ${periodEnd},
            "subscriptionCancelAtPeriodEnd" = ${subscription.cancel_at_period_end}
        WHERE "id" = ${resolvedTenantId}
    `;
    if (updated === 0) throw billingError('Business account not found.', 404);
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
