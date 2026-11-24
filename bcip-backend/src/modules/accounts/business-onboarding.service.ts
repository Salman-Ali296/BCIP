import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { Errors } from '../../utils/error';
import { getBusinessPlanAccess } from '../billing/business-access.service';
import {
    businessIdentitySchema,
    businessIntelligenceSchema,
    businessOperationsSchema,
    businessTeamSchema,
    businessWorkspaceSchema,
    TEAM_ROLE_LEVELS,
    type BusinessIdentityInput,
    type BusinessIntelligenceInput,
    type BusinessOperationsInput,
    type BusinessTeamInput,
    type BusinessWorkspaceInput,
} from './dto/business-onboarding.dto';

type OnboardingStepData =
    | BusinessIdentityInput
    | BusinessOperationsInput
    | BusinessIntelligenceInput
    | BusinessTeamInput
    | BusinessWorkspaceInput;

interface OnboardingDraft {
    '1'?: BusinessIdentityInput;
    '2'?: BusinessOperationsInput;
    '3'?: BusinessIntelligenceInput;
    '4'?: BusinessTeamInput;
    '5'?: BusinessWorkspaceInput;
}

function isRecord(value: Prisma.JsonValue | undefined): value is Prisma.JsonObject {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function draftFromJson(value: Prisma.JsonValue | undefined): OnboardingDraft {
    if (!isRecord(value)) return {};
    return value as OnboardingDraft;
}

type TeamRoleLevel = BusinessOperationsInput['teams'][number]['roleLevels'][number];

function teamRoleLevelsFromJson(value: Prisma.JsonValue | null): TeamRoleLevel[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap(item => {
        if (!isRecord(item)) return [];
        const { role, count } = item;
        if (
            typeof role !== 'string' ||
            !(TEAM_ROLE_LEVELS as readonly string[]).includes(role) ||
            typeof count !== 'number'
        ) {
            return [];
        }
        return [{ role: role as TeamRoleLevel['role'], count }];
    });
}

function requireStep(step: number): void {
    if (!Number.isInteger(step) || step < 1 || step > 5) {
        throw Errors.validation('Choose an onboarding step from 1 to 5');
    }
}

function validationSchema(step: number) {
    requireStep(step);
    switch (step) {
        case 1: return businessIdentitySchema;
        case 2: return businessOperationsSchema;
        case 3: return businessIntelligenceSchema;
        case 4: return businessTeamSchema;
        case 5: return businessWorkspaceSchema;
        default: throw Errors.validation('Choose an onboarding step from 1 to 5');
    }
}

function parseStep(step: number, data: unknown): OnboardingStepData {
    return validationSchema(step).parse(data) as OnboardingStepData;
}

async function getBusinessAdministrator(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            tenantId: true,
            role: true,
            accountType: true,
        },
    });
    if (!user) throw Errors.notFound('Account');
    if (user.accountType !== 'BUSINESS' || user.role !== 'BUSINESS_ADMIN') {
        throw Errors.forbidden('Only a business administrator can configure this workspace');
    }
    const access = await getBusinessPlanAccess(user.tenantId);
    if (!access.active) {
        throw Errors.forbidden('An active business trial or subscription is required for workspace setup');
    }
    return user;
}

async function ensureUsersBelongToTenant(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    userIds: Array<string | null | undefined>,
): Promise<void> {
    const ids = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
    if (!ids.length) return;

    const count = await transaction.user.count({
        where: {
            id: { in: ids },
            tenantId,
            isActive: true,
            role: { not: 'CUSTOMER' },
        },
    });
    if (count !== ids.length) {
        throw Errors.validation('Choose active team members from this business workspace');
    }
}

async function upsertSettings(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    data: Omit<Prisma.TenantSettingsUncheckedCreateInput, 'tenantId'>,
): Promise<void> {
    await transaction.tenantSettings.upsert({
        where: { tenantId },
        create: { ...data, tenantId },
        update: data,
    });
}

