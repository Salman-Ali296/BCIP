import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { Errors } from '../../../../utils/error';
import { validate } from '../../../../utils/validators';
import { submitComplaintUseCase } from '../../container';

const submitComplaintSchema = z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    title: z.string().trim().min(10).max(200),
    description: z.string().trim().min(20).max(5000),
});

export async function submitComplaint(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.tenantId) {
            throw Errors.unauthorized('Tenant context missing');
        }

        const input = validate(req.body, submitComplaintSchema);
        const result = await submitComplaintUseCase.execute({
            ...input,
            tenantId: req.tenantId,
        });

        res.status(201).json({
            success: true,
            data: result,
            message: 'Complaint submitted successfully',
        });
    } catch (error) {
        next(error);
    }
}