import assert from 'node:assert/strict';
import test from 'node:test';
import {
    BUSINESS_TRIAL_DURATION_MS,
    createBusinessTrialPeriod,
    getBusinessTrialState,
} from '../src/modules/accounts/trial-policy';

test('a business trial lasts exactly 14 days from acceptance', () => {
    const acceptedAt = new Date('2026-10-03T12:00:00.000Z');
    const period = createBusinessTrialPeriod(acceptedAt);

    assert.equal(period.acceptedAt, acceptedAt);
    assert.equal(period.expiresAt.getTime() - acceptedAt.getTime(), BUSINESS_TRIAL_DURATION_MS);
});

test('trial access is active before expiry and expires at the boundary', () => {
    const period = createBusinessTrialPeriod(new Date('2026-10-03T12:00:00.000Z'));

    assert.equal(getBusinessTrialState(period, new Date('2026-10-17T11:59:59.999Z')).active, true);
    assert.equal(getBusinessTrialState(period, period.expiresAt).active, false);
    assert.equal(getBusinessTrialState(period, period.expiresAt).daysRemaining, 0);
});

test('the remaining trial days round up for a partial day', () => {
    const period = createBusinessTrialPeriod(new Date('2026-10-03T12:00:00.000Z'));
    const status = getBusinessTrialState(period, new Date('2026-10-16T12:00:01.000Z'));

    assert.equal(status.active, true);
    assert.equal(status.daysRemaining, 1);
});
