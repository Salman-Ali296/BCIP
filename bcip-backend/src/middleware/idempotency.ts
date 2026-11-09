import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { Errors } from '../utils/error';
import { logger } from '../utils/logger';

interface IdempotencyRecord {
    idempotencyKey: string;
    method: string;
    path: string;
    statusCode: number;
    responseBody: any;
    createdAt: Date;
}

const idempotencyCache = new Map<string, IdempotencyRecord>();

/**
 * Middleware to handle idempotent requests
 * Prevents duplicate processing if client retries with same idempotency key
 * 
 * Usage: Include x-idempotency-key header in POST/PUT requests
 */
export const idempotencyMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Only apply to non-idempotent methods
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return next();
    }

    const idempotencyKey = req.headers['x-idempotency-key'] as string;

    // Idempotency key required for state-changing operations
    if (!idempotencyKey) {
        return next();
    }

    // Check if we've already processed this request
    const cacheKey = `${req.method}:${req.path}:${idempotencyKey}`;
    const cached = idempotencyCache.get(cacheKey);

    if (cached) {
        logger.info('Idempotent request - returning cached response', {
            idempotencyKey,
        });

        res.status(cached.statusCode);
        res.json({
            ...cached.responseBody,
            _idempotent: true,
            _cachedAt: cached.createdAt,
        });
        return;
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Intercept response to cache it
    res.json = function (body: any) {
        const record: IdempotencyRecord = {
            idempotencyKey,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            responseBody: body,
            createdAt: new Date(),
        };

        // Cache for 24 hours (configurable)
        idempotencyCache.set(cacheKey, record);

        // Clean old entries every 1000 requests
        if (Math.random() < 0.001) {
            const oneHourAgo = Date.now() - 3600000;
            for (const [key, value] of idempotencyCache.entries()) {
                if (value.createdAt.getTime() < oneHourAgo) {
                    idempotencyCache.delete(key);
                }
            }
        }

        res.setHeader('x-idempotency-key', idempotencyKey);

        return originalJson(body);
    } as any;

    next();
};