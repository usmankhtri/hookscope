import express, { Request, Response, NextFunction } from 'express';
import { StorageManager } from '../engine/storage/storageManager';
import { generateEndpointToken, generateEventId, isValidEndpointToken } from '../engine/security/tokenGenerator';
import { parseWebhookPayload } from '../engine/parser/requestParser';
import { validateReplayUrlWithDns } from '../engine/security/ssrfGuard';
import { globalRateLimiter } from '../engine/security/rateLimiter';
import { HttpMethod, WebhookEndpoint, WebhookEvent, ReplayRequest, ReplayResponse } from '../types';

const MAX_BODY_SIZE_BYTES = 512 * 1024; // 512 KB
const MAX_REPLAY_RESPONSE_SIZE = 256 * 1024; // 256 KB

function parseCookies(req: Request): Record<string, string> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(';')) {
    const idx = pair.indexOf('=');
    if (idx > 0) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}

function getSessionId(req: Request): string | undefined {
  const fromHeader = req.headers['x-hooklab-session'] as string | undefined;
  if (fromHeader && fromHeader.trim().length >= 8) {
    return fromHeader.trim();
  }
  const cookies = parseCookies(req);
  if (cookies.hl_session && cookies.hl_session.trim().length >= 8) {
    return cookies.hl_session.trim();
  }
  return undefined;
}

function generateSessionId(): string {
  return `sess_${generateEndpointToken(18)}`;
}

