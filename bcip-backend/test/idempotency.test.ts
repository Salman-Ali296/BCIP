import assert from 'node:assert/strict';
import test from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import { idempotencyMiddleware } from '../src/middleware/idempotency';

interface Captured {
    status?: number;
    body?: unknown;
    headers: Record<string, string>;
}

function request(overrides: { key?: string; authorization?: string; ip?: string; url?: string; method?: string }): Request {
    const headers: Record<string, string> = {};
    if (overrides.key !== undefined) headers['x-idempotency-key'] = overrides.key;
    if (overrides.authorization) headers.authorization = overrides.authorization;
    return {
        method: overrides.method ?? 'POST',
        originalUrl: overrides.url ?? '/api/complaints/abc/escalate',
        headers,
        ip: overrides.ip ?? '10.0.0.1',
    } as unknown as Request;
}

function response(captured: Captured): Response {
    const res = {
        statusCode: 200,
        status(code: number) {
            this.statusCode = code;
            captured.status = code;
            return this;
        },
        setHeader(name: string, value: string) {
            captured.headers[name] = value;
        },
        json(body: unknown) {
            captured.body = body;
            return this;
        },
    };
    return res as unknown as Response;
}

/** Runs the middleware; when it calls next(), the "handler" responds with `handlerBody`. */
function run(req: Request, handlerBody: unknown, handlerStatus = 200): { captured: Captured; handled: boolean } {
    const captured: Captured = { headers: {} };
    const res = response(captured);
    let handled = false;
    const next: NextFunction = () => {
        handled = true;
        res.statusCode = handlerStatus;
        res.json(handlerBody);
    };
    idempotencyMiddleware(req, res, next);
    return { captured, handled };
}

test('idempotent replay is returned to the same caller', () => {
    const key = `same-caller-${Date.now()}`;
    const first = run(request({ key, authorization: 'Bearer caller-a' }), { id: 1 });
    assert.equal(first.handled, true);

    const second = run(request({ key, authorization: 'Bearer caller-a' }), { id: 2 });
    assert.equal(second.handled, false);
    assert.deepEqual(second.captured.body, { id: 1 });
    assert.equal(second.captured.headers['x-idempotent-replay'], 'true');
});

test('cached responses are never served to a different caller reusing the key', () => {
    const key = `cross-caller-${Date.now()}`;
    run(request({ key, authorization: 'Bearer victim-token' }), { secret: 'victim-data' });

    const attacker = run(request({ key, authorization: 'Bearer attacker-token' }), { secret: 'attacker-data' });
    assert.equal(attacker.handled, true);
    assert.deepEqual(attacker.captured.body, { secret: 'attacker-data' });

    const anonymous = run(request({ key, ip: '10.9.9.9' }), { anonymous: true });
    assert.equal(anonymous.handled, true);
});

test('failed responses are not cached', () => {
    const key = `failure-${Date.now()}`;
    run(request({ key, authorization: 'Bearer caller-b' }), { error: 'boom' }, 500);
    const retry = run(request({ key, authorization: 'Bearer caller-b' }), { ok: true });
    assert.equal(retry.handled, true);
    assert.deepEqual(retry.captured.body, { ok: true });
});

test('authentication responses are never cached', () => {
    const key = `auth-${Date.now()}`;
    run(request({ key, url: '/api/v1/auth/login' }), { token: 'first' });
    const retry = run(request({ key, url: '/api/v1/auth/login' }), { token: 'second' });
    assert.equal(retry.handled, true);
    assert.deepEqual(retry.captured.body, { token: 'second' });
});

test('malformed idempotency keys are rejected', () => {
    const result = run(request({ key: 'x'.repeat(129) }), {});
    assert.equal(result.handled, false);
    assert.equal(result.captured.status, 400);
});
