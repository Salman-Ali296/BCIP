import { prisma } from '../../../config/database';
import { Prisma, Priority } from '@prisma/client';

export interface CategoryConfig {
    id: string;
    name: string;
    description: string | null;
    aiLabel: string | null;
    keywords: string[];
    defaultPriority: Priority;
    isActive: boolean;
    tenantId: string;
    tenantName: string;
    complaintCount: number;
}

export interface CreateCategoryData {
    name: string;
    description?: string;
    aiLabel?: string;
    keywords?: string[];
    defaultPriority?: Priority;
    tenantId: string;
}

export interface UpdateCategoryData {
    name?: string;
    description?: string | null;
    aiLabel?: string | null;
    keywords?: string[];
    defaultPriority?: Priority;
    isActive?: boolean;
}

export interface SystemConfig {
    id: string;
    key: string;
    value: unknown;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class AdminConfigService {
    // Category Management
    async getCategories(): Promise<CategoryConfig[]> {
        const categories = await prisma.complaintCategory.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                aiLabel: true,
                keywords: true,
                defaultPriority: true,
                isActive: true,
                tenantId: true,
                tenant: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        complaints: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return categories.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            aiLabel: c.aiLabel,
            keywords: c.keywords,
            defaultPriority: c.defaultPriority,
            isActive: c.isActive,
            tenantId: c.tenantId,
            tenantName: c.tenant.name,
            complaintCount: c._count.complaints,
        }));
    }

    async getCategoryById(id: string): Promise<CategoryConfig | null> {
        const category = await prisma.complaintCategory.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                aiLabel: true,
                keywords: true,
                defaultPriority: true,
                isActive: true,
                tenantId: true,
                tenant: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        complaints: true,
                    },
                },
            },
        });

        if (!category) {
            return null;
        }

        return {
            id: category.id,
            name: category.name,
            description: category.description,
            aiLabel: category.aiLabel,
            keywords: category.keywords,
            defaultPriority: category.defaultPriority,
            isActive: category.isActive,
            tenantId: category.tenantId,
            tenantName: category.tenant.name,
            complaintCount: category._count.complaints,
        };
    }

    async createCategory(data: CreateCategoryData): Promise<CategoryConfig> {
        const category = await prisma.complaintCategory.create({
            data: {
                name: data.name,
                description: data.description || null,
                aiLabel: data.aiLabel || null,
                keywords: data.keywords || [],
                defaultPriority: data.defaultPriority || 'MEDIUM',
                tenantId: data.tenantId,
            },
            select: {
                id: true,
                name: true,
                description: true,
                aiLabel: true,
                keywords: true,
                defaultPriority: true,
                isActive: true,
                tenantId: true,
                tenant: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return {
            ...category,
            tenantName: category.tenant.name,
            complaintCount: 0,
        };
    }

    async updateCategory(id: string, data: UpdateCategoryData): Promise<CategoryConfig> {
        const category = await prisma.complaintCategory.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                description: true,
                aiLabel: true,
                keywords: true,
                defaultPriority: true,
                isActive: true,
                tenantId: true,
                tenant: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        complaints: true,
                    },
                },
            },
        });

        return {
            ...category,
            tenantName: category.tenant.name,
            complaintCount: category._count.complaints,
        };
    }

    async deleteCategory(id: string): Promise<void> {
        // Check if category has complaints
        const complaintCount = await prisma.complaint.count({
            where: { categoryId: id },
        });

        if (complaintCount > 0) {
            throw new Error(
                `Cannot delete category with ${complaintCount} associated complaints. Please deactivate instead.`
            );
        }

        await prisma.complaintCategory.delete({
            where: { id },
        });
    }

    // System Configuration Management
    async getSystemConfigs(): Promise<SystemConfig[]> {
        const configs = await prisma.systemConfiguration.findMany({
            orderBy: {
                key: 'asc',
            },
        });

        return configs;
    }

    async getSystemConfig(key: string): Promise<SystemConfig | null> {
        return await prisma.systemConfiguration.findUnique({
            where: { key },
        });
    }

    async upsertSystemConfig(
        key: string,
        value: Prisma.InputJsonValue | typeof Prisma.JsonNull,
        description?: string
    ): Promise<SystemConfig> {
        return await prisma.systemConfiguration.upsert({
            where: { key },
            update: {
                value,
                description: description || undefined,
            },
            create: {
                key,
                value,
                description: description || null,
            },
        });
    }

    async deleteSystemConfig(key: string): Promise<void> {
        await prisma.systemConfiguration.delete({
            where: { key },
        });
    }

    // AI Configuration
    async getAISettings(): Promise<{
        aiEnabled: boolean;
        duplicateThreshold: number;
        autoProcessAI: boolean;
    }> {
        // Get AI settings from a representative tenant or system config
        const tenantSettings = await prisma.tenantSettings.findFirst({
            select: {
                aiEnabled: true,
                duplicateThreshold: true,
                autoProcessAI: true,
            },
        });

        return (
            tenantSettings || {
                aiEnabled: true,
                duplicateThreshold: 0.85,
                autoProcessAI: true,
            }
        );
    }

    async getAIProcessingStats(): Promise<{
        totalProcessed: number;
        successRate: number;
        avgConfidence: number;
        byType: Array<{ type: string; count: number }>;
    }> {
        const [totalProcessed, completed, processes, byType] = await Promise.all([
            prisma.aIProcessing.count(),
            prisma.aIProcessing.count({
                where: { status: 'COMPLETED' },
            }),
            prisma.aIProcessing.findMany({
                where: {
                    status: 'COMPLETED',
                    confidenceScore: { not: null },
                },
                select: {
                    confidenceScore: true,
                },
            }),
            prisma.aIProcessing.groupBy({
                by: ['processingType'],
                _count: { id: true },
            }),
        ]);

        const avgConfidence =
            processes.length > 0
                ? processes.reduce((sum, p) => sum + (p.confidenceScore || 0), 0) /
                  processes.length
                : 0;

        return {
            totalProcessed,
            successRate: totalProcessed > 0 ? (completed / totalProcessed) * 100 : 0,
            avgConfidence: Math.round(avgConfidence * 100) / 100,
            byType: byType.map((t) => ({
                type: t.processingType,
                count: t._count.id,
            })),
        };
    }
}

export const adminConfigService = new AdminConfigService();
