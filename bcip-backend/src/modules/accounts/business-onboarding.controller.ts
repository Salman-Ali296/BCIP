import { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { Errors } from '../../utils/error';
import {
    acceptBusinessInvitationSchema,
    createBusinessInvitationSchema,
    inspectBusinessInvitationSchema,
} from './dto/business-onboarding.dto';
import { businessInvitationService } from './business-invitation.service';
import { businessOnboardingService } from './business-onboarding.service';

function getUserId(req: Request): string {
    const userId = req.user?.id;
    if (!userId) throw Errors.unauthorized();
    return userId;
}

function validationError(error: ZodError) {
    return Errors.validation('Validation failed', {
        fields: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
        })),
    });
}

const saveStepSchema = z.object({
    version: z.number().int().min(0),
    data: z.unknown(),
}).strict();

const completeSchema = z.object({
    version: z.number().int().min(0),
}).strict();

export async function getBusinessOnboarding(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        res.json({
            success: true,
            data: await businessOnboardingService.get(getUserId(req)),
        });
    } catch (error) {
        next(error);
    }
}

export async function saveBusinessOnboardingStep(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const step = Number(req.params.step);
        const { version, data } = saveStepSchema.parse(req.body);
        res.json({
            success: true,
            data: await businessOnboardingService.saveStep(
                getUserId(req),
                step,
                version,
                data,
            ),
            message: 'Workspace step saved.',
        });
    } catch (error) {
        next(error instanceof ZodError ? validationError(error) : error);
    }
}

export async function completeBusinessWorkspaceOnboarding(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { version } = completeSchema.parse(req.body);
        res.json({
            success: true,
            data: await businessOnboardingService.complete(getUserId(req), version),
            message: 'Your business workspace is ready.',
        });
    } catch (error) {
        next(error instanceof ZodError ? validationError(error) : error);
    }
}

export async function createBusinessInvitation(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const input = createBusinessInvitationSchema.parse(req.body);
        res.status(201).json({
            success: true,
            data: await businessInvitationService.create(getUserId(req), input),
            message: 'Invitation sent.',
        });
    } catch (error) {
        next(error instanceof ZodError ? validationError(error) : error);
    }
}

export async function inspectBusinessInvitation(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { token } = inspectBusinessInvitationSchema.parse(req.body);
        res.json({
            success: true,
            data: await businessInvitationService.inspect(token),
        });
    } catch (error) {
        next(error instanceof ZodError ? validationError(error) : error);
    }
}

export async function acceptBusinessInvitation(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const input = acceptBusinessInvitationSchema.parse(req.body);
        res.json({
            success: true,
            data: await businessInvitationService.accept(input),
            message: 'Invitation accepted. You can now sign in to your business workspace.',
        });
    } catch (error) {
        next(error instanceof ZodError ? validationError(error) : error);
    }
}
