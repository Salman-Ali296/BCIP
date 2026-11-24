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
import {
    changeRegistrationEmailSchema,
    completeBusinessRegistrationSchema,
} from '../src/modules/accounts/dto/business-registration.dto';

test('business owners can register a workspace with normalized account details', () => {
    const result = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: '  Northwind Support  ',
        industry: 'Retail & E-commerce',
        email: '  OWNER@BCIP.COM ',
        password: 'Secure-pass-123',
        fullName: '  Business Owner  ',
        phone: '+1 555 010 2040',
        termsAccepted: true,
        privacyPolicyAccepted: true,
    });

    assert.equal(result.success, true);
    if (result.success) {
        assert.equal(result.data.email, 'owner@bcip.com');
        assert.equal(result.data.businessName, 'Northwind Support');
        assert.equal(result.data.fullName, 'Business Owner');
    }
});

test('business account draft can be created before collecting business details', () => {
    const result = registerSchema.safeParse({
        accountType: 'BUSINESS',
        email: 'owner@example.com',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
        phone: '+1 555 010 2040',
        termsAccepted: true,
        privacyPolicyAccepted: true,
    });

    assert.equal(result.success, true);
});

test('business registration requires acceptance of both legal policies', () => {
    const result = registerSchema.safeParse({
        accountType: 'BUSINESS',
        email: 'owner@example.com',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
        phone: '+1 555 010 2040',
    });

    assert.equal(result.success, false);
});

test('completed business profiles accept optional evidence and require explicit confirmation', () => {
    const profile = {
        businessName: 'Northwind Support',
        industry: 'Retail',
        teamSize: '11–50',
        phone: '+1 555 010 2040',
        country: 'United States',
        city: 'Seattle',
        businessAddress: '123 Registered Road',
        registrationNumber: 'REG-123',
        evidenceUrl: 'https://registry.example/business.pdf',
        confirmationAccepted: true,
    };

    assert.equal(completeBusinessRegistrationSchema.safeParse(profile).success, true);
    const profileWithoutEvidence = {
        ...profile,
        evidenceUrl: undefined,
        registrationNumber: undefined,
    };
    assert.equal(completeBusinessRegistrationSchema.safeParse(profileWithoutEvidence).success, true);
    assert.equal(
        completeBusinessRegistrationSchema.safeParse({ ...profile, evidenceUrl: 'http://registry.example/business.pdf' }).success,
        false,
    );
    assert.equal(
        completeBusinessRegistrationSchema.safeParse({ ...profile, confirmationAccepted: false }).success,
        false,
    );
    assert.equal(
        completeBusinessRegistrationSchema.safeParse({ ...profile, country: '' }).success,
        false,
    );
    assert.equal(
        completeBusinessRegistrationSchema.safeParse({ ...profile, city: '' }).success,
        false,
    );
    assert.equal(
        completeBusinessRegistrationSchema.safeParse({ ...profile, phone: '123' }).success,
        false,
    );
});

test('registration website and evidence URLs must use HTTP or HTTPS', () => {
    const base = {
        accountType: 'BUSINESS',
        businessName: 'Northwind Support',
        industry: 'Retail',
        email: 'owner@example.com',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
        phone: '+1 555 010 2040',
        termsAccepted: true,
        privacyPolicyAccepted: true,
    };

    assert.equal(
        registerSchema.safeParse({ ...base, website: 'javascript:alert(1)' }).success,
        false,
    );
    assert.equal(
        registerSchema.safeParse({
            ...base,
            documents: [{
                documentType: 'Registration certificate',
                fileName: 'certificate.pdf',
                fileUrl: 'javascript:alert(1)',
            }],
        }).success,
        false,
    );
});

test('business registration evidence requires HTTPS and the registered address and number', () => {
    const base = {
        accountType: 'BUSINESS',
        businessName: 'Northwind Support',
        industry: 'Retail',
        email: 'owner@example.com',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
        phone: '+1 555 010 2040',
        termsAccepted: true,
        privacyPolicyAccepted: true,
    };
    const evidence = {
        documentType: 'BUSINESS_REGISTRATION',
        fileName: 'registration-evidence',
        fileUrl: 'https://registry.example/business.pdf',
        metadata: {
            businessAddress: '123 Registered Road',
            registrationNumber: 'REG-123',
        },
    };

    assert.equal(registerSchema.safeParse({ ...base, documents: [evidence] }).success, true);
    assert.equal(
        registerSchema.safeParse({
            ...base,
            documents: [{ ...evidence, fileUrl: 'http://registry.example/business.pdf' }],
        }).success,
        false,
    );
    assert.equal(
        registerSchema.safeParse({
            ...base,
            documents: [{ ...evidence, metadata: { businessAddress: '123 Registered Road' } }],
        }).success,
        false,
    );
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
        accountType: 'BUSINESS',
        businessName: 'Example Business',
        industry: 'Retail',
        email: 'name@',
        password: 'Secure-pass-123',
        fullName: 'Example User',
        phone: '+1 555 010 2040',
        termsAccepted: true,
        privacyPolicyAccepted: true,
    }).success, false);
});

