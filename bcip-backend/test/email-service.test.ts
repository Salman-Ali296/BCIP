import assert from 'node:assert/strict';
import test from 'node:test';
import type { SendMailOptions } from 'nodemailer';

import { EmailService } from '../src/services/emailService';
import { AppError } from '../src/utils/error';

const emailEnvironment = {
    GMAIL_USER: 'sender@example.com',
    GMAIL_APP_PASSWORD: 'test-app-password',
    APP_BASE_URL: 'https://portal.example.com',
};

function withEmailEnvironment<T>(run: () => Promise<T>): Promise<T> {
    const previous = new Map(
        Object.keys(emailEnvironment).map(key => [key, process.env[key]]),
    );
    Object.assign(process.env, emailEnvironment);

    return run().finally(() => {
        for (const [key, value] of previous) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    });
}

test('complaint confirmation sends a tracking link and escapes customer content', async () => {
    await withEmailEnvironment(async () => {
        let sentMessage: SendMailOptions | undefined;
        const service = new EmailService(() => ({
            sendMail: async message => {
                sentMessage = message;
            },
        }));

        await service.sendComplaintConfirmation(
            'customer@example.com',
            '<Customer & Co>',
            'BCIP/123',
        );

        assert.equal(sentMessage?.to, 'customer@example.com');
        assert.equal(sentMessage?.subject, 'We received your complaint');
        assert.match(sentMessage?.text ?? '', /BCIP\/123/);
        assert.match(
            sentMessage?.html ?? '',
            /Hello &lt;Customer &amp; Co&gt;/,
        );
        assert.match(
            sentMessage?.html ?? '',
            /\/support\/track\/BCIP%2F123/,
        );
    });
});

test('complaint confirmation reports delivery failures without exposing provider details', async () => {
    await withEmailEnvironment(async () => {
        const service = new EmailService(() => ({
            sendMail: async () => {
                throw new Error('provider connection details');
            },
        }));

        await assert.rejects(
            service.sendComplaintConfirmation(
                'customer@example.com',
                'Customer',
                'BCIP-123',
            ),
            (error: unknown) =>
                error instanceof AppError &&
                error.statusCode === 503 &&
                !error.message.includes('provider connection details'),
        );
    });
});
