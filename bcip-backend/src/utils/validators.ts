import { z } from 'zod';
import { Errors } from '../utils/error';

/**
 * Validation schemas for complaint domain
 */
export const ComplaintSchemas = {
    submit: z.object({
        title: z
            .string()
            .min(10, 'Title must be at least 10 characters')
            .max(200, 'Title must be less than 200 characters')
            .trim(),
        description: z
            .string()
            .min(20, 'Description must be at least 20 characters')
            .max(5000, 'Description must be less than 5000 characters')
            .trim(),
        customerEmail: z
            .string()
            .email('Invalid email address')
            .toLowerCase(),
        customerName: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must be less than 100 characters')
            .trim(),
        attachmentUrl: z
            .string()
            .url('Invalid attachment URL')
            .optional(),
        tenantId: z.string().uuid('Invalid tenant ID'),
    }),

    updateStatus: z.object({
        status: z.preprocess(
            value => typeof value === 'string' ? value.toUpperCase() : value,
            z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional()
        ),
        priority: z.preprocess(
            value => typeof value === 'string' ? value.toUpperCase() : value,
            z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
        ),
        assignedToId: z.string().uuid().optional(),
    }).refine(data => Boolean(data.status || data.priority || data.assignedToId), {
        message: 'At least one complaint field must be updated',
    }),
};

/**
 * Validate input against schema
 */
export function validate<TSchema extends z.ZodTypeAny>(
    data: unknown,
    schema: TSchema
): z.infer<TSchema> {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            throw Errors.validation('Input validation failed', { fields: messages });
        }
        throw error;
    }
}

/**
 * Sanitize complaint text (XSS prevention)
 */
export function sanitizeText(text: string): string {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .trim();
}