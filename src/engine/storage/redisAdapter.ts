import { Redis } from '@upstash/redis';
import { WebhookEndpoint, WebhookEvent, StorageStatus } from '../../types';
import { WebhookStorageAdapter } from './types';

const MAX_EVENTS_PER_ENDPOINT = 100;
const MAX_BODY_SIZE_BYTES = 512 * 1024; // 512 KB
const DEFAULT_RETENTION_HOURS = 24;

export class RedisStorageAdapter implements WebhookStorageAdapter {
  readonly name = 'RedisStorageAdapter';
  private client: Redis | null = null;
  private configured = false;
  private connectionError: string | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL || process.env.REDIS_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

    if (url && token) {
      try {
        this.client = new Redis({
          url,
          token,
        });
        this.configured = true;
      } catch (err: any) {
        this.configured = false;
        this.connectionError = err?.message || 'Failed to initialize Redis client';
      }
    } else {
      this.configured = false;
    }
  }

  isConfigured(): boolean {
    return this.configured && this.client !== null;
  }

  getStatus(): StorageStatus {
    if (!this.isConfigured()) {
      return {
        configured: false,
        type: 'unconfigured',
        message: 'Live endpoint storage is not configured. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or REDIS_REST_URL and REDIS_REST_TOKEN) before using public persistent webhook endpoints on serverless platforms.',
        isDurable: false,
        retentionHours: DEFAULT_RETENTION_HOURS,
        maxEventsPerEndpoint: MAX_EVENTS_PER_ENDPOINT,
        maxBodySizeBytes: MAX_BODY_SIZE_BYTES,
      };
    }

    return {
      configured: true,
      type: 'upstash',
      message: 'Redis-compatible serverless persistent storage active. Durable across serverless invocations.',
      isDurable: true,
      retentionHours: DEFAULT_RETENTION_HOURS,
      maxEventsPerEndpoint: MAX_EVENTS_PER_ENDPOINT,
      maxBodySizeBytes: MAX_BODY_SIZE_BYTES,
    };
  }

  private epKey(token: string): string {
    return `hooklab:ep:${token}`;
  }

  private eventsListKey(token: string): string {
    return `hooklab:events:${token}`;
  }

  private eventKey(token: string, eventId: string): string {
    return `hooklab:ev:${token}:${eventId}`;
  }

  async createEndpoint(endpoint: WebhookEndpoint): Promise<WebhookEndpoint> {
    if (!this.client) throw new Error('Storage not configured');
    const ttlSeconds = (endpoint.retentionHours || DEFAULT_RETENTION_HOURS) * 3600;

    await this.client.set(this.epKey(endpoint.token), JSON.stringify(endpoint), {
      ex: ttlSeconds,
    });
    await this.client.sadd('hooklab:endpoints', endpoint.token);
    return endpoint;
  }

  async getEndpoint(token: string): Promise<WebhookEndpoint | null> {
    if (!this.client) return null;
    const data = await this.client.get<string | WebhookEndpoint>(this.epKey(token));
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as WebhookEndpoint;
      } catch {
        return null;
      }
    }
    return data as WebhookEndpoint;
  }

  async updateEndpoint(token: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null> {
    if (!this.client) return null;
    const existing = await this.getEndpoint(token);
    if (!existing) return null;

    const updated: WebhookEndpoint = {
      ...existing,
      ...updates,
      token: existing.token,
      id: existing.id,
    };

    const ttlSeconds = (updated.retentionHours || DEFAULT_RETENTION_HOURS) * 3600;
    await this.client.set(this.epKey(token), JSON.stringify(updated), {
      ex: ttlSeconds,
    });
    return updated;
  }

  async deleteEndpoint(token: string): Promise<boolean> {
    if (!this.client) return false;
    await this.clearEvents(token);
    await this.client.del(this.epKey(token));
    await this.client.srem('hooklab:endpoints', token);
    return true;
  }

  async listEndpoints(): Promise<WebhookEndpoint[]> {
    if (!this.client) return [];
    const tokens = await this.client.smembers('hooklab:endpoints');
    if (!tokens || tokens.length === 0) return [];

    const endpoints: WebhookEndpoint[] = [];
    for (const token of tokens) {
      const ep = await this.getEndpoint(token);
      if (ep) {
        endpoints.push(ep);
      } else {
        // Expired or deleted
        await this.client.srem('hooklab:endpoints', token);
      }
    }
    return endpoints;
  }

  async saveEvent(event: WebhookEvent): Promise<void> {
    if (!this.client) throw new Error('Storage not configured');
    const token = event.endpointToken;
    const ep = await this.getEndpoint(token);
    const retentionHours = ep?.retentionHours || DEFAULT_RETENTION_HOURS;
    const ttlSeconds = retentionHours * 3600;

    // Save event payload
    await this.client.set(this.eventKey(token, event.id), JSON.stringify(event), {
      ex: ttlSeconds,
    });

    // Push ID to list
    const listKey = this.eventsListKey(token);
    await this.client.lpush(listKey, event.id);
    await this.client.ltrim(listKey, 0, MAX_EVENTS_PER_ENDPOINT - 1);
    await this.client.expire(listKey, ttlSeconds);
  }

  async getEvents(token: string, options?: { limit?: number; offset?: number }): Promise<{ events: WebhookEvent[]; total: number }> {
    if (!this.client) return { events: [], total: 0 };
    const listKey = this.eventsListKey(token);
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    const total = await this.client.llen(listKey);
    if (total === 0) return { events: [], total: 0 };

    const eventIds = await this.client.lrange(listKey, offset, offset + limit - 1);
    if (!eventIds || eventIds.length === 0) return { events: [], total };

    const events: WebhookEvent[] = [];
    for (const eventId of eventIds) {
      const raw = await this.client.get<string | WebhookEvent>(this.eventKey(token, eventId));
      if (raw) {
        if (typeof raw === 'string') {
          try {
            events.push(JSON.parse(raw));
          } catch {
            // ignore corrupt
          }
        } else {
          events.push(raw as WebhookEvent);
        }
      }
    }

    return { events, total };
  }

  async getEvent(token: string, eventId: string): Promise<WebhookEvent | null> {
    if (!this.client) return null;
    const raw = await this.client.get<string | WebhookEvent>(this.eventKey(token, eventId));
    if (!raw) return null;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw as WebhookEvent;
  }

  async deleteEvent(token: string, eventId: string): Promise<boolean> {
    if (!this.client) return false;
    await this.client.del(this.eventKey(token, eventId));
    await this.client.lrem(this.eventsListKey(token), 0, eventId);
    return true;
  }

  async clearEvents(token: string): Promise<boolean> {
    if (!this.client) return false;
    const listKey = this.eventsListKey(token);
    const eventIds = await this.client.lrange(listKey, 0, -1);
    if (eventIds && eventIds.length > 0) {
      for (const id of eventIds) {
        await this.client.del(this.eventKey(token, id));
      }
    }
    await this.client.del(listKey);
    return true;
  }
}
