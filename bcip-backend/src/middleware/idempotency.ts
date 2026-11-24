import { createHash } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AUTH_SESSION_COOKIE } from '../modules/accounts/auth-session-cookie';

interface IdempotencyRecord {
    statusCode: number;
    responseBody: unknown;
    createdAt: number;
}

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 10_000;
const MAX_KEY_LENGTH = 128;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_\-:.]+$/;

// Paths whose responses carry credentials or one-time secrets must never be
// replayed from a cache.
const NON_CACHEABLE_PATH_PREFIXES = ['/api/auth', '/api/v1/auth'];

const idempotencyCache = new Map<string, IdempotencyRecord>();

/**
 * Identifies the caller so cached responses are never served to anyone else.
 * The middleware runs before authentication, so the raw credential (bearer
 * token or session cookie) is hashed; anonymous callers are scoped by IP.
 */
function callerScope(req: Request): string {
    const authorization = req.headers.authorization;
    const sessionCookie = req.headers.cookie
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${AUTH_SESSION_COOKIE}=`));
    const credential = authorization || sessionCookie;

    if (credential) {
        return `cred:${createHash('sha256').update(credential).digest('hex')}`;
    }
    return `ip:${req.ip ?? 'unknown'}`;
}

function pruneCache(now: number): void {
    for (const [key, value] of idempotencyCache) {
        if (now - value.createdAt > IDEMPOTENCY_TTL_MS) {
            idempotencyCache.delete(key);
        }
    }
    // Map preserves insertion order, so the oldest entries are evicted first.
    while (idempotencyCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = idempotencyCache.keys().next().value;
        if (oldestKey === undefined) break;
        idempotencyCache.delete(oldestKey);
    }
}

/**
 * Middleware to handle idempotent requests.
 * Prevents duplicate processing if a client retries with the same idempotency key.
 * Cached responses are scoped to the calling principal, expire after 24 hours,
 * and only successful (2xx) responses are stored.
 *
 * Usage: include an x-idempotency-key header in POST/PUT/PATCH requests.
 */
export const idempotencyMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return next();
    }

    const idempotencyKey = req.headers['x-idempotency-key'];
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length === 0) {
        return next();
    }
    if (
        idempotencyKey.length > MAX_KEY_LENGTH ||
        !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)
    ) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'x-idempotency-key must be 1-128 URL-safe characters',
            },
        });
        return;
    }

    const requestPath = req.originalUrl.split('?')[0];
    if (NON_CACHEABLE_PATH_PREFIXES.some((prefix) => requestPath.startsWith(prefix))) {
        return next();
    }

    const cacheKey = `${callerScope(req)}:${req.method}:${requestPath}:${idempotencyKey}`;
    const now = Date.now();
    const cached = idempotencyCache.get(cacheKey);

    if (cached && now - cached.createdAt <= IDEMPOTENCY_TTL_MS) {
        logger.info('Idempotent request - returning cached response', {
            idempotencyKey,
        });

        res.setHeader('x-idempotency-key', idempotencyKey);
        res.setHeader('x-idempotent-replay', 'true');
        res.status(cached.statusCode).json(cached.responseBody);
        return;
    }
    if (cached) {
        idempotencyCache.delete(cacheKey);
    }

    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            if (idempotencyCache.size >= MAX_CACHE_ENTRIES) {
                pruneCache(Date.now());
            }
            idempotencyCache.set(cacheKey, {
                statusCode: res.statusCode,
                responseBody: body,
                createdAt: Date.now(),
            });
        }

        res.setHeader('x-idempotency-key', idempotencyKey);
        return originalJson(body);
    } as Response['json'];

    next();
};
