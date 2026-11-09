// src/shared/middleware/tenant.middleware.ts
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';

export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>();

/**
 * Tenant middleware — must be placed AFTER authMiddleware.
 * Tenant identity is derived exclusively from the authenticated principal.
 * A client-supplied x-tenant-id header is rejected if it conflicts with the
 * authenticated tenant, and never accepted as a substitute for authentication.
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authenticatedTenantId = req.user?.tenantId;

    // Reject requests where no authenticated tenant exists.
    if (!authenticatedTenantId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    // If the client also sends x-tenant-id, it must match the authenticated tenant.
    // We do NOT use the header as the authoritative source — only the authenticated
    // principal determines tenant context.
    const requestedTenantId = req.headers['x-tenant-id'] as string | undefined;
    if (requestedTenantId && requestedTenantId !== authenticatedTenantId) {
        res.status(403).json({ error: 'Tenant does not match authenticated account' });
        return;
    }

    req.tenantId = authenticatedTenantId;

    // Run the rest of the request inside this context
    tenantContext.run({ tenantId: authenticatedTenantId }, () => next());
}

// Usage in Repository:
// const currentTenant = tenantContext.getStore()?.tenantId;