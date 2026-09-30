# HookLab

> Inspect, test, replay, and debug webhooks from one developer workspace.

HookLab is a webhook testing and inspection tool for developers working with APIs, SaaS integrations, and event-driven systems.

Create a public endpoint, send webhooks to it, inspect the request, review headers and payloads, generate client code, replay requests, compare JSON payloads, and test webhook responses.

Built for backend developers, frontend engineers, API developers, SaaS builders, freelancers, and QA teams.

---

## Live

https://hookscope-tools.vercel.app

---

## What HookLab Does

Webhook integrations can be difficult to debug because the important part of the interaction happens between two systems.

HookLab gives you a place to receive and inspect those requests.

```text
Create endpoint
      ↓
Receive webhook
      ↓
Inspect request
      ↓
Edit / Replay
      ↓
Test response
      ↓
Debug integration
```

---

## Key Features

- **Instant Webhook Endpoints**: Generate unique, isolated public endpoints with a single click.
- **Deep Request Inspection**: Real-time breakdown of headers, query parameters, raw body, parsed JSON, client IP, and timestamps.
- **Interactive Replay & Resend**: Modify headers, query params, or body payloads and replay webhook deliveries directly against your staging or local endpoints.
- **Code Generation**: Export ready-to-run code snippets in cURL, Fetch (JavaScript/TypeScript), Python (Requests), Go, and Node.js.
- **Payload Diffing**: Compare two webhook payloads side-by-side with clear visual differences to catch schema drifts.
- **Custom Response Simulation**: Configure status codes (200, 201, 400, 500), latency delays, and response bodies to test how upstream webhook senders handle edge cases and retries.
- **Dark / Light Modes**: Full developer-first UI theme support.
- **Safe & Ephemeral Storage**: Automatic expiration controls with Redis persistence in production and in-memory fallback for local development.

---

## Webhook Endpoint URLs

In production:
```
https://hookscope-tools.vercel.app/h/<endpoint-token>
```

In local development:
```
http://localhost:3000/h/<endpoint-token>
```

You can send `POST`, `PUT`, `PATCH`, `DELETE`, or `GET` requests to your endpoint token.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Routing**: React Router
- **Backend / API**: Express.js with serverless compatibility
- **Storage**: Upstash Redis (production) / In-Memory Adapter (local development & fallback)
- **Testing**: Vitest, TypeScript type checking

---

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at:
   ```
   http://localhost:3000
   ```

### Running Tests

Run the Vitest test suite:
```bash
npm test
```

### Type Checking & Linting

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

---

## Deployment & Production Domain

The canonical production deployment is hosted at:
**https://hookscope-tools.vercel.app**

---

## License

MIT
