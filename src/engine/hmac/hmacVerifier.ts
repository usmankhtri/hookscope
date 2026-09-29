export type HmacAlgorithm = 'SHA-256' | 'SHA-1' | 'SHA-512';
export type EncodingFormat = 'hex' | 'base64';

export interface VerificationResult {
  valid: boolean;
  computedSignature: string;
  expectedSignature: string;
  algorithm: HmacAlgorithm;
  encoding: EncodingFormat;
  normalizedMessage: string;
  explanation: string;
}

/**
 * Convert an ArrayBuffer to a hex string.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert an ArrayBuffer to a Base64 string.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}

/**
 * Compute HMAC using Web Crypto API (browser + Node 18+).
 */
export async function computeHmac(
  secret: string,
  message: string,
  algorithm: HmacAlgorithm = 'SHA-256',
  encoding: EncodingFormat = 'hex'
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;

  if (cryptoObj && cryptoObj.subtle) {
    const cryptoKey = await cryptoObj.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: algorithm } },
      false,
      ['sign']
    );

    const signatureBuffer = await cryptoObj.subtle.sign('HMAC', cryptoKey, msgData);

    return encoding === 'base64' ? bufferToBase64(signatureBuffer) : bufferToHex(signatureBuffer);
  }

  // Node crypto fallback
  try {
    const nodeCrypto = await import('crypto');
    const algoNode = algorithm.toLowerCase().replace('-', '');
    const hmac = nodeCrypto.createHmac(algoNode, secret);
    hmac.update(message);
    return hmac.digest(encoding);
  } catch (err: any) {
    throw new Error(`HMAC calculation not supported in this environment: ${err.message}`);
  }
}

/**
 * Clean incoming signature string by stripping known provider prefixes like sha256=, sha1=, v1=
 */
export function normalizeSignature(signature: string): string {
  let sig = signature.trim();
  if (sig.startsWith('sha256=')) sig = sig.slice(7);
  else if (sig.startsWith('sha1=')) sig = sig.slice(5);
  else if (sig.startsWith('sha512=')) sig = sig.slice(7);
  else if (sig.startsWith('v1=')) sig = sig.slice(3);
  return sig.trim();
}

/**
 * Verify webhook signature deterministically.
 */
export async function verifyWebhookSignature(
  secret: string,
  rawBody: string,
  providedSignature: string,
  options?: {
    algorithm?: HmacAlgorithm;
    encoding?: EncodingFormat;
    timestamp?: string; // For Stripe style timestamp prepending (t.payload)
  }
): Promise<VerificationResult> {
  const algorithm = options?.algorithm || 'SHA-256';
  const encoding = options?.encoding || 'hex';

  if (!secret) {
    return {
      valid: false,
      computedSignature: '',
      expectedSignature: providedSignature,
      algorithm,
      encoding,
      normalizedMessage: rawBody,
      explanation: 'Secret key is empty. A signing secret is required.',
    };
  }

  if (!providedSignature) {
    return {
      valid: false,
      computedSignature: '',
      expectedSignature: '',
      algorithm,
      encoding,
      normalizedMessage: rawBody,
      explanation: 'Signature to verify is empty.',
    };
  }

  let messageToSign = rawBody;
  if (options?.timestamp) {
    messageToSign = `${options.timestamp}.${rawBody}`;
  }

  try {
    const computed = await computeHmac(secret, messageToSign, algorithm, encoding);
    const cleanedProvided = normalizeSignature(providedSignature);

    // Constant-time-like case-insensitive check for hex, exact for base64
    const isValid =
      encoding === 'hex'
        ? computed.toLowerCase() === cleanedProvided.toLowerCase()
        : computed === cleanedProvided;

    return {
      valid: isValid,
      computedSignature: computed,
      expectedSignature: cleanedProvided,
      algorithm,
      encoding,
      normalizedMessage: messageToSign,
      explanation: isValid
        ? 'Signature matches computed HMAC hash.'
        : 'Signature mismatch. Check secret, raw body whitespace, encoding, or provider-specific headers (e.g., timestamp).',
    };
  } catch (err: any) {
    return {
      valid: false,
      computedSignature: '',
      expectedSignature: providedSignature,
      algorithm,
      encoding,
      normalizedMessage: messageToSign,
      explanation: `Verification error: ${err.message}`,
    };
  }
}
