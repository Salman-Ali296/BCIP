import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { Errors } from '../utils/error';
import { AUTH_SESSION_COOKIE } from '../modules/accounts/auth-session-cookie';
import {
	isPublicCustomerAccount,
	PUBLIC_CUSTOMER_ACCESS_MESSAGE,
} from '../modules/accounts/customer-access.policy';
import { isUnapprovedBusinessAdministrator } from '../modules/accounts/business-approval.policy';

interface AuthToken {
	userId?: unknown;
	tenantId?: unknown;
	purpose?: unknown;
}

export async function authMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> {
	const header = req.headers.authorization;
	let token: string | undefined;
	let cookieSession = false;

	if (header !== undefined) {
		token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
	} else {
		const cookies = req.headers.cookie
			?.split(';')
			.map((cookie) => cookie.trim())
			.filter((cookie) => cookie.startsWith(`${AUTH_SESSION_COOKIE}=`));
		if (cookies?.length === 1) {
			token = cookies[0].slice(AUTH_SESSION_COOKIE.length + 1);
			cookieSession = true;
		}
	}

	if (!token) {
		next(Errors.unauthorized());
		return;
	}

	if (
		cookieSession &&
		!['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
		(!req.headers.origin || !env.CORS_ORIGINS.includes(req.headers.origin))
	) {
		next(Errors.forbidden('Request origin not allowed'));
		return;
	}

	let payload: AuthToken;
	try {
		payload = jwt.verify(token, env.JWT_SECRET, {
			algorithms: ['HS256'],
		}) as AuthToken;
	} catch {
		next(Errors.unauthorized('Invalid or expired token'));
		return;
	}

	// Purpose-scoped tokens (e.g. registration continuation) share the signing
	// secret but must never be accepted as session tokens.
	if (
		typeof payload.userId !== 'string' ||
		typeof payload.tenantId !== 'string' ||
		payload.purpose !== undefined
	) {
		next(Errors.unauthorized('Invalid token claims'));
		return;
	}

	const user = await prisma.user.findFirst({
		where: {
			id: payload.userId,
			tenantId: payload.tenantId,
		},
		select: {
			id: true,
			email: true,
			role: true,
			accountType: true,
			tenantId: true,
			emailVerified: true,
			isActive: true,
			tenant: {
				select: {
					isActive: true,
					businessVerified: true,
				},
			},
		},
	});

	if (!user || !user.tenant) {
		next(Errors.unauthorized('Invalid or expired token'));
		return;
	}
	if (isPublicCustomerAccount(user.accountType)) {
		next(Errors.forbidden(PUBLIC_CUSTOMER_ACCESS_MESSAGE));
		return;
	}
	const unapprovedBusinessAdministrator =
		isUnapprovedBusinessAdministrator(user);
	if (!user.isActive) {
		next(Errors.accountSuspended());
		return;
	}
	if (!user.emailVerified) {
		next(Errors.emailNotVerified());
		return;
	}
	if (
		user.accountType === 'BUSINESS' &&
		!user.tenant.businessVerified &&
		!unapprovedBusinessAdministrator
	) {
		next(Errors.businessVerificationPending());
		return;
	}
	if (!user.tenant.isActive && !unapprovedBusinessAdministrator) {
		next(Errors.accountSuspended());
		return;
	}
	if (
		unapprovedBusinessAdministrator &&
		!isAllowedPreApprovalRequest(req)
	) {
		next(Errors.businessVerificationPending());
		return;
	}

	req.user = user;
	req.tenantId = user.tenantId;
	next();
}

function isAllowedPreApprovalRequest(req: Request): boolean {
	const route = req.originalUrl.split('?')[0];
	return (
		(req.method === 'GET' &&
			(route === '/api/auth/me' || route === '/api/v1/auth/me')) ||
		(req.method === 'POST' &&
			(route === '/api/auth/session-upgrade' ||
				route === '/api/v1/auth/session-upgrade'))
	);
}

export function requireRoles(...roles: string[]) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.user || !roles.includes(req.user.role)) {
			next(Errors.forbidden('Insufficient permissions'));
			return;
		}
		next();
	};
}
