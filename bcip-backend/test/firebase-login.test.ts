import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import type { NextFunction, Request, Response } from 'express';

import { env } from '../src/config/env';
import { authService } from '../src/modules/accounts/auth.service';
import { AuthController } from '../src/modules/accounts/auth.controller';

function mockMethod<Arguments extends unknown[], Result>(
    context: TestContext,
    target: object,
    methodName: string,
    implementation: (...args: Arguments) => Result,
) {
    const original = Object.getOwnPropertyDescriptor(target, methodName);
    Object.defineProperty(target, methodName, {
        configurable: true,
        writable: true,
        value: (...args: Arguments) => implementation(...args),
    });
    context.after(() => {
        if (original) {
            Object.defineProperty(target, methodName, original);
        } else {
            Reflect.deleteProperty(target, methodName);
        }
    });
}

function makeResponse() {
    const responseState: {
        statusCode?: number;
        body?: unknown;
        headers: Record<string, string>;
    } = { headers: {} };
    const response = {
        setHeader(name: string, value: string) {
            responseState.headers[name] = value;
            return response;
        },
        status(statusCode: number) {
            responseState.statusCode = statusCode;
            return response;
        },
        json(body: unknown) {
            responseState.body = body;
            return response;
        },
    };
    return { response: response as unknown as Response, responseState };
}

test('Firebase login establishes an HttpOnly BCIP cookie without returning its JWT', async (t) => {
    const originalNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';
    t.after(() => {
        env.NODE_ENV = originalNodeEnv;
    });

    mockMethod(t, authService, 'createFirebaseSession', async (uid: string) => {
        assert.equal(uid, 'firebase-user-1');
        return {
            token: 'bcip-session-jwt',
            user: {
                id: 'account-1',
                email: 'customer@example.com',
                fullName: 'Jane Doe',
                role: 'CUSTOMER',
                accountType: 'CUSTOMER',
                emailVerified: true,
                tenantId: 'tenant-1',
                tenantName: 'BCIP Platform',
            },
            tenant: { id: 'tenant-1', name: 'BCIP Platform' },
        } as never;
    });

    const { response, responseState } = makeResponse();
    let nextError: unknown;
    const next: NextFunction = (error) => {
        nextError = error;
    };
    const request = {
        body: { rememberMe: true },
        firebaseUser: { uid: 'firebase-user-1' },
    } as unknown as Request;

    await new AuthController().firebaseLogin(request, response, next);

    assert.equal(nextError, undefined);
    assert.equal(responseState.statusCode, 200);
    assert.match(
        responseState.headers['Set-Cookie'],
        /^bcip_session=bcip-session-jwt;.*HttpOnly/,
    );
    assert.match(responseState.headers['Set-Cookie'], /Max-Age=604800/);
    assert.equal(
        JSON.stringify(responseState.body).includes('bcip-session-jwt'),
        false,
    );
    assert.equal(
        (responseState.body as { data: { user: { email: string } } }).data.user.email,
        'customer@example.com',
    );
});
