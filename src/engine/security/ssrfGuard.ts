import net from 'net';

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  normalizedUrl?: string;
}

export function isPrivateIp(ip: string): boolean {
  if (!net.isIP(ip)) {
    return false;
  }

  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(p => parseInt(p, 10));
    if (parts.length !== 4) return true;

    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 127.0.0.0/8 (loopback)
    if (parts[0] === 127) return true;
    // 100.64.0.0/10 (carrier-grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // 169.254.0.0/16 (link local, cloud metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.0.0.0/24
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 0) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;
    // 224.0.0.0/4 (multicast)
    if (parts[0] >= 224 && parts[0] <= 239) return true;
    // 240.0.0.0/4 (reserved)
    if (parts[0] >= 240) return true;

    return false;
  }

  // IPv6 checks
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    // Loopback
    if (lower === '::1' || lower === '0000:0000:0000:0000:0000:0000:0000:0001') return true;
    // Unspecified
    if (lower === '::' || lower === '0000:0000:0000:0000:0000:0000:0000:0000') return true;
    // IPv4 mapped
    if (lower.startsWith('::ffff:')) {
      const ipv4Part = lower.slice(7);
      if (net.isIPv4(ipv4Part)) {
        return isPrivateIp(ipv4Part);
      }
    }
    // Unique local address fc00::/7 (fc00... or fd00...)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    // Link-local address fe80::/10
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;

    return false;
  }

  return false;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.internal',
  'instance-data',
  '169.254.169.254',
]);

/**
 * Synchronous URL and hostname validation against SSRF.
 */
export function validateReplayUrlSync(urlString: string): ValidationResult {
  if (!urlString || typeof urlString !== 'string') {
    return { allowed: false, reason: 'URL must be a non-empty string' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { allowed: false, reason: 'Malformed URL provided' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { allowed: false, reason: 'Only HTTP and HTTPS protocols are allowed' };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { allowed: false, reason: `Access to hostname "${hostname}" is restricted (SSRF protection)` };
  }

  if (hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { allowed: false, reason: 'Access to internal/local domains is restricted' };
  }

  if (isPrivateIp(hostname)) {
    return { allowed: false, reason: `Access to private IP address "${hostname}" is restricted` };
  }

  return { allowed: true, normalizedUrl: parsed.toString() };
}

/**
 * Async DNS-resolved URL validation for Node.js server.
 */
export async function validateReplayUrlWithDns(urlString: string): Promise<ValidationResult> {
  const syncCheck = validateReplayUrlSync(urlString);
  if (!syncCheck.allowed) {
    return syncCheck;
  }

  const parsed = new URL(urlString.trim());
  const hostname = parsed.hostname;

  // If hostname is already an IP, it was checked by isPrivateIp in sync check
  if (net.isIP(hostname)) {
    return syncCheck;
  }

  try {
    const dns = await import('dns');
    const records = await dns.promises.lookup(hostname, { all: true });

    for (const record of records) {
      if (isPrivateIp(record.address)) {
        return {
          allowed: false,
          reason: `Resolved IP ${record.address} for host ${hostname} is private/internal (SSRF blocked)`,
        };
      }
    }

    return { allowed: true, normalizedUrl: parsed.toString() };
  } catch (err: any) {
    return { allowed: false, reason: `DNS resolution failed: ${err.message}` };
  }
}
