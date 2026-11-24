
import { z } from 'zod';
import { emailAddressSchema } from './email-policy';

/**
 * Safely validates URLs without allowing URL constructor
 * exceptions to escape Zod validation.
 */
const isSafeUrl = (
    value: string,
    allowedProtocols: string[],
): boolean => {
    try {
        const url = new URL(value);

        return (
            allowedProtocols.includes(url.protocol) &&
            !url.username &&
            !url.password &&
            Boolean(url.hostname)
        );
    } catch {
        return false;
    }
};

const httpUrl = z
    .string()
    .trim()
    .url('Enter a valid website URL')
    .refine(
        value => isSafeUrl(value, ['https:', 'http:']),
        'Use a valid HTTP or HTTPS URL',
    );

const httpsUrl = z
    .string()
    .trim()
    .url('Enter a valid logo URL')
    .refine(
        value => isSafeUrl(value, ['https:']),
        'Use a valid HTTPS URL',
    );

const timezone = z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine(value => {
        try {
            new Intl.DateTimeFormat('en-US', {
                timeZone: value,
            });
            return true;
        } catch {
            return false;
        }
    }, 'Choose a valid time zone');

const time = z.string().regex(
    /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    'Use 24-hour time (HH:mm)',
);

const priority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const day = z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
]);

// ============================================================
// BUSINESS IDENTITY
// ============================================================

export const businessIdentitySchema = z.object({
    businessName: z.string().trim().min(2).max(120),

    legalBusinessName: z
        .string()
        .trim()
        .max(160)
        .optional()
        .default(''),

    website: httpUrl
        .or(z.literal(''))
        .optional()
        .default(''),

    industry: z.enum([
         'Technology',
        'Software & SaaS',
        'IT Services',
        'Healthcare',
        'Pharmaceuticals',
        'Fitness & Wellness',
        'Finance',
        'Banking',
        'Insurance',
        'Real Estate',
        'Retail',
        'E-commerce',
        'Wholesale & Distribution',
        'Food & Beverage',
        'Restaurants & Cafes',
        'Fashion & Apparel',
        'Beauty & Personal Care',
        'Education',
        'Manufacturing',
        'Construction',
        'Automotive',
        'Agriculture',
        'Energy & Utilities',
        'Telecommunications',
        'Media & Entertainment',
        'Marketing & Advertising',
        'Logistics',
        'Transportation',
        'Hospitality',
        'Travel & Tourism',
        'Legal Services',
        'Consulting & Professional Services',
        'Security Services',
        'Government & Public Sector',
        'Non-Profit',
        'Other',
    ]),

    teamSize: z.enum([
        '1–10',
        '11–50',
        '51–200',
        '201–500',
        '501–1000',
        '1000+',
    ]),

    country: z.string().trim().min(2).max(100),

    timezone,

    primaryEmail: emailAddressSchema,

    primaryContactName: z.string().trim().min(2).max(120),

    phone: z
        .string()
        .trim()
        .min(7)
        .max(30)
        .regex(/^[+()\d.\-\s]+$/, 'Enter a valid phone number'),

    logoUrl: httpsUrl
        .or(z.literal(''))
        .optional()
        .default(''),
}).strict();

// ============================================================
// BUSINESS OPERATIONS
// ============================================================

/** Positions inside a complaint-handling team, from most to least senior. */
export const TEAM_ROLE_LEVELS = ['MANAGER', 'ESCALATION_AGENT', 'AGENT'] as const;

export const businessOperationsSchema = z.object({
    departments: z.array(
        z.object({
            id: z.string().uuid().optional(),

            name: z.string().trim().min(2).max(80),

            description: z
                .string()
                .trim()
                .max(500)
                .optional()
                .default(''),

            managerUserId: z.string().uuid().nullable().optional(),

            isActive: z.boolean().default(true),
        }).strict(),
    ).max(30).refine(
        values =>
            new Set(
                values.map(value => value.name.toLocaleLowerCase()),
            ).size === values.length,
        'Department names must be unique',
    ),

    teams: z.array(
        z.object({
            id: z.string().uuid().optional(),

            name: z.string().trim().min(2).max(80),

            description: z
                .string()
                .trim()
                .max(500)
                .optional()
                .default(''),

            roleLevels: z.array(
                z.object({
                    role: z.enum(TEAM_ROLE_LEVELS),
                    count: z.number().int().min(1).max(500),
                }).strict(),
            ).max(TEAM_ROLE_LEVELS.length).optional().default([]).refine(
                levels => new Set(levels.map(level => level.role)).size === levels.length,
                'Each role can only be listed once per team',
            ),

            isActive: z.boolean().default(true),
        }).strict(),
    ).max(30).default([]).refine(
        values =>
            new Set(
                values.map(value => value.name.toLocaleLowerCase()),
            ).size === values.length,
        'Team names must be unique',
    ).refine(
        values => {
            const ids = values.flatMap(
                value => value.id ? [value.id] : [],
            );

            return new Set(ids).size === ids.length;
        },
        'A team can only be listed once',
    ),

    workingDays: z.array(day).min(1).max(7).refine(
        values => new Set(values).size === values.length,
        'Working days must not be repeated',
    ),

    workingHourStart: time,

    workingHourEnd: time,

    defaultResponseTargetMinutes: z.number().int().min(1).max(525600),

    defaultResolutionTargetMinutes: z.number().int().min(1).max(525600),

    escalationThresholdMinutes: z.number().int().min(1).max(525600),

    defaultPriority: priority,

    primaryTeamId: z.string().uuid().nullable(),
}).strict().refine(
    value => value.workingHourStart < value.workingHourEnd,
    {
        path: ['workingHourEnd'],
        message: 'Working hours must end after they start',
    },
);

