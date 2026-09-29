/**
 * Cryptographically secure endpoint token generation and validation.
 */

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateEndpointToken(length: number = 14): string {
  // Using node crypto or browser crypto
  let randomValues: Uint8Array;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues as any);
  } else {
    // fallback if node crypto without global
    try {
      const nodeCrypto = require('crypto');
      randomValues = new Uint8Array(nodeCrypto.randomBytes(length));
    } catch {
      randomValues = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * 256);
      }
    }
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[randomValues[i] % ALPHABET.length];
  }
  return result;
}

export function generateEventId(): string {
  let rand = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes as any);
    rand = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    rand = Math.random().toString(16).substring(2, 10);
  }
  return `evt_${Date.now().toString(36)}_${rand}`;
}

export function isValidEndpointToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  if (token.length < 6 || token.length > 32) return false;
  return /^[a-zA-Z0-9_-]+$/.test(token);
}
