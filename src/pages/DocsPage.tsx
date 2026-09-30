import React, { useEffect } from 'react';
import { CodeBlock } from '../components/common/CodeBlock';
import { Shield, Server, Terminal, KeyRound, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DocsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Documentation – HookLab';
  }, []);
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-12 font-sans">
      {/* Header */}
      <div className="space-y-3 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>Technical Guide & Reference</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          HookLab Documentation
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
          Technical specifications for public endpoint ingestion, safe request inspection, custom response rules, SSRF-restricted replay, and Vercel serverless deployment.
        </p>
      </div>

      {/* Section 1: Ingestion */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-500" />
          1. Webhook Ingestion Routes
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          HookLab provisions temporary, unpredictable HTTP endpoints capable of receiving payloads from third-party services like Stripe, GitHub, Shopify, Slack, Twilio, and custom SaaS platforms.
        </p>
        <div className="p-4 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs space-y-2 font-mono">
          <div><span className="text-neutral-400">Supported Methods:</span> POST, PUT, PATCH, GET, DELETE, HEAD, OPTIONS</div>
          <div><span className="text-neutral-400">URL Pattern:</span> https://&lt;your-domain&gt;/h/:token or /api/h/:token</div>
          <div><span className="text-neutral-400">Payload Limit:</span> 512 KB per request</div>
          <div><span className="text-neutral-400">Default Response:</span> HTTP 200 OK with confirmation receipt</div>
        </div>
      </section>

      {/* Section 2: Replay & SSRF Guard */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-neutral-500" />
          2. Webhook Replay & SSRF Security
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          The Replay engine lets you resend captured requests to a destination API, tunnel address, or secondary webhook receiver. To prevent HookLab from acting as an open proxy into private clouds or internal networks, every destination URL undergoes Server-Side Request Forgery (SSRF) validation before execution:
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 space-y-1 pl-2">
          <li>Blocks loopback and localhost addresses (127.0.0.1, ::1, 0.0.0.0)</li>
          <li>Blocks private RFC 1918 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)</li>
          <li>Blocks cloud metadata endpoints (169.254.169.254, metadata.google.internal)</li>
          <li>Enforces a 10-second timeout and 256 KB response truncation limit</li>
        </ul>
      </section>

      {/* Section 3: Custom Response Configuration */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-500" />
          3. Custom Response Configuration
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Test how webhook providers behave when your receiver returns non-200 status codes or experiences latency. You can configure any HookLab endpoint to respond with:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-[#121214] text-center">200 OK</div>
          <div className="p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-[#121214] text-center">201 Created</div>
          <div className="p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-[#121214] text-center">400 Bad Request</div>
          <div className="p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-[#121214] text-center">429 Rate Limited</div>
          <div className="p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-[#121214] text-center">500 Server Error</div>
          <div className="p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-[#121214] text-center">502 Bad Gateway</div>
          <div className="p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-[#121214] text-center">503 Unavailable</div>
          <div className="p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-[#121214] text-center">0 - 5000ms Delay</div>
        </div>
      </section>

      {/* Section 4: Storage Architecture on Vercel */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-neutral-500" />
          4. Vercel & Serverless Storage Architecture
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          In serverless runtimes like Vercel and AWS Lambda, processes spin up and shut down on demand. File systems and in-memory arrays are ephemeral and cannot reliably persist webhooks across multiple requests.
        </p>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          HookLab implements a clean storage abstraction. For durable production persistence, set up an Upstash Redis database (or any Redis REST provider) and supply the credentials in your environment variables:
        </p>

        <CodeBlock
          language="bash"
          code={`# Upstash Redis REST Credentials (recommended for Vercel)
UPSTASH_REDIS_REST_URL="https://your-upstash-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-rest-token"

# Optional Rate Limiting
RATE_LIMIT_PER_MINUTE="120"`}
        />
      </section>

      {/* Section 5: Signature Verification */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-neutral-500" />
          5. Webhook Signature Verification
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Webhooks typically include an HMAC signature in headers (e.g. <code className="font-mono text-xs">Stripe-Signature</code> or <code className="font-mono text-xs">X-Hub-Signature-256</code>). HookLab provides a deterministic verification tool that calculates HMAC hashes directly in your browser without logging or transmitting secret keys.
        </p>
      </section>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <Link
          to="/security"
          className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          View Security Specifications
        </Link>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
