import assert from 'node:assert/strict';
import test from 'node:test';
import {
    businessOperationsSchema,
    businessWorkspaceSchema,
    createBusinessInvitationSchema,
} from '../src/modules/accounts/dto/business-onboarding.dto';

const operations = {
    departments: [{ name: 'Customer Care', description: '', managerUserId: null, isActive: true }],
    teams: [{ name: 'Support Team', description: 'Handles customer complaints', isActive: true }],
    workingDays: ['MONDAY', 'TUESDAY'],
    workingHourStart: '09:00',
    workingHourEnd: '17:00',
    defaultResponseTargetMinutes: 120,
    defaultResolutionTargetMinutes: 2880,
    escalationThresholdMinutes: 60,
    defaultPriority: 'MEDIUM',
    primaryTeamId: null,
};

test('business operations accept the normalized team and SLA settings saved by onboarding', () => {
    const result = businessOperationsSchema.safeParse(operations);
    assert.equal(result.success, true);
    if (result.success) {
        assert.equal(result.data.teams[0].name, 'Support Team');
    }
});

test('business operations reject duplicate teams and client-supplied tenant identifiers', () => {
    assert.equal(businessOperationsSchema.safeParse({
        ...operations,
        teams: [
            { name: 'Support Team', description: '', isActive: true },
            { name: ' support team ', description: '', isActive: true },
        ],
    }).success, false);

    assert.equal(businessOperationsSchema.safeParse({
        ...operations,
        tenantId: 'another-tenant',
    }).success, false);
});

test('workspace settings require explicit email and in-app notification preferences', () => {
    const workspace = {
        workspaceDisplayName: 'Northstar Support',
        primaryColor: '#6334a3',
        dateFormat: 'MMM d, yyyy',
        defaultComplaintView: 'inbox',
        defaultDashboardPeriod: '30d',
        notifications: {
            newComplaint: true,
            highPriority: true,
            escalation: true,
            assignment: true,
            weeklySummary: false,
            email: true,
            inApp: false,
        },
    };

    assert.equal(businessWorkspaceSchema.safeParse(workspace).success, true);
    const { email: _email, ...withoutEmailPreference } = workspace.notifications;
    assert.equal(businessWorkspaceSchema.safeParse({
        ...workspace,
        notifications: withoutEmailPreference,
    }).success, false);
});

test('business invitations cannot assign administrator or customer roles', () => {
    for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN', 'CUSTOMER']) {
        assert.equal(createBusinessInvitationSchema.safeParse({
            email: 'agent@example.com',
            role,
            departmentId: null,
        }).success, false);
    }
});
