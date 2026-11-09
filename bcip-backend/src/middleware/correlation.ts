import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

/**
 * Adds correlation ID to every request for distributed tracing
 * Enables tracking of a single request through multiple services
 */
export const correlationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Use existing correlation ID or generate new one
    const correlationHeader = req.headers['x-correlation-id'] || req.headers['x-request-id'];
    const correlationId = Array.isArray(correlationHeader)
        ? correlationHeader[0]
        : correlationHeader || uuidv4();
    const requestId = uuidv4();

    // Store in request object for use in handlers
    req.correlationId = correlationId;
    req.requestId = requestId;

    // Add to response headers for client tracking
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-request-id', requestId);

    // Set context for all loggers in this request
    logger.setContext({
        requestId,
        correlationId,
        method: req.method,
        path: req.path,
        ip: req.ip,
    });

    // Log request
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        query: req.query,
        userId: req.user?.id,
    });

    // Log response when finished
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const level = res.statusCode >= 400 ? 'warn' : 'info';
        logger[level as 'info' | 'warn']('Request completed', {
            statusCode: res.statusCode,
            duration,
        });
    });

    next();
};