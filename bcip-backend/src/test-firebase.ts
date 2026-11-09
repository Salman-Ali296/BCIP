import 'dotenv/config';

import { getFirebaseAuth } from './config/firebase-admin';

try {
    const auth = getFirebaseAuth();

    console.log('Firebase Admin SDK initialized successfully.');
    console.log(`Firebase project: ${auth.app.options.projectId}`);
} catch (error) {
    console.error('Firebase Admin initialization failed.');

    if (error instanceof Error) {
        console.error(error.message);
    }

    process.exitCode = 1;
}