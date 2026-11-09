import { Request, Response } from 'express';
import { adminConfigService } from '../services/admin-config.service';
import { Prisma, Priority } from '@prisma/client';
import { z } from 'zod';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
    z.union([
        z.string(),
        z.number().finite(),
        z.boolean(),
        z.null(),
        z.array(jsonValueSchema),
        z.record(jsonValueSchema),
    ]),
);

const systemConfigSchema = z.object({
    key: z.string().min(1),
    value: jsonValueSchema,
    description: z.string().nullable().optional(),
});

export class AdminConfigController {
    // Category Management
    async getCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await adminConfigService.getCategories();
            res.json({
                success: true,
                data: categories,
                count: categories.length,
            });
        } catch (error) {
            console.error('Admin get categories error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CATEGORIES_FETCH_ERROR',
                    message: 'Failed to fetch categories',
                },
            });
        }
    }

    async getCategoryById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Category ID is required',
                    },
                });
                return;
            }

            const category = await adminConfigService.getCategoryById(id);

            if (!category) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'CATEGORY_NOT_FOUND',
                        message: 'Category not found',
                    },
                });
                return;
            }

            res.json({
                success: true,
                data: category,
            });
        } catch (error) {
            console.error('Admin get category by ID error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CATEGORY_FETCH_ERROR',
                    message: 'Failed to fetch category',
                },
            });
        }
    }

    async createCategory(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, aiLabel, keywords, defaultPriority, tenantId } = req.body;

            if (!name || !tenantId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DATA',
                        message: 'Category name and tenant ID are required',
                    },
                });
                return;
            }

            if (defaultPriority && !Object.values(Priority).includes(defaultPriority)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_PRIORITY',
                        message: 'Invalid priority value',
                    },
                });
                return;
            }

            const category = await adminConfigService.createCategory({
                name,
                description,
                aiLabel,
                keywords: Array.isArray(keywords) ? keywords : [],
                defaultPriority,
                tenantId,
            });

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category,
            });
        } catch (error) {
            console.error('Admin create category error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CATEGORY_CREATE_ERROR',
                    message: 'Failed to create category',
                },
            });
        }
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, description, aiLabel, keywords, defaultPriority, isActive } = req.body;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Category ID is required',
                    },
                });
                return;
            }

            if (defaultPriority && !Object.values(Priority).includes(defaultPriority)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_PRIORITY',
                        message: 'Invalid priority value',
                    },
                });
                return;
            }

            const updateData: {
                name?: string;
                description?: string | null;
                aiLabel?: string | null;
                keywords?: string[];
                defaultPriority?: Priority;
                isActive?: boolean;
            } = {};

            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (aiLabel !== undefined) updateData.aiLabel = aiLabel;
            if (keywords !== undefined && Array.isArray(keywords))
                updateData.keywords = keywords;
            if (defaultPriority !== undefined) updateData.defaultPriority = defaultPriority;
            if (isActive !== undefined) updateData.isActive = isActive;

            const category = await adminConfigService.updateCategory(id, updateData);

            res.json({
                success: true,
                message: 'Category updated successfully',
                data: category,
            });
        } catch (error) {
            console.error('Admin update category error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CATEGORY_UPDATE_ERROR',
                    message: 'Failed to update category',
                },
            });
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || id.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Category ID is required',
                    },
                });
                return;
            }

            await adminConfigService.deleteCategory(id);

            res.json({
                success: true,
                message: 'Category deleted successfully',
            });
        } catch (error: any) {
            console.error('Admin delete category error:', error);

            if (error.message && error.message.includes('Cannot delete category')) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'CATEGORY_IN_USE',
                        message: error.message,
                    },
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: {
                    code: 'CATEGORY_DELETE_ERROR',
                    message: 'Failed to delete category',
                },
            });
        }
    }

    // System Configuration
    async getSystemConfigs(req: Request, res: Response): Promise<void> {
        try {
            const configs = await adminConfigService.getSystemConfigs();
            res.json({
                success: true,
                data: configs,
                count: configs.length,
            });
        } catch (error) {
            console.error('Admin get system configs error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CONFIGS_FETCH_ERROR',
                    message: 'Failed to fetch system configurations',
                },
            });
        }
    }

    async getSystemConfig(req: Request, res: Response): Promise<void> {
        try {
            const { key } = req.params;

            if (typeof key !== 'string' || key.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_KEY',
                        message: 'Configuration key is required',
                    },
                });
                return;
            }

            const config = await adminConfigService.getSystemConfig(key);

            if (!config) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'CONFIG_NOT_FOUND',
                        message: 'Configuration not found',
                    },
                });
                return;
            }

            res.json({
                success: true,
                data: config,
            });
        } catch (error) {
            console.error('Admin get system config error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CONFIG_FETCH_ERROR',
                    message: 'Failed to fetch configuration',
                },
            });
        }
    }

    async upsertSystemConfig(req: Request, res: Response): Promise<void> {
        try {
            const parsed = systemConfigSchema.safeParse(req.body);

            if (!parsed.success) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DATA',
                        message: 'Configuration key and value are required',
                    },
                });
                return;
            }

            const { key, value, description } = parsed.data;
            const prismaValue = value === null ? Prisma.JsonNull : value;
            const config = await adminConfigService.upsertSystemConfig(
                key,
                prismaValue,
                description ?? undefined,
            );

            res.json({
                success: true,
                message: 'Configuration saved successfully',
                data: config,
            });
        } catch (error) {
            console.error('Admin upsert system config error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CONFIG_SAVE_ERROR',
                    message: 'Failed to save configuration',
                },
            });
        }
    }

    // AI Configuration
    async getAISettings(req: Request, res: Response): Promise<void> {
        try {
            const settings = await adminConfigService.getAISettings();
            res.json({
                success: true,
                data: settings,
            });
        } catch (error) {
            console.error('Admin get AI settings error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'AI_SETTINGS_FETCH_ERROR',
                    message: 'Failed to fetch AI settings',
                },
            });
        }
    }

    async getAIProcessingStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await adminConfigService.getAIProcessingStats();
            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error('Admin get AI processing stats error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'AI_STATS_FETCH_ERROR',
                    message: 'Failed to fetch AI processing statistics',
                },
            });
        }
    }
}

export const adminConfigController = new AdminConfigController();
