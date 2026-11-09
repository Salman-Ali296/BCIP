import assert from 'node:assert/strict';
import test from 'node:test';
import { registerSchema } from '../src/modules/accounts/dto/register.dto';
import { loginSchema } from '../src/modules/accounts/dto/login.dto';
import {
    isDisposableEmailAddress,
    isPersonalEmailAddress,
} from '../src/modules/accounts/dto/email-policy';
import { verifyEmailCodeSchema } from '../src/modules/accounts/dto/verify-email.dto';
import { AppError } from '../src/utils/error';
import { EmailService } from '../src/services/emailService';

test('business owners can register a workspace with normalized account details', () => {
    const result = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: '  Northwind Support  ',
        industry: 'Retail & E-commerce',
        email: '  OWNER@BCIP.COM ',
        password: 'Secure-pass-123',
        fullName: '  Business Owner  ',
    });

    assert.equal(result.success, true);
    if (result.success) {
        assert.equal(result.data.email, 'owner@bcip.com');
        assert.equal(result.data.businessName, 'Northwind Support');
        assert.equal(result.data.fullName, 'Business Owner');
    }
});

test('business registration requires an industry', () => {
    const result = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: 'Northwind Support',
        email: 'owner@example.com',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
    });

    assert.equal(result.success, false);
});

test('verification setup fails explicitly when Gmail delivery is not configured', () => {
    const keys = [
        'GMAIL_USER',
        'GMAIL_APP_PASSWORD',
        'APP_BASE_URL',
    ];
    const originalValues = new Map(keys.map(key => [key, process.env[key]]));
    for (const key of keys) delete process.env[key];

    try {
        assert.throws(
            () => new EmailService().assertVerificationEmailConfigured(),
            (error: unknown) =>
                error instanceof AppError &&
                error.statusCode === 503 &&
                error.details?.missingConfiguration?.includes('GMAIL_USER'),
        );
    } finally {
        for (const [key, value] of originalValues) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});

test('verification setup accepts a Gmail app-password configuration', () => {
    const values: Record<string, string> = {
        GMAIL_USER: 'verification@gmail.com',
        GMAIL_APP_PASSWORD: 'abcdefghijklmnop',
        APP_BASE_URL: 'https://bcip.example.com',
    };
    const originalValues = new Map(
        Object.keys(values).map(key => [key, process.env[key]]),
    );
    Object.assign(process.env, values);

    try {
        assert.doesNotThrow(() =>
            new EmailService().assertVerificationEmailConfigured(),
        );
    } finally {
        for (const [key, value] of originalValues) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});

test('email verification accepts only a valid email and a six-digit code', () => {
    assert.equal(
        verifyEmailCodeSchema.safeParse({
            email: 'owner@example.com',
            code: '012345',
        }).success,
        true,
    );
    assert.equal(
        verifyEmailCodeSchema.safeParse({
            email: 'owner@example.com',
            code: '12345a',
        }).success,
        false,
    );
    assert.equal(
        verifyEmailCodeSchema.safeParse({
            email: 'owner@example.com',
            code: '12345',
        }).success,
        false,
    );
});

test('registration and login reject malformed email addresses', () => {
    assert.equal(loginSchema.safeParse({ email: 'not-an-email', password: 'password123' }).success, false);
    assert.equal(registerSchema.safeParse({
        accountType: 'CUSTOMER',
        email: 'name@',
        password: 'Secure-pass-123',
        fullName: 'Example User',
    }).success, false);
});

test('disposable domains are rejected without blocking mainstream public email providers', () => {
    assert.equal(isDisposableEmailAddress('user@mailinator.com'), true);
    assert.equal(isDisposableEmailAddress('user@sub.mailinator.com'), true);
    assert.equal(isDisposableEmailAddress('user@gmail.com'), false);
    assert.equal(isDisposableEmailAddress('user@outlook.com'), false);
    assert.equal(isDisposableEmailAddress('user@yahoo.com'), false);

    const disposable = registerSchema.safeParse({
        accountType: 'CUSTOMER',
        email: 'user@10minutemail.com',
        password: 'Secure-pass-123',
        fullName: 'Example User',
    });
    assert.equal(disposable.success, false);
});

test('business registration requires a work email while customer accounts may use personal email', () => {
    const businessWithPersonalEmail = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: 'Northwind Support',
        industry: 'Retail',
        email: 'OWNER@GMAIL.COM',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
    });
    assert.equal(businessWithPersonalEmail.success, false);

    const businessWithWorkEmail = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: 'Northwind Support',
        industry: 'Retail',
        email: 'OWNER@NORTHWIND.COM',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
    });
    assert.equal(businessWithWorkEmail.success, true);

    const customerWithPersonalEmail = registerSchema.safeParse({
        accountType: 'CUSTOMER',
        email: 'person@gmail.com',
        password: 'Secure-pass-123',
        fullName: 'Example Customer',
    });
    assert.equal(customerWithPersonalEmail.success, true);
    assert.equal(isPersonalEmailAddress('  OWNER@GMAIL.COM '), true);
    assert.equal(isPersonalEmailAddress('owner@northwind.com'), false);
});
