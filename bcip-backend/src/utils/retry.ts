export interface RetryOptions {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
}

export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: RetryOptions = {}
): Promise<T> {
    const maxAttempts = options.maxAttempts ?? 3;
    const initialDelayMs = options.initialDelayMs ?? 100;
    const maxDelayMs = options.maxDelayMs ?? 2000;

    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                break;
            }

            const delay = Math.min(initialDelayMs * 2 ** (attempt - 1), maxDelayMs);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error(`${operationName} failed`);
}
