import React, { useState, useEffect } from 'react';
import { CodeBlock } from '../components/common/CodeBlock';
import {
  Shield,
  Server,
  Terminal,
  KeyRound,
  ArrowRight,
  Sliders,
  FileCode,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Database,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DocsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Documentation & Developer Reference – HookScope';
  }, []);

  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'javascript' | 'python' | 'go'>('curl');
  const [docSearch, setDocSearch] = useState('');

  const codeSnippets = {
    curl: `curl -X POST https://hookscope-tools.vercel.app/h/wh_live_a9f82c \\
  -H "Content-Type: application/json" \\
  -H "Stripe-Signature: t=1728284400,v1=9e38d6f1a8c90b4e2f1a6c8b9d0e2f1a" \\
  -d '{"event":"payment_intent.succeeded","amount":8900,"currency":"usd"}'`,
    javascript: `// Sending a Webhook via Fetch in Node.js or Browser
const response = await fetch('https://hookscope-tools.vercel.app/h/wh_live_a9f82c', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Event-Type': 'order.completed',
    'X-Signature': 'sha256=4f2a7e9b0c1d2e3f...',
  },
  body: JSON.stringify({
    event: 'order.completed',
    orderId: 'ord_9182374',
    amount: 142.50,
  }),
});

const receipt = await response.json();
console.log('HookScope Receipt:', receipt.received, receipt.id);`,
    python: `# Sending a Webhook with Python requests
import requests

payload = {
    "event": "charge.succeeded",
    "customer": "cus_9128374",
    "amount": 4900,
}

headers = {
    "Content-Type": "application/json",
    "User-Agent": "BillingService/1.0",
}

response = requests.post(
    "https://hookscope-tools.vercel.app/h/wh_live_a9f82c",
    json=payload,
    headers=headers
)
print("Receipt:", response.json())`,
    go: `// Sending a Webhook with Go
package main

import (
    "bytes"
    "fmt"
    "net/http"
)

func main() {
    url := "https://hookscope-tools.vercel.app/h/wh_live_a9f82c"
    jsonData := []byte(\`{"event":"user.created","id":"usr_102"}\`)

    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-HookScope-Source", "go-client")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    fmt.Println("Response Status:", resp.Status)
}`,
  };

  const sections = [
    { id: 'ingestion', title: '1. Ingestion Endpoints & Protocol' },
    { id: 'ssrf', title: '2. SSRF-Safe Replay Engine' },
    { id: 'mock-rules', title: '3. Custom Response Rules & Status Codes' },
    { id: 'hmac', title: '4. In-Browser HMAC Verification' },
    { id: 'storage', title: '5. Vercel & Upstash Redis Storage' },
    { id: 'api-reference', title: '6. REST API Specifications' },
  ];

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-12 font-sans">
      {/* Header */}
      <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          <span>Technical Guide &amp; API Reference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          HookScope Documentation
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          Complete guide to creating test endpoints, inspecting HTTP webhooks in real time, configuring mock response rules, replaying requests safely, and deploying with Upstash Redis.
        </p>

        {/* Quick Jump Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar text-2xs font-mono">
          {sections.map(sec => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white whitespace-nowrap transition-colors"
            >
              {sec.title}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Doc Content (9 cols) */}
        <div className="lg:col-span-8 space-y-12">
          {/* Section 1: Ingestion */}
          <section id="ingestion" className="space-y-4 scroll-mt-20">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neutral-500" />
              1. Ingestion Endpoints &amp; Protocol
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              HookScope generates cryptographically unpredictable, 14-character alphanumeric tokens (e.g. <code className="font-mono text-2xs">/h/wh_live_a9f82c</code>). These endpoints accept incoming HTTP payloads from any webhook delivery service.
            </p>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden text-xs font-mono">
              <div className="bg-neutral-50 dark:bg-[#161619] px-4 py-2 font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                HTTP Route Specifications
              </div>
              <div className="p-4 space-y-2 bg-white dark:bg-[#121214] text-neutral-700 dark:text-neutral-300">
                <div><span className="text-neutral-400">Endpoint Format:</span> https://&lt;domain&gt;/h/:token or /api/h/:token</div>
                <div><span className="text-neutral-400">Allowed Methods:</span> POST, PUT, PATCH, GET, DELETE, HEAD, OPTIONS</div>
                <div><span className="text-neutral-400">Payload Limits:</span> 512 KB per request</div>
                <div><span className="text-neutral-400">Ingestion Latency:</span> &lt; 15ms standard, &lt; 50ms with Redis persistence</div>
                <div><span className="text-neutral-400">Default Response:</span> HTTP 200 OK with confirmation receipt JSON</div>
              </div>
            </div>

            {/* Code Samples Tab */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-2xs font-mono">
                <span className="text-neutral-500">Dispatch Webhook Snippet:</span>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded">
                  {(['curl', 'javascript', 'python', 'go'] as const).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveCodeLang(lang)}
                      className={`px-2 py-0.5 rounded transition-colors uppercase ${
                        activeCodeLang === lang
                          ? 'bg-white dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 font-bold shadow-2xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <CodeBlock language={activeCodeLang === 'curl' ? 'bash' : activeCodeLang} code={codeSnippets[activeCodeLang]} />
            </div>
          </section>

          {/* Section 2: SSRF Replay */}
          <section id="ssrf" className="space-y-4 scroll-mt-20">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-neutral-500" />
              2. SSRF-Safe Replay Engine
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              When developing webhook receivers, you often need to resend captured requests to a local development service or staging server. HookScope includes built-in SSRF protections to prevent requests from targeting private internal networks or cloud metadata.
            </p>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>SSRF Protection Guardrails</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300 font-mono text-2xs pl-2">
                <li>Blocks loopback addresses: 127.0.0.1, ::1, 0.0.0.0, localhost</li>
                <li>Blocks private subnets: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</li>
                <li>Blocks cloud metadata addresses: 169.254.169.254, metadata.google.internal</li>
                <li>Blocks link-local ranges: 169.254.0.0/16, fe80::/10</li>
                <li>Performs DNS pre-resolution checks before initiating outbound HTTP connections</li>
                <li>Applies strict 10-second timeout and 256 KB response body truncation limits</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Custom Mock Rules */}
          <section id="mock-rules" className="space-y-4 scroll-mt-20">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-500" />
              3. Custom Response Rules &amp; Status Codes
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Webhook senders (like Stripe or Shopify) use automated exponential backoff when a destination server returns an error. HookScope lets you configure any endpoint to return mock status codes and injected latency so you can observe retry behavior firsthand:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] text-center">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">200 OK</span>
                <span className="text-3xs text-neutral-400">Default Success</span>
              </div>
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] text-center">
                <span className="font-bold text-amber-600 dark:text-amber-400 block">429 Limit</span>
                <span className="text-3xs text-neutral-400">Rate Limited</span>
              </div>
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] text-center">
                <span className="font-bold text-rose-600 dark:text-rose-400 block">500 Error</span>
                <span className="text-3xs text-neutral-400">Internal Failure</span>
              </div>
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] text-center">
                <span className="font-bold text-blue-600 dark:text-blue-400 block">0 - 5000ms</span>
                <span className="text-3xs text-neutral-400">Delay Injection</span>
              </div>
            </div>
          </section>

          {/* Section 4: HMAC Verification */}
          <section id="hmac" className="space-y-4 scroll-mt-20">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-neutral-500" />
              4. In-Browser HMAC Signature Verification
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Webhook providers sign payloads using a shared secret and an HMAC digest (such as <code className="font-mono text-2xs">Stripe-Signature</code> or <code className="font-mono text-2xs">X-Hub-Signature-256</code>). HookScope includes an in-browser HMAC tool powered by the native <code className="font-mono text-2xs">window.crypto.subtle</code> API.
            </p>

            <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] space-y-2 text-xs">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Supported Algorithms &amp; Provider Prepend Formats:
              </h4>
              <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 text-xs space-y-1">
                <li><strong className="text-neutral-800 dark:text-neutral-200">HMAC-SHA256:</strong> Standard for Stripe, GitHub, Shopify, Slack, Twilio.</li>
                <li><strong className="text-neutral-800 dark:text-neutral-200">Stripe Prepend Format:</strong> Hashes <code className="font-mono text-2xs">t + "." + payload</code> and compares against <code className="font-mono text-2xs">v1</code> hash.</li>
                <li><strong className="text-neutral-800 dark:text-neutral-200">Base64 &amp; Hex:</strong> Supports both hexadecimal and base64-encoded digests.</li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/app/tools/signature"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>Open HMAC Verifier Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Section 5: Storage Architecture */}
          <section id="storage" className="space-y-4 scroll-mt-20">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-neutral-500" />
              5. Vercel &amp; Upstash Redis Storage Configuration
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              When running in a serverless environment like Vercel or AWS Lambda, in-memory objects are ephemeral and do not persist across isolated instances. HookScope includes an Upstash Redis REST adapter that provides persistent storage with zero server management:
            </p>

            <CodeBlock
              language="bash"
              code={`# Add these variables to your Vercel Project Settings or .env file
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-secret-rest-token"

# Optional Rate Limiter Configuration (requests per minute)
RATE_LIMIT_PER_MINUTE="120"`}
            />
          </section>

          {/* Section 6: REST API Reference */}
          <section id="api-reference" className="space-y-4 scroll-mt-20">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-neutral-500" />
              6. REST API Reference
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              HookScope exposes programmatic REST endpoints for automating test environments and orchestrating webhook workflows:
            </p>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-xs">
              <div className="p-3 bg-neutral-50/50 dark:bg-[#161619] flex items-center justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-3xs font-bold mr-2">POST</span>
                  <span>/api/endpoints</span>
                </div>
                <span className="text-3xs text-neutral-500 font-sans">Creates new endpoint</span>
              </div>

              <div className="p-3 bg-neutral-50/50 dark:bg-[#161619] flex items-center justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-3xs font-bold mr-2">GET</span>
                  <span>/api/endpoints</span>
                </div>
                <span className="text-3xs text-neutral-500 font-sans">Lists user endpoints</span>
              </div>

              <div className="p-3 bg-neutral-50/50 dark:bg-[#161619] flex items-center justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-3xs font-bold mr-2">GET</span>
                  <span>/api/endpoints/:token/events</span>
                </div>
                <span className="text-3xs text-neutral-500 font-sans">Fetches captured stream</span>
              </div>

              <div className="p-3 bg-neutral-50/50 dark:bg-[#161619] flex items-center justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-3xs font-bold mr-2">PATCH</span>
                  <span>/api/endpoints/:token</span>
                </div>
                <span className="text-3xs text-neutral-500 font-sans">Updates response rules</span>
              </div>

              <div className="p-3 bg-neutral-50/50 dark:bg-[#161619] flex items-center justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 text-3xs font-bold mr-2">POST</span>
                  <span>/api/replay</span>
                </div>
                <span className="text-3xs text-neutral-500 font-sans">Dispatches SSRF replay</span>
              </div>

              <div className="p-3 bg-neutral-50/50 dark:bg-[#161619] flex items-center justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-3xs font-bold mr-2">DELETE</span>
                  <span>/api/endpoints/:token</span>
                </div>
                <span className="text-3xs text-neutral-500 font-sans">Deletes endpoint and data</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sticky Sidebar Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 bg-white dark:bg-[#121214] space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-mono">
              Table of Contents
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              {sections.map(sec => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block py-1"
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
              <span className="text-3xs font-mono uppercase text-neutral-400 block">
                Quick Action
              </span>
              <Link
                to="/app"
                className="flex items-center justify-between w-full p-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-white transition-colors"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
