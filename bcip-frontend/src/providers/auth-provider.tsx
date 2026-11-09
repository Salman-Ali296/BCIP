'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  bootstrapFirebaseLogin,
  exchangeFirebaseToken,
  getCurrentUser,
  loginWithPassword,
  logoutFromBackend,
  upgradeLegacySession,
  type CookieAuthSession,
  type AuthUser,
} from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';
import type { Auth, UserCredential } from 'firebase/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

let sessionRestoreRequest: Promise<AuthUser> | null = null;
const AUTH_CHANNEL_NAME = 'bcip-auth-session';

function broadcastSessionChange(): void {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
  channel.postMessage({ type: 'session-changed' });
  channel.close();
}

function restoreBackendSession(): Promise<AuthUser> {
  if (!sessionRestoreRequest) {
    sessionRestoreRequest = (async () => {
      const persistentToken = localStorage.getItem('token');
      const transientToken = sessionStorage.getItem('token');
      const legacyToken = persistentToken ?? transientToken;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      if (legacyToken) {
        try {
          await upgradeLegacySession(legacyToken, Boolean(persistentToken));
        } catch (error) {
          if (!(error instanceof ApiClientError) || error.status !== 401) {
            throw error;
          }
        }
      }

      return getCurrentUser();
    })().finally(() => {
      sessionRestoreRequest = null;
    });
  }

  return sessionRestoreRequest;
}

export type User = AuthUser;

