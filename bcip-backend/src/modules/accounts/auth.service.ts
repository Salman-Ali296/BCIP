import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { Errors } from '../../utils/error';
import { getFirebaseAuth } from '../../config/firebase-admin';
import { logger } from '../../utils/logger';
import {
    EMAIL_VERIFICATION_CODE_TTL_MINUTES,
    emailService,
} from '../../services/emailService';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { createBusinessTrialPeriod, getBusinessTrialState } from './trial-policy';

const verificationCodeLifetimeMs = EMAIL_VERIFICATION_CODE_TTL_MINUTES * 60 * 1000;
const dummyPasswordHash = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 12);
type AccountWithTenant = Prisma.UserGetPayload<{
    include: { tenant: true };
}>;
type PendingEmailVerification = Prisma.UserGetPayload<{
    select: {
        id: true;
        email: true;
        accountType: true;
        tenantId: true;
        firebaseUid: true;
    };
}>;

interface FirebaseRegistrationAdmin {
    createUser(input: {
        email: string;
        password: string;
        displayName: string;
        emailVerified: false;
        disabled: true;
    }): Promise<{ uid: string }>;
    deleteUser(uid: string): Promise<void>;
    verifyEmail(uid: string): Promise<void>;
    updatePassword(uid: string, password: string): Promise<void>;
}

interface FirebaseLoginAdmin {
    getUserByEmail(email: string): Promise<{ uid: string }>;
    createUser(input: {
        email: string;
        password: string;
        displayName: string;
        emailVerified: true;
        disabled: false;
    }): Promise<{ uid: string }>;
    createCustomToken(uid: string): Promise<string>;
    deleteUser(uid: string): Promise<void>;
}

const firebaseRegistrationAdmin: FirebaseRegistrationAdmin = {
    createUser: (input) => getFirebaseAuth().createUser(input),
    deleteUser: (uid) => getFirebaseAuth().deleteUser(uid),
    verifyEmail: async (uid) => {
        await getFirebaseAuth().updateUser(uid, {
            emailVerified: true,
            disabled: false,
        });
    },
    updatePassword: async (uid, password) => {
        await getFirebaseAuth().updateUser(uid, { password });
    },
};

const firebaseLoginAdapter: FirebaseLoginAdmin = {
    getUserByEmail: (email) => getFirebaseAuth().getUserByEmail(email),
    createUser: (input) => getFirebaseAuth().createUser(input),
    createCustomToken: (uid) => getFirebaseAuth().createCustomToken(uid),
    deleteUser: (uid) => getFirebaseAuth().deleteUser(uid),
};

function hasFirebaseErrorCode(error: unknown, code: string): boolean {
    return typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === code;
}

export class AuthService {
    constructor(
        private readonly firebaseAdmin: FirebaseRegistrationAdmin = firebaseRegistrationAdmin,
        private readonly firebaseLoginAdmin: FirebaseLoginAdmin = firebaseLoginAdapter,
    ) {}

