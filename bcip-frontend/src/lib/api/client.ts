interface RequestOptions extends RequestInit {
    token?: string;
    sameOrigin?: boolean;
}

export class ApiClientError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly code?: string,
    ) {
        super(message);
        this.name = "ApiClientError";
    }
}

export function notifySessionExpired(response: Response): void {
    if (typeof window !== 'undefined' && response.status === 401) {
        window.dispatchEvent(new Event('bcip:session-expired'));
    }
}

// Get API base URL from environment or default to relative paths
function getApiBaseUrl(): string {
    if (typeof window === 'undefined') {
        // Server-side: use environment variable or default
        return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    }
    // Client-side: use environment variable or construct from window location
    return process.env.NEXT_PUBLIC_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000`;
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { token, sameOrigin, headers, ...requestOptions } = options;
    
    // Construct full URL
    const baseUrl = getApiBaseUrl();
    const apiPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullUrl = endpoint.startsWith('http')
        ? endpoint
        : sameOrigin
          ? apiPath
          : `${baseUrl}${apiPath}`;
    const isFormData =
        typeof FormData !== 'undefined' &&
        requestOptions.body instanceof FormData;
    
    try {
        const response = await fetch(fullUrl, {
            ...requestOptions,
            credentials: "include",
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
        });

        if (!response.ok) {
            if (!apiPath.startsWith('/api/auth/')) {
                notifySessionExpired(response);
            }
            const parsed = await response.json().catch(() => null) as {
                message?: string;
                error?: { message?: string; code?: string };
            } | null;
            throw new ApiClientError(
                parsed?.error?.message ||
                    parsed?.message ||
                    `API request failed with status ${response.status}`,
                response.status,
                parsed?.error?.code,
            );
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json() as Promise<T>;
    } catch (error) {
        if (error instanceof ApiClientError) {
            throw error;
        }
        // Network or other errors
        throw new ApiClientError(
            error instanceof Error ? error.message : 'Network error occurred',
            0,
            'NETWORK_ERROR'
        );
    }
}