// ============================================================
// BUSINESS INTELLIGENCE
// ============================================================

export const businessIntelligenceSchema = z.object({
    categories: z.array(
        z.object({
            id: z.string().uuid().optional(),

            name: z.string().trim().min(2).max(80),

            description: z
                .string()
                .trim()
                .max(500)
                .optional()
                .default(''),

            defaultPriority: priority,

            isActive: z.boolean().default(true),
        }).strict(),
    ).max(50).refine(
        values =>
            new Set(
                values.map(value => value.name.toLocaleLowerCase()),
            ).size === values.length,
        'Category names must be unique',
    ),

    ai: z.object({
        categorizationEnabled: z.boolean(),

        sentimentEnabled: z.boolean(),

        prioritySuggestionEnabled: z.boolean(),

        similarityDetectionEnabled: z.boolean(),

        responseSuggestionEnabled: z.boolean(),

        summaryEnabled: z.boolean(),
    }).strict(),
}).strict();

// ============================================================
// BUSINESS TEAM
// ============================================================

export const businessTeamSchema = z.object({
    members: z.array(
        z.object({
            userId: z.string().uuid(),

            departmentId: z.string().uuid().nullable(),

            teamId: z.string().uuid().nullable(),
        }).strict(),
    ).max(500).refine(
        values =>
            new Set(values.map(value => value.userId)).size === values.length,
        'A team member can only be listed once',
    ),
}).strict();

// ============================================================
// BUSINESS WORKSPACE
// ============================================================

export const businessWorkspaceSchema = z.object({
    workspaceDisplayName: z.string().trim().min(2).max(100),

    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),

    dateFormat: z.enum([
        'MMM d, yyyy',
        'dd/MM/yyyy',
        'MM/dd/yyyy',
        'yyyy-MM-dd',
    ]),

    defaultComplaintView: z.enum(['inbox', 'table']),

    defaultDashboardPeriod: z.enum(['7d', '30d', '90d']),

    notifications: z.object({
        newComplaint: z.boolean(),
        highPriority: z.boolean(),
        escalation: z.boolean(),
        assignment: z.boolean(),
        weeklySummary: z.boolean(),
        email: z.boolean(),
        inApp: z.boolean(),
    }).strict(),
}).strict();

// ============================================================
// BUSINESS INVITATIONS
// ============================================================

export const createBusinessInvitationSchema = z.object({
    email: emailAddressSchema,

    role: z.enum([
        'MANAGER',
        'AGENT',
        'ESCALATION_AGENT',
    ]),

    departmentId: z.string().uuid().nullable().optional(),
}).strict();

export const inspectBusinessInvitationSchema = z.object({
    token: z.string().min(32).max(200),
}).strict();

export const acceptBusinessInvitationSchema = z.object({
    token: z.string().min(32).max(200),

    fullName: z.string().trim().min(3).max(120),

    password: z.string().min(12).max(128),
}).strict();

// ============================================================
// TYPES
// ============================================================

export type BusinessIdentityInput =
    z.infer<typeof businessIdentitySchema>;

export type BusinessOperationsInput =
    z.infer<typeof businessOperationsSchema>;

export type BusinessIntelligenceInput =
    z.infer<typeof businessIntelligenceSchema>;

export type BusinessTeamInput =
    z.infer<typeof businessTeamSchema>;

export type BusinessWorkspaceInput =
    z.infer<typeof businessWorkspaceSchema>;

export type CreateBusinessInvitationInput =
    z.infer<typeof createBusinessInvitationSchema>;

export type AcceptBusinessInvitationInput =
    z.infer<typeof acceptBusinessInvitationSchema>;