async function applyIdentity(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    input: BusinessIdentityInput,
): Promise<void> {
    await transaction.tenant.update({
        where: { id: tenantId },
        data: {
            name: input.businessName,
            legalName: input.legalBusinessName || null,
            website: input.website || null,
            industry: input.industry,
            teamSize: input.teamSize,
            country: input.country,
            timezone: input.timezone,
            email: input.primaryEmail,
            primaryContactName: input.primaryContactName,
            phone: input.phone,
            logoUrl: input.logoUrl || null,
        },
    });
}

async function applyOperations(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    input: BusinessOperationsInput,
): Promise<void> {
    await ensureUsersBelongToTenant(
        transaction,
        tenantId,
        input.departments.map(department => department.managerUserId),
    );

    const departmentsWithId = input.departments.filter(
        (department): department is typeof department & { id: string } => Boolean(department.id),
    );
    if (departmentsWithId.length) {
        const ownedDepartments = await transaction.department.count({
            where: {
                id: { in: departmentsWithId.map(department => department.id) },
                tenantId,
            },
        });
        if (ownedDepartments !== departmentsWithId.length) {
            throw Errors.notFound('Department');
        }
    }

    const existingTeams = await transaction.team.findMany({
        where: { tenantId },
        select: { id: true, name: true },
    });
    for (const team of input.teams) {
        const sameName = existingTeams.filter(
            existing => existing.name.toLocaleLowerCase() === team.name.toLocaleLowerCase(),
        );
        if (team.id) {
            if (sameName.some(existing => existing.id !== team.id)) {
                throw Errors.validation('A team with this name already exists in this workspace');
            }
        } else if (sameName.length > 1) {
            throw Errors.validation('This workspace has duplicate team names. Ask an administrator to resolve them.');
        } else if (sameName.length === 1) {
            team.id = sameName[0].id;
        }
    }

    const teamsWithId = input.teams.filter(
        (team): team is typeof team & { id: string } => Boolean(team.id),
    );
    if (teamsWithId.length) {
        const ownedTeams = await transaction.team.count({
            where: {
                id: { in: teamsWithId.map(team => team.id) },
                tenantId,
            },
        });
        if (ownedTeams !== teamsWithId.length) {
            throw Errors.notFound('Team');
        }
    }
    for (const team of input.teams) {
        const values = {
            name: team.name,
            description: team.description || null,
            roleLevels: team.roleLevels,
            isActive: team.isActive,
        };
        if (team.id) {
            await transaction.team.update({
                where: { id: team.id },
                data: values,
            });
        } else {
            const savedTeam = await transaction.team.create({
                data: { tenantId, ...values },
            });
            team.id = savedTeam.id;
        }
    }
    if (input.primaryTeamId) {
        const team = await transaction.team.findFirst({
            where: { id: input.primaryTeamId, tenantId, isActive: true },
            select: { id: true },
        });
        if (!team) throw Errors.validation('Choose an active team from this business workspace');
    }

    for (const department of input.departments) {
        const values = {
            name: department.name,
            description: department.description || null,
            managerUserId: department.managerUserId ?? null,
            isActive: department.isActive,
        };
        if (department.id) {
            await transaction.department.update({
                where: { id: department.id },
                data: values,
            });
        } else {
            await transaction.department.upsert({
                where: {
                    tenantId_name: { tenantId, name: department.name },
                },
                create: { tenantId, ...values },
                update: values,
            });
        }
    }

    const activeDepartmentNames = input.departments.flatMap(
        department => department.isActive ? [department.name] : [],
    );
    await transaction.department.updateMany({
        where: {
            tenantId,
            isActive: true,
            ...(activeDepartmentNames.length
                ? { name: { notIn: activeDepartmentNames } }
                : {}),
        },
        data: { isActive: false },
    });

    await upsertSettings(transaction, tenantId, {
        workingDays: input.workingDays,
        workingHourStart: input.workingHourStart,
        workingHourEnd: input.workingHourEnd,
        defaultResponseTargetMinutes: input.defaultResponseTargetMinutes,
        defaultResolutionTargetMinutes: input.defaultResolutionTargetMinutes,
        escalationThresholdMinutes: input.escalationThresholdMinutes,
        defaultSlaHours: Math.max(1, Math.ceil(input.defaultResolutionTargetMinutes / 60)),
        defaultPriority: input.defaultPriority,
        primaryTeamId: input.primaryTeamId,
    });
}

