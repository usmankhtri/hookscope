import { WebhookEndpoint, WebhookEvent, StorageStatus } from '../../types';

export interface WebhookStorageAdapter {
  readonly name: string;
  isConfigured(): boolean;
  getStatus(): StorageStatus;
  createEndpoint(endpoint: WebhookEndpoint, sessionId?: string): Promise<WebhookEndpoint>;
  getEndpoint(token: string): Promise<WebhookEndpoint | null>;
  updateEndpoint(token: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null>;
  deleteEndpoint(token: string, sessionId?: string): Promise<boolean>;
  listEndpoints(sessionId?: string): Promise<WebhookEndpoint[]>;
  attachToSession?(token: string, sessionId: string): Promise<void>;
  saveEvent(event: WebhookEvent): Promise<void>;
  getEvents(token: string, options?: { limit?: number; offset?: number }): Promise<{ events: WebhookEvent[]; total: number }>;
  getEvent(token: string, eventId: string): Promise<WebhookEvent | null>;
  deleteEvent(token: string, eventId: string): Promise<boolean>;
  clearEvents(token: string): Promise<boolean>;
}
