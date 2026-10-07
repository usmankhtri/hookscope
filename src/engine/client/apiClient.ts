import { WebhookEndpoint, WebhookEvent, StorageStatus, ReplayRequest, ReplayResponse } from '../../types';

export interface SystemStatusResponse {
  storage: StorageStatus;
  version: string;
  nodeEnv: string;
  limits: {
    maxBodySizeBytes: number;
    rateLimitPerMin: number;
    maxEventsPerEndpoint: number;
    maxReplayResponseSizeBytes: number;
  };
}

function getClientSessionId(): string {
  if (typeof window === 'undefined') return '';
  const PRIMARY_KEY = 'hookscope_session_id';
  const LEGACY_KEY = 'hooklab_session_id';
  try {
    let id = localStorage.getItem(PRIMARY_KEY) || localStorage.getItem(LEGACY_KEY);
    if (!id) {
      const match = document.cookie.match(/(?:^|; )(?:hs_session|hl_session)=([^;]*)/);
      if (match && match[1]) {
        id = decodeURIComponent(match[1]);
      }
    }
    return id || '';
  } catch {
    return '';
  }
}

function setClientSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  const PRIMARY_KEY = 'hookscope_session_id';
  const LEGACY_KEY = 'hooklab_session_id';
  try {
    localStorage.setItem(PRIMARY_KEY, sessionId);
    localStorage.setItem(LEGACY_KEY, sessionId);
    document.cookie = `hs_session=${encodeURIComponent(sessionId)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    document.cookie = `hl_session=${encodeURIComponent(sessionId)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // Ignore if cookies/localStorage are restricted
  }
}

function getRequestHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };
  const session = getClientSessionId();
  if (session) {
    headers['x-hookscope-session'] = session;
    headers['x-hooklab-session'] = session;
  }
  return headers;
}

export class ApiClient {
  static async getStatus(): Promise<SystemStatusResponse | null> {
    const res = await fetch('/api/status');
    if (res.status === 304) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch status: ${res.statusText}`);
    }
    return res.json();
  }

  static async listEndpoints(): Promise<WebhookEndpoint[]> {
    const session = getClientSessionId();
    if (!session) {
      // Fresh user or user who cleared browser cookies / site data
      return [];
    }
    const res = await fetch('/api/endpoints', {
      headers: getRequestHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to list endpoints: ${res.statusText}`);
    }
    const data = await res.json();
    return data.endpoints || [];
  }

  static async createEndpoint(name?: string): Promise<WebhookEndpoint> {
    const res = await fetch('/api/endpoints', {
      method: 'POST',
      headers: getRequestHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create webhook endpoint');
    }

    const data = await res.json();
    if (data.sessionId) {
      setClientSessionId(data.sessionId);
    }
    return data.endpoint;
  }

  static async getEndpoint(token: string): Promise<WebhookEndpoint> {
    const res = await fetch(`/api/endpoints/${token}`, {
      headers: getRequestHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Endpoint not found');
    }
    const data = await res.json();
    return data.endpoint;
  }

  static async updateEndpoint(token: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const res = await fetch(`/api/endpoints/${token}`, {
      method: 'PATCH',
      headers: getRequestHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update endpoint');
    }

    const data = await res.json();
    return data.endpoint;
  }

  static async deleteEndpoint(token: string): Promise<boolean> {
    const res = await fetch(`/api/endpoints/${token}`, {
      method: 'DELETE',
      headers: getRequestHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to delete endpoint');
    }
    const data = await res.json();
    return data.success;
  }

  static async getEvents(token: string, options?: { limit?: number; offset?: number }): Promise<{ events: WebhookEvent[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const res = await fetch(`/api/endpoints/${token}/events?${params.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to load webhook events');
    }
    return res.json();
  }

  static async getEvent(token: string, eventId: string): Promise<WebhookEvent> {
    const res = await fetch(`/api/endpoints/${token}/events/${eventId}`);
    if (!res.ok) {
      throw new Error('Event not found');
    }
    const data = await res.json();
    return data.event;
  }

  static async deleteEvent(token: string, eventId: string): Promise<boolean> {
    const res = await fetch(`/api/endpoints/${token}/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to delete event');
    }
    const data = await res.json();
    return data.success;
  }

  static async clearEvents(token: string): Promise<boolean> {
    const res = await fetch(`/api/endpoints/${token}/clear`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error('Failed to clear events');
    }
    const data = await res.json();
    return data.success;
  }

  static async replayRequest(req: ReplayRequest): Promise<ReplayResponse> {
    const res = await fetch('/api/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    const data = await res.json();
    if (!res.ok && !data.error) {
      throw new Error('Replay request failed');
    }
    return data;
  }

  static async sendTestRequest(
    targetUrl: string,
    method: string,
    headers: Record<string, string>,
    body: string
  ): Promise<{ status: number; statusText: string; body: string; durationMs: number }> {
    const start = Date.now();
    const fetchHeaders = new Headers();
    for (const [k, v] of Object.entries(headers)) {
      fetchHeaders.set(k, v);
    }

    const init: RequestInit = {
      method,
      headers: fetchHeaders,
    };

    if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      init.body = body;
    }

    const res = await fetch(targetUrl, init);
    const text = await res.text();
    const durationMs = Date.now() - start;

    return {
      status: res.status,
      statusText: res.statusText,
      body: text,
      durationMs,
    };
  }
}
