import { Request, Response, NextFunction } from 'express';
import { complaintService } from '../services/complaintService';
import { validate, ComplaintSchemas } from '../utils/validators';
import { Errors } from '../utils/error';

function hasAllowedFileSignature(file: { mimetype: string; buffer: Buffer }): boolean {
    if (file.mimetype === 'application/pdf') {
        return file.buffer.subarray(0, 5).toString() === '%PDF-';
    }
    if (file.mimetype === 'image/png') {
        return file.buffer.subarray(0, 8).equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
    }
    if (file.mimetype === 'image/jpeg') {
        return file.buffer.length >= 3 &&
            file.buffer[0] === 0xff &&
            file.buffer[1] === 0xd8 &&
            file.buffer[2] === 0xff;
    }
    return false;
}

/**
 * POST /complaints
 * Create new complaint with full error handling and logging
 */
export async function createComplaint(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Validate input
        const validatedData = validate(req.body, ComplaintSchemas.submit);
        const files = (req.files ?? []) as Array<{
            originalname: string;
            mimetype: string;
            size: number;
            buffer: Buffer;
        }>;
        if (files.some((file) => !hasAllowedFileSignature(file))) {
            throw Errors.validation('Uploaded file content does not match an allowed file type');
        }

        // Call service
        const complaint = await complaintService.createComplaint({
            ...validatedData,
            files,
        });

        // Return success response
        res.status(201).json({
            success: true,
            data: complaint,
            message: 'Complaint submitted successfully',
        });
    } catch (error) {
        // Pass to error handler middleware
        next(error);
    }
}

/**
 * GET /complaints
 * List complaints with filtering
 */
export async function listComplaints(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const isCustomer = req.user?.role === 'CUSTOMER';
        const tenantId = isCustomer ? undefined : req.tenantId;
        const customerEmail = isCustomer ? req.user?.email : undefined;
        if (!tenantId && !customerEmail) {
            throw Errors.unauthorized('Tenant context missing');
        }

        const assignmentFilter = req.query.assignedTo;
        const search = typeof req.query.search === 'string'
            ? req.query.search.trim().slice(0, 100)
            : undefined;

        const result = await complaintService.listComplaints(tenantId, {
            customerEmail,
            status: req.query.status as string,
            priority: req.query.priority as string,
            category: req.query.category as string,
            sentiment: req.query.sentiment as string,
            search,
            assignedToId: assignmentFilter === 'current' ? req.user?.id : undefined,
            unassigned: assignmentFilter === 'unassigned',
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
        });

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

export async function getComplaint(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const complaintId = req.params.id;
        if (typeof complaintId !== 'string') {
            throw Errors.validation('Complaint ID is invalid');
        }

        let complaint;
        if (req.user?.role === 'CUSTOMER') {
            if (!req.user.email) {
                throw Errors.unauthorized('Verified account email missing');
            }
            complaint = await complaintService.getComplaintForCustomer(
                complaintId,
                req.user.email,
            );
        } else {
            if (!req.tenantId) {
                throw Errors.unauthorized('Tenant context missing');
            }
            complaint = await complaintService.getComplaint(complaintId, req.tenantId);
        }
        res.json({ success: true, data: complaint });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /complaints/:id
 * Update complaint status
 */
export async function updateComplaintStatus(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;
        const tenantId = req.tenantId;
        if (!tenantId) {
            throw Errors.unauthorized('Tenant context missing');
        }
        if (typeof id !== 'string') {
            throw Errors.validation('Complaint ID is invalid');
        }

        const { status, priority, assignedToId } = validate(
            req.body,
            ComplaintSchemas.updateStatus
        );

        const updated = await complaintService.updateStatus(
            id,
            tenantId,
            status,
            assignedToId,
            priority,
        );

        res.json({
            success: true,
            data: updated,
            message: 'Complaint updated successfully',
        });
    } catch (error) {
        next(error);
    }
}

export async function trackComplaint(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const trackingId = req.params.trackingId;
        if (typeof trackingId !== 'string') throw Errors.validation('Tracking ID is invalid');
        const complaint = await complaintService.getComplaintByTrackingId(trackingId);
        res.json({
            success: true,
            data: {
                id: complaint.id,
                trackingId: complaint.trackingId,
                title: complaint.title,
                status: complaint.status,
                priority: complaint.priority,
                aiCategory: complaint.aiCategory,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt,
                statusHistory: complaint.statusHistory.map((event) => ({
                    id: event.id,
                    toStatus: event.toStatus,
                    changedAt: event.changedAt,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function uploadComplaintFiles(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const complaintId = req.params.id;
        if (typeof complaintId !== 'string') throw Errors.validation('Complaint ID is invalid');
        const tenantId = req.tenantId;
        if (!tenantId) throw Errors.unauthorized('Tenant context missing');
        const files = (req.files ?? []) as Array<{ originalname: string; mimetype: string; size: number; buffer: Buffer }>;
        if (files.length === 0) throw Errors.validation('At least one file is required');
        if (files.some((file) => !hasAllowedFileSignature(file))) {
            throw Errors.validation('Uploaded file content does not match an allowed file type');
        }
        await complaintService.addAttachments(complaintId, tenantId, files);
        res.status(201).json({ success: true, message: 'Files uploaded successfully' });
    } catch (error) {
        next(error);
    }

}

export async function getTenantBySlug(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const slug = req.params.slug;
        if (typeof slug !== 'string') throw Errors.validation('Business slug is invalid');
        res.json({ success: true, data: await complaintService.getTenantBySlug(slug) });
    } catch (error) {
        next(error);
    }
}

export async function submitCSATFeedback(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const trackingId = req.params.trackingId;
        if (typeof trackingId !== 'string') throw Errors.validation('Tracking ID is invalid');
        const { rating, comments } = req.body ?? {};
        if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw Errors.validation('Rating must be an integer between 1 and 5');
        }
        if (
            comments !== undefined &&
            (typeof comments !== 'string' || comments.length > 1000)
        ) {
            throw Errors.validation('Feedback comments must be 1000 characters or fewer');
        }

        const feedback = await complaintService.submitCSATFeedback(trackingId, rating, comments);
        res.status(201).json({
            success: true,
            data: feedback,
            message: 'Feedback submitted successfully. Thank you!',
        });
    } catch (error) {
        next(error);
    }
}

export async function getAIResponseSuggestion(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) throw Errors.unauthorized('Tenant context missing');
        const complaintId = req.params.id;
        if (typeof complaintId !== 'string') throw Errors.validation('Complaint ID is invalid');
        const { tone } = req.query;

        const suggestion = await complaintService.getAIResponseSuggestion(
            complaintId,
            tenantId,
            (tone as any) || 'empathetic'
        );
        res.json({ success: true, data: suggestion });
    } catch (error) {
        next(error);
    }
}

export async function escalateComplaint(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) throw Errors.unauthorized('Tenant context missing');
        const complaintId = req.params.id;
        if (typeof complaintId !== 'string') throw Errors.validation('Complaint ID is invalid');
        const { reason } = req.body;

        const escalated = await complaintService.escalateComplaint(complaintId, tenantId, reason);
        res.json({
            success: true,
            data: escalated,
            message: 'Complaint escalated to senior operations team',
        });
    } catch (error) {
        next(error);
    }
}