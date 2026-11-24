import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { getBusinessPlanAccess } from '../billing/business-access.service';
import { emailService } from '../../services/emailService';
import { Errors } from '../../utils/error';
import type {
    AcceptBusinessInvitationInput,
    CreateBusinessInvitationInput,
} from './dto/business-onboarding.dto';

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const ACCEPTABLE_ROLES = ['MANAGER', 'AGENT', 'ESCALATION_AGENT'] as const;

function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

function assertRole(
    role: string,
): asserts role is (typeof ACCEPTABLE_ROLES)[number] {
    if (!ACCEPTABLE_ROLES.includes(role as (typeof ACCEPTABLE_ROLES)[number])) {
        throw Errors.forbidden('This role cannot be assigned through a business invitation');
    }
}

export class BusinessInvitationService {
    async create(userId: string, input: CreateBusinessInvitationInput) {
        const inviter = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                tenantId: true,
                role: true,
                accountType: true,
                tenant: { select: { name: true, isActive: true } },
            },
        });
        if (!inviter) throw Errors.notFound('Account');
        if (
            inviter.accountType !== 'BUSINESS' ||
            inviter.role !== 'BUSINESS_ADMIN' ||
            !inviter.tenant.isActive
        ) {
            throw Errors.forbidden('Only an active business administrator can invite team members');
        }
        assertRole(input.role);
        const access = await getBusinessPlanAccess(inviter.tenantId);
        if (!access.active || access.features?.team_management === false) {
            throw Errors.forbidden('Team invitations are not available for this workspace');
        }

        const email = input.email.trim().toLowerCase();
        const token = randomBytes(32).toString('base64url');
        const invitation = await prisma.$transaction(async transaction => {
            await transaction.$queryRaw`
                SELECT id FROM tenants WHERE id = ${inviter.tenantId} FOR UPDATE
            `;

            const existingUser = await transaction.user.findUnique({
                where: { email },
                select: { id: true },
            });
            if (existingUser) {
                throw Errors.duplicateRequest('An account already uses this email address');
            }
            const now = new Date();
            const pending = await transaction.businessInvitation.findFirst({
                where: {
                    tenantId: inviter.tenantId,
                    email,
                    acceptedAt: null,
                    expiresAt: { gt: now },
                },
                select: { id: true },
            });
            if (pending) {
                throw Errors.duplicateRequest('A pending invitation already exists for this email');
            }

            if (input.departmentId) {
                const department = await transaction.department.findFirst({
                    where: {
                        id: input.departmentId,
                        tenantId: inviter.tenantId,
                        isActive: true,
                    },
                    select: { id: true },
                });
                if (!department) throw Errors.notFound('Department');
            }
            const [activeMembers, pendingInvitations] = await Promise.all([
                transaction.user.count({
                    where: {
                        tenantId: inviter.tenantId,
                        isActive: true,
                        role: { not: 'CUSTOMER' },
                    },
                }),
                transaction.businessInvitation.count({
                    where: {
                        tenantId: inviter.tenantId,
                        acceptedAt: null,
                        expiresAt: { gt: now },
                    },
                }),
            ]);
            if (
                access.limits?.teamMembers !== null &&
                access.limits?.teamMembers !== undefined &&
                activeMembers + pendingInvitations >= access.limits.teamMembers
            ) {
                throw Errors.forbidden('This workspace has reached its team member limit');
            }

            const created = await transaction.businessInvitation.create({
                data: {
                    tenantId: inviter.tenantId,
                    email,
                    role: input.role,
                    departmentId: input.departmentId ?? null,
                    tokenHash: hashToken(token),
                    expiresAt: new Date(now.getTime() + INVITATION_LIFETIME_MS),
                    invitedByUserId: inviter.id,
                },
                select: { id: true, expiresAt: true },
            });
            await transaction.auditLog.create({
                data: {
                    tenantId: inviter.tenantId,
                    userId: inviter.id,
                    action: 'BUSINESS_MEMBER_INVITED',
                    entity: 'BusinessInvitation',
                    entityId: created.id,
                    newValue: { role: input.role, departmentId: input.departmentId ?? null },
                },
            });
            return created;
        });

        try {
            await emailService.sendBusinessInvitation(
                email,
                inviter.tenant.name,
                input.role,
                token,
            );
        } catch (error) {
            await prisma.$transaction(async transaction => {
                await transaction.auditLog.deleteMany({
                    where: {
                        tenantId: inviter.tenantId,
                        entity: 'BusinessInvitation',
                        entityId: invitation.id,
                        action: 'BUSINESS_MEMBER_INVITED',
                    },
                });
                await transaction.businessInvitation.deleteMany({
                    where: { id: invitation.id, acceptedAt: null },
                });
            });
            throw error;
        }

        return { id: invitation.id, email, role: input.role, expiresAt: invitation.expiresAt };
    }

    async inspect(token: string) {
        const invitation = await prisma.businessInvitation.findUnique({
            where: { tokenHash: hashToken(token) },
            select: {
                email: true,
                role: true,
                expiresAt: true,
                acceptedAt: true,
                tenant: { select: { name: true, isActive: true } },
            },
        });
        if (
            !invitation ||
            invitation.acceptedAt ||
            invitation.expiresAt <= new Date() ||
            !invitation.tenant.isActive
        ) {
            throw Errors.notFound('Valid invitation');
        }
        return {
            email: invitation.email,
            role: invitation.role,
            businessName: invitation.tenant.name,
            expiresAt: invitation.expiresAt,
        };
    }

    async accept(input: AcceptBusinessInvitationInput) {
        const tokenHash = hashToken(input.token);
        const invitationAccess = await prisma.businessInvitation.findUnique({
            where: { tokenHash },
            select: {
                tenantId: true,
                expiresAt: true,
                acceptedAt: true,
                tenant: { select: { isActive: true } },
            },
        });
        if (
            !invitationAccess ||
            invitationAccess.acceptedAt ||
            invitationAccess.expiresAt <= new Date() ||
            !invitationAccess.tenant.isActive
        ) {
            throw Errors.notFound('Valid invitation');
        }
        const access = await getBusinessPlanAccess(invitationAccess.tenantId);
        if (!access.active || access.features?.team_management === false) {
            throw Errors.forbidden('Team invitations are not available for this workspace');
        }
        const passwordHash = await bcrypt.hash(input.password, 12);

        return prisma.$transaction(async transaction => {
            await transaction.$queryRaw`
                SELECT id FROM tenants WHERE id = ${invitationAccess.tenantId} FOR UPDATE
            `;
            const invitation = await transaction.businessInvitation.findUnique({
                where: { tokenHash },
                select: {
                    id: true,
                    tenantId: true,
                    email: true,
                    role: true,
                    departmentId: true,
                    expiresAt: true,
                    acceptedAt: true,
                    tenant: { select: { name: true, isActive: true } },
                },
            });
            if (
                !invitation ||
                invitation.acceptedAt ||
                invitation.expiresAt <= new Date() ||
                !invitation.tenant.isActive
            ) {
                throw Errors.notFound('Valid invitation');
            }
            assertRole(invitation.role);
            const [activeMembers, pendingInvitations] = await Promise.all([
                transaction.user.count({
                    where: {
                        tenantId: invitation.tenantId,
                        isActive: true,
                        role: { not: 'CUSTOMER' },
                    },
                }),
                transaction.businessInvitation.count({
                    where: {
                        tenantId: invitation.tenantId,
                        acceptedAt: null,
                        expiresAt: { gt: new Date() },
                    },
                }),
            ]);
            if (
                access.limits?.teamMembers !== null &&
                access.limits?.teamMembers !== undefined &&
                activeMembers + pendingInvitations > access.limits.teamMembers
            ) {
                throw Errors.forbidden('This workspace has exceeded its team member limit');
            }
            if (await transaction.user.findUnique({
                where: { email: invitation.email },
                select: { id: true },
            })) {
                throw Errors.duplicateRequest('An account already uses this email address');
            }
            if (invitation.departmentId) {
                const department = await transaction.department.findFirst({
                    where: {
                        id: invitation.departmentId,
                        tenantId: invitation.tenantId,
                        isActive: true,
                    },
                    select: { id: true },
                });
                if (!department) throw Errors.notFound('Department');
            }

            const user = await transaction.user.create({
                data: {
                    email: invitation.email,
                    fullName: input.fullName,
                    passwordHash,
                    accountType: invitation.role === 'ESCALATION_AGENT'
                        ? 'ESCALATION_AGENT'
                        : 'EMPLOYEE',
                    role: invitation.role,
                    tenantId: invitation.tenantId,
                    departmentId: invitation.departmentId,
                    emailVerified: true,
                },
                select: { id: true },
            });
            const accepted = await transaction.businessInvitation.updateMany({
                where: {
                    id: invitation.id,
                    acceptedAt: null,
                    expiresAt: { gt: new Date() },
                },
                data: { acceptedAt: new Date() },
            });
            if (accepted.count !== 1) {
                throw Errors.duplicateRequest('This invitation has already been accepted');
            }
            await transaction.auditLog.create({
                data: {
                    tenantId: invitation.tenantId,
                    userId: user.id,
                    action: 'BUSINESS_INVITATION_ACCEPTED',
                    entity: 'BusinessInvitation',
                    entityId: invitation.id,
                    newValue: { role: invitation.role },
                },
            });
            return {
                businessName: invitation.tenant.name,
                email: invitation.email,
            };
        });
    }
}

export const businessInvitationService = new BusinessInvitationService();
