import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { authService } from './auth.service';
import { ApiResponse } from '../../utils/api-response';
import { Errors } from '../../utils/error';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';
import { resendVerificationSchema } from './dto/resend-verification.dto';
import { verifyEmailCodeSchema } from './dto/verify-email.dto';
import { forgotPasswordSchema } from './dto/forgot-password.dto';
import { resetPasswordSchema } from './dto/reset-password.dto';
import {
    changeRegistrationEmailSchema,
    completeBusinessRegistrationSchema,
    updateRegistrationAccountSchema,
} from './dto/business-registration.dto';
import {
    firebaseBootstrapLoginSchema,
    firebaseSessionSchema,
} from './dto/firebase-session.dto';
import {
    clearAuthSessionCookie,
    setAuthSessionCookie,
} from './auth-session-cookie';
import { env } from '../../config/env';
import { EMAIL_VERIFICATION_CODE_TTL_MINUTES } from '../../services/emailService';
// import { authMiddleware } from '../../middleware/auth.middleware';

export class AuthController {
    verificationPolicy(_req: Request, res: Response): void {
        ApiResponse.success(res, {
            codeLength: 6,
            expiresInSeconds: EMAIL_VERIFICATION_CODE_TTL_MINUTES * 60,
            resendCooldownSeconds: env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
        }, 'Email verification policy');
    }

    async bootstrapFirebaseLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = firebaseBootstrapLoginSchema.parse(req.body);
            const result = await authService.bootstrapFirebaseLogin(credentials);
            ApiResponse.success(res, result, 'Sign-in migration completed');
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async firebaseLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { rememberMe } = firebaseSessionSchema.parse(req.body ?? {});
            const firebaseUid = req.firebaseUser?.uid;
            if (!firebaseUid) throw Errors.unauthorized();

            const result = await authService.createFirebaseSession(firebaseUid);
            const { token, ...session } = result;
            setAuthSessionCookie(res, token, rememberMe);
            ApiResponse.success(res, session, 'Login successful');
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async upgradeSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { rememberMe } = firebaseSessionSchema.parse(req.body ?? {});
            const userId = req.user?.id;
            if (!userId) throw Errors.unauthorized();

            const result = await authService.createSessionForUser(userId);
            const { token, ...session } = result;
            setAuthSessionCookie(res, token, rememberMe);
            ApiResponse.success(res, session, 'Session upgraded');
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    logout(_req: Request, res: Response) {
        clearAuthSessionCookie(res);
        res.status(204).end();
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate input
            const validatedData = registerSchema.parse(req.body);

            // Process registration
            const result = await authService.register(validatedData);

            // Return success
            ApiResponse.success(
                res,
                result,
                'If the address can be registered, continue to email verification to request a code.',
                201,
            );
        } catch (error: any) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate input
            const validatedData = loginSchema.parse(req.body);

            // Process login
            const result = await authService.login(validatedData);

            // Return success
            ApiResponse.success(res, result, 'Login successful');
        } catch (error: any) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const tokenValue = req.query.token ?? req.body?.token;
            if (tokenValue !== undefined) {
                if (typeof tokenValue !== 'string' || !tokenValue.trim()) {
                    throw Errors.validation('A verification token is required');
                }
                ApiResponse.success(
                    res,
                    await authService.verifyEmail(tokenValue.trim()),
                    'Email verified',
                );
                return;
            }

            const parsed = verifyEmailCodeSchema.safeParse(req.body);
            if (!parsed.success) {
                throw Errors.validation('Validation failed', {
                    fields: parsed.error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                });
            }
            ApiResponse.success(
                res,
                await authService.verifyEmailCode(parsed.data.email, parsed.data.code),
                'Email verified',
            );
        } catch (error) {
            next(error);
        }
    }

    async resendVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = resendVerificationSchema.parse(req.body);
            const result = await authService.resendVerificationEmail(email);
            ApiResponse.success(
                res,
                result,
                'If an unverified account exists, a verification code has been requested.',
            );
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async changeRegistrationEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const data = changeRegistrationEmailSchema.parse(req.body);
            const result = await authService.changeRegistrationEmail(data);
            ApiResponse.success(res, result, 'Registration email updated');
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async completeBusinessRegistration(req: Request, res: Response, next: NextFunction) {
        try {
            const authorization = req.headers.authorization;
            const token = authorization?.startsWith('Bearer ')
                ? authorization.slice('Bearer '.length).trim()
                : '';
            if (!token) throw Errors.unauthorized('A verified registration session is required');

            const data = completeBusinessRegistrationSchema.parse(req.body);
            const result = await authService.completeBusinessRegistration(token, data);
            ApiResponse.success(res, result, 'Business registration submitted for review', 201);
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async updateRegistrationAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const authorization = req.headers.authorization;
            const token = authorization?.startsWith('Bearer ')
                ? authorization.slice('Bearer '.length).trim()
                : '';
            if (!token) throw Errors.unauthorized('A verified registration session is required');

            const data = updateRegistrationAccountSchema.parse(req.body);
            await authService.updateRegistrationAccount(token, data);
            ApiResponse.success(res, { updated: true }, 'Registration account details updated');
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = forgotPasswordSchema.parse(req.body);
            const result = await authService.forgotPassword(email);
            ApiResponse.success(
                res,
                result,
                'If an account exists for this email, we have sent instructions to reset your password.',
            );
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);
            const result = await authService.resetPassword({
                token: validatedData.token,
                password: validatedData.password,
            });
            ApiResponse.success(res, result, 'Password updated successfully.');
        } catch (error) {
            if (error instanceof ZodError) {
                next(Errors.validation('Validation failed', {
                    fields: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                }));
                return;
            }
            next(error);
        }
    }

    async profile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) throw Errors.unauthorized();
            ApiResponse.success(res, await authService.getProfile(userId));
        } catch (error) {
            next(error);
        }
    }

    async profileQr(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) throw Errors.unauthorized();
            ApiResponse.success(res, await authService.getProfileQr(userId));
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();