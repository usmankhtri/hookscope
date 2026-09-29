import { describe, it, expect } from 'vitest';
import { compareJsonPayloads, summarizeJsonDiff } from '../src/engine/diff/jsonDiff';

describe('JSON Diff Engine', () => {
  it('identifies added, removed, and changed fields', () => {
    const oldObj = {
      user: {
        name: 'John Doe',
        email: 'old@example.com',
        role: 'user',
      },
      tags: ['alpha', 'beta'],
    };

    const newObj = {
      user: {
        name: 'John Doe',
        email: 'new@example.com',
        active: true,
      },
      tags: ['alpha', 'gamma'],
    };

    const diffs = compareJsonPayloads(oldObj, newObj);
    const summary = summarizeJsonDiff(oldObj, newObj);

    // email changed
    const emailDiff = diffs.find(d => d.path === 'user.email');
    expect(emailDiff?.type).toBe('changed');
    expect(emailDiff?.oldValue).toBe('old@example.com');
    expect(emailDiff?.newValue).toBe('new@example.com');

    // role removed
    const roleDiff = diffs.find(d => d.path === 'user.role');
    expect(roleDiff?.type).toBe('removed');
    expect(roleDiff?.oldValue).toBe('user');

    // active added
    const activeDiff = diffs.find(d => d.path === 'user.active');
    expect(activeDiff?.type).toBe('added');
    expect(activeDiff?.newValue).toBe(true);

    expect(summary.changedCount).toBeGreaterThan(0);
    expect(summary.addedCount).toBeGreaterThan(0);
    expect(summary.removedCount).toBeGreaterThan(0);
  });
});
