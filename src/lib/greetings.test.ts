import { test } from 'node:test';
import assert from 'node:assert';
import { getGreeting } from './greetings.ts';

test('getGreeting returns correct message for morning', () => {
    const morning = new Date('2024-01-01T08:00:00');
    assert.strictEqual(getGreeting(morning), 'Good morning');
});

test('getGreeting returns correct message for afternoon', () => {
    const afternoon = new Date('2024-01-01T14:00:00');
    assert.strictEqual(getGreeting(afternoon), 'Good afternoon');
});

test('getGreeting returns correct message for evening', () => {
    const evening = new Date('2024-01-01T20:00:00');
    assert.strictEqual(getGreeting(evening), 'Good evening');
});
