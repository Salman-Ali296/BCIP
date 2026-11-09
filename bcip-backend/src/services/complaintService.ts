import { ComplaintStatus, Priority, Prisma, Sentiment } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database';
import { aiService } from './aiService';
import { emailService } from './emailService';
import { logger } from '../utils/logger';
import { AppError, Errors } from '../utils/error';
import { sanitizeText } from '../utils/validators';

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

export class ComplaintService {
    /**
     * Create complaint with AI processing
     * 
     * Transaction ensures atomicity:
     * - If AI call fails, complaint is still created (graceful degradation)
     * - If email fails, complaint and AI results still saved
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
            const tenant = await prisma.tenant.findFirst({
                where: {
                    id: tenantId,
                    isActive: true,
                    businessTrial: {
                        is: {
                            complaintChannel: 'WEB_PORTAL',
                            onboardingCompletedAt: { not: null },
                            acceptedAt: { lte: new Date() },
                            expiresAt: { gt: new Date() },
                        },
                    },
                },
                select: { id: true },
            });
            if (!tenant) {
                throw Errors.forbidden('This business complaint portal is not accepting complaints');
            }

            const candidates = await prisma.complaint.findMany({
                where: { tenantId },
                select: { id: true, title: true, description: true },
                orderBy: { createdAt: 'desc' },
                take: 100,
            });

            // Start database transaction
            const complaint = await prisma.$transaction(async (tx) => {
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

                if (assignee) {
                    await tx.complaint.update({
                        where: { id: complaint.id },
                        data: { assignedToId: assignee.id },
                    });
                }

                // AI and routing are completed before the customer receives the tracking ID.
                try {
                    const aiPrediction = await aiService.predict({
                        text: `${title}\n${sanitizedDescription}`,
                        complaintId: complaint.id,
                        candidateTexts: candidates.map((candidate) =>
                            `${candidate.title}\n${candidate.description}`,
                        ),
                        candidateIds: candidates.map((candidate) => candidate.id),
                    });

                    // 3. Update complaint with AI results
                    const updatedComplaint = await tx.complaint.update({
                        where: { id: complaint.id },
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

                    return updatedComplaint;
                } catch (aiError) {
                    // Log error but don't fail the transaction
                    logger.error(
                        'AI processing failed, continuing with complaint creation',
                        aiError,
                    );

                    return complaint;
                }
            });

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
        const page = filters.page || 1;
        const limit = Math.min(filters.limit || 20, 100); // Max 100 per page
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

        return prisma.complaintAttachment.createMany({
            data: files.map(file => ({
                complaintId,
                fileName: file.originalname,
                originalName: file.originalname,
                mimeType: file.mimetype,
                fileSize: file.size,
                storageProvider: 'local-data-url',
                fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            })),
        });
    }

    async getTenantBySlug(slug: string) {
        const tenant = await prisma.tenant.findFirst({
            where: { slug, isActive: true },
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
    ) {
        try {
            const complaint = await prisma.complaint.findUnique({
                where: { id: complaintId },
            });

            if (!complaint || complaint.tenantId !== tenantId) {
                throw Errors.notFound('Complaint');
            }

            if (assignedToId) {
                const assignee = await prisma.user.findFirst({
                    where: { id: assignedToId, tenantId, isActive: true },
                    select: { id: true },
                });
                if (!assignee) {
                    throw Errors.validation('Assigned user does not belong to this tenant');
                }
            }

            const updated = await prisma.complaint.update({
                where: { id: complaintId },
                data: {
                    ...(newStatus ? { status: newStatus as ComplaintStatus } : {}),
                    ...(newPriority ? { priority: newPriority as Priority } : {}),
                    assignedToId,
                    ...(newStatus ? { resolvedAt: newStatus === 'RESOLVED' ? new Date() : null } : {}),
                },
            });

            // Log activity
            if (newStatus) {
                await prisma.statusHistory.create({
                    data: {
                        complaintId,
                        fromStatus: complaint.status,
                        toStatus: newStatus as ComplaintStatus,
                    },
                });
            }

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

    async escalateComplaint(complaintId: string, tenantId: string, reason?: string) {
        const complaint = await prisma.complaint.findFirst({
            where: { id: complaintId, tenantId },
        });

        if (!complaint) throw Errors.notFound('Complaint');

        const updated = await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                status: 'ESCALATED',
                priority: 'CRITICAL',
            },
        });

        await prisma.statusHistory.create({
            data: {
                complaintId,
                fromStatus: complaint.status,
                toStatus: 'ESCALATED',
                comment: reason || 'Escalated by supervisor for immediate priority review',
            },
        });

        return updated;
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
