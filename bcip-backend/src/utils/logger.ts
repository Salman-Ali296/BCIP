import pino, { Logger as PinoLogger } from 'pino';

interface LogContext {
    requestId?: string;
    userId?: string;
    tenantId?: string;
    correlationId?: string;
    [key: string]: any;
}

class Logger {
    private logger: PinoLogger;
    private context: LogContext = {};

    constructor() {
        this.logger = pino({
            level: process.env.LOG_LEVEL || 'info',
            transport: {
                target: 'pino-pretty', // Pretty-print in dev, JSON in prod
                options: {
                    colorize: process.env.NODE_ENV !== 'production',
                    singleLine: process.env.NODE_ENV === 'production',
                    translateTime: 'SYS:standard',
                },
            },
        });
    }

    /**
     * Set context for all subsequent logs in this logger instance
     */
    setContext(context: LogContext): void {
        this.context = { ...this.context, ...context };
    }

    /**
     * Create a child logger with additional context
     */
    child(context: LogContext): Logger {
        const childLogger = new Logger();
        childLogger.context = { ...this.context, ...context };
        return childLogger;
    }

    info(message: string, meta?: any): void {
        this.logger.info({ ...this.context, ...meta }, message);
    }

    error(message: string, error?: Error | any, meta?: any): void {
        this.logger.error(
            {
                ...this.context,
                ...meta,
                stack: error?.stack,
                errorCode: error?.code,
            },
            message
        );
    }

    warn(message: string, meta?: any): void {
        this.logger.warn({ ...this.context, ...meta }, message);
    }

    debug(message: string, meta?: any): void {
        this.logger.debug({ ...this.context, ...meta }, message);
    }

    /**
     * Log performance metrics
     */
    performance(operation: string, durationMs: number, meta?: any): void {
        const level = durationMs > 1000 ? 'warn' : 'info';
        this.logger[level](
            { ...this.context, ...meta, durationMs, operation },
            `Operation completed`
        );
    }
}

export const logger = new Logger();