export function getRoleHome(role?: string): string {
  if (!role) return '/dashboard';
  const upper = role.toUpperCase();
  if (upper === 'SUPER_ADMIN') return '/admin/dashboard';
  if (upper === 'CUSTOMER') return '/customer/dashboard';
  if (upper === 'ESCALATION_AGENT') return '/business/dashboard';
  if (
    upper === 'BUSINESS_ADMIN' ||
    upper === 'MANAGER' ||
    upper === 'AGENT' ||
    upper === 'BUSINESS'
  ) {
    return '/business/dashboard';
  }
  return '/dashboard';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  error: string | null;
  refreshSession: () => Promise<void>;
  login: (
    email: string,
    password: string,
    options?: { rememberMe?: boolean; returnTo?: string | null },
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export class AuthRequestError extends Error {
  constructor(message: string, readonly code?: string, readonly status?: number) {
    super(message);
    this.name = "AuthRequestError";
  }
}

function firebaseErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  return undefined;
}

function toAuthRequestError(error: unknown): AuthRequestError {
  if (error instanceof ApiClientError) {
    return new AuthRequestError(error.message, error.code, error.status);
  }

  const code = firebaseErrorCode(error);
  if (code === 'auth/user-disabled') {
    return new AuthRequestError(
      'This account is inactive or not yet verified. Contact your organization administrator or BCIP support.',
      'ACCOUNT_SUSPENDED',
      403,
    );
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password'
  ) {
    return new AuthRequestError(
      'The email address or password is incorrect.',
      'INVALID_CREDENTIALS',
      401,
    );
  }
  if (code === 'auth/network-request-failed') {
    return new AuthRequestError(
      'We couldn’t connect to the sign-in service. Check your connection and try again.',
      'NETWORK_ERROR',
      0,
    );
  }
  return new AuthRequestError(
    'We couldn’t complete sign-in. Please try again.',
    'AUTHENTICATION_FAILED',
  );
}

function isFirebaseCredentialFailure(error: unknown): boolean {
  const code = firebaseErrorCode(error);
  return code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-disabled';
}

function getPostLoginPath(role: string | undefined, returnTo?: string | null): string {
  const roleHome = getRoleHome(role);
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return roleHome;
  }

  const requestedUrl = new URL(returnTo, window.location.origin);
  if (requestedUrl.origin !== window.location.origin) {
    return roleHome;
  }

  const rolePrefix =
    roleHome.slice(0, roleHome.lastIndexOf("/")) || roleHome;
  return requestedUrl.pathname === rolePrefix ||
    requestedUrl.pathname.startsWith(`${rolePrefix}/`)
    ? `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
    : roleHome;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const operationId = useRef(0);
  const router = useRouter();
  const isLoading = status === 'loading';

  const refreshSession = useCallback(async () => {
    const currentOperation = ++operationId.current;
    setStatus('loading');
    setError(null);

    try {
      const currentUser = await restoreBackendSession();
      if (operationId.current !== currentOperation) return;
      if (!currentUser.emailVerified) {
        throw new ApiClientError(
          'Email verification is required before signing in.',
          403,
          'EMAIL_NOT_VERIFIED',
        );
      }
      setUser(currentUser);
      setToken(null);
      setStatus('authenticated');
    } catch (cause) {
      if (operationId.current !== currentOperation) return;
      setUser(null);
      setToken(null);
      if (
        cause instanceof ApiClientError &&
        (cause.status === 401 || cause.status === 403)
      ) {
        setStatus('unauthenticated');
        try {
          await logoutFromBackend();
        } catch {
          // The rejected cookie is not accepted as an authenticated session.
        }
      } else {
        setStatus('error');
        setError(
          'We couldn’t check your sign-in session. Check your connection and try again.',
        );
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void refreshSession();
    });
    return () => {
      active = false;
    };
  }, [refreshSession]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
      setError(null);
      setStatus('unauthenticated');
    };

    window.addEventListener('bcip:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('bcip:session-expired', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (
        typeof event.data === 'object' &&
        event.data !== null &&
        'type' in event.data &&
        event.data.type === 'session-changed'
      ) {
        void refreshSession();
      }
    };
    return () => channel.close();
  }, [refreshSession]);

  const login: AuthContextType["login"] = async (
    email,
    password,
    options = {},
  ) => {
    const currentOperation = ++operationId.current;
    setUser(null);
    setToken(null);
    setError(null);
    setStatus('loading');

    let auth: Auth | undefined;
    let session: CookieAuthSession;
    try {
      const firebaseClient = await import('@/lib/firebase');
      if (!firebaseClient.isFirebaseClientConfigured()) {
        const passwordSession = await loginWithPassword(email, password);
        session = await upgradeLegacySession(
          passwordSession.token,
          options.rememberMe ?? false,
        );
      } else {
        const {
          inMemoryPersistence,
          setPersistence,
          signInWithCustomToken,
          signInWithEmailAndPassword,
        } = await import('firebase/auth');
        auth = firebaseClient.getFirebaseAuth();
        await setPersistence(auth, inMemoryPersistence);
        let credential: UserCredential;
        try {
          credential = await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          if (!isFirebaseCredentialFailure(error)) {
            throw toAuthRequestError(error);
          }

          const { customToken } = await bootstrapFirebaseLogin(email, password);
          credential = await signInWithCustomToken(auth, customToken);
        }

        const idToken = await credential.user.getIdToken();
        session = await exchangeFirebaseToken(
          idToken,
          options.rememberMe ?? false,
        );
      }
    } catch (error) {
      const authError = toAuthRequestError(error);
      if (operationId.current === currentOperation) {
        setUser(null);
        setStatus('unauthenticated');
        setError(authError.message);
      }
      throw authError;
    } finally {
      if (auth) {
        try {
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
        } catch {
          if (operationId.current === currentOperation) {
            setUser(null);
            setToken(null);
            setStatus('unauthenticated');
            setError('We couldn’t safely complete sign-in. Please try again.');
          }
          throw new AuthRequestError(
            'We couldn’t safely complete sign-in. Please try again.',
            'AUTHENTICATION_FAILED',
          );
        }
      }
    }

    try {
      if (!session.user || session.user.emailVerified !== true) {
        throw new AuthRequestError(
          'Email verification is required before signing in.',
          'EMAIL_NOT_VERIFIED',
          403,
        );
      }
      if (operationId.current !== currentOperation) return;

      setToken(null);
      setUser(session.user);
      setStatus('authenticated');
      broadcastSessionChange();
      router.push(getPostLoginPath(session.user.role, options.returnTo));
    } catch (cause) {
      const authError = toAuthRequestError(cause);
      if (operationId.current === currentOperation) {
        setUser(null);
        setToken(null);
        setStatus('unauthenticated');
        setError(authError.message);
      }
      throw authError;
    }
  };

  const logout = () => {
    operationId.current += 1;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setError(null);
    setStatus('unauthenticated');

    void (async () => {
      let logoutError: unknown;
      try {
        await logoutFromBackend();
      } catch (cause) {
        logoutError = cause;
      }
      broadcastSessionChange();

      try {
        const { getApps } = await import('firebase/app');
        const [app] = getApps();
        if (app) {
          const { getAuth, signOut } = await import('firebase/auth');
          await signOut(getAuth(app));
        }
      } catch (cause) {
        logoutError ??= cause;
      }

      if (logoutError) {
        setStatus('error');
        setError(
          'We couldn’t fully end your session. Check your connection and try signing out again.',
        );
      }
      router.replace('/login');
    })();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        status,
        error,
        refreshSession,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}