import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { createApp } from '../src/app';
import { verifyStripeSignature } from '../src/modules/billing/billing.service';

test('health endpoint responds without requiring authenticated access', async () => {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));

    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');

        const response = await fetch(`http://127.0.0.1:${address.port}/health`);
        const body = await response.json() as {
            status: string;
            timestamp: string;
            environment: string;
        };

        assert.equal(response.status, 200);
        assert.equal(body.status, 'ok');
        assert.ok(Number.isFinite(Date.parse(body.timestamp)));
        assert.ok(body.environment.length > 0);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
});

test('Stripe signature verification validates signatures and rejects stale timestamps', () => {
    const secret = 'whsec_test_secret';
    const rawBody = Buffer.from('{"type":"invoice.paid"}');
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', secret)
        .update(`${timestamp}.`)
        .update(rawBody)
        .digest('hex');

    assert.equal(verifyStripeSignature(rawBody, `t=${timestamp},v1=${signature}`, secret), true);
    assert.equal(verifyStripeSignature(rawBody, `t=${timestamp},v1=${'0'.repeat(64)}`, secret), false);
    assert.equal(verifyStripeSignature(rawBody, `t=${timestamp - 301},v1=${signature}`, secret), false);
});

test('email verification rejects a missing token without accessing the database', async () => {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));

    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');

        const response = await fetch(
            `http://127.0.0.1:${address.port}/api/v1/auth/verify-email`,
        );
        const body = await response.json() as { error?: { code?: string } };

        assert.equal(response.status, 400);
        assert.equal(body.error?.code, 'VALIDATION_ERROR');
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
});

test('the legacy auth prefix uses the same protected, rate-limited auth routes', async () => {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));

    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');
        const baseUrl = `http://127.0.0.1:${address.port}`;

        const profileResponse = await fetch(`${baseUrl}/api/auth/me`);
        const verificationResponse = await fetch(`${baseUrl}/api/auth/verify-email`);
        const profileBody = await profileResponse.json() as { error?: { code?: string } };
        const verificationBody = await verificationResponse.json() as { error?: { code?: string } };

        assert.equal(profileResponse.status, 401);
        assert.equal(profileBody.error?.code, 'UNAUTHORIZED');
        assert.equal(verificationResponse.status, 400);
        assert.equal(verificationBody.error?.code, 'VALIDATION_ERROR');

        let loginStatus = 0;
        for (let attempt = 0; attempt < 11; attempt += 1) {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'not-an-email', password: 'password123' }),
            });
            loginStatus = response.status;
        }
        assert.equal(loginStatus, 429);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
});

test('billing webhook requires raw JSON and a provider signature', async () => {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));

    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');

        const response = await fetch(
            `http://127.0.0.1:${address.port}/api/v1/auth/billing/webhook/Stripe`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{"type":"invoice.paid"}',
            },
        );

        assert.equal(response.status, 401);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
});

test('billing webhook keeps raw-body signature validation on the legacy auth prefix', async () => {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));

    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');

        const response = await fetch(
            `http://127.0.0.1:${address.port}/api/auth/billing/webhook/Stripe`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{"type":"invoice.paid"}',
            },
        );

        assert.equal(response.status, 401);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
});

test('social identity claims and public admin endpoints cannot create or manage authenticated accounts', async () => {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));

    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');
        const baseUrl = `http://127.0.0.1:${address.port}`;

        const socialResponse = await fetch(`${baseUrl}/api/v1/auth/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                provider: 'google',
                email: 'admin@example.com',
                role: 'SUPER_ADMIN',
                accountType: 'BUSINESS',
            }),
        });
        const adminResponse = await fetch(`${baseUrl}/api/v1/admin/users`);
        const approvalResponse = await fetch(
            `${baseUrl}/api/v1/admin/businesses/pending-verification`,
        );

        assert.equal(socialResponse.status, 404);
        assert.equal(adminResponse.status, 401);
        assert.equal(approvalResponse.status, 401);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
});

test('login and verification resend endpoints enforce request rate limits', async () => {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));

    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');
        const baseUrl = `http://127.0.0.1:${address.port}`;

        let loginStatus = 0;
        for (let attempt = 0; attempt < 11; attempt += 1) {
            const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'not-an-email', password: 'password123' }),
            });
            loginStatus = response.status;
        }
        assert.equal(loginStatus, 429);

        let resendStatus = 0;
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const response = await fetch(`${baseUrl}/api/v1/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'nobody@example.com' }),
            });
            resendStatus = response.status;
        }
        assert.equal(resendStatus, 429);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
});

test('authenticated business APIs reject direct requests without a verified session', async () => {
    const server = createApp().listen(0);
    await new Promise<void>(resolve => server.once('listening', resolve));

    try {
        const address = server.address();
        assert.ok(address && typeof address !== 'string');
        const response = await fetch(
            `http://127.0.0.1:${address.port}/api/v1/auth/trial`,
        );
        const body = await response.json() as { error?: { code?: string } };
        assert.equal(response.status, 401);
        assert.equal(body.error?.code, 'UNAUTHORIZED');
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
});
