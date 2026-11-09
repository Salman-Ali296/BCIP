import {
    applicationDefault,
    cert,
    getApps,
    initializeApp,
} from 'firebase-admin/app';

import {
    getAuth,
    type Auth,
} from 'firebase-admin/auth';

import { env } from './env';

const FIREBASE_APP_NAME = 'bcip-admin';

let firebaseAuthInstance: Auth | undefined;

export function getFirebaseAuth(): Auth {
    if (firebaseAuthInstance) {
        return firebaseAuthInstance;
    }

    if (!env.FIREBASE_PROJECT_ID) {
        throw new Error('FIREBASE_PROJECT_ID is required for Firebase Admin.');
    }

    const hasClientEmail = Boolean(env.FIREBASE_CLIENT_EMAIL);
    const hasPrivateKey = Boolean(env.FIREBASE_PRIVATE_KEY);
    if (hasClientEmail !== hasPrivateKey) {
        throw new Error(
            'Firebase service-account configuration is incomplete. Configure both credential fields or use Application Default Credentials.',
        );
    }

    const credential = hasClientEmail && hasPrivateKey
        ? cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
        : applicationDefault();

    const existingApp = getApps().find(
        (app) => app.name === FIREBASE_APP_NAME,
    );
    if (
        existingApp &&
        existingApp.options.projectId !== env.FIREBASE_PROJECT_ID
    ) {
        throw new Error(
            'The existing Firebase Admin app is configured for a different project.',
        );
    }

    const firebaseApp = existingApp ?? initializeApp(
        {
            credential,
            projectId: env.FIREBASE_PROJECT_ID,
        },
        FIREBASE_APP_NAME,
    );

    firebaseAuthInstance = getAuth(firebaseApp);

    return firebaseAuthInstance;
}