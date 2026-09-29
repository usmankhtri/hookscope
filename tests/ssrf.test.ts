import { describe, it, expect } from 'vitest';
import { isPrivateIp, validateReplayUrlSync } from '../src/engine/security/ssrfGuard';

describe('SSRF Guard', () => {
  it('identifies private and loopback IPv4 and IPv6 addresses', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('172.16.5.1')).toBe(true);
    expect(isPrivateIp('192.168.1.1')).toBe(true);
    expect(isPrivateIp('169.254.169.254')).toBe(true);
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('1.1.1.1')).toBe(false);
  });

  it('blocks localhost, loopback, and metadata endpoints synchronously', () => {
    expect(validateReplayUrlSync('http://localhost:3000/api').allowed).toBe(false);
    expect(validateReplayUrlSync('http://127.0.0.1:8080/').allowed).toBe(false);
    expect(validateReplayUrlSync('http://169.254.169.254/latest/meta-data/').allowed).toBe(false);
    expect(validateReplayUrlSync('http://metadata.google.internal/').allowed).toBe(false);
    expect(validateReplayUrlSync('ftp://example.com/file').allowed).toBe(false);
    expect(validateReplayUrlSync('https://api.stripe.com/v1/webhook').allowed).toBe(true);
  });
});
