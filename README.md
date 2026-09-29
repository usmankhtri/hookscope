# HookLab

> Inspect, test, replay, and understand webhooks.

HookLab is a developer tool for receiving HTTP webhooks at temporary public endpoints, inspecting the requests, viewing headers and payloads, editing and replaying requests, generating equivalent client code, comparing payloads, and testing webhook behavior.

Built for backend developers, frontend engineers, API developers, SaaS builders, and QA teams who need to debug webhook integrations without guessing.

---

## Features

- **Public Webhook Ingestion**: Provision secure, unpredictable temporary endpoint tokens (`/h/:token`) supporting `POST`, `PUT`, `PATCH`, `GET`, and `DELETE`.
- **Deep Request Inspection**:
  - Detailed overview (timings, IP, size, status, headers count, query params).
  - Searchable headers with key/value viewer and one-click copy.
  - Parsed query parameters viewer.
  - Safe payload inspection for JSON (pretty-printed & raw), XML (entity-safe formatting), form-urlencoded, and plain text.
- **Client Code Generation**: Generate production-ready snippets in **cURL**, **JavaScript `fetch`**, **Axios**, **Node.js**, and **Python `requests`**.
- **Replay & Edit-and-Resend with SSRF Protection**: Forward captured webhooks to external staging APIs or local tunnels. Includes protection against Server-Side Request Forgery (blocking private RFC 1918 subnets, loopbacks, and cloud metadata services).
- **Mock Response Testing**: Configure endpoints to return custom status codes (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `422`, `429`, `500`, `502`, `503`), custom bodies, headers, and artificial delays (`0–5000ms`) to test sender retries.
- **Payload Comparison (JSON Diff)**: Structural JSON diff tool displaying added, removed, and modified fields with exact path identifiers.
- **Signature / HMAC Verifier**: Deterministic, client-side HMAC signature verification supporting SHA-256, SHA-1, and SHA-512 in Hex or Base64. Secrets are never transmitted or logged.
- **Simulated Event Templates**: Pre-loaded simulated events for Stripe, GitHub, Shopify, Slack, Discord, and generic JSON webhooks.
- **Built-in Test Dispatcher**: Send real HTTP test requests directly from the interface to your endpoint.

---

## Architecture & Storage Persistence

In serverless environments such as **Vercel**, ephemeral memory and local filesystems cannot reliably persist state between isolated function invocations.

HookLab implements a clean persistence abstraction (`WebhookStorageAdapter`):
- **Production (Vercel)**: Uses a Redis-compatible REST storage adapter powered by **Upstash Redis** (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`). This guarantees durable, zero-connection-overhead persistence across serverless invocations.
- **Development**: An honest in-memory adapter is available for local testing and unit tests, clearly reporting `isDurable: false` on the `/api/status` diagnostics dashboard.
- If storage credentials are not configured in production, HookLab provides a clear configuration notice rather than faking persistence.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Yes (Production) | Upstash Redis REST database URL. |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (Production) | Upstash Redis REST access token. |
| `RATE_LIMIT_PER_MINUTE` | No (Default: 120) | Maximum requests per minute per IP / endpoint. |
| `ALLOW_EPHEMERAL_DEV_STORAGE` | No (Default: true in dev) | Allows in-memory fallback for local dev. |
| `PORT` | No (Default: 3000) | Local server port. |

*Storage credentials are server-only and are never exposed to the client bundle.*

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

### 3. Run Automated Tests

Automated unit tests cover token generation, request parsing, JSON diffing, HMAC verification, client code generation, and SSRF restrictions:

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Deployment to Vercel

HookLab is designed for zero-friction Vercel deployment:

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. In **Project Settings → Environment Variables**, add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy. Vercel automatically builds the Vite frontend and deploys the serverless functions in `api/index.ts`.

---

## Security & Data Retention

- **Untrusted Payloads**: Incoming webhook bodies are treated as untrusted strings. They are never executed, evaluated, or rendered as executable HTML.
- **SSRF Protection**: Replay targets are validated against internal subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.169.254`, IPv6 loopbacks and unique local addresses).
- **Automatic Expiry**: Webhook events expire automatically after 24 hours (or the configured endpoint retention period).
- **Privacy Notice**: Do not send production secrets or live sensitive customer data to a testing endpoint.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
