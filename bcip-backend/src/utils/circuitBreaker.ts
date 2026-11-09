import { logger } from './logger';
import { Errors } from '../utils/error';

enum CircuitState {
    CLOSED = 'CLOSED',     // Normal operation
    OPEN = 'OPEN',         // Service failing, reject all requests
    HALF_OPEN = 'HALF_OPEN', // Test if service recovered
}

interface CircuitBreakerConfig {
    failureThreshold: number;      // Fail N times to open circuit
    successThreshold: number;      // Succeed N times to close circuit
    timeout: number;               // Time in ms to wait before half-open
    resetTimeout: number;          // Time in ms between half-open attempts
}

export class CircuitBreaker<T> {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private successCount = 0;
    private lastFailureTime: number | null = null;
    private config: CircuitBreakerConfig;
    private name: string;

    constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
        this.name = name;
        this.config = {
            failureThreshold: config.failureThreshold || 5,
            successThreshold: config.successThreshold || 2,
            timeout: config.timeout || 60000,
            resetTimeout: config.resetTimeout || 30000,
        };
    }

    /**
     * Execute function with circuit breaker protection
     */
    async execute<R>(fn: () => Promise<R>): Promise<R> {
        if (this.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
                logger.info(`Circuit breaker ${this.name} entering HALF_OPEN state`);
            } else {
                throw Errors.circuitBreakerOpen();
            }
        }

        try {
            const result = await this.executeWithTimeout(fn);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private async executeWithTimeout<R>(
        fn: () => Promise<R>,
        timeoutMs = this.config.timeout
    ): Promise<R> {
        return Promise.race([
            fn(),
            new Promise<R>((_, reject) =>
                setTimeout(
                    () => reject(Errors.timeout(this.name)),
                    timeoutMs
                )
            ),
        ]);
    }

    private onSuccess(): void {
        this.failureCount = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
                logger.info(`Circuit breaker ${this.name} closed - service recovered`);
            }
        }
    }

    private onFailure(): void {
        this.lastFailureTime = Date.now();
        this.failureCount++;

        if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
            logger.error(
                `Circuit breaker ${this.name} opened - service failing`,
                new Error(`${this.name} exceeded failure threshold`)
            );
        }

        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.OPEN;
            logger.warn(`Circuit breaker ${this.name} reopened after failed attempt`);
        }
    }

    private shouldAttemptReset(): boolean {
        return (
            this.lastFailureTime !== null &&
            Date.now() - this.lastFailureTime >= this.config.resetTimeout
        );
    }

    getState(): CircuitState {
        return this.state;
    }

    getMetrics() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
        };
    }
}