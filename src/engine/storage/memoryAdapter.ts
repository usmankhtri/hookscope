import { WebhookEndpoint, WebhookEvent, StorageStatus } from '../../types';
import { WebhookStorageAdapter } from './types';

const MAX_EVENTS_PER_ENDPOINT = 100;
const MAX_BODY_SIZE_BYTES = 512 * 1024; // 512 KB
const DEFAULT_RETENTION_HOURS = 24;

export class MemoryStorageAdapter implements WebhookStorageAdapter {
  readonly name = 'MemoryStorageAdapter';
  private endpoints = new Map<string, WebhookEndpoint>();
  private events = new Map<string, WebhookEvent[]>();

  isConfigured(): boolean {
    return true;
  }

  getStatus(): StorageStatus {
    return {
      configured: true,
      type: 'memory',
      message: 'In-memory ephemeral storage active. This mode is suitable for local development only and is NOT persistent across serverless invocations.',
      isDurable: false,
      retentionHours: DEFAULT_RETENTION_HOURS,
      maxEventsPerEndpoint: MAX_EVENTS_PER_ENDPOINT,
      maxBodySizeBytes: MAX_BODY_SIZE_BYTES,
    };
  }

  async createEndpoint(endpoint: WebhookEndpoint): Promise<WebhookEndpoint> {
    this.endpoints.set(endpoint.token, { ...endpoint });
    if (!this.events.has(endpoint.token)) {
      this.events.set(endpoint.token, []);
    }
    return endpoint;
  }

  async getEndpoint(token: string): Promise<WebhookEndpoint | null> {
    const ep = this.endpoints.get(token);
    return ep ? { ...ep } : null;
  }

  async updateEndpoint(token: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null> {
    const existing = this.endpoints.get(token);
    if (!existing) return null;
    const updated = { ...existing, ...updates, token: existing.token, id: existing.id };
    this.endpoints.set(token, updated);
    return { ...updated };
  }

  async deleteEndpoint(token: string): Promise<boolean> {
    const deleted = this.endpoints.delete(token);
    this.events.delete(token);
    return deleted;
  }

  async listEndpoints(): Promise<WebhookEndpoint[]> {
    return Array.from(this.endpoints.values()).map(ep => ({ ...ep }));
  }

  async saveEvent(event: WebhookEvent): Promise<void> {
    let list = this.events.get(event.endpointToken);
    if (!list) {
      list = [];
      this.events.set(event.endpointToken, list);
    }
    // Prepend new event
    list.unshift({ ...event });
    // Enforce max limit
    if (list.length > MAX_EVENTS_PER_ENDPOINT) {
      list.length = MAX_EVENTS_PER_ENDPOINT;
    }
  }

  async getEvents(token: string, options?: { limit?: number; offset?: number }): Promise<{ events: WebhookEvent[]; total: number }> {
    const list = this.events.get(token) || [];
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const paged = list.slice(offset, offset + limit).map(e => ({ ...e }));
    return {
      events: paged,
      total: list.length,
    };
  }

  async getEvent(token: string, eventId: string): Promise<WebhookEvent | null> {
    const list = this.events.get(token) || [];
    const found = list.find(e => e.id === eventId);
    return found ? { ...found } : null;
  }

  async deleteEvent(token: string, eventId: string): Promise<boolean> {
    const list = this.events.get(token);
    if (!list) return false;
    const initialLen = list.length;
    const filtered = list.filter(e => e.id !== eventId);
    this.events.set(token, filtered);
    return filtered.length < initialLen;
  }

  async clearEvents(token: string): Promise<boolean> {
    if (this.events.has(token)) {
      this.events.set(token, []);
      return true;
    }
    return false;
  }
}
