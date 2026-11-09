import dotenv from 'dotenv';
import path from 'node:path';

// Load the backend root .env file.
// This assumes the compiled/source file resolves from src/config.
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const configuredNodeEnv = process.env.NODE_ENV?.trim();

export const env = {
    NODE_ENV: configuredNodeEnv || 'development',

    PORT: Number.parseInt(process.env.PORT || '4000', 10),

    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || '',

    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Firebase Admin SDK configuration.
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',

    EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS: Number(
        process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS || '60',
    ),

    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

    STRIPE_PRICES: {
        starter: {
            month: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
            year: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
        },
        growth: {
            month: process.env.STRIPE_PRICE_GROWTH_MONTHLY || '',
            year: process.env.STRIPE_PRICE_GROWTH_YEARLY || '',
        },
        business: {
            month: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
            year: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
        },
    },

    CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
};

export function validateEnv(): void {
    if (!configuredNodeEnv) {
        throw new Error('NODE_ENV is required');
    }

    if (!['development', 'test', 'production'].includes(configuredNodeEnv)) {
        throw new Error('NODE_ENV must be development, test, or production');
    }

    if (!env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required');
    }

    if (env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters');
    }

    if (
        !Number.isInteger(env.PORT) ||
        env.PORT < 1 ||
        env.PORT > 65535
    ) {
        throw new Error('PORT must be a valid TCP port');
    }

    if (
        !Number.isInteger(env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS) ||
        env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS < 30 ||
        env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS > 3600
    ) {
        throw new Error(
            'EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS must be between 30 and 3600',
        );
    }
}