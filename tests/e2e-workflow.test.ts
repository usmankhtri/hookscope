import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { AddressInfo } from 'net';
import { createExpressApp } from '../src/server/createApp';

describe('HookLab Full E2E Webhook Pipeline & Security Suite', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'development';
    const app = createExpressApp();
    server = http.createServer(app);

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('1. Generates an unpredictable, valid endpoint through the API', async () => {
    const res = await fetch(`${baseUrl}/api/endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Automated E2E Test Endpoint' }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.endpoint).toBeDefined();
    expect(data.endpoint.token).toHaveLength(14);
    expect(data.endpoint.name).toBe('Automated E2E Test Endpoint');
    expect(data.endpoint.retentionHours).toBe(24);
  });

  it('2. Ingests a real POST JSON webhook, writes to storage, and returns 200 receipt', async () => {
    // Create dedicated endpoint
    const createRes = await fetch(`${baseUrl}/api/endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ingestion Target' }),
    });
    const { endpoint } = await createRes.json();
    const token = endpoint.token;

    // Send real POST JSON webhook
    const testPayload = {
      event: 'order.created',
      order: {
        id: 'order_12345',
        amount: 4900,
        currency: 'USD',
      },
      source: 'hooklab-local-test',
    };

    const webhookRes = await fetch(`${baseUrl}/h/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Test': 'HookLab',
        'X-Request-ID': 'local-test-001',
      },
      body: JSON.stringify(testPayload),
    });

    expect(webhookRes.status).toBe(200);
    const receipt = await webhookRes.json();
    expect(receipt.received).toBe(true);
    expect(receipt.id).toMatch(/^evt_/);
    expect(receipt.timestamp).toBeDefined();
    expect(receipt.sizeBytes).toBeGreaterThan(0);

    // Retrieve from history API to confirm storage persistence
    const historyRes = await fetch(`${baseUrl}/api/endpoints/${token}/events`);
    expect(historyRes.status).toBe(200);
    const history = await historyRes.json();
    expect(history.total).toBe(1);
    expect(history.events).toHaveLength(1);

    const stored = history.events[0];
    expect(stored.id).toBe(receipt.id);
    expect(stored.method).toBe('POST');
    expect(stored.endpointToken).toBe(token);
    expect(stored.headers['x-webhook-test']).toBe('HookLab');
    expect(stored.headers['x-request-id']).toBe('local-test-001');
    expect(stored.contentFormat).toBe('json');
    expect(stored.parsedBody.event).toBe('order.created');
    expect(stored.parsedBody.order.id).toBe('order_12345');
    expect(stored.parsedBody.order.amount).toBe(4900);
  });

  it('3. Ingests diverse HTTP methods, query params, form-urlencoded, text, and nested JSON', async () => {
    const createRes = await fetch(`${baseUrl}/api/endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const { endpoint } = await createRes.json();
    const token = endpoint.token;

    // A. PUT JSON
    const putRes = await fetch(`${baseUrl}/h/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', value: 'approved' }),
    });
    expect(putRes.status).toBe(200);

    // B. PATCH JSON
    const patchRes = await fetch(`${baseUrl}/h/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patchField: true }),
    });
    expect(patchRes.status).toBe(200);

    // C. GET with query parameters
    const getRes = await fetch(`${baseUrl}/h/${token}?h=test&source=local&version=1`);
    expect(getRes.status).toBe(200);

    // D. Form urlencoded
    const formRes = await fetch(`${baseUrl}/h/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=authorization_code&code=test_code_123',
    });
    expect(formRes.status).toBe(200);

    // E. Plain text
    const textRes = await fetch(`${baseUrl}/h/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Raw webhook message verification string',
    });
    expect(textRes.status).toBe(200);

    // F. Nested JSON with items
    const nestedRes = await fetch(`${baseUrl}/h/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'payment.succeeded',
        customer: { id: 'cus_123', profile: { name: 'Test User' } },
        items: [{ id: 'item_1', quantity: 2 }],
      }),
    });
    expect(nestedRes.status).toBe(200);

    // Verify history contains all events
    const historyRes = await fetch(`${baseUrl}/api/endpoints/${token}/events`);
    const history = await historyRes.json();
    expect(history.total).toBe(6);

    // Verify GET event query capture
    const getEvent = history.events.find((e: any) => e.method === 'GET');
    expect(getEvent).toBeDefined();
    expect(getEvent.query.h).toBe('test');
    expect(getEvent.query.source).toBe('local');
    expect(getEvent.query.version).toBe('1');

    // Verify form-urlencoded parsed correctly
    const formEvent = history.events.find((e: any) => e.contentFormat === 'form');
    expect(formEvent).toBeDefined();
    expect(formEvent.parsedBody.grant_type).toBe('authorization_code');
    expect(formEvent.parsedBody.code).toBe('test_code_123');

    // Verify nested JSON parsed correctly
    const nestedEvent = history.events.find((e: any) => e.parsedBody?.event === 'payment.succeeded');
    expect(nestedEvent).toBeDefined();
    expect(nestedEvent.parsedBody.customer.profile.name).toBe('Test User');
    expect(nestedEvent.parsedBody.items[0].quantity).toBe(2);
  }, 15000);

  it('4. Supports deleting single events and clearing entire history', async () => {
    const createRes = await fetch(`${baseUrl}/api/endpoints`, { method: 'POST' });
    const { endpoint } = await createRes.json();
    const token = endpoint.token;

    // Send two requests
    const r1 = await fetch(`${baseUrl}/h/${token}`, { method: 'POST', body: 'event 1' });
    const { id: id1 } = await r1.json();
    const r2 = await fetch(`${baseUrl}/h/${token}`, { method: 'POST', body: 'event 2' });
    const { id: id2 } = await r2.json();

    // Verify 2 events exist
    let historyRes = await fetch(`${baseUrl}/api/endpoints/${token}/events`);
    let history = await historyRes.json();
    expect(history.total).toBe(2);

    // Delete first event
    const delEventRes = await fetch(`${baseUrl}/api/endpoints/${token}/events/${id1}`, {
      method: 'DELETE',
    });
    expect(delEventRes.status).toBe(200);

    // Verify 1 event remains
    historyRes = await fetch(`${baseUrl}/api/endpoints/${token}/events`);
    history = await historyRes.json();
    expect(history.total).toBe(1);
    expect(history.events[0].id).toBe(id2);

    // Clear entire history
    const clearRes = await fetch(`${baseUrl}/api/endpoints/${token}/clear`, { method: 'POST' });
    expect(clearRes.status).toBe(200);

    historyRes = await fetch(`${baseUrl}/api/endpoints/${token}/events`);
    history = await historyRes.json();
    expect(history.total).toBe(0);
    expect(history.events).toHaveLength(0);
  });

  it('5. Deletes endpoint and rejects further webhook ingestion with 404', async () => {
    const createRes = await fetch(`${baseUrl}/api/endpoints`, { method: 'POST' });
    const { endpoint } = await createRes.json();
    const token = endpoint.token;

    // Delete endpoint
    const delRes = await fetch(`${baseUrl}/api/endpoints/${token}`, { method: 'DELETE' });
    expect(delRes.status).toBe(200);

    // Attempt to fetch deleted endpoint -> 404
    const getRes = await fetch(`${baseUrl}/api/endpoints/${token}`);
    expect(getRes.status).toBe(404);

    // Attempt to send webhook to deleted endpoint -> 404
    const webhookRes = await fetch(`${baseUrl}/h/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: true }),
    });
    expect(webhookRes.status).toBe(404);
    const errData = await webhookRes.json();
    expect(errData.error).toBe('ENDPOINT_NOT_FOUND');
  });

  it('6. Supports mock response status codes and headers', async () => {
    const createRes = await fetch(`${baseUrl}/api/endpoints`, { method: 'POST' });
    const { endpoint } = await createRes.json();
    const token = endpoint.token;

    // Configure mock response (HTTP 502 with custom body)
    await fetch(`${baseUrl}/api/endpoints/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mockResponse: {
          enabled: true,
          statusCode: 502,
          delayMs: 50,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'upstream_gateway_error' }),
        },
      }),
    });

    // Send webhook
    const startTime = Date.now();
    const webhookRes = await fetch(`${baseUrl}/h/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'fail_test' }),
    });
    const elapsed = Date.now() - startTime;

    expect(webhookRes.status).toBe(502);
    const body = await webhookRes.json();
    expect(body.error).toBe('upstream_gateway_error');
    expect(elapsed).toBeGreaterThanOrEqual(40); // Verified artificial delay

    // Verify the event was still persisted in the history despite the mock 502 returned!
    const historyRes = await fetch(`${baseUrl}/api/endpoints/${token}/events`);
    const history = await historyRes.json();
    expect(history.total).toBe(1);
    expect(history.events[0].statusCodeSent).toBe(502);
  });

  it('7. Rejects oversized payloads exceeding 512 KB limit with HTTP 413', async () => {
    const createRes = await fetch(`${baseUrl}/api/endpoints`, { method: 'POST' });
    const { endpoint } = await createRes.json();
    const token = endpoint.token;

    // Create 520 KB buffer
    const largeBuffer = Buffer.alloc(520 * 1024, 'a');

    const res = await fetch(`${baseUrl}/h/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: largeBuffer,
    });

    expect(res.status).toBe(413);
    const err = await res.json();
    expect(err.error).toBe('PAYLOAD_TOO_LARGE');
  });

  it('8. Replay SSRF protection blocks loopback, private IPs, and metadata targets', async () => {
    // Loopback
    const r1 = await fetch(`${baseUrl}/api/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://127.0.0.1:8080/admin' }),
    });
    expect(r1.status).toBe(400);
    const d1 = await r1.json();
    expect(d1.error).toBe('SSRF_RESTRICTION');

    // Cloud metadata
    const r2 = await fetch(`${baseUrl}/api/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://169.254.169.254/computeMetadata/v1/' }),
    });
    expect(r2.status).toBe(400);
    const d2 = await r2.json();
    expect(d2.error).toBe('SSRF_RESTRICTION');

    // Private RFC 1918 subnets
    const r3 = await fetch(`${baseUrl}/api/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://10.0.0.5/secrets' }),
    });
    expect(r3.status).toBe(400);
    const d3 = await r3.json();
    expect(d3.error).toBe('SSRF_RESTRICTION');

    // Localhost hostname
    const r4 = await fetch(`${baseUrl}/api/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://localhost:3000/internal' }),
    });
    expect(r4.status).toBe(400);
    const d4 = await r4.json();
    expect(d4.error).toBe('SSRF_RESTRICTION');
  });

  it('9. Gracefully handles malformed endpoint tokens with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/h/invalid--token!!@@##`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('INVALID_TOKEN');
  });

  it('10. Serves SEO robots.txt and sitemap.xml with hookscope-tools.vercel.app', async () => {
    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    expect(robotsRes.status).toBe(200);
    const robotsTxt = await robotsRes.text();
    expect(robotsTxt).toContain('hookscope-tools.vercel.app');

    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    expect(sitemapRes.status).toBe(200);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain('https://hookscope-tools.vercel.app/');
  });
});
