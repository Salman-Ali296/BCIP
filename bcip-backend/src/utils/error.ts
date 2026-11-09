// Custom error classes with operational context
export enum ErrorCode {
    // Client errors (4xx)
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
    BUSINESS_VERIFICATION_PENDING = 'BUSINESS_VERIFICATION_PENDING',
    ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',

    // Server errors (5xx)
    DATABASE_ERROR = 'DATABASE_ERROR',
    AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

    // Timeout/Circuit breaker
    REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
    REQUEST_TOO_LARGE = 'REQUEST_TOO_LARGE',
    CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
}

interface ErrorContext {
    code: ErrorCode;
    message: string;
    statusCode: number;
    isOperational: boolean; // true = expected error, false = unexpected
    details?: Record<string, any>;
    requestId?: string;
    timestamp?: Date;
}

export class AppError extends Error implements ErrorContext {
    code: ErrorCode;

    statusCode: number;
    isOperational: boolean;
    details?: Record<string, any>;
    requestId?: string;
    timestamp: Date;

    constructor(
        code: ErrorCode,
        message: string,
        statusCode: number,
        isOperational = true,
        details?: Record<string, any>
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);

        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        this.timestamp = new Date();

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            isOperational: this.isOperational,
            details: this.details,

            timestamp: this.timestamp,
        };
    }
}

// Helper factory functions for common errors
export const Errors = {
    validation: (message: string, details?: any) =>
        new AppError(ErrorCode.VALIDATION_ERROR, message, 400, true, details),

    unauthorized: (message = 'Unauthorized') =>
        new AppError(ErrorCode.UNAUTHORIZED, message, 401, true),

    forbidden: (message = 'Forbidden') =>
        new AppError(ErrorCode.FORBIDDEN, message, 403, true),

    notFound: (resource: string) =>
        new AppError(
            ErrorCode.RESOURCE_NOT_FOUND,
            `${resource} not found`,
            404,
            true
        ),

    duplicateRequest: (message = 'Duplicate request detected') =>
        new AppError(ErrorCode.DUPLICATE_REQUEST, message, 409, true),

    invalidCredentials: () =>
        new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password', 401, true),

    emailNotVerified: () =>
        new AppError(ErrorCode.EMAIL_NOT_VERIFIED, 'Verify your email before signing in', 403, true),

    businessVerificationPending: () =>
        new AppError(
            ErrorCode.BUSINESS_VERIFICATION_PENDING,
            'Business verification is pending',
            403,
            true,
        ),

    accountSuspended: () =>
        new AppError(ErrorCode.ACCOUNT_SUSPENDED, 'This account is suspended', 403, true),

    databaseError: (originalError: any) =>
        new AppError(
            ErrorCode.DATABASE_ERROR,
            'Database operation failed',
            500,

            false,
            { originalError: originalError.message }
        ),

    aiServiceUnavailable: () =>
        new AppError(
            ErrorCode.AI_SERVICE_UNAVAILABLE,
            'AI service is temporarily unavailable',
            503,
            true
        ),

    circuitBreakerOpen: () =>
        new AppError(
            ErrorCode.CIRCUIT_BREAKER_OPEN,
            'Service temporarily degraded. Please try again later.',
            503,
            true
        ),

    timeout: (service: string) =>
        new AppError(
            ErrorCode.REQUEST_TIMEOUT,
            `Request to ${service} timed out`,
            504,
            true
        ),

    payloadTooLarge: (message = 'Request payload is too large') =>
        new AppError(ErrorCode.REQUEST_TOO_LARGE, message, 413, true),

    internalError: (message = 'Internal server error', originalError?: any) =>
        new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            message,

            500,
            false,
            originalError ? { originalError: originalError.message } : undefined
        ),
};