export function createExpressApp(): express.Application {
  const app = express();

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Raw body parser for webhooks to preserve exact bytes and signatures
  app.use('/h/:token', express.raw({ type: '*/*', limit: '1mb' }));
  app.use('/api/h/:token', express.raw({ type: '*/*', limit: '1mb' }));

  // Standard JSON and URL-encoded for internal API routes
  app.use('/api', express.json({ limit: '1mb' }));
  app.use('/api', express.urlencoded({ extended: true, limit: '1mb' }));

  // SEO: robots.txt and sitemap.xml fallback endpoints
  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.type('text/plain').send('User-agent: *\nAllow: /\nAllow: /docs\nAllow: /security\nAllow: /privacy\nAllow: /about\nDisallow: /app/\nDisallow: /h/\nDisallow: /api/\n\nSitemap: https://hookscope-tools.vercel.app/sitemap.xml\n');
  });

  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://hookscope-tools.vercel.app/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>https://hookscope-tools.vercel.app/docs</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n  <url><loc>https://hookscope-tools.vercel.app/security</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n  <url><loc>https://hookscope-tools.vercel.app/privacy</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n  <url><loc>https://hookscope-tools.vercel.app/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>');
  });

  // Health and Storage Status
  app.get('/api/status', (req: Request, res: Response) => {
    const storage = StorageManager.getAdapter();
    res.json({
      storage: storage.getStatus(),
      version: '1.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
      limits: {
        maxBodySizeBytes: MAX_BODY_SIZE_BYTES,
        rateLimitPerMin: 120,
        maxEventsPerEndpoint: 100,
        maxReplayResponseSizeBytes: MAX_REPLAY_RESPONSE_SIZE,
      },
    });
  });

  // Endpoints CRUD
  app.post('/api/endpoints', async (req: Request, res: Response) => {
    try {
      const storage = StorageManager.getAdapter();
      if (!storage.isConfigured()) {
        const status = storage.getStatus();
        return res.status(503).json({
          error: 'STORAGE_UNCONFIGURED',
          message: status.message,
        });
      }

      let sessionId = getSessionId(req);
      if (!sessionId) {
        sessionId = generateSessionId();
      }

      // Keep cookie refreshed for 30 days
      res.setHeader('Set-Cookie', `hl_session=${encodeURIComponent(sessionId)}; Path=/; Max-Age=2592000; SameSite=Lax`);

      const token = generateEndpointToken(14);
      const endpoint: WebhookEndpoint = {
        id: `ep_${token}`,
        token,
        createdAt: new Date().toISOString(),
        name: req.body?.name || `Endpoint ${token.slice(0, 6)}`,
        description: req.body?.description || '',
        retentionHours: 24,
        rateLimitPerMin: 120,
        mockResponse: {
          enabled: false,
          statusCode: 200,
          delayMs: 0,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'ok', message: 'Webhook received successfully' }, null, 2),
          headers: {},
        },
      };

      const created = await storage.createEndpoint(endpoint, sessionId);
      return res.status(201).json({ endpoint: created, sessionId });
    } catch (err: any) {
      return res.status(500).json({ error: 'FAILED_TO_CREATE_ENDPOINT', message: err.message });
    }
  });

  app.get('/api/endpoints', async (req: Request, res: Response) => {
    try {
      const storage = StorageManager.getAdapter();
      const sessionId = getSessionId(req);
      if (!sessionId) {
        // Fresh user or user who cleared browser cookies / site data
        return res.json({ endpoints: [] });
      }
      const endpoints = await storage.listEndpoints(sessionId);
      return res.json({ endpoints });
    } catch (err: any) {
      return res.status(500).json({ error: 'FAILED_TO_LIST_ENDPOINTS', message: err.message });
    }
  });

  app.get('/api/endpoints/:token', async (req: Request, res: Response) => {
    const token = req.params.token;
    if (!isValidEndpointToken(token)) {
      return res.status(400).json({ error: 'INVALID_TOKEN', message: 'Malformed endpoint identifier' });
    }

    try {
      const storage = StorageManager.getAdapter();
      const endpoint = await storage.getEndpoint(token);
      if (!endpoint) {
        return res.status(404).json({ error: 'ENDPOINT_NOT_FOUND', message: 'Endpoint not found or expired' });
      }

      // If user accesses an endpoint directly, attach to their session so it appears in their workspace
      const sessionId = getSessionId(req);
      if (sessionId && storage.attachToSession) {
        await storage.attachToSession(token, sessionId);
      }

      return res.json({ endpoint });
    } catch (err: any) {
      return res.status(500).json({ error: 'STORAGE_ERROR', message: err.message });
    }
  });

  app.patch('/api/endpoints/:token', async (req: Request, res: Response) => {
    const token = req.params.token;
    if (!isValidEndpointToken(token)) {
      return res.status(400).json({ error: 'INVALID_TOKEN', message: 'Malformed endpoint identifier' });
    }

    try {
      const storage = StorageManager.getAdapter();
      const updated = await storage.updateEndpoint(token, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'ENDPOINT_NOT_FOUND', message: 'Endpoint not found' });
      }
      return res.json({ endpoint: updated });
    } catch (err: any) {
      return res.status(500).json({ error: 'STORAGE_ERROR', message: err.message });
    }
  });

  app.delete('/api/endpoints/:token', async (req: Request, res: Response) => {
    const token = req.params.token;
    if (!isValidEndpointToken(token)) {
      return res.status(400).json({ error: 'INVALID_TOKEN', message: 'Malformed endpoint identifier' });
    }

    try {
      const storage = StorageManager.getAdapter();
      const sessionId = getSessionId(req);
      const success = await storage.deleteEndpoint(token, sessionId);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: 'STORAGE_ERROR', message: err.message });
    }
  });

  // Events query & management
  app.get('/api/endpoints/:token/events', async (req: Request, res: Response) => {
    const token = req.params.token;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '50', 10)));
    const offset = Math.max(0, parseInt(req.query.offset as string || '0', 10));

    try {
      const storage = StorageManager.getAdapter();
      const result = await storage.getEvents(token, { limit, offset });
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'STORAGE_ERROR', message: err.message });
    }
  });

  app.get('/api/endpoints/:token/events/:eventId', async (req: Request, res: Response) => {
    const { token, eventId } = req.params;
    try {
      const storage = StorageManager.getAdapter();
      const event = await storage.getEvent(token, eventId);
      if (!event) {
        return res.status(404).json({ error: 'EVENT_NOT_FOUND', message: 'Event not found' });
      }
      return res.json({ event });
    } catch (err: any) {
      return res.status(500).json({ error: 'STORAGE_ERROR', message: err.message });
    }
  });

  app.delete('/api/endpoints/:token/events/:eventId', async (req: Request, res: Response) => {
    const { token, eventId } = req.params;
    try {
      const storage = StorageManager.getAdapter();
      const success = await storage.deleteEvent(token, eventId);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: 'STORAGE_ERROR', message: err.message });
    }
  });

  app.post('/api/endpoints/:token/clear', async (req: Request, res: Response) => {
    const token = req.params.token;
    try {
      const storage = StorageManager.getAdapter();
      const success = await storage.clearEvents(token);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: 'STORAGE_ERROR', message: err.message });
    }
  });

  // Webhook Ingestion Handler (for /h/:token and /api/h/:token)
  const webhookHandler = async (req: Request, res: Response) => {
    const token = req.params.token;
    const startTime = Date.now();

    if (!isValidEndpointToken(token)) {
      return res.status(400).json({ error: 'INVALID_TOKEN', message: 'Malformed endpoint identifier' });
    }

    const storage = StorageManager.getAdapter();
    if (!storage.isConfigured()) {
      const status = storage.getStatus();
      return res.status(503).json({
        error: 'STORAGE_UNCONFIGURED',
        message: status.message,
      });
    }

    // Rate Limiting
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const rateCheck = globalRateLimiter.isRateLimited(`ep:${token}:${clientIp}`);
    if (rateCheck.limited) {
      res.setHeader('Retry-After', rateCheck.retryAfterSeconds.toString());
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Limit: ${rateCheck.limit} req/min. Please retry in ${rateCheck.retryAfterSeconds}s.`,
      });
    }

    // Endpoint existence check
    const endpoint = await storage.getEndpoint(token);
    if (!endpoint) {
      return res.status(404).json({
        error: 'ENDPOINT_NOT_FOUND',
        message: 'This webhook endpoint does not exist or has expired.',
      });
    }

    // Body handling & size check
    let rawBody = '';
    let sizeBytes = 0;
    if (Buffer.isBuffer(req.body)) {
      sizeBytes = req.body.length;
      if (sizeBytes > MAX_BODY_SIZE_BYTES) {
        return res.status(413).json({
          error: 'PAYLOAD_TOO_LARGE',
          message: `Payload size (${sizeBytes} bytes) exceeds limit of ${MAX_BODY_SIZE_BYTES} bytes (512 KB).`,
        });
      }
      rawBody = req.body.toString('utf-8');
    } else if (typeof req.body === 'string') {
      sizeBytes = Buffer.byteLength(req.body, 'utf-8');
      if (sizeBytes > MAX_BODY_SIZE_BYTES) {
        return res.status(413).json({
          error: 'PAYLOAD_TOO_LARGE',
          message: `Payload size exceeds limit of ${MAX_BODY_SIZE_BYTES} bytes.`,
        });
      }
      rawBody = req.body;
    }

    const contentType = (req.headers['content-type'] as string) || '';
    const parsedResult = parseWebhookPayload(rawBody, contentType);

    // Normalize headers
    const sanitizedHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === 'string') {
        sanitizedHeaders[k] = v;
      } else if (Array.isArray(v)) {
        sanitizedHeaders[k] = v.join(', ');
      }
    }

    // Query parameters
    const queryParams: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(req.query)) {
      if (typeof v === 'string') {
        queryParams[k] = v;
      } else if (Array.isArray(v)) {
        queryParams[k] = v.map(String);
      }
    }

    const mock = endpoint.mockResponse;
    const statusCodeSent = mock?.enabled ? mock.statusCode : 200;

    const event: WebhookEvent = {
      id: generateEventId(),
      endpointToken: token,
      method: req.method.toUpperCase() as HttpMethod,
      path: req.originalUrl || req.url,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl || req.url}`,
      query: queryParams,
      headers: sanitizedHeaders,
      contentType,
      contentFormat: parsedResult.contentFormat,
      rawBody,
      parsedBody: parsedResult.parsedBody,
      bodyError: parsedResult.bodyError,
      sizeBytes,
      timestamp: new Date().toISOString(),
      ip: clientIp,
      durationMs: Date.now() - startTime,
      statusCodeSent,
    };

    // Store event
    try {
      await storage.saveEvent(event);
    } catch (saveErr: any) {
      return res.status(500).json({ error: 'SAVE_FAILED', message: saveErr.message });
    }

    // Handle Mock Response if enabled
    if (mock?.enabled) {
      if (mock.delayMs && mock.delayMs > 0) {
        const safeDelay = Math.min(5000, Math.max(0, mock.delayMs));
        await new Promise(resolve => setTimeout(resolve, safeDelay));
      }

      if (mock.headers) {
        for (const [hk, hv] of Object.entries(mock.headers)) {
          res.setHeader(hk, hv);
        }
      }

      if (mock.contentType) {
        res.setHeader('Content-Type', mock.contentType);
      }

      return res.status(mock.statusCode || 200).send(mock.body || '');
    }

    // Standard Success Response
    return res.status(200).json({
      received: true,
      id: event.id,
      timestamp: event.timestamp,
      sizeBytes,
    });
  };

  app.all('/h/:token', webhookHandler);
  app.all('/api/h/:token', webhookHandler);

  // SSRF-Protected Webhook Replay Route
  app.post('/api/replay', async (req: Request, res: Response) => {
    const replayReq = req.body as ReplayRequest;
    if (!replayReq || !replayReq.url) {
      return res.status(400).json({ error: 'MISSING_URL', message: 'Destination URL is required for replay' });
    }

    // SSRF Check
    const ssrfValidation = await validateReplayUrlWithDns(replayReq.url);
    if (!ssrfValidation.allowed) {
      return res.status(400).json({
        error: 'SSRF_RESTRICTION',
        message: ssrfValidation.reason || 'Destination URL violates SSRF security restrictions.',
      });
    }

    const startTime = Date.now();
    const timeoutMs = Math.min(15000, Math.max(1000, replayReq.timeoutMs || 10000));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const sanitizedHeaders: Record<string, string> = { ...(replayReq.headers || {}) };
      delete sanitizedHeaders['host'];
      delete sanitizedHeaders['content-length'];

      const fetchOptions: RequestInit = {
        method: replayReq.method || 'POST',
        headers: sanitizedHeaders,
        signal: controller.signal,
        redirect: 'follow',
      };

      if (replayReq.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(replayReq.method)) {
        fetchOptions.body = replayReq.body;
      }

      const response = await fetch(ssrfValidation.normalizedUrl || replayReq.url, fetchOptions);
      clearTimeout(timeoutId);

      const durationMs = Date.now() - startTime;
      const respHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        respHeaders[key] = val;
      });

      // Read response body with safety limit
      const rawText = await response.text();
      const sizeBytes = Buffer.byteLength(rawText, 'utf-8');
      const truncatedBody = sizeBytes > MAX_REPLAY_RESPONSE_SIZE
        ? rawText.slice(0, MAX_REPLAY_RESPONSE_SIZE) + '\n... [Response body truncated due to size limit]'
        : rawText;

      const result: ReplayResponse = {
        success: response.ok,
        statusCode: response.status,
        statusText: response.statusText,
        durationMs,
        headers: respHeaders,
        body: truncatedBody,
        sizeBytes,
        targetUrl: replayReq.url,
        timestamp: new Date().toISOString(),
      };

      return res.json(result);
    } catch (err: any) {
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');

      const result: ReplayResponse = {
        success: false,
        durationMs,
        headers: {},
        body: '',
        sizeBytes: 0,
        error: isTimeout ? `Request timed out after ${timeoutMs}ms` : err.message || 'Network request failed',
        targetUrl: replayReq.url,
        timestamp: new Date().toISOString(),
      };

      return res.status(502).json(result);
    }
  });

  return app;
}
