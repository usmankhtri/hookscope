import { WebhookStorageAdapter } from './types';
import { MemoryStorageAdapter } from './memoryAdapter';
import { RedisStorageAdapter } from './redisAdapter';
import { StorageStatus, WebhookEndpoint, WebhookEvent } from '../../types';

class UnconfiguredStorageAdapter implements WebhookStorageAdapter {
  readonly name = 'UnconfiguredStorageAdapter';

  isConfigured(): boolean {
    return false;
  }

  getStatus(): StorageStatus {
    return {
      configured: false,
      type: 'unconfigured',
      message: 'Live endpoint storage is not configured. Configure the required server-side storage environment variables (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) before using public persistent webhook endpoints.',
      isDurable: false,
      retentionHours: 24,
      maxEventsPerEndpoint: 100,
      maxBodySizeBytes: 512 * 1024,
    };
  }

  async createEndpoint(): Promise<WebhookEndpoint> {
    throw new Error('Live endpoint storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
  }

  async getEndpoint(): Promise<WebhookEndpoint | null> {
    return null;
  }

  async updateEndpoint(): Promise<WebhookEndpoint | null> {
    throw new Error('Storage not configured');
  }

  async deleteEndpoint(): Promise<boolean> {
    return false;
  }

  async listEndpoints(): Promise<WebhookEndpoint[]> {
    return [];
  }

  async saveEvent(): Promise<void> {
    throw new Error('Live endpoint storage is not configured. Incoming webhooks cannot be stored.');
  }

  async getEvents(): Promise<{ events: WebhookEvent[]; total: number }> {
    return { events: [], total: 0 };
  }

  async getEvent(): Promise<WebhookEvent | null> {
    return null;
  }

  async deleteEvent(): Promise<boolean> {
    return false;
  }

  async clearEvents(): Promise<boolean> {
    return false;
  }
}

class StorageManager {
  private static instance: WebhookStorageAdapter | null = null;

  static getAdapter(): WebhookStorageAdapter {
    if (!StorageManager.instance) {
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL || process.env.REDIS_URL;
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

      if (redisUrl && redisToken) {
        StorageManager.instance = new RedisStorageAdapter();
      } else if (process.env.ALLOW_EPHEMERAL_DEV_STORAGE === 'true' || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        // In local development or testing, fallback to in-memory adapter but honestly report isDurable: false
        StorageManager.instance = new MemoryStorageAdapter();
      } else {
        StorageManager.instance = new UnconfiguredStorageAdapter();
      }
    }
    return StorageManager.instance;
  }

  static setAdapterForTesting(adapter: WebhookStorageAdapter | null) {
    StorageManager.instance = adapter;
  }
}

export { StorageManager };
