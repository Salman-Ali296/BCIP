import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { execFile } from 'node:child_process';
import { resolveMx, Resolver } from 'node:dns/promises';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { promisify } from 'node:util';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError, ErrorCode, Errors } from '../../utils/error';
import { getFirebaseAuth } from '../../config/firebase-admin';
import { logger } from '../../utils/logger';
import {
    EMAIL_VERIFICATION_CODE_TTL_MINUTES,
    emailService,
} from '../../services/emailService';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
    ChangeRegistrationEmailDto,
    CompleteBusinessRegistrationDto,
    UpdateRegistrationAccountDto,
} from './dto/business-registration.dto';
import {
    isPublicCustomerAccount,
    PUBLIC_CUSTOMER_ACCESS_MESSAGE,
} from './customer-access.policy';
import { isDisposableEmailAddress, isPersonalEmailAddress } from './dto/email-policy';
import { isUnapprovedBusinessAdministrator } from './business-approval.policy';

const verificationCodeLifetimeMs = EMAIL_VERIFICATION_CODE_TTL_MINUTES * 60 * 1000;
const dummyPasswordHash = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 12);
type AccountWithTenant = Prisma.UserGetPayload<{
    include: { tenant: true };
}>;
type PendingEmailVerification = Prisma.UserGetPayload<{
    select: {
        id: true;
        email: true;
        firebaseUid: true;
        accountType: true;
        role: true;
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
    updateEmail(uid: string, email: string): Promise<void>;
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
    updateEmail: async (uid, email) => {
        await getFirebaseAuth().updateUser(uid, { email, emailVerified: false, disabled: true });
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

type MailExchangeLookup = (domain: string) => Promise<boolean>;
const execFileAsync = promisify(execFile);

function getErrorCode(error: unknown): string | undefined {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string'
    ) {
        return error.code;
    }
    return undefined;
}

export function parseSystemMxLookupOutput(output: string): boolean | undefined {
    if (/timed out|server (?:failure|failed)|servfail|connection refused|refused|no response/i.test(output)) {
        return undefined;
    }
    if (/mail exchanger\s*=|MX preference\s*=/i.test(output)) {
        return true;
    }
    if (/non-existent domain|NXDOMAIN|no answer/i.test(output)) {
        return false;
    }
    if (/\bserver:\s*[^\r\n]+\r?\n\s*address:\s*[^\r\n]+/i.test(output)) {
        return false;
    }
    return undefined;
}

async function lookupMxWithSystemResolver(domain: string): Promise<boolean | undefined> {
    try {
        const { stdout, stderr } = await execFileAsync(
            'nslookup',
            ['-type=MX', domain],
            { timeout: 5_000, windowsHide: true },
        );
        return parseSystemMxLookupOutput(`${stdout}\n${stderr}`);
    } catch (error) {
        const output = [
            typeof error === 'object' && error !== null && 'stdout' in error ? error.stdout : '',
            typeof error === 'object' && error !== null && 'stderr' in error ? error.stderr : '',
        ].filter((value): value is string => typeof value === 'string').join('\n');
        return parseSystemMxLookupOutput(output);
    }
}

export async function domainHasMailExchangeRecord(domain: string): Promise<boolean> {
    try {
        return (await resolveMx(domain)).some(record => record.exchange.length > 0);
    } catch (error) {
        if (['ENODATA', 'ENOTFOUND', 'EAI_NODATA', 'EAI_NONAME'].includes(getErrorCode(error) ?? '')) {
            return false;
        }
        if (['ECONNREFUSED', 'ETIMEOUT', 'ESERVFAIL', 'EAI_AGAIN'].includes(getErrorCode(error) ?? '')) {
            const systemLookup = await lookupMxWithSystemResolver(domain);
            if (systemLookup !== undefined) {
                logger.warn('Node DNS MX lookup failed; system resolver fallback was used', {
                    operation: 'business_email_mx_lookup',
                    errorCode: getErrorCode(error),
                });
                return systemLookup;
            }
            try {
                const publicResolver = new Resolver({ timeout: 4_000, tries: 1 });
                publicResolver.setServers(['1.1.1.1', '8.8.8.8']);
                return (await publicResolver.resolveMx(domain)).some(record => record.exchange.length > 0);
            } catch (publicError) {
                if (['ENODATA', 'ENOTFOUND'].includes(getErrorCode(publicError) ?? '')) {
                    return false;
                }
            }
        }
        // DNS infrastructure is unreachable: do not block legitimate registrations.
        // Email ownership is still proven by the verification code step.
        logger.warn('Business email MX lookup unavailable; allowing domain', {
            operation: 'business_email_mx_lookup',
            errorCode: getErrorCode(error),
        });
        return true;
    }
}

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
        private readonly mailExchangeLookup: MailExchangeLookup = domainHasMailExchangeRecord,
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

    private createRegistrationContinuationToken(userId: string): string {
        return jwt.sign(
            { purpose: 'business_registration_completion', userId },
            env.JWT_SECRET,
            { expiresIn: '30m', algorithm: 'HS256' },
        );
    }

    async register(data: RegisterDto) {
        if (data.accountType !== 'BUSINESS') {
            throw Errors.forbidden(
                'Only business accounts can register. Customers can use the public complaint portal without an account.',
            );
        }

        const emailDomain = data.email.slice(data.email.lastIndexOf('@') + 1);
        if (!(await this.mailExchangeLookup(emailDomain))) {
            throw Errors.validation('Business email domain must have valid mail exchange records');
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

        const role = 'BUSINESS_ADMIN';

        let result: {
            user: Awaited<ReturnType<typeof prisma.user.create>>;
            tenant: Awaited<ReturnType<typeof prisma.tenant.create>>;
        };
        try {
            result = await prisma.$transaction(async (tx) => {
                const tenant = await tx.tenant.create({
                    data: {
                        name: data.workspaceName ?? data.businessName ?? 'Business registration pending',
                        slug: `${(data.businessName ?? data.workspaceName ?? 'business-pending').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
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

                await tx.auditLog.create({
                    data: {
                        action: 'BUSINESS_REGISTRATION_POLICIES_ACCEPTED',
                        entity: 'Tenant',
                        entityId: tenant.id,
                        userId: user.id,
                        tenantId: tenant.id,
                        newValue: {
                            termsAccepted: true,
                            privacyPolicyAccepted: true,
                            acceptedAt: new Date().toISOString(),
                        },
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

        // Deliver in the background: Gmail SMTP can take 5-12s, which would make
        // the registration request hit the frontend proxy timeout. On failure the
        // code is cleared so the user can immediately use "Resend code".
        void emailService.sendVerificationCode(user.email, verificationCode).catch(async () => {
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
        });
        return { accepted: true };
    }

    async changeRegistrationEmail(data: ChangeRegistrationEmailDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                firebaseUid: true,
                accountType: true,
                role: true,
                emailVerified: true,
                emailVerificationSentAt: true,
                tenantId: true,
                tenant: {
                    select: {
                        isActive: true,
                        businessVerified: true,
                        industry: true,
                    },
                },
            },
        });
        const passwordMatches = await bcrypt.compare(
            data.password,
            user?.passwordHash ?? dummyPasswordHash,
        );
        if (!user || !passwordMatches || user.accountType !== 'BUSINESS' || user.role !== 'BUSINESS_ADMIN') {
            throw Errors.invalidCredentials();
        }
        if (
            user.emailVerified &&
            (user.tenant.isActive || user.tenant.businessVerified || user.tenant.industry !== null)
        ) {
            throw Errors.forbidden('A verified email cannot be changed through registration');
        }
        if (data.email === data.newEmail) {
            throw Errors.validation('Enter a different email address');
        }
        if (isDisposableEmailAddress(data.newEmail) || isPersonalEmailAddress(data.newEmail)) {
            throw Errors.validation('Use a non-disposable business email address');
        }
        const emailDomain = data.newEmail.slice(data.newEmail.lastIndexOf('@') + 1);
        if (!(await this.mailExchangeLookup(emailDomain))) {
            throw Errors.validation('Business email domain must have valid mail exchange records');
        }

        const [existingUser, existingTenant] = await Promise.all([
            prisma.user.findUnique({ where: { email: data.newEmail }, select: { id: true } }),
            prisma.tenant.findUnique({ where: { email: data.newEmail }, select: { id: true } }),
        ]);
        if (existingUser || (existingTenant && existingTenant.id !== user.tenantId)) {
            throw Errors.duplicateRequest('This email address is already associated with an account');
        }
        if (!user.firebaseUid) {
            throw Errors.internalError('The identity account is unavailable. Please contact support.');
        }

        try {
            await this.firebaseAdmin.updateEmail(user.firebaseUid, data.newEmail);
        } catch {
            throw Errors.internalError('The email address could not be updated. Please try again.');
        }

        try {
            await prisma.$transaction(async transaction => {
                await transaction.user.update({
                    where: { id: user.id },
                    data: {
                        email: data.newEmail,
                        emailVerified: false,
                        emailVerificationTokenHash: null,
                        emailVerificationExpiresAt: null,
                        emailVerificationSentAt: null,
                    },
                });
                await transaction.tenant.update({
                    where: { id: user.tenantId },
                    data: { email: data.newEmail },
                });
            });
        } catch (error) {
            try {
                await this.firebaseAdmin.updateEmail(user.firebaseUid, user.email);
            } catch {
                logger.error('Firebase email rollback failed after registration email change', undefined, {
                    operation: 'registration_email_compensation',
                });
                throw Errors.internalError(
                    'The email change could not be completed. Contact support before trying again.',
                );
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw Errors.duplicateRequest('This email address is already associated with an account');
            }
            throw error;
        }

        return { accepted: true };
    }

    async completeBusinessRegistration(token: string, data: CompleteBusinessRegistrationDto) {
        let payload: string | jwt.JwtPayload;
        try {
            payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
        } catch {
            throw Errors.unauthorized('The registration session has expired. Verify your email again.');
        }

        if (
            typeof payload === 'string' ||
            payload.purpose !== 'business_registration_completion' ||
            typeof payload.userId !== 'string'
        ) {
            throw Errors.unauthorized('A valid registration session is required');
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                tenantId: true,
                email: true,
                emailVerified: true,
                accountType: true,
                role: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                        businessVerified: true,
                        phone: true,
                        country: true,
                        city: true,
                        businessAddress: true,
                        industry: true,
                        website: true,
                        teamSize: true,
                        description: true,
                    },
                },
            },
        });
        if (!user || !user.emailVerified || user.accountType !== 'BUSINESS' || user.role !== 'BUSINESS_ADMIN') {
            throw Errors.forbidden('Verify your business administrator email before completing registration');
        }
        if (user.tenant.isActive || user.tenant.businessVerified) {
            throw Errors.forbidden('This business registration is no longer pending');
        }

        const normalizedData = {
            ...data,
            website: data.website || null,
            businessAddress: data.businessAddress || null,
            description: data.description || null,
            evidenceUrl: data.evidenceUrl || null,
        };
        if (user.tenant.industry !== null) {
            const existingDocument = await prisma.accountDocument.findFirst({
                where: {
                    tenantId: user.tenantId,
                    documentType: 'BUSINESS_REGISTRATION',
                },
                select: { fileUrl: true, metadata: true },
            });
            const metadata =
                existingDocument?.metadata &&
                typeof existingDocument.metadata === 'object' &&
                !Array.isArray(existingDocument.metadata)
                    ? existingDocument.metadata
                    : null;
            const matchesExisting =
                user.tenant.name === data.businessName &&
                user.tenant.industry === data.industry &&
                user.tenant.website === normalizedData.website &&
                user.tenant.teamSize === data.teamSize &&
                user.tenant.phone === data.phone &&
                user.tenant.country === data.country &&
                user.tenant.city === data.city &&
                user.tenant.businessAddress === normalizedData.businessAddress &&
                user.tenant.description === normalizedData.description &&
                (normalizedData.evidenceUrl === null
                    ? existingDocument === null
                    : existingDocument?.fileUrl === normalizedData.evidenceUrl &&
                        metadata !== null &&
                        metadata.registrationNumber === (data.registrationNumber ?? null));
            if (matchesExisting) {
                return {
                    registrationReferenceId: user.tenantId,
                    emailVerified: user.emailVerified,
                    businessVerified: user.tenant.businessVerified,
                    businessApprovalStatus: user.tenant.businessVerified ? 'APPROVED' : 'PENDING_REVIEW',
                };
            }
            throw Errors.duplicateRequest('Business registration details have already been submitted');
        }

        const submittedAt = new Date();
        const businessSlugBase = data.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 100) || 'business';
        const businessSlug = `${businessSlugBase}-${user.tenantId.slice(-8)}`;
        const updated = await prisma.$transaction(async transaction => {
            const result = await transaction.tenant.updateMany({
                where: {
                    id: user.tenantId,
                    isActive: false,
                    businessVerified: false,
                    industry: null,
                },
                data: {
                    name: data.businessName,
                    slug: businessSlug,
                    phone: data.phone,
                    country: data.country,
                    city: data.city,
                    businessAddress: normalizedData.businessAddress,
                    industry: data.industry,
                    website: normalizedData.website,
                    teamSize: data.teamSize,
                    description: normalizedData.description,
                },
            });
            if (result.count !== 1) {
                throw Errors.duplicateRequest('Business registration details have already been submitted');
            }

            if (normalizedData.evidenceUrl) {
                await transaction.accountDocument.create({
                    data: {
                        tenantId: user.tenantId,
                        userId: user.id,
                        documentType: 'BUSINESS_REGISTRATION',
                        fileName: 'business-registration-evidence-link',
                        fileUrl: normalizedData.evidenceUrl,
                        metadata: {
                            country: data.country,
                            city: data.city,
                            businessAddress: normalizedData.businessAddress,
                            registrationNumber: data.registrationNumber ?? null,
                        },
                    },
                });
            }
            await transaction.auditLog.create({
                data: {
                    action: 'BUSINESS_REGISTRATION_SUBMITTED',
                    entity: 'Tenant',
                    entityId: user.tenantId,
                    userId: user.id,
                    tenantId: user.tenantId,
                    newValue: {
                        businessApprovalStatus: 'PENDING_REVIEW',
                        emailVerified: true,
                        confirmationAccepted: true,
                        submittedAt: submittedAt.toISOString(),
                    },
                },
            });
            return transaction.tenant.findUniqueOrThrow({
                where: { id: user.tenantId },
                select: { id: true, businessVerified: true },
            });
        });

        return {
            registrationReferenceId: updated.id,
            emailVerified: user.emailVerified,
            businessVerified: updated.businessVerified,
            businessApprovalStatus: updated.businessVerified ? 'APPROVED' : 'PENDING_REVIEW',
        };
    }

    async updateRegistrationAccount(token: string, data: UpdateRegistrationAccountDto) {
        let payload: string | jwt.JwtPayload;
        try {
            payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
        } catch {
            throw Errors.unauthorized('The registration session has expired. Verify your email again.');
        }
        if (
            typeof payload === 'string' ||
            payload.purpose !== 'business_registration_completion' ||
            typeof payload.userId !== 'string'
        ) {
            throw Errors.unauthorized('A valid registration session is required');
        }
        const userId = payload.userId;

        return prisma.$transaction(async transaction => {
            const user = await transaction.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    tenantId: true,
                    fullName: true,
                    phone: true,
                    emailVerified: true,
                    accountType: true,
                    role: true,
                    tenant: { select: { isActive: true, industry: true } },
                },
            });
            if (
                !user ||
                !user.emailVerified ||
                user.accountType !== 'BUSINESS' ||
                user.role !== 'BUSINESS_ADMIN' ||
                user.tenant.isActive ||
                user.tenant.industry !== null
            ) {
                throw Errors.forbidden('This registration account can no longer be edited');
            }

            await transaction.user.update({
                where: { id: user.id },
                data: { fullName: data.fullName, phone: data.phone },
            });
            await transaction.tenant.update({
                where: { id: user.tenantId },
                data: { phone: data.phone },
            });
            await transaction.auditLog.create({
                data: {
                    action: 'BUSINESS_REGISTRATION_ACCOUNT_UPDATED',
                    entity: 'Tenant',
                    entityId: user.tenantId,
                    userId: user.id,
                    tenantId: user.tenantId,
                    oldValue: { fullName: user.fullName, phone: user.phone },
                    newValue: { fullName: data.fullName, phone: data.phone },
                },
            });
        });
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
                firebaseUid: true,
                accountType: true,
                role: true,
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
                firebaseUid: true,
                accountType: true,
                role: true,
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

            return result;
        });
        if (verified.count !== 1) throw Errors.validation('Verification token is invalid or expired');
        return {
            id: user.id,
            email: user.email,
            emailVerified: true,
            ...(user.accountType === 'BUSINESS' && user.role === 'BUSINESS_ADMIN'
                ? { registrationToken: this.createRegistrationContinuationToken(user.id) }
                : {}),
        };
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
        role: string;
        tenant: { isActive: boolean; businessVerified: boolean };
    }): void {
        const unapprovedBusinessAdministrator =
            isUnapprovedBusinessAdministrator(user);
        if (isPublicCustomerAccount(user.accountType)) {
            throw Errors.forbidden(PUBLIC_CUSTOMER_ACCESS_MESSAGE);
        }
        if (!user.isActive) {
            throw Errors.accountSuspended();
        }
        if (!user.emailVerified) {
            throw Errors.emailNotVerified();
        }
        if (
            user.accountType === 'BUSINESS' &&
            !user.tenant.businessVerified &&
            !unapprovedBusinessAdministrator
        ) {
            throw Errors.businessVerificationPending();
        }
        if (!user.tenant.isActive && !unapprovedBusinessAdministrator) {
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
            businessVerified: boolean;
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
                businessVerified: tenant.businessVerified,
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
