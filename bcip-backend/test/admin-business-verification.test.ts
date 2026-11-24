import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';

import { Prisma } from '@prisma/client';
import { prisma } from '../src/config/database';
import { AdminBusinessService } from '../src/modules/administration/services/admin-business.service';
import { AppError } from '../src/utils/error';

function mockPrismaMethod<Arguments extends unknown[], Result>(
    context: TestContext,
    target: object,
    methodName: string,
    implementation: (...args: Arguments) => Result,
) {
    const original = Object.getOwnPropertyDescriptor(target, methodName);
    const calls: Arguments[] = [];
    Object.defineProperty(target, methodName, {
        configurable: true,
        writable: true,
        value: (...args: Arguments) => {
            calls.push(args);
            return implementation(...args);
        },
    });
    context.after(() => {
        if (original) Object.defineProperty(target, methodName, original);
        else Reflect.deleteProperty(target, methodName);
    });
    return { calls };
}

test('business verification is blocked until a business administrator verifies email', async t => {
    mockPrismaMethod(
        t,
        prisma.user,
        'findFirst',
        async () => null as never,
    );
    const tenantUpdate = mockPrismaMethod(
        t,
        prisma.tenant,
        'update',
        async () => ({}) as never,
    );
    const service = new AdminBusinessService();

    await assert.rejects(
        service.updateBusinessStatus('tenant-1', { businessVerified: true }, 'reviewer-1'),
        (error: unknown) =>
            error instanceof AppError &&
            error.statusCode === 403 &&
            error.message.includes('verify their email'),
    );
    assert.equal(tenantUpdate.calls.length, 0);
});

test('a super admin can manually approve a verified business administrator without uploaded evidence', async t => {
    mockPrismaMethod(
        t,
        prisma.user,
        'findFirst',
        async () => ({ id: 'business-admin-1' }) as never,
    );
    mockPrismaMethod(t, prisma, '$transaction', async (
        operation: (transaction: Prisma.TransactionClient) => Promise<unknown>,
    ) => operation(prisma as Prisma.TransactionClient));
    mockPrismaMethod(
        t,
        prisma.tenant,
        'findUnique',
        async () => ({ isActive: false, businessVerified: false }) as never,
    );
    mockPrismaMethod(t, prisma.accountDocument, 'updateMany', async () => ({ count: 0 }) as never);
    mockPrismaMethod(t, prisma.auditLog, 'create', async () => ({ id: 'audit-1' }) as never);
    const tenantUpdate = mockPrismaMethod(
        t,
        prisma.tenant,
        'update',
        async () => ({
            id: 'tenant-1',
            isActive: true,
            businessVerified: true,
        }) as never,
    );
    const service = new AdminBusinessService();

    const result = await service.updateBusinessStatus(
        'tenant-1',
        { businessVerified: true, isActive: true },
        'reviewer-1',
    );
    assert.deepEqual(result, {
        id: 'tenant-1',
        isActive: true,
        businessVerified: true,
    });
    assert.equal(tenantUpdate.calls.length, 1);
});

test('admin approval verifies the business and records evidence review', async t => {
    mockPrismaMethod(
        t,
        prisma.user,
        'findFirst',
        async () => ({ id: 'business-admin-1' }) as never,
    );
    mockPrismaMethod(
        t,
        prisma.accountDocument,
        'findMany',
        async () => [{
            fileUrl: 'https://registry.example/business.pdf',
            metadata: {
                businessAddress: '123 Registered Road',
                registrationNumber: 'REG-123',
            },
        }] as never,
    );
    mockPrismaMethod(
        t,
        prisma,
        '$transaction',
        async (
            operation: (transaction: Prisma.TransactionClient) => Promise<unknown>,
        ) => operation(prisma as Prisma.TransactionClient),
    );
    mockPrismaMethod(
        t,
        prisma.tenant,
        'findUnique',
        async () => ({ isActive: false, businessVerified: false }) as never,
    );
    mockPrismaMethod(
        t,
        prisma.auditLog,
        'create',
        async () => ({ id: 'audit-1' }) as never,
    );
    const tenantUpdate = mockPrismaMethod(
        t,
        prisma.tenant,
        'update',
        async () => ({
            id: 'tenant-1',
            isActive: true,
            businessVerified: true,
        }) as never,
    );
    const evidenceUpdate = mockPrismaMethod(
        t,
        prisma.accountDocument,
        'updateMany',
        async () => ({ count: 1 }) as never,
    );
    const service = new AdminBusinessService();

    const result = await service.updateBusinessStatus('tenant-1', {
        businessVerified: true,
        isActive: true,
    }, 'reviewer-1');
    assert.deepEqual(result, {
        id: 'tenant-1',
        isActive: true,
        businessVerified: true,
    });
    assert.equal(tenantUpdate.calls.length, 1);
    assert.equal(evidenceUpdate.calls.length, 1);
});

test('admin rejection records the reviewer and previous business status', async t => {
    mockPrismaMethod(
        t,
        prisma,
        '$transaction',
        async (
            operation: (transaction: Prisma.TransactionClient) => Promise<unknown>,
        ) => operation(prisma as Prisma.TransactionClient),
    );
    mockPrismaMethod(
        t,
        prisma.tenant,
        'findUnique',
        async () => ({ isActive: false, businessVerified: false }) as never,
    );
    mockPrismaMethod(
        t,
        prisma.tenant,
        'update',
        async () => ({
            id: 'tenant-1',
            isActive: false,
            businessVerified: false,
        }) as never,
    );
    const auditCreate = mockPrismaMethod(
        t,
        prisma.auditLog,
        'create',
        async () => ({ id: 'audit-1' }) as never,
    );

    await new AdminBusinessService().updateBusinessStatus(
        'tenant-1',
        { businessVerified: false },
        'reviewer-1',
    );

    assert.equal(auditCreate.calls.length, 1);
    assert.equal(
        (auditCreate.calls[0][0] as { data: { action: string; userId: string } }).data.action,
        'BUSINESS_REGISTRATION_REJECTED',
    );
    assert.equal(
        (auditCreate.calls[0][0] as { data: { userId: string } }).data.userId,
        'reviewer-1',
    );
});
