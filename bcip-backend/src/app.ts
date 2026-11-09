
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { correlationMiddleware } from './middleware/correlation';
import { idempotencyMiddleware } from './middleware/idempotency';
import { errorHandler } from './middleware/errorHandler';

import complaintRoutes from './routes/complaints';
import apiRoutes from './routes';
import authRoutes from './modules/accounts/auth.routes';

import { env } from './config/env';
import { logger } from './utils/logger';

export function createApp(): Express {
    const app = express();

    // Security configuration
    app.disable('x-powered-by');

    // Configure only according to your actual reverse-proxy topology.
    app.set('trust proxy', 1);

    app.use(helmet());

    app.use(
        cors({
            origin: env.CORS_ORIGINS,
            credentials: true,
        }),
    );

    // Request rate limiting
    app.use(
        '/api',
        rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
        }),
    );

    // Correlation ID for request tracing
    app.use(correlationMiddleware);

    // Stripe webhooks must receive the raw request body.
    // Register these routes before express.json().
    app.use(
        [
            '/api/auth/billing/webhook/Stripe',
            '/api/v1/auth/billing/webhook/Stripe',
        ],
        express.raw({
            type: 'application/json',
            limit: '1mb',
        }),
    );

    // Request body parsers
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ limit: '1mb', extended: false }));

    // Idempotency middleware should follow body parsing if it
    // needs access to req.body. Otherwise, it can run earlier.
    app.use(idempotencyMiddleware);

    // Health check
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: env.NODE_ENV,
        });
    });

    // Authentication routes
    app.use('/api/auth', authRoutes);

    // Complaint routes
    app.use('/api/complaints', complaintRoutes);

    // Versioned API routes
    app.use('/api/v1', apiRoutes);

    // Root endpoint
    app.get('/', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'AI-Powered Business Complaint Platform API',
        });
    });

    // Handle unmatched routes
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Route not found',
                path: req.originalUrl,
            },
        });
    });

    // Error handler must be registered last.
    app.use(errorHandler);

    logger.info('Express app configured successfully');

    return app;
}
