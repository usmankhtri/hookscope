import { describe, it, expect } from 'vitest';
import { generateEndpointToken, generateEventId, isValidEndpointToken } from '../src/engine/security/tokenGenerator';

describe('Token Generator', () => {
  it('generates secure unpredictable tokens with correct length', () => {
    const token1 = generateEndpointToken(14);
    const token2 = generateEndpointToken(14);

    expect(token1).toHaveLength(14);
    expect(token2).toHaveLength(14);
    expect(token1).not.toBe(token2);
    expect(isValidEndpointToken(token1)).toBe(true);
    expect(isValidEndpointToken(token2)).toBe(true);
  });

  it('validates endpoint tokens correctly', () => {
    expect(isValidEndpointToken('AbC123xyz_99')).toBe(true);
    expect(isValidEndpointToken('')).toBe(false);
    expect(isValidEndpointToken('12')).toBe(false); // too short
    expect(isValidEndpointToken('invalid token with spaces')).toBe(false);
    expect(isValidEndpointToken('invalid/token/slash')).toBe(false);
  });

  it('generates unique event IDs with prefix', () => {
    const id1 = generateEventId();
    const id2 = generateEventId();

    expect(id1.startsWith('evt_')).toBe(true);
    expect(id2.startsWith('evt_')).toBe(true);
    expect(id1).not.toBe(id2);
  });
});