test('disposable domains are rejected without blocking mainstream public email providers', () => {
    assert.equal(isDisposableEmailAddress('user@mailinator.com'), true);
    assert.equal(isDisposableEmailAddress('user@sub.mailinator.com'), true);
    assert.equal(isDisposableEmailAddress('user@tempmail.com'), true);
    assert.equal(isDisposableEmailAddress('user@temp-mail.net'), true);
    assert.equal(isDisposableEmailAddress('user@sub.mailsac.com'), true);
    assert.equal(isDisposableEmailAddress('user@gmail.com'), false);
    assert.equal(isDisposableEmailAddress('user@outlook.com'), false);
    assert.equal(isDisposableEmailAddress('user@yahoo.com'), false);

    const disposable = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: 'Example Business',
        industry: 'Retail',
        email: 'user@10minutemail.com',
        password: 'Secure-pass-123',
        fullName: 'Example User',
    });
    assert.equal(disposable.success, false);

    const temporaryMail = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: 'Example Business',
        industry: 'Retail',
        email: 'user@tempmail.com',
        password: 'Secure-pass-123',
        fullName: 'Example User',
    });
    assert.equal(temporaryMail.success, false);
});

test('only business accounts may register, and business registration requires a work email', () => {
    const businessWithPersonalEmail = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: 'Northwind Support',
        industry: 'Retail',
        email: 'OWNER@GMAIL.COM',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
        phone: '+1 555 010 2040',
        termsAccepted: true,
        privacyPolicyAccepted: true,
    });
    assert.equal(businessWithPersonalEmail.success, false);

    const businessWithWorkEmail = registerSchema.safeParse({
        accountType: 'BUSINESS',
        businessName: 'Northwind Support',
        industry: 'Retail',
        email: 'OWNER@NORTHWIND.COM',
        password: 'Secure-pass-123',
        fullName: 'Business Owner',
        phone: '+1 555 010 2040',
        termsAccepted: true,
        privacyPolicyAccepted: true,
    });
    assert.equal(businessWithWorkEmail.success, true);

    const customerRegistration = registerSchema.safeParse({
        accountType: 'CUSTOMER',
        email: 'person@gmail.com',
        password: 'Secure-pass-123',
        fullName: 'Example Customer',
    });
    assert.equal(customerRegistration.success, false);
    assert.equal(isPersonalEmailAddress('  OWNER@GMAIL.COM '), true);
    assert.equal(isPersonalEmailAddress('owner@tuta.com'), true);
    assert.equal(isPersonalEmailAddress('owner@northwind.com'), false);
});

test('team size accepts the en dash the wizard sends and a plain hyphen, stored as en dash', () => {
    const profile = {
        businessName: 'Northwind Support',
        industry: 'Retail',
        teamSize: '11–50',
        phone: '+1 555 010 2040',
        country: 'United States',
        city: 'Seattle',
        confirmationAccepted: true,
    };

    const withEnDash = completeBusinessRegistrationSchema.safeParse(profile);
    assert.equal(withEnDash.success, true);
    if (withEnDash.success) assert.equal(withEnDash.data.teamSize, '11–50');

    const withHyphen = completeBusinessRegistrationSchema.safeParse({ ...profile, teamSize: '11-50' });
    assert.equal(withHyphen.success, true);
    if (withHyphen.success) assert.equal(withHyphen.data.teamSize, '11–50');

    assert.equal(completeBusinessRegistrationSchema.safeParse({ ...profile, teamSize: '12-50' }).success, false);
});

test('changing a pending registration email keeps the current email from the request body', () => {
    const result = changeRegistrationEmailSchema.safeParse({
        email: 'owner@northwind.example',
        newEmail: 'support@northwind.example',
        password: 'Secure-pass-123',
    });

    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.email, 'owner@northwind.example');
    assert.equal(
        changeRegistrationEmailSchema.safeParse({ newEmail: 'support@northwind.example', password: 'x' }).success,
        false,
    );
});