    private generateToken(userId: string, role: string, tenantId: string): string {
        return jwt.sign({ userId, role, tenantId }, env.JWT_SECRET, { expiresIn: '7d' });
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    private hashVerificationCode(code: string): string {
        return crypto.createHmac('sha256', env.JWT_SECRET).update(code).digest('hex');
    }

    async register(data: RegisterDto) {
        if (data.accountType === 'EMPLOYEE' || data.accountType === 'ESCALATION_AGENT') {
            throw Errors.forbidden('Staff accounts must be created through a tenant invitation');
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
            select: { emailVerified: true },
        });
        if (existingUser) {
            return { verificationRequired: !existingUser.emailVerified };
        }

        const passwordHash = await bcrypt.hash(data.password, 12);
        let firebaseUser: { uid: string };
        try {
            firebaseUser = await this.firebaseAdmin.createUser({
                email: data.email,
                password: data.password,
                displayName: data.fullName,
                emailVerified: false,
                disabled: true,
            });
        } catch (error) {
            if (hasFirebaseErrorCode(error, 'auth/email-already-exists')) {
                throw Errors.duplicateRequest(
                    'An account may already exist with this email. Sign in or contact support.',
                );
            }
            throw Errors.internalError(
                'We could not complete registration with the identity service. Please try again.',
            );
        }

        // Role is determined server-side only — never from client input.
        // EMPLOYEE / ESCALATION_AGENT are blocked above; this branch is unreachable for them.
        const role = data.accountType === 'BUSINESS' ? 'BUSINESS_ADMIN' : 'CUSTOMER';

        let result: {
            user: Awaited<ReturnType<typeof prisma.user.create>>;
            tenant: Awaited<ReturnType<typeof prisma.tenant.create>>;
        };
        try {
            result = await prisma.$transaction(async (tx) => {
                let tenant = null;
                if (data.accountType === 'BUSINESS') {
                    tenant = await tx.tenant.create({
                        data: {
                            name: data.workspaceName ?? data.businessName!,
                            slug: `${data.businessName!.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
                            email: data.email,
                            phone: data.phone,
                            industry: data.industry,
                            teamSize: data.teamSize,
                            website: data.website,
                            timezone: data.timezone,
                            isActive: false,
                            businessVerified: false,
                        },
                    });
                } else {
                    // CUSTOMER accounts always join the platform-wide public tenant.
                    // The tenantId is NEVER accepted from the client — it is resolved server-side.
                    tenant = await tx.tenant.findUnique({
                        where: { slug: 'bcip-public-consumer-platform' },
                    });
                    if (!tenant) {
                        tenant = await tx.tenant.create({
                            data: {
                                name: 'BCIP Public Consumer Platform',
                                slug: 'bcip-public-consumer-platform',
                                email: 'support@bcip.global',
                                isActive: true,
                                businessVerified: true,
                            },
                        });
                    }
                }

                if (!tenant) throw Errors.notFound('Tenant');

                const user = await tx.user.create({
                    data: {
                        email: data.email,
                        firebaseUid: firebaseUser.uid,
                        passwordHash,
                        fullName: data.fullName,
                        phone: data.phone,
                        accountType: data.accountType,
                        role,
                        tenantId: tenant.id,
                        documents: data.documents.length ? {
                            create: data.documents.map(document => ({
                                documentType: document.documentType,
                                fileName: document.fileName,
                                fileUrl: document.fileUrl,
                                metadata: (document.metadata ? (document.metadata as Prisma.InputJsonValue) : Prisma.JsonNull),
                                tenant: { connect: { id: tenant!.id } },
                            })),
                        } : undefined,
                    },
                });

                if (data.accountType === 'BUSINESS' && data.policies.length) {
                    await tx.companyPolicy.createMany({
                        data: data.policies.map(policy => ({ ...policy, tenantId: tenant.id })),
                    });
                }

                return { user, tenant };
            });
        } catch {
            try {
                await this.firebaseAdmin.deleteUser(firebaseUser.uid);
            } catch {
                logger.error(
                    'Firebase signup compensation failed; manual reconciliation is required',
                    undefined,
                    { operation: 'signup_compensation' },
                );
                throw Errors.internalError(
                    'Registration could not be completed. Please contact support before retrying.',
                );
            }
            throw Errors.internalError(
                'Registration could not be completed. Please try again.',
            );
        }

        return {
            ...this.toAccountResponse(result.user, result.tenant),
            verificationRequired: true,
        };
    }

    async resendVerificationEmail(email: string) {
        emailService.assertVerificationEmailConfigured();

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                emailVerificationSentAt: true,
            },
        });
        if (!user || user.emailVerified) return { accepted: true };

        const verificationCode = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
        const verificationCodeHash = this.hashVerificationCode(verificationCode);
        const now = new Date();
        const cooldownThreshold = new Date(
            now.getTime() - env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000,
        );
        const result = await prisma.user.updateMany({
            where: {
                id: user.id,
                emailVerified: false,
                OR: [
                    { emailVerificationSentAt: null },
                    { emailVerificationSentAt: { lte: cooldownThreshold } },
                ],
            },
            data: {
                emailVerificationTokenHash: verificationCodeHash,
                emailVerificationExpiresAt: new Date(now.getTime() + verificationCodeLifetimeMs),
                emailVerificationSentAt: now,
            },
        });
        if (result.count !== 1) return { accepted: true };

        try {
            await emailService.sendVerificationCode(user.email, verificationCode);
        } catch (error) {
            try {
                await prisma.user.updateMany({
                    where: {
                        id: user.id,
                        emailVerificationTokenHash: verificationCodeHash,
                        emailVerified: false,
                    },
                    data: {
                        emailVerificationTokenHash: null,
                        emailVerificationExpiresAt: null,
                        emailVerificationSentAt: null,
                    },
                });
            } catch {
                logger.error(
                    'Unable to invalidate an undelivered BCIP verification code',
                    undefined,
                    { operation: 'verification_code_cleanup' },
                );
            }
            throw error;
        }
        return { accepted: true };
    }

    async verifyEmail(token: string) {
        const user = await prisma.user.findFirst({
            where: {
                emailVerificationTokenHash: this.hashToken(token),
                emailVerificationExpiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                email: true,
                accountType: true,
                tenantId: true,
                firebaseUid: true,
            },
        });
        if (!user) throw Errors.validation('Verification token is invalid or expired');

        return this.completeEmailVerification(user, this.hashToken(token));
    }

    async verifyEmailCode(email: string, code: string) {
        const verificationCodeHash = this.hashVerificationCode(code);
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                accountType: true,
                tenantId: true,
                firebaseUid: true,
                emailVerified: true,
                emailVerificationTokenHash: true,
                emailVerificationExpiresAt: true,
            },
        });
        if (
            !user ||
            user.emailVerified ||
            !user.emailVerificationTokenHash ||
            !user.emailVerificationExpiresAt ||
            user.emailVerificationExpiresAt <= new Date()
        ) {
            throw Errors.validation('Verification code is invalid or expired');
        }

        const storedHash = Buffer.from(user.emailVerificationTokenHash, 'hex');
        const submittedHash = Buffer.from(verificationCodeHash, 'hex');
        if (
            storedHash.length !== submittedHash.length ||
            !crypto.timingSafeEqual(storedHash, submittedHash)
        ) {
            throw Errors.validation('Verification code is invalid or expired');
        }

        return this.completeEmailVerification(user, verificationCodeHash);
    }

    private async completeEmailVerification(
        user: PendingEmailVerification,
        verificationHash: string,
    ) {
        if (user.firebaseUid) {
            try {
                await this.firebaseAdmin.verifyEmail(user.firebaseUid);
            } catch {
                throw Errors.internalError(
                    'Email verification could not be completed. Please try again.',
                );
            }
        }

        const verified = await prisma.$transaction(async (transaction) => {
            const result = await transaction.user.updateMany({
                where: {
                    id: user.id,
                    emailVerificationTokenHash: verificationHash,
                    emailVerificationExpiresAt: { gt: new Date() },
                    emailVerified: false,
                },
                data: {
                    emailVerified: true,
                    emailVerificationTokenHash: null,
                    emailVerificationExpiresAt: null,
                    emailVerificationSentAt: null,
                },
            });
            if (result.count !== 1) {
                throw Errors.validation('Verification token is invalid or expired');
            }

            if (user.accountType === 'BUSINESS') {
                await transaction.tenant.update({
                    where: { id: user.tenantId },
                    data: { isActive: true, businessVerified: true },
                });
            }
            return result;
        });
        if (verified.count !== 1) throw Errors.validation('Verification token is invalid or expired');
        return { id: user.id, email: user.email, emailVerified: true };
    }

    async login(data: LoginDto) {
        const user = await prisma.user.findUnique({ where: { email: data.email }, include: { tenant: true } });
        const passwordMatches = await bcrypt.compare(
            data.password,
            user?.passwordHash ?? dummyPasswordHash,
        );
        if (!user || !passwordMatches) {
            throw Errors.invalidCredentials();
        }
        this.assertAccountCanLogin(user);
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return {
            ...this.toAccountResponse(user, user.tenant),
            token: this.generateToken(user.id, user.role, user.tenantId),
        };
    }

    async createFirebaseSession(firebaseUid: string) {
        const user = await prisma.user.findUnique({
            where: { firebaseUid },
            include: { tenant: true },
        });
        if (!user) throw Errors.unauthorized('Invalid or expired authentication token');
        return this.createSessionForAccount(user);
    }

    async createSessionForUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true },
        });
        if (!user) throw Errors.unauthorized('Invalid or expired authentication token');
        return this.createSessionForAccount(user);
    }

    private async createSessionForAccount(
        user: AccountWithTenant,
    ) {
        this.assertAccountCanLogin(user);
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        return {
            ...this.toAccountResponse(user, user.tenant),
            token: this.generateToken(user.id, user.role, user.tenantId),
        };
    }

    async bootstrapFirebaseLogin(data: LoginDto): Promise<{ customToken: string }> {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: { tenant: true },
        });
        const passwordMatches = await bcrypt.compare(
            data.password,
            user?.passwordHash ?? dummyPasswordHash,
        );
        if (!user || !passwordMatches) {
            throw Errors.invalidCredentials();
        }
        this.assertAccountCanLogin(user);

        if (user.firebaseUid) {
            try {
                return {
                    customToken: await this.firebaseLoginAdmin.createCustomToken(
                        user.firebaseUid,
                    ),
                };
            } catch {
                throw Errors.internalError(
                    'We could not complete sign-in with the identity service. Please try again.',
                );
            }
        }

        let existingFirebaseIdentity: { uid: string } | undefined;
        try {
            existingFirebaseIdentity = await this.firebaseLoginAdmin.getUserByEmail(
                user.email,
            );
        } catch (error) {
            if (!hasFirebaseErrorCode(error, 'auth/user-not-found')) {
                throw Errors.internalError(
                    'We could not complete sign-in with the identity service. Please try again.',
                );
            }
        }
        if (existingFirebaseIdentity) {
            throw Errors.duplicateRequest(
                'This account needs support before it can be connected to BCIP sign-in.',
            );
        }

        // A new Firebase identity is created only after the existing BCIP password
        // has been verified; email alone is never used to link it.
        let firebaseUser: { uid: string };
        try {
            firebaseUser = await this.firebaseLoginAdmin.createUser({
                email: user.email,
                password: data.password,
                displayName: user.fullName,
                emailVerified: true,
                disabled: false,
            });
        } catch (error) {
            if (hasFirebaseErrorCode(error, 'auth/email-already-exists')) {
                throw Errors.duplicateRequest(
                    'This account needs support before it can be connected to BCIP sign-in.',
                );
            }
            throw Errors.internalError(
                'We could not complete sign-in with the identity service. Please try again.',
            );
        }

        try {
            const linked = await prisma.user.updateMany({
                where: { id: user.id, firebaseUid: null },
                data: { firebaseUid: firebaseUser.uid },
            });
            if (linked.count !== 1) {
                throw Errors.duplicateRequest(
                    'This account could not be connected to BCIP sign-in. Please try again.',
                );
            }
        } catch (error) {
            try {
                await this.firebaseLoginAdmin.deleteUser(firebaseUser.uid);
            } catch {
                logger.error(
                    'Firebase login migration cleanup failed; manual reconciliation is required',
                    undefined,
                    { operation: 'login_migration_cleanup' },
                );
                throw Errors.internalError(
                    'Sign-in could not be completed. Please contact support.',
                );
            }
            if (error instanceof Error && 'code' in error && error.code === 'DUPLICATE_REQUEST') {
                throw error;
            }
            throw Errors.internalError(
                'Sign-in could not be completed. Please try again.',
            );
        }

        try {
            return {
                customToken: await this.firebaseLoginAdmin.createCustomToken(
                    firebaseUser.uid,
                ),
            };
        } catch {
            throw Errors.internalError(
                'We could not complete sign-in with the identity service. Please try again.',
            );
        }
    }

    private assertAccountCanLogin(user: {
        isActive: boolean;
        emailVerified: boolean;
        accountType: string;
        tenant: { isActive: boolean; businessVerified: boolean };
    }): void {
        if (!user.isActive) {
            throw Errors.accountSuspended();
        }
        if (!user.emailVerified) {
            throw Errors.emailNotVerified();
        }
        if (user.accountType === 'BUSINESS' && !user.tenant.businessVerified) {
            throw Errors.businessVerificationPending();
        }
        if (!user.tenant.isActive) {
            throw Errors.accountSuspended();
        }
    }

    async forgotPassword(email: string) {
        emailService.assertVerificationEmailConfigured();

        const user = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: {
                id: true,
                email: true,
                isActive: true,
                passwordResetSentAt: true,
            },
        });

        // Anti-enumeration: If account does not exist or is suspended, return accepted without disclosure.
        if (!user || !user.isActive) {
            return { accepted: true };
        }

        const now = new Date();
        const cooldownMs = 60 * 1000;
        if (user.passwordResetSentAt && (now.getTime() - user.passwordResetSentAt.getTime()) < cooldownMs) {
            return { accepted: true };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetTokenHash: this.hashToken(resetToken),
                passwordResetExpiresAt: resetExpiresAt,
                passwordResetSentAt: now,
            },
        });

        await emailService.sendPasswordResetEmail(user.email, resetToken);
        return { accepted: true };
    }

    async resetPassword(data: { token: string; password: string }) {
        const tokenHash = this.hashToken(data.token.trim());
        const user = await prisma.user.findFirst({
            where: {
                passwordResetTokenHash: tokenHash,
                passwordResetExpiresAt: { gt: new Date() },
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                firebaseUid: true,
            },
        });

        if (!user) {
            throw Errors.validation('This password reset link is invalid or has expired.');
        }

        const newPasswordHash = await bcrypt.hash(data.password, 12);

        if (user.firebaseUid) {
            try {
                await this.firebaseAdmin.updatePassword(user.firebaseUid, data.password);
            } catch {
                throw Errors.internalError(
                    'Password could not be updated. Please try again.',
                );
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: newPasswordHash,
                passwordResetTokenHash: null,
                passwordResetExpiresAt: null,
                passwordResetSentAt: null,
            },
        });

        return {
            success: true,
            message: 'Password updated successfully. You can now sign in with your new password.',
        };
    }

    async getBusinessTrialStatus(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                accountType: true,
                role: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        businessTrial: true,
                    },
                },
            },
        });

        if (!user) throw Errors.notFound('Account');
        if (!['BUSINESS_ADMIN', 'MANAGER', 'AGENT', 'ESCALATION_AGENT'].includes(user.role)) {
            throw Errors.forbidden('Business trial access is only available to business accounts');
        }

        const trial = user.tenant.businessTrial;
        return {
            tenant: {
                id: user.tenant.id,
                name: user.tenant.name,
                slug: user.tenant.slug,
            },
            canAcceptTrial: user.accountType === 'BUSINESS' && user.role === 'BUSINESS_ADMIN',
            onboardingComplete: Boolean(user.tenant.businessTrial?.onboardingCompletedAt),
            complaintChannel: user.tenant.businessTrial?.complaintChannel ?? null,
            complaintPortalUrl: user.tenant.businessTrial?.complaintChannel === 'WEB_PORTAL'
                ? `/support/${encodeURIComponent(user.tenant.slug)}/complaint`
                : null,
            trial: trial
                ? getBusinessTrialState(
                    { acceptedAt: trial.acceptedAt, expiresAt: trial.expiresAt },
                )
                : null,
        };
    }

    async acceptBusinessTrial(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, accountType: true, role: true, tenantId: true },
        });

        if (!user) throw Errors.notFound('Account');
        if (user.accountType !== 'BUSINESS' || user.role !== 'BUSINESS_ADMIN') {
            throw Errors.forbidden('Only a business administrator can accept the trial');
        }
        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
            select: { businessVerified: true, isActive: true },
        });
        if (!tenant?.businessVerified || !tenant.isActive) {
            throw Errors.businessVerificationPending();
        }

        const existingTrial = await prisma.businessTrial.findUnique({
            where: { tenantId: user.tenantId },
            select: { acceptedAt: true, expiresAt: true },
        });
        if (existingTrial) {
            if (getBusinessTrialState(existingTrial).active) {
                return this.getBusinessTrialStatus(user.id);
            }
            throw Errors.forbidden('This business workspace has already used its 14-day trial');
        }

        const acceptedAt = new Date();
        const period = createBusinessTrialPeriod(acceptedAt);
        await prisma.$transaction(async (tx) => {
            await tx.businessTrial.upsert({
                where: { tenantId: user.tenantId },
                create: {
                    tenantId: user.tenantId,
                    acceptedByUserId: user.id,
                    acceptedAt: period.acceptedAt,
                    expiresAt: period.expiresAt,
                },
                update: {},
            });
        });

        return this.getBusinessTrialStatus(user.id);
    }

    async completeBusinessOnboarding(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, accountType: true, role: true, tenantId: true },
        });
        if (!user) throw Errors.notFound('Account');
        if (user.accountType !== 'BUSINESS' || user.role !== 'BUSINESS_ADMIN') {
            throw Errors.forbidden('Only a business administrator can configure the complaint channel');
        }

        const trial = await prisma.businessTrial.findUnique({
            where: { tenantId: user.tenantId },
            select: { acceptedAt: true, expiresAt: true, onboardingCompletedAt: true },
        });
        if (!trial || !getBusinessTrialState(trial).active) {
            throw Errors.forbidden('An active business trial is required to complete onboarding');
        }

        if (!trial.onboardingCompletedAt) {
            await prisma.businessTrial.update({
                where: { tenantId: user.tenantId },
                data: {
                    complaintChannel: 'WEB_PORTAL',
                    channelConfiguredAt: new Date(),
                    onboardingCompletedAt: new Date(),
                },
            });
        }
        return this.getBusinessTrialStatus(user.id);
    }

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { tenant: true, documents: true } });
        if (!user) throw Errors.notFound('Account');
        return this.toAccountResponse(user, user.tenant, user.documents);
    }

    async getProfileQr(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { tenant: true } });
        if (!user) throw Errors.notFound('Account');
        const payload = JSON.stringify({ version: 1, accountId: user.id, accountType: user.accountType, tenantId: user.tenantId, secret: user.profileQrSecret });
        return { payload, dataUrl: await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M' }) };
    }

    private toAccountResponse(
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string | null;
            role: string;
            accountType: string;
            emailVerified: boolean;
        },
        tenant: {
            id: string;
            name: string;
            slug: string;
            industry: string | null;
            website: string | null;
        },
        documents?: unknown,
    ) {
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                accountType: user.accountType,
                emailVerified: user.emailVerified,
                tenantId: tenant.id,
                tenantName: tenant.name,
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                industry: tenant.industry,
                website: tenant.website,
            },
            documents,
        };
    }
}

export const authService = new AuthService();
