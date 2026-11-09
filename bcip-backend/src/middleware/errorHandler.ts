import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../utils/error';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware
 * Converts all errors to structured JSON responses
 * Logs all errors with context
 */
export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const requestId = req.requestId;
    const correlationId = req.correlationId;

    // Handle custom AppError
    if (error instanceof AppError) {
        logger[error.isOperational ? 'warn' : 'error'](
            error.message,
            error,
            {
                requestId,
                code: error.code,
                isOperational: error.isOperational,
            }
        );

        res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.isOperational ? error.details : undefined,
                requestId,
                correlationId,
                timestamp: new Date().toISOString(),
            },
        });

        return;
    }

    // Handle unexpected errors
    logger.error('Unexpected error', error, { requestId });

    res.status(500).json({
        success: false,
        error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: 'An unexpected error occurred',
            requestId,
            correlationId,
            timestamp: new Date().toISOString(),
        },
    });
};