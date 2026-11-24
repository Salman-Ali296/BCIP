import { ComplaintStatus, Priority, Prisma, Sentiment } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database';
import { aiService } from './aiService';
import { emailService } from './emailService';
import { logger } from '../utils/logger';
import { AppError, Errors } from '../utils/error';
import { sanitizeText } from '../utils/validators';
import { BUSINESS_PLAN_IDS } from '../modules/billing/business-plans';
import { getPlanForTenant } from '../modules/billing/plan-catalog.service';
import {
    getCurrentUsagePeriod,
    releaseUsageWithinTransaction,
    reserveUsageWithinTransaction,
} from '../modules/billing/usage.service';

interface CreateComplaintRequest {
    title: string;
    description: string;
    customerEmail: string;
    customerName: string;
    attachmentUrl?: string;
    tenantId: string;
    files?: ComplaintUploadFile[];
}

interface ComplaintUploadFile {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

function acceptingComplaintPortalWhere(now: Date): Prisma.TenantWhereInput {
    return {
        isActive: true,
        businessVerified: true,
        complaintChannel: 'WEB_PORTAL',
        onboardingCompletedAt: { not: null },
        slug: { not: 'bcip-public-consumer-platform' },
        OR: [
            {
                businessTrial: {
                    is: {
                        acceptedAt: { lte: now },
                        expiresAt: { gt: now },
                    },
                },
            },
            {
                subscriptionStatus: { in: ['active', 'trialing', 'demo_active'] },
                subscriptionPlan: { in: [...BUSINESS_PLAN_IDS] },
                OR: [
                    { subscriptionCurrentPeriodEnd: null },
                    { subscriptionCurrentPeriodEnd: { gt: now } },
                ],
            },
        ],
    };
}

export class ComplaintService {
    /**
     * Create complaint with AI processing
     *
     * The transaction contains database work only (usage, customer, complaint,
     * attachments, assignment, AI quota reservation). AI analysis runs after
     * commit and is best-effort: on failure the saved complaint is returned and
     * the AI quota reservation is released.
     * - If email fails, complaint and AI results are still saved
     */
    async createComplaint(request: CreateComplaintRequest) {
        const {
            title,
            description,
            customerEmail,
            customerName,
            attachmentUrl,
            tenantId,
            files = [],
        } = request;

        const trackingId = this.generateTrackingId();
        const sanitizedDescription = sanitizeText(description);

        logger.info('Creating complaint', { tenantId });

        try {
            const now = new Date();
            const tenant = await prisma.tenant.findFirst({
                where: {
                    ...acceptingComplaintPortalWhere(now),
                    id: tenantId,
                },
                select: { id: true },
            });
            if (!tenant) {
                throw Errors.forbidden('This business complaint portal is not accepting complaints');
            }
            const plan = await getPlanForTenant(tenantId);
            if (!plan) {
                throw Errors.forbidden('This business plan is not available for complaint submissions');
            }

            const candidates = await prisma.complaint.findMany({
                where: { tenantId },
                select: { id: true, title: true, description: true },
                orderBy: { createdAt: 'desc' },
                take: 100,
            });

            let aiProcessingDeferred = false;
            let evidenceOmitted = false;
            const usagePeriod = getCurrentUsagePeriod(now);
            const { complaint: savedComplaint, hasAiCapacity } = await prisma.$transaction(async (tx) => {
                const hasComplaintCapacity = await reserveUsageWithinTransaction(
                    tx,
                    tenantId,
                    'complaints',
                    plan.complaintLimit,
                    usagePeriod,
                );
                if (!hasComplaintCapacity) {
                    throw Errors.forbidden(
                        'This business has reached its monthly complaint limit. Please contact the business directly.',
                    );
                }

                const customer = await tx.customer.upsert({
                    where: {
                        tenantId_email: {
                            tenantId,
                            email: customerEmail,
                        },
                    },
                    update: { fullName: customerName },
                    create: {
                        tenantId,
                        email: customerEmail,
                        fullName: customerName,
                    },
                });

                const complaint = await tx.complaint.create({
                    data: {
                        tenantId,
                        trackingId,
                        title,
                        description: sanitizedDescription,
                        customerId: customer.id,
                        status: 'OPEN',
                        priority: 'MEDIUM',
                        aiCategory: 'PENDING',
                        aiSentiment: 'NEUTRAL',
                        sentimentScore: 0,
                        aiPriority: 'MEDIUM',
                        isDuplicate: false,
                    },
                });

                if (files.length > 0) {
                    const requestedStorageBytes = files.reduce((total, file) => total + file.size, 0);
                    await tx.$queryRaw`
                        SELECT "id" FROM "tenants" WHERE "id" = ${tenantId} FOR UPDATE
                    `;
                    const storage = await tx.complaintAttachment.aggregate({
                        where: { complaint: { tenantId } },
                        _sum: { fileSize: true },
                    });
                    const existingStorageBytes = storage._sum.fileSize ?? 0;
                    const storageLimitBytes = plan.storageLimitMb === null
                        ? null
                        : plan.storageLimitMb * 1024 * 1024;
                    const hasStorageCapacity = storageLimitBytes === null ||
                        requestedStorageBytes <= storageLimitBytes - existingStorageBytes;
                    if (!hasStorageCapacity) {
                        evidenceOmitted = true;
                    } else {
                    await tx.complaintAttachment.createMany({
                        data: files.map((file) => {
                            const originalName = file.originalname
                                .replace(/[\\/\u0000-\u001f\u007f]/g, '_')
                                .slice(0, 255);
                            return {
                                complaintId: complaint.id,
                                fileName: originalName,
                                originalName,
                                mimeType: file.mimetype,
                                fileSize: file.size,
                                storageProvider: 'local-data-url',
                                fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                            };
                        }),
                    });
                    }
                }

                const teamMembers = await tx.user.findMany({
                    where: {
                        tenantId,
                        isActive: true,
                        role: { in: ['BUSINESS_ADMIN', 'MANAGER', 'AGENT'] },
                    },
                    select: {
                        id: true,
                        _count: {
                            select: {
                                assignedComplaints: {
                                    where: {
                                        status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] },
                                    },
                                },
                            },
                        },
                    },
                });
                const assignee = teamMembers.reduce<
                    { id: string; openAssignments: number } | undefined
                >((selected, member) => {
                    const candidate = {
                        id: member.id,
                        openAssignments: member._count.assignedComplaints,
                    };
                    return !selected || candidate.openAssignments < selected.openAssignments
                        ? candidate
                        : selected;
                }, undefined);

                let saved = complaint;
                if (assignee) {
                    saved = await tx.complaint.update({
                        where: { id: complaint.id },
                        data: { assignedToId: assignee.id },
                    });
                }

                const hasAiCapacity = await reserveUsageWithinTransaction(
                    tx,
                    tenantId,
                    'ai_analyses',
                    plan.aiAnalysisLimit,
                    usagePeriod,
                );
                if (!hasAiCapacity) {
                    aiProcessingDeferred = true;
                }

                return { complaint: saved, hasAiCapacity };
            });

