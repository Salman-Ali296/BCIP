import type { Response } from 'express';

import { env } from '../../config/env';

export const AUTH_SESSION_COOKIE = 'bcip_session';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function setAuthSessionCookie(
    response: Response,
    token: string,
    rememberMe: boolean,
): void {
    const cookieParts = [
        `${AUTH_SESSION_COOKIE}=${token}`,
        'Path=/',
        'HttpOnly',
        env.NODE_ENV === 'production' ? 'SameSite=None' : 'SameSite=Lax',
    ];

    if (env.NODE_ENV === 'production') {
        cookieParts.push('Secure');
    }
    if (rememberMe) {
        cookieParts.push(`Max-Age=${Math.floor(SESSION_MAX_AGE_MS / 1000)}`);
    }

    response.setHeader('Set-Cookie', cookieParts.join('; '));
}

export function clearAuthSessionCookie(response: Response): void {
    const cookieParts = [
        `${AUTH_SESSION_COOKIE}=`,
        'Path=/',
        'HttpOnly',
        env.NODE_ENV === 'production' ? 'SameSite=None' : 'SameSite=Lax',
        'Max-Age=0',
    ];

    if (env.NODE_ENV === 'production') {
        cookieParts.push('Secure');
    }

    response.setHeader('Set-Cookie', cookieParts.join('; '));
}
