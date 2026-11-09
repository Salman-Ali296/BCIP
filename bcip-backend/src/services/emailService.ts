import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';
import { AppError, ErrorCode } from '../utils/error';

interface GmailConfiguration {
    user: string;
    appPassword: string;
    appBaseUrl: URL;
}

export const EMAIL_VERIFICATION_CODE_TTL_MINUTES = 10;

export class EmailService {
    private getGmailConfiguration(): GmailConfiguration {
        const user = process.env.GMAIL_USER?.trim();
        const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
        const appBaseUrlValue = process.env.APP_BASE_URL?.trim();
        const missingConfiguration = [
            !user && 'GMAIL_USER',
            !appPassword && 'GMAIL_APP_PASSWORD',
            !appBaseUrlValue && 'APP_BASE_URL',
        ].filter((value): value is string => Boolean(value));

        if (missingConfiguration.length) {
            throw new AppError(
                ErrorCode.EXTERNAL_SERVICE_ERROR,
                'Gmail email delivery is not configured. Please contact the BCIP administrator.',
                503,
                true,
                { missingConfiguration },
            );
        }

        let appBaseUrl: URL;
        try {
            appBaseUrl = new URL(appBaseUrlValue!);
        } catch {
            throw new AppError(
                ErrorCode.EXTERNAL_SERVICE_ERROR,
                'Gmail email delivery is not configured. Please contact the BCIP administrator.',
                503,
                true,
                { invalidConfiguration: 'APP_BASE_URL' },
            );
        }

        if (
            !['http:', 'https:'].includes(appBaseUrl.protocol) ||
            appBaseUrl.username ||
            appBaseUrl.password
        ) {
            throw new AppError(
                ErrorCode.EXTERNAL_SERVICE_ERROR,
                'Gmail email delivery is not configured. Please contact the BCIP administrator.',
                503,
                true,
                { invalidConfiguration: 'APP_BASE_URL' },
            );
        }

        return {
            user: user!,
            appPassword: appPassword!,
            appBaseUrl,
        };
    }

    assertVerificationEmailConfigured(): void {
        this.getGmailConfiguration();
    }

    async sendVerificationCode(recipient: string, code: string): Promise<void> {
        const config = this.getGmailConfiguration();
        const expiryMinutes = EMAIL_VERIFICATION_CODE_TTL_MINUTES;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: config.user, pass: config.appPassword },
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 20_000,
        });

        try {
            await transporter.sendMail({
                from: `BCIP <${config.user}>`,
                to: recipient,
                subject: 'Your BCIP email verification code',
                text: `Your BCIP verification code is ${code}. It expires in ${expiryMinutes} minutes. If you did not request this, you can ignore this email.`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;"><h2 style="color: #21113b;">Verify your BCIP email</h2><p>Enter this code on the verification page to activate your account:</p><p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #21113b;">${code}</p><p style="color: #64748b;">This code expires in ${expiryMinutes} minutes. If you did not request it, you can ignore this email.</p></div>`,
            });
            logger.info('Account verification code delivered');
        } catch {
            logger.error('Account verification code delivery failed');
            throw new AppError(
                ErrorCode.EXTERNAL_SERVICE_ERROR,
                'We could not deliver the verification code. Please try again shortly.',
                503,
                true,
                { deliveryFailed: true },
            );
        }
    }

    async sendPasswordResetEmail(recipient: string, token: string): Promise<void> {
        const config = this.getGmailConfiguration();
        const resetUrl = new URL(
            `/reset-password?token=${encodeURIComponent(token)}`,
            config.appBaseUrl,
        );
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: config.user, pass: config.appPassword },
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 20_000,
        });

        try {
            await transporter.sendMail({
                from: `BCIP <${config.user}>`,
                to: recipient,
                subject: 'Reset your BCIP password',
                text: `You requested a password reset for your BCIP account.\n\nUse this link to set a new password:\n${resetUrl.toString()}\n\nThis link will expire in 1 hour. If you did not request this, you can safely ignore this email.`,
                html: `<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
<h2 style="color: #0f172a; margin-bottom: 16px;">Reset your BCIP password</h2>
<p style="color: #334155; line-height: 1.6;">You requested a password reset for your BCIP workspace account. Click the button below to choose a new password.</p>
<div style="margin: 28px 0;">
  <a href="${resetUrl.toString()}" style="background-color: #2454d6; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
</div>
<p style="color: #64748b; font-size: 13px; line-height: 1.5;">This link will expire in 1 hour. If you did not make this request, your account is secure and no further action is needed.</p>
</div>`,
            });
            logger.info('Password reset email delivered', { recipient });
        } catch {
            logger.error('Password reset email delivery failed', undefined, { recipient });
            throw new AppError(
                ErrorCode.EXTERNAL_SERVICE_ERROR,
                'We could not deliver the password reset email at this moment. Please try again shortly.',
                503,
                true,
                { deliveryFailed: true },
            );
        }
    }

    async sendComplaintConfirmation(
        recipient: string,
        customerName: string,
        trackingId: string
    ): Promise<void> {
        logger.info('Complaint confirmation queued', {
            recipient,
            customerName,
            trackingId,
        });
    }
}

export const emailService = new EmailService();