            // AI analysis runs after commit so no locks are held while waiting on the AI service.
            let complaint = savedComplaint;
            if (hasAiCapacity) {
                let releaseAiUsage = false;
                try {
                    const aiPrediction = await aiService.predict({
                        text: `${title}\n${sanitizedDescription}`,
                        complaintId: complaint.id,
                        candidateTexts: candidates.map((candidate) =>
                            `${candidate.title}\n${candidate.description}`,
                        ),
                        candidateIds: candidates.map((candidate) => candidate.id),
                    });

                    complaint = await prisma.complaint.update({
                        where: { id: complaint.id, tenantId },
                        data: {
                            aiCategory: aiPrediction.category,
                            aiSentiment: aiPrediction.sentiment as Sentiment,
                            aiSentimentScore: aiPrediction.sentimentScore,
                            aiPriority: aiPrediction.priorityLevel as Priority,
                            priority: aiPrediction.priorityLevel as Priority,
                            isDuplicate: aiPrediction.isDuplicate,
                            duplicateOf: aiPrediction.duplicateOf
                                ? { connect: { id: aiPrediction.duplicateOf } }
                                : undefined,
                            suggestedResponse: aiPrediction.wasProcessed
                                ? this.buildSuggestedResponse(
                                    aiPrediction.category,
                                    aiPrediction.sentiment,
                                )
                                : null,
                            aiSummary: aiPrediction.wasProcessed
                                ? this.summarizeComplaint(title, sanitizedDescription)
                                : null,
                            aiProcessed: aiPrediction.wasProcessed,
                            aiProcessedAt: aiPrediction.wasProcessed ? new Date() : null,
                        },
                    });

                    releaseAiUsage = !aiPrediction.wasProcessed;
                } catch (aiError) {
                    releaseAiUsage = true;
                    logger.warn('AI analysis failed after the complaint was saved; returning the saved complaint', {
                        complaintId: complaint.id,
                        tenantId,
                        error: aiError instanceof Error ? aiError.message : String(aiError),
                    });
                }

                if (releaseAiUsage) {
                    try {
                        await prisma.$transaction((tx) =>
                            releaseUsageWithinTransaction(tx, tenantId, 'ai_analyses', usagePeriod),
                        );
                    } catch (releaseError) {
                        logger.warn('Failed to release AI usage reservation', {
                            complaintId: complaint.id,
                            tenantId,
                            error: releaseError instanceof Error ? releaseError.message : String(releaseError),
                        });
                    }
                }
            }

