import bcrypt from 'bcrypt';
import { prisma } from '../src/config/database';
import { env } from '../src/config/env';
import { createBusinessTrialPeriod } from '../src/modules/accounts/trial-policy';
import { logger } from '../src/utils/logger';

/**
 * BCIP Development Database Seed
 *
 * Creates authentic development accounts with real hashed passwords, real tenant isolation,
 * and valid business trial configurations.
 *
 * Credentials can be customized via environment variables:
 * - DEV_BUSINESS_NAME (default: 'Apex Enterprise Solutions')
 * - DEV_AUTH_EMAIL    (default: 'dev.admin@bcip.local')
 * - DEV_AUTH_PASSWORD (default: 'DevPassword123!')
 * - DEV_SUPER_ADMIN_EMAIL and DEV_SUPER_ADMIN_PASSWORD (optional; development only)
 */
export async function seedDevelopmentData(): Promise<void> {
    const devBusinessName = process.env.DEV_BUSINESS_NAME || 'Apex Enterprise Solutions';
    const devEmail = (process.env.DEV_AUTH_EMAIL || 'dev.admin@bcip.local').trim().toLowerCase();
    const devPassword = process.env.DEV_AUTH_PASSWORD || 'DevPassword123!';
    const devSlug = 'apex-enterprise';

    logger.info('Seeding development workspace and administrator...');

    // 1. Provision Platform Public Tenant (for customer complaints)
    const platformTenant = await prisma.tenant.upsert({
        where: { slug: 'bcip-public-consumer-platform' },
        update: { isActive: true, businessVerified: true },
        create: {
            name: 'BCIP Public Consumer Platform',
            slug: 'bcip-public-consumer-platform',
            email: 'support@bcip.global',
            subscriptionPlan: 'ENTERPRISE',
            isActive: true,
            businessVerified: true,
        },
    });

    const superAdminEmail = process.env.DEV_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    const superAdminPassword = process.env.DEV_SUPER_ADMIN_PASSWORD;
    if (Boolean(superAdminEmail) !== Boolean(superAdminPassword)) {
        throw new Error('Set both DEV_SUPER_ADMIN_EMAIL and DEV_SUPER_ADMIN_PASSWORD to bootstrap a Super Admin');
    }
    if (superAdminEmail && superAdminPassword) {
        if (env.NODE_ENV !== 'development') {
            throw new Error('Super Admin bootstrap is available only in development');
        }
        if (superAdminPassword.length < 12) {
            throw new Error('DEV_SUPER_ADMIN_PASSWORD must be at least 12 characters');
        }

        const existingSuperAdmin = await prisma.user.findUnique({
            where: { email: superAdminEmail },
            select: {
                role: true,
                accountType: true,
                isActive: true,
                emailVerified: true,
            },
        });
        if (existingSuperAdmin) {
            if (
                existingSuperAdmin.role !== 'SUPER_ADMIN' ||
                existingSuperAdmin.accountType !== 'EMPLOYEE' ||
                !existingSuperAdmin.isActive ||
                !existingSuperAdmin.emailVerified
            ) {
                throw new Error('DEV_SUPER_ADMIN_EMAIL already belongs to an incompatible account');
            }
            logger.info('Development Super Admin account already exists; credentials were not changed');
        } else {
            await prisma.user.create({
                data: {
                    email: superAdminEmail,
                    passwordHash: await bcrypt.hash(superAdminPassword, 12),
                    fullName: process.env.DEV_SUPER_ADMIN_NAME?.trim() || 'Platform Administrator',
                    accountType: 'EMPLOYEE',
                    role: 'SUPER_ADMIN',
                    tenantId: platformTenant.id,
                    isActive: true,
                    emailVerified: true,
                },
            });
            logger.info('Development Super Admin account provisioned');
        }
    }

    // 2. Provision Development Business Tenant
    const businessTenant = await prisma.tenant.upsert({
        where: { slug: devSlug },
        update: {
            name: devBusinessName,
            isActive: true,
            businessVerified: true,
        },
        create: {
            name: devBusinessName,
            slug: devSlug,
            email: devEmail,
            industry: 'Software & Technology',
            subscriptionPlan: 'ENTERPRISE',
            isActive: true,
            businessVerified: true,
        },
    });

    // 3. Provision Verified Development Business Admin User
    const passwordHash = await bcrypt.hash(devPassword, 12);
    const devUser = await prisma.user.upsert({
        where: { email: devEmail },
        update: {
            passwordHash,
            fullName: 'Dev Administrator',
            accountType: 'BUSINESS',
            role: 'BUSINESS_ADMIN',
            tenantId: businessTenant.id,
            isActive: true,
            emailVerified: true,
        },
        create: {
            email: devEmail,
            passwordHash,
            fullName: 'Dev Administrator',
            accountType: 'BUSINESS',
            role: 'BUSINESS_ADMIN',
            tenantId: businessTenant.id,
            isActive: true,
            emailVerified: true,
        },
    });

    // 4. Provision 14-day Business Trial (connected to tenant and dev user)
    const trialPeriod = createBusinessTrialPeriod(new Date());
    await prisma.businessTrial.upsert({
        where: { tenantId: businessTenant.id },
        update: {
            acceptedAt: trialPeriod.acceptedAt,
            expiresAt: trialPeriod.expiresAt,
        },
        create: {
            tenant: { connect: { id: businessTenant.id } },
            acceptedBy: { connect: { id: devUser.id } },
            acceptedAt: trialPeriod.acceptedAt,
            expiresAt: trialPeriod.expiresAt,
        },
    });

    // 5. Provision Verified Development Customer User
    const customerEmail = 'dev.customer@bcip.local';
    await prisma.user.upsert({
        where: { email: customerEmail },
        update: {
            passwordHash,
            fullName: 'Dev Customer',
            accountType: 'CUSTOMER',
            role: 'CUSTOMER',
            tenantId: platformTenant.id,
            isActive: true,
            emailVerified: true,
        },
        create: {
            email: customerEmail,
            passwordHash,
            fullName: 'Dev Customer',
            accountType: 'CUSTOMER',
            role: 'CUSTOMER',
            tenantId: platformTenant.id,
            isActive: true,
            emailVerified: true,
        },
    });

    logger.info('Development seed complete:', {
        businessTenant: businessTenant.name,
        businessAdmin: devUser.email,
        customerUser: customerEmail,
    });
}

if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
    seedDevelopmentData()
        .then(async () => {
            await prisma.$disconnect();
            process.exit(0);
        })
        .catch(async error => {
            logger.error('Seed failed:', error);
            await prisma.$disconnect();
            process.exit(1);
        });
}
