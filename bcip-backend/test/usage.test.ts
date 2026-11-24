import assert from 'node:assert/strict';
import test from 'node:test';
import { getCurrentUsagePeriod } from '../src/modules/billing/usage.service';

test('usage periods are UTC calendar months with a half-open end', () => {
    const period = getCurrentUsagePeriod(new Date('2026-03-31T23:59:59.000Z'));
    assert.equal(period.start.toISOString(), '2026-03-01T00:00:00.000Z');
    assert.equal(period.end.toISOString(), '2026-04-01T00:00:00.000Z');
});

test('usage periods handle December to January rollover', () => {
    const period = getCurrentUsagePeriod(new Date('2026-12-15T12:00:00.000Z'));
    assert.equal(period.start.toISOString(), '2026-12-01T00:00:00.000Z');
    assert.equal(period.end.toISOString(), '2027-01-01T00:00:00.000Z');
});