            if (aiProcessingDeferred || evidenceOmitted) {
                try {
                    const businessAdmins = await prisma.user.findMany({
                        where: { tenantId, role: 'BUSINESS_ADMIN', isActive: true },
                        select: { id: true },
                    });
                    if (businessAdmins.length > 0) {
                        const reasons = [
                            ...(aiProcessingDeferred ? ['AI analysis deferred at the plan limit'] : []),
                            ...(evidenceOmitted ? ['attachments were omitted at the storage limit'] : []),
                        ];
                        await prisma.notification.createMany({
                            data: businessAdmins.map(({ id }) => ({
                                tenantId,
                                userId: id,
                                complaintId: complaint.id,
                                type: 'SYSTEM',
                                title: 'A plan limit affected a new complaint',
                                message: `The complaint was retained; ${reasons.join(' and ')}.`,
                            })),
                        });
                    }
                } catch (notificationError) {
                    logger.error('Failed to notify business administrators about plan limits', notificationError);
                }
            }

            // 4. Log activity
            await prisma.statusHistory.create({
                data: {
                    complaintId: complaint.id,
                    toStatus: 'OPEN',
                },
            });

            // 5. Send confirmation email (async, don't block on failure)
            try {
                await emailService.sendComplaintConfirmation(
                    customerEmail,
                    customerName,
                    trackingId
                );
            } catch (emailError) {
                logger.error('Failed to send complaint confirmation email', emailError);
                // Don't throw - complaint already created
            }

            logger.info('Complaint created successfully', {
                tenantId,
                priority: complaint.priority,
            });

            if (aiProcessingDeferred || evidenceOmitted) {
                return {
                    ...complaint,
                    ...(aiProcessingDeferred
                        ? { notice: 'AI analysis was deferred because the business reached its plan limit.' }
                        : {}),
                    ...(evidenceOmitted
                        ? { evidenceNotice: 'The complaint was saved, but attachments exceeded the business storage limit.' }
                        : {}),
                };
            }

