export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type ContentFormat = 'json' | 'xml' | 'form' | 'text' | 'binary' | 'empty';

export interface WebhookEndpoint {
  id: string;
  token: string;
  createdAt: string;
  name?: string;
  description?: string;
  mockResponse?: {
    enabled: boolean;
    statusCode: number;
    delayMs: number;
    contentType: string;
    body: string;
    headers: Record<string, string>;
  };
  retentionHours: number;
  rateLimitPerMin: number;
}

export interface WebhookEvent {
  id: string;
  endpointToken: string;
  method: HttpMethod;
  path: string;
  url: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string>;
  contentType: string;
  contentFormat: ContentFormat;
  rawBody: string;
  parsedBody: any;
  bodyError?: string;
  sizeBytes: number;
  timestamp: string;
  ip?: string;
  durationMs?: number;
  statusCodeSent: number;
}

export interface ReplayRequest {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface ReplayResponse {
  success: boolean;
  statusCode?: number;
  statusText?: string;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
  sizeBytes: number;
  error?: string;
  targetUrl: string;
  timestamp: string;
}

export interface StorageStatus {
  configured: boolean;
  type: 'redis' | 'upstash' | 'memory' | 'unconfigured';
  message: string;
  isDurable: boolean;
  retentionHours: number;
  maxEventsPerEndpoint: number;
  maxBodySizeBytes: number;
}

export interface DiffResult {
  path: string;
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  oldValue?: any;
  newValue?: any;
}
