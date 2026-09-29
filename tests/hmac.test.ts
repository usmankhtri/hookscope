import { describe, it, expect } from 'vitest';
import { computeHmac, verifyWebhookSignature, normalizeSignature } from '../src/engine/hmac/hmacVerifier';

describe('HMAC Signature Verifier', () => {
  const secret = 'whsec_test_secret_12345';
  const payload = '{"event":"charge.succeeded","amount":1000}';

  it('computes and verifies HMAC-SHA256 correctly', async () => {
    const signature = await computeHmac(secret, payload, 'SHA-256', 'hex');
    expect(signature).toBeDefined();
    expect(signature.length).toBe(64);

    const verification = await verifyWebhookSignature(secret, payload, signature, {
      algorithm: 'SHA-256',
      encoding: 'hex',
    });

    expect(verification.valid).toBe(true);
  });

  it('handles provider prefixes like sha256= cleanly', async () => {
    const rawSignature = await computeHmac(secret, payload, 'SHA-256', 'hex');
    const prefixedSignature = `sha256=${rawSignature}`;

    const verification = await verifyWebhookSignature(secret, payload, prefixedSignature, {
      algorithm: 'SHA-256',
    });

    expect(verification.valid).toBe(true);
  });

  it('rejects tampered payloads', async () => {
    const signature = await computeHmac(secret, payload, 'SHA-256', 'hex');
    const tamperedPayload = '{"event":"charge.succeeded","amount":9999}';

    const verification = await verifyWebhookSignature(secret, tamperedPayload, signature, {
      algorithm: 'SHA-256',
    });

    expect(verification.valid).toBe(false);
  });
});