            return {
                id: complaint.id,
                trackingId,
                status: complaint.status,
                priority: complaint.priority,
                sentiment: complaint.aiSentiment,
                category: complaint.aiCategory,
                suggestedResponse: complaint.suggestedResponse,
                aiSummary: complaint.aiSummary,
                assignedToId: complaint.assignedToId,
            };
        } catch (error) {
            logger.error('Failed to create complaint', error, { tenantId });

            if (error instanceof AppError) {
                throw error;
            }

            if (error instanceof Error && error.message.includes('unique')) {
                throw Errors.duplicateRequest('Complaint with this tracking ID already exists');
            }

            throw Errors.databaseError(error);
        }
    }

    /**
     * Fetch complaints with filters and pagination
     */
    async listComplaints(
        tenantId: string | undefined,
        filters: {
            customerEmail?: string;
            status?: string;
            priority?: string;
            category?: string;
            sentiment?: string;
            search?: string;
            assignedToId?: string;
            unassigned?: boolean;
            page?: number;
            limit?: number;
        }
    ) {
        const page = Math.max(1, Math.floor(filters.page || 1));
        const limit = Math.min(Math.max(1, Math.floor(filters.limit || 20)), 100); // 1-100 per page
        const skip = (page - 1) * limit;
        const search = filters.search?.trim();
        const statusValues = filters.status
            ?.split(",")
            .filter((value): value is ComplaintStatus =>
                Object.values(ComplaintStatus).includes(value as ComplaintStatus),
            );
        const priorityValues = filters.priority
            ?.split(",")
            .filter((value): value is Priority =>
                Object.values(Priority).includes(value as Priority),
            );
        const categories = filters.category?.split(",").filter(Boolean);
        const where: Prisma.ComplaintWhereInput = {
            ...(tenantId ? { tenantId } : {}),
            ...(filters.customerEmail
                ? { customer: { is: { email: filters.customerEmail } } }
                : {}),
            ...(statusValues?.length && { status: { in: statusValues } }),
            ...(priorityValues?.length && { priority: { in: priorityValues } }),
            ...(categories?.length && { aiCategory: { in: categories } }),
            ...(filters.sentiment && { aiSentiment: filters.sentiment as Sentiment }),
            ...(filters.assignedToId && { assignedToId: filters.assignedToId }),
            ...(filters.unassigned && { assignedToId: null }),
            ...(search && {
                OR: [
                    { trackingId: { contains: search, mode: "insensitive" } },
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                    {
                        customer: {
                            is: {
                                OR: [
                                    { fullName: { contains: search, mode: "insensitive" } },
                                    { email: { contains: search, mode: "insensitive" } },
                                ],
                            },
                        },
                    },
                ],
            }),
        };

        try {
            const [complaints, total] = await Promise.all([
                prisma.complaint.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        trackingId: true,
                        title: true,
                        priority: true,
                        status: true,
                        aiCategory: true,
                        aiSentiment: true,
                        suggestedResponse: true,
                        aiSummary: true,
                        assignedToId: true,
                        customer: { select: { email: true } },
                        createdAt: true,
                    },
                }),
                prisma.complaint.count({
                    where,
                }),
            ]);

            return {
                data: complaints.map((complaint) => ({
                    ...complaint,
                    category: complaint.aiCategory ?? 'GENERAL',
                    sentiment: complaint.aiSentiment,
                    customerEmail: complaint.customer?.email ?? null,
                })),
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error('Failed to list complaints', error, { tenantId });
            throw Errors.databaseError(error);
        }
    }

    async getComplaint(complaintId: string, tenantId: string) {
        try {
            const complaint = await prisma.complaint.findFirst({
                where: { id: complaintId, tenantId },
                include: {
                    customer: { select: { email: true, fullName: true } },
                    statusHistory: { orderBy: { changedAt: 'asc' } },
                },
            });

            if (!complaint) {
                throw Errors.notFound('Complaint');
            }

            return {
                ...complaint,
                category: complaint.aiCategory ?? 'GENERAL',
                sentiment: complaint.aiSentiment,
                customerEmail: complaint.customer?.email ?? null,
            };
        } catch (error) {
            logger.error('Failed to get complaint', error, { complaintId, tenantId });
            if (error instanceof AppError) {
                throw error;
            }
            throw Errors.databaseError(error);
        }
    }

    async getComplaintForCustomer(complaintId: string, customerEmail: string) {
        try {
            const complaint = await prisma.complaint.findFirst({
                where: {
                    id: complaintId,
                    customer: { is: { email: customerEmail } },
                },
                include: {
                    customer: { select: { email: true, fullName: true } },
                    statusHistory: { orderBy: { changedAt: 'asc' } },
                },
            });

            if (!complaint) {
                throw Errors.notFound('Complaint');
            }

            return {
                ...complaint,
                category: complaint.aiCategory ?? 'GENERAL',
                sentiment: complaint.aiSentiment,
                customerEmail: complaint.customer?.email ?? null,
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Failed to get customer complaint', error, { complaintId });
            throw Errors.databaseError(error);
        }
    }

    async getComplaintByTrackingId(trackingId: string) {
        const complaint = await prisma.complaint.findUnique({
            where: { trackingId },
            include: {
                customer: { select: { email: true, fullName: true } },
                statusHistory: { orderBy: { changedAt: 'asc' } },
            },
        });

        if (!complaint) throw Errors.notFound('Complaint');
        return complaint;
    }

    async addAttachments(
        complaintId: string,
        tenantId: string,
        files: Array<{ originalname: string; mimetype: string; size: number; buffer: Buffer }>,
    ) {
        const complaint = await prisma.complaint.findFirst({
            where: { id: complaintId, tenantId },
        });
        if (!complaint) throw Errors.notFound('Complaint');
        const plan = await getPlanForTenant(tenantId);
        if (!plan) throw Errors.forbidden('This business plan is not available for evidence uploads');

        return prisma.$transaction(async (tx) => {
            const requestedStorageBytes = files.reduce((total, file) => total + file.size, 0);
            await tx.$queryRaw`
                SELECT "id" FROM "tenants" WHERE "id" = ${tenantId} FOR UPDATE
            `;
            const currentStorage = await tx.complaintAttachment.aggregate({
                where: { complaint: { tenantId } },
                _sum: { fileSize: true },
            });
            const existingStorageBytes = currentStorage._sum.fileSize ?? 0;
            const limitBytes = plan.storageLimitMb === null
                ? null
                : plan.storageLimitMb * 1024 * 1024;
            if (
                limitBytes !== null &&
                requestedStorageBytes > limitBytes - existingStorageBytes
            ) {
                throw Errors.forbidden(
                    'The evidence storage limit has been reached. The complaint remains saved; these attachments were not uploaded.',
                );
            }

            return tx.complaintAttachment.createMany({
                data: files.map((file) => ({
                    complaintId,
                    fileName: file.originalname,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    fileSize: file.size,
                    storageProvider: 'local-data-url',
                    fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                })),
            });
        });
    }

    async listAcceptingComplaintPortals(search?: string) {
        const now = new Date();
        const normalizedSearch = search?.trim();
        try {
            return await prisma.tenant.findMany({
                where: {
                    ...acceptingComplaintPortalWhere(now),
                    ...(normalizedSearch
                        ? {
                              AND: [
                                  {
                                      OR: [
                                          {
                                              name: {
                                                  contains: normalizedSearch,
                                                  mode: 'insensitive',
                                              },
                                          },
                                          {
                                              slug: {
                                                  contains: normalizedSearch,
                                                  mode: 'insensitive',
                                              },
                                          },
                                      ],
                                  },
                              ],
                          }
                        : {}),
                },
                select: { id: true, name: true, slug: true },
                orderBy: { name: 'asc' },
                take: 50,
            });
        } catch (error) {
            logger.error('Failed to list public complaint portals', error);
            throw Errors.databaseError(error);
        }
    }

    async getTenantBySlug(slug: string) {
        const now = new Date();
        const tenant = await prisma.tenant.findFirst({
            where: {
                ...acceptingComplaintPortalWhere(now),
                slug,
            },
            select: { id: true, name: true, slug: true },
        });
        if (!tenant) throw Errors.notFound('Business');
        return tenant;
    }

    /**
     * Update complaint status (idempotent via tracking)
     */
    async updateStatus(
        complaintId: string,
        tenantId: string,
        newStatus?: string,
        assignedToId?: string,
        newPriority?: string,
        actorUserId?: string,
    ) {
        try {
            if (assignedToId) {
                const assignee = await prisma.user.findFirst({
                    where: { id: assignedToId, tenantId, isActive: true },
                    select: { id: true },
                });
                if (!assignee) {
                    throw Errors.validation('Assigned user does not belong to this tenant');
                }
            }

            const { complaint, updated } = await prisma.$transaction(async (tx) => {
                const complaint = await tx.complaint.findFirst({
                    where: { id: complaintId, tenantId },
                });

                if (!complaint) {
                    throw Errors.notFound('Complaint');
                }

                const updated = await tx.complaint.update({
                    where: { id: complaintId, tenantId },
                    data: {
                        ...(newStatus ? { status: newStatus as ComplaintStatus } : {}),
                        ...(newPriority ? { priority: newPriority as Priority } : {}),
                        assignedToId,
                        ...(newStatus ? { resolvedAt: newStatus === 'RESOLVED' ? new Date() : null } : {}),
                    },
                });

                // Log activity
                if (newStatus) {
                    await tx.statusHistory.create({
                        data: {
                            complaintId,
                            fromStatus: complaint.status,
                            toStatus: newStatus as ComplaintStatus,
                            changedById: actorUserId ?? null,
                        },
                    });

                    await tx.auditLog.create({
                        data: {
                            action: 'COMPLAINT_STATUS_UPDATED',
                            entity: 'Complaint',
                            entityId: complaintId,
                            tenantId,
                            userId: actorUserId ?? null,
                            oldValue: {
                                status: complaint.status,
                                priority: complaint.priority,
                                assignedToId: complaint.assignedToId,
                            },
                            newValue: {
                                status: updated.status,
                                priority: updated.priority,
                                assignedToId: updated.assignedToId,
                            },
                        },
                    });
                }

                return { complaint, updated };
            });

            logger.info('Complaint status updated', {
                complaintId,
                oldStatus: complaint.status,
                newStatus,
            });

            return updated;
        } catch (error) {
            logger.error('Failed to update complaint status', error, { complaintId });
            if (error instanceof AppError) {
                throw error;
            }
            throw Errors.databaseError(error);
        }
    }

    private generateTrackingId(): string {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const random = randomBytes(16).toString('hex').toUpperCase();
        return `COMP-${dateStr}-${random}`;
    }

    async submitCSATFeedback(trackingId: string, rating: number, comments?: string) {
        const complaint = await prisma.complaint.findUnique({
            where: { trackingId },
            include: { feedback: true },
        });

        if (!complaint) throw Errors.notFound('Complaint');

        return prisma.cSATFeedback.upsert({
            where: { complaintId: complaint.id },
            update: {
                rating,
                comments: comments?.trim() || null,
                submittedAt: new Date(),
            },
            create: {
                complaintId: complaint.id,
                rating,
                comments: comments?.trim() || null,
            },
        });
    }

    async getAIResponseSuggestion(
        complaintId: string,
        tenantId: string,
        tone: 'empathetic' | 'professional' | 'urgent' | 'apologetic' = 'empathetic'
    ) {
        const complaint = await prisma.complaint.findFirst({
            where: { id: complaintId, tenantId },
            include: { customer: true, tenant: true },
        });

        if (!complaint) throw Errors.notFound('Complaint');

        return aiService.suggestResponse({
            title: complaint.title,
            description: complaint.description,
            category: complaint.aiCategory || 'GENERAL',
            sentiment: complaint.aiSentiment || 'NEGATIVE',
            tone,
            customerName: complaint.customer?.fullName || 'Valued Customer',
            businessName: complaint.tenant?.name || 'Support Team',
        });
    }

    async escalateComplaint(
        complaintId: string,
        tenantId: string,
        reason?: string,
        actorUserId?: string,
    ) {
        return prisma.$transaction(async (tx) => {
            const complaint = await tx.complaint.findFirst({
                where: { id: complaintId, tenantId },
            });

            if (!complaint) throw Errors.notFound('Complaint');

            const updated = await tx.complaint.update({
                where: { id: complaintId, tenantId },
                data: {
                    status: 'ESCALATED',
                    priority: 'CRITICAL',
                },
            });

            await tx.statusHistory.create({
                data: {
                    complaintId,
                    fromStatus: complaint.status,
                    toStatus: 'ESCALATED',
                    comment: reason || 'Escalated by supervisor for immediate priority review',
                    changedById: actorUserId ?? null,
                },
            });

            await tx.auditLog.create({
                data: {
                    action: 'COMPLAINT_ESCALATED',
                    entity: 'Complaint',
                    entityId: complaintId,
                    tenantId,
                    userId: actorUserId ?? null,
                    oldValue: {
                        status: complaint.status,
                        priority: complaint.priority,
                    },
                    newValue: {
                        status: 'ESCALATED',
                        priority: 'CRITICAL',
                        reason: reason ?? null,
                    },
                },
            });

            return updated;
        });
    }

    private buildSuggestedResponse(category: string, sentiment: string): string {
        const categoryLabels: Record<string, string> = {
            BILLING: 'billing or payment',
            DELIVERY: 'delivery',
            PRODUCT_QUALITY: 'product quality',
            CUSTOMER_SERVICE: 'customer service',
            TECHNICAL_SUPPORT: 'technical support',
            REFUND: 'refund',
            GENERAL: 'support',
        };
        const issue = categoryLabels[category.toUpperCase()] ?? 'support';
        const acknowledgement = sentiment === 'NEGATIVE'
            ? "I'm sorry this issue has caused frustration."
            : 'Thank you for bringing this issue to our attention.';

        return [
            'Hello,',
            '',
            acknowledgement,
            `We have logged your ${issue} concern and our team is reviewing the details. We will follow up with a clear update as soon as we have one.`,
            '',
            'Best,',
            '[Business support team]',
        ].join('\n');
    }

    private summarizeComplaint(title: string, description: string): string {
        const normalized = `${title.trim()}. ${description.trim()}`
            .replace(/\s+/g, ' ')
            .replace(/[.!?]+$/, '');
        const words = normalized.split(' ');
        return words.length > 40
            ? `${words.slice(0, 40).join(' ')}…`
            : normalized;
    }
}

export const complaintService = new ComplaintService();
