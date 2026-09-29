export function getPublicEndpointUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/h/${token}`;
  }
  return `/h/${token}`;
}
