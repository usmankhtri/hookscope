import { WebhookEndpoint, WebhookEvent, StorageStatus } from '../../types';

export interface WebhookStorageAdapter {
  readonly name: string;
  isConfigured(): boolean;
  getStatus(): StorageStatus;
  createEndpoint(endpoint: WebhookEndpoint): Promise<WebhookEndpoint>;
  getEndpoint(token: string): Promise<WebhookEndpoint | null>;
  updateEndpoint(token: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null>;
  deleteEndpoint(token: string): Promise<boolean>;
  listEndpoints(): Promise<WebhookEndpoint[]>;
  saveEvent(event: WebhookEvent): Promise<void>;
  getEvents(token: string, options?: { limit?: number; offset?: number }): Promise<{ events: WebhookEvent[]; total: number }>;
  getEvent(token: string, eventId: string): Promise<WebhookEvent | null>;
  deleteEvent(token: string, eventId: string): Promise<boolean>;
  clearEvents(token: string): Promise<boolean>;
}