async function applyIntelligence(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    input: BusinessIntelligenceInput,
): Promise<void> {
    const providedIds = input.categories.flatMap(
        category => category.id ? [category.id] : [],
    );
    if (providedIds.length) {
        const ownedCount = await transaction.complaintCategory.count({
            where: { id: { in: providedIds }, tenantId },
        });
        if (ownedCount !== providedIds.length) throw Errors.notFound('Complaint category');
    }

    for (const category of input.categories) {
        const values = {
            name: category.name,
            description: category.description || null,
            defaultPriority: category.defaultPriority,
            isActive: category.isActive,
        };
        if (category.id) {
            await transaction.complaintCategory.update({
                where: { id: category.id },
                data: values,
            });
        } else {
            await transaction.complaintCategory.upsert({
                where: { tenantId_name: { tenantId, name: category.name } },
                create: { tenantId, keywords: [], ...values },
                update: values,
            });
        }
    }

    await upsertSettings(transaction, tenantId, {
        categorizationEnabled: input.ai.categorizationEnabled,
        sentimentEnabled: input.ai.sentimentEnabled,
        prioritySuggestionEnabled: input.ai.prioritySuggestionEnabled,
        similarityDetectionEnabled: input.ai.similarityDetectionEnabled,
        responseSuggestionEnabled: input.ai.responseSuggestionEnabled,
        summaryEnabled: input.ai.summaryEnabled,
        aiEnabled: Object.values(input.ai).some(Boolean),
    });
}

async function applyTeam(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    input: BusinessTeamInput,
): Promise<void> {
    await ensureUsersBelongToTenant(
        transaction,
        tenantId,
        input.members.map(member => member.userId),
    );
    const departmentIds = input.members.flatMap(
        member => member.departmentId ? [member.departmentId] : [],
    );
    if (departmentIds.length) {
        const count = await transaction.department.count({
            where: {
                id: { in: [...new Set(departmentIds)] },
                tenantId,
                isActive: true,
            },
        });
        if (count !== new Set(departmentIds).size) {
            throw Errors.validation('Choose active departments from this workspace');
        }
    }
    const teamIds = input.members.flatMap(member => member.teamId ? [member.teamId] : []);
    if (teamIds.length) {
        const count = await transaction.team.count({
            where: {
                id: { in: [...new Set(teamIds)] },
                tenantId,
                isActive: true,
            },
        });
        if (count !== new Set(teamIds).size) {
            throw Errors.validation('Choose active teams from this workspace');
        }
    }
    for (const member of input.members) {
        await transaction.user.updateMany({
            where: { id: member.userId, tenantId, role: { not: 'CUSTOMER' } },
            data: {
                departmentId: member.departmentId,
                teamId: member.teamId,
            },
        });
    }
}

async function applyWorkspace(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    input: BusinessWorkspaceInput,
): Promise<void> {
    await upsertSettings(transaction, tenantId, {
        workspaceDisplayName: input.workspaceDisplayName,
        primaryColor: input.primaryColor.toLowerCase(),
        dateFormat: input.dateFormat,
        defaultComplaintView: input.defaultComplaintView,
        defaultDashboardPeriod: input.defaultDashboardPeriod,
        newComplaintNotification: input.notifications.newComplaint,
        highPriorityNotification: input.notifications.highPriority,
        escalationNotification: input.notifications.escalation,
        assignmentNotification: input.notifications.assignment,
        weeklySummary: input.notifications.weeklySummary,
        emailNotifications: input.notifications.email,
        inAppNotifications: input.notifications.inApp,
    });
}

