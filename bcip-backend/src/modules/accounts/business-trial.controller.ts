import { NextFunction, Request, Response } from 'express';
import { Errors } from '../../utils/error';
import { businessTrialService } from './business-trial.service';

function getUserId(req: Request): string {
    const userId = req.user?.id;
    if (!userId) throw Errors.unauthorized();
    return userId;
}

export async function getBusinessTrialStatus(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        res.json({ success: true, data: await businessTrialService.getStatus(getUserId(req)) });
    } catch (error) {
        next(error);
    }
}

export async function acceptBusinessTrial(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (req.body?.accepted !== true) {
            throw Errors.validation('You must accept the 14-day trial terms to continue');
        }
        res.json({
            success: true,
            data: await businessTrialService.accept(getUserId(req)),
            message: 'Your 14-day free trial has started.',
        });
    } catch (error) {
        next(error);
    }
}

export async function completeBusinessOnboarding(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (req.body?.complaintChannel !== 'WEB_PORTAL') {
            throw Errors.validation('Select the BCIP customer web portal as your complaint channel');
        }
        res.json({
            success: true,
            data: await businessTrialService.completeOnboarding(getUserId(req)),
            message: 'Your customer complaint portal is ready.',
        });
    } catch (error) {
        next(error);
    }
}