async function applyStep(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    step: number,
    input: OnboardingStepData,
): Promise<void> {
    switch (step) {
        case 1: return applyIdentity(transaction, tenantId, input as BusinessIdentityInput);
        case 2: return applyOperations(transaction, tenantId, input as BusinessOperationsInput);
        case 3: return applyIntelligence(transaction, tenantId, input as BusinessIntelligenceInput);
        case 4: return applyTeam(transaction, tenantId, input as BusinessTeamInput);
        case 5: return applyWorkspace(transaction, tenantId, input as BusinessWorkspaceInput);
        default: throw Errors.validation('Choose an onboarding step from 1 to 5');
    }
}

export class BusinessOnboardingService {
    async get(userId: string) {
        const user = await getBusinessAdministrator(userId);
        const [tenant, progress, departments, teams, categories, users, invitations] =
            await Promise.all([
                prisma.tenant.findUnique({
                    where: { id: user.tenantId },
                    select: {
                        id: true,
                        name: true,
                        legalName: true,
                        slug: true,
                        email: true,
                        phone: true,
                        website: true,
                        industry: true,
                        teamSize: true,
                        country: true,
                        timezone: true,
                        primaryContactName: true,
                        logoUrl: true,
                        complaintChannel: true,
                        onboardingCompletedAt: true,
                    },
                }),
                prisma.businessOnboarding.findUnique({ where: { tenantId: user.tenantId } }),
                prisma.department.findMany({
                    where: { tenantId: user.tenantId },
                    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        managerUserId: true,
                        isActive: true,
                    },
                }),
                prisma.team.findMany({
                    where: { tenantId: user.tenantId },
                    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
                    select: { id: true, name: true, description: true, roleLevels: true, isActive: true },
                }),
                prisma.complaintCategory.findMany({
                    where: { tenantId: user.tenantId },
                    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        defaultPriority: true,
                        isActive: true,
                    },
                }),
                prisma.user.findMany({
                    where: {
                        tenantId: user.tenantId,
                        isActive: true,
                        role: { not: 'CUSTOMER' },
                    },
                    orderBy: { fullName: 'asc' },
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        departmentId: true,
                        teamId: true,
                    },
                }),
                prisma.businessInvitation.findMany({
                    where: {
                        tenantId: user.tenantId,
                        acceptedAt: null,
                        expiresAt: { gt: new Date() },
                    },
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        expiresAt: true,
                        department: { select: { name: true } },
                    },
                }),
            ]);
        if (!tenant) throw Errors.notFound('Business account');

        const settings = await prisma.tenantSettings.findUnique({
            where: { tenantId: user.tenantId },
            select: {
                workingDays: true,
                workingHourStart: true,
                workingHourEnd: true,
                defaultResponseTargetMinutes: true,
                defaultResolutionTargetMinutes: true,
                escalationThresholdMinutes: true,
                defaultPriority: true,
                primaryTeamId: true,
                categorizationEnabled: true,
                sentimentEnabled: true,
                prioritySuggestionEnabled: true,
                similarityDetectionEnabled: true,
                responseSuggestionEnabled: true,
                summaryEnabled: true,
                workspaceDisplayName: true,
                primaryColor: true,
                dateFormat: true,
                defaultComplaintView: true,
                defaultDashboardPeriod: true,
                newComplaintNotification: true,
                highPriorityNotification: true,
                escalationNotification: true,
                assignmentNotification: true,
                weeklySummary: true,
                emailNotifications: true,
                inAppNotifications: true,
            },
        });
        const draft = draftFromJson(progress?.draft);
        const teamDrafts = teams.map(team => ({
            ...team,
            description: team.description ?? '',
            roleLevels: teamRoleLevelsFromJson(team.roleLevels),
        }));
        return {
            tenant,
            progress: {
                currentStep: progress?.currentStep ?? 1,
                completedThrough: progress?.completedThrough ?? 0,
                version: progress?.version ?? 0,
                completedAt: progress?.completedAt ?? tenant.onboardingCompletedAt,
            },
            steps: {
                '1': draft['1'] ?? {
                    businessName: tenant.name,
                    legalBusinessName: tenant.legalName ?? '',
                    website: tenant.website ?? '',
                    industry: tenant.industry ?? '',
                    teamSize: tenant.teamSize ?? '',
                    country: tenant.country ?? '',
                    timezone: tenant.timezone,
                    primaryEmail: tenant.email,
                    primaryContactName: tenant.primaryContactName ?? '',
                    phone: tenant.phone ?? '',
                    logoUrl: tenant.logoUrl ?? '',
                },
                '2': draft['2'] ? {
                    ...draft['2'],
                    teams: draft['2'].teams ?? teamDrafts,
                } : {
                    departments,
                    teams: teamDrafts,
                    workingDays: settings?.workingDays ?? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
                    workingHourStart: settings?.workingHourStart ?? '09:00',
                    workingHourEnd: settings?.workingHourEnd ?? '17:00',
                    defaultResponseTargetMinutes: settings?.defaultResponseTargetMinutes ?? 120,
                    defaultResolutionTargetMinutes: settings?.defaultResolutionTargetMinutes ?? 2880,
                    escalationThresholdMinutes: settings?.escalationThresholdMinutes ?? 60,
                    defaultPriority: settings?.defaultPriority ?? 'MEDIUM',
                    primaryTeamId: settings?.primaryTeamId ?? null,
                },
                '3': draft['3'] ?? {
                    categories,
                    ai: {
                        categorizationEnabled: settings?.categorizationEnabled ?? true,
                        sentimentEnabled: settings?.sentimentEnabled ?? true,
                        prioritySuggestionEnabled: settings?.prioritySuggestionEnabled ?? true,
                        similarityDetectionEnabled: settings?.similarityDetectionEnabled ?? true,
                        responseSuggestionEnabled: settings?.responseSuggestionEnabled ?? true,
                        summaryEnabled: settings?.summaryEnabled ?? true,
                    },
                },
                '4': draft['4'] ?? {
                    members: users.map(({ id, departmentId, teamId }) => ({
                        userId: id,
                        departmentId,
                        teamId,
                    })),
                },
                '5': draft['5'] ? {
                    ...draft['5'],
                    notifications: {
                        newComplaint: draft['5'].notifications.newComplaint,
                        highPriority: draft['5'].notifications.highPriority,
                        escalation: draft['5'].notifications.escalation,
                        assignment: draft['5'].notifications.assignment,
                        weeklySummary: draft['5'].notifications.weeklySummary,
                        email: draft['5'].notifications.email ?? settings?.emailNotifications ?? true,
                        inApp: draft['5'].notifications.inApp ?? settings?.inAppNotifications ?? true,
                    },
                } : {
                    workspaceDisplayName: settings?.workspaceDisplayName ?? tenant.name,
                    primaryColor: settings?.primaryColor ?? '#6334a3',
                    dateFormat: settings?.dateFormat ?? 'MMM d, yyyy',
                    defaultComplaintView: settings?.defaultComplaintView ?? 'inbox',
                    defaultDashboardPeriod: settings?.defaultDashboardPeriod ?? '30d',
                    notifications: {
                        newComplaint: settings?.newComplaintNotification ?? true,
                        highPriority: settings?.highPriorityNotification ?? true,
                        escalation: settings?.escalationNotification ?? true,
                        assignment: settings?.assignmentNotification ?? true,
                        weeklySummary: settings?.weeklySummary ?? false,
                        email: settings?.emailNotifications ?? true,
                        inApp: settings?.inAppNotifications ?? true,
                    },
                },
            },
            departments,
            teams: teamDrafts,
            categories,
            users,
            invitations,
        };
    }

    async saveStep(userId: string, step: number, version: number, data: unknown) {
        requireStep(step);
        if (!Number.isInteger(version) || version < 0) {
            throw Errors.validation('Refresh the workspace before saving changes');
        }
        const user = await getBusinessAdministrator(userId);
        const parsed = parseStep(step, data);

        await prisma.$transaction(async transaction => {
            const current = await transaction.businessOnboarding.upsert({
                where: { tenantId: user.tenantId },
                create: { tenantId: user.tenantId },
                update: { updatedAt: new Date() },
            });
            if (step > current.currentStep) {
                throw Errors.validation('Complete the earlier workspace steps before continuing');
            }
            if (current.version !== version) {
                throw Errors.duplicateRequest(
                    'This workspace changed in another tab. Refresh and review the latest saved information.',
                );
            }
            await applyStep(transaction, user.tenantId, step, parsed);
            const nextDraft = {
                ...draftFromJson(current.draft),
                [String(step)]: parsed,
            };
            const updated = await transaction.businessOnboarding.updateMany({
                where: { tenantId: user.tenantId, version },
                data: {
                    currentStep: Math.max(current.currentStep, Math.min(step + 1, 5)),
                    completedThrough: Math.max(current.completedThrough, step),
                    version: { increment: 1 },
                    draft: nextDraft as Prisma.InputJsonValue,
                },
            });
            if (updated.count !== 1) {
                throw Errors.duplicateRequest(
                    'This workspace changed in another tab. Refresh and review the latest saved information.',
                );
            }
            await transaction.auditLog.create({
                data: {
                    tenantId: user.tenantId,
                    userId: user.id,
                    action: 'BUSINESS_ONBOARDING_STEP_SAVED',
                    entity: 'BusinessOnboarding',
                    entityId: current.id,
                    newValue: { step },
                },
            });
        });
        return this.get(userId);
    }

    async complete(userId: string, version: number) {
        const user = await getBusinessAdministrator(userId);
        return prisma.$transaction(async transaction => {
            const progress = await transaction.businessOnboarding.findUnique({
                where: { tenantId: user.tenantId },
            });
            if (!progress || progress.completedThrough < 5) {
                throw Errors.validation('Save all five workspace steps before completing setup');
            }
            if (progress.version !== version) {
                throw Errors.duplicateRequest(
                    'This workspace changed in another tab. Refresh and review the latest saved information.',
                );
            }
            if (progress.completedAt) {
                throw Errors.duplicateRequest('This business workspace has already completed onboarding');
            }
            const claimed = await transaction.businessOnboarding.updateMany({
                where: {
                    tenantId: user.tenantId,
                    version,
                    completedThrough: { gte: 5 },
                    completedAt: null,
                },
                data: { updatedAt: new Date() },
            });
            if (claimed.count !== 1) {
                throw Errors.duplicateRequest(
                    'This workspace changed in another tab. Refresh and review the latest saved information.',
                );
            }
            const draft = draftFromJson(progress.draft);
            const identity = businessIdentitySchema.parse(draft['1']);
            const operations = businessOperationsSchema.parse(draft['2']);
            const intelligence = businessIntelligenceSchema.parse(draft['3']);
            const team = businessTeamSchema.parse(draft['4']);
            const workspace = businessWorkspaceSchema.parse(draft['5']);

            await applyIdentity(transaction, user.tenantId, identity);
            await applyOperations(transaction, user.tenantId, operations);
            await applyIntelligence(transaction, user.tenantId, intelligence);
            await applyTeam(transaction, user.tenantId, team);
            await applyWorkspace(transaction, user.tenantId, workspace);

            const completedAt = new Date();
            await transaction.tenant.update({
                where: { id: user.tenantId },
                data: {
                    complaintChannel: 'WEB_PORTAL',
                    channelConfiguredAt: completedAt,
                    onboardingCompletedAt: completedAt,
                },
            });
            const completed = await transaction.businessOnboarding.updateMany({
                where: { tenantId: user.tenantId, version, completedAt: null },
                data: { completedAt, version: { increment: 1 } },
            });
            if (completed.count !== 1) {
                throw Errors.duplicateRequest(
                    'This workspace changed in another tab. Refresh and review the latest saved information.',
                );
            }
            await transaction.auditLog.create({
                data: {
                    tenantId: user.tenantId,
                    userId: user.id,
                    action: 'BUSINESS_ONBOARDING_COMPLETED',
                    entity: 'BusinessOnboarding',
                    entityId: progress.id,
                    newValue: { completedAt: completedAt.toISOString() },
                },
            });
            return { completedAt };
        }).then(async result => ({
            ...result,
            onboarding: await this.get(userId),
        }));
    }
}

export const businessOnboardingService = new BusinessOnboardingService();
