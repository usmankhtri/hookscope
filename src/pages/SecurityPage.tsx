import React, { useEffect } from 'react';
import { Shield, ShieldCheck, Lock, Server, Terminal, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SecurityPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Security Architecture & Model – HookLab';
  }, []);
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-3 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Security Architecture & Safeguards</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          HookLab Security Model
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
          Technical specifications for untrusted payload isolation, SSRF prevention during webhook replay, credential isolation, and rate-limiting controls.
        </p>
      </div>

      {/* Primary Caution */}
      <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Developer Environment Notice
          </p>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
            Do not send production secrets or sensitive customer data to a testing endpoint.
          </p>
          <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
            HookLab is designed for staging, sandbox validation, local webhook testing, and integration inspection. Always utilize sanitized test payloads or test accounts when validating webhooks.
          </p>
        </div>
      </div>

      {/* Security Pillars */}
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-500" />
            1. Untrusted Payload Isolation
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Incoming webhook payloads originate from external, untrusted clients. HookLab enforces strict boundaries:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 space-y-1.5 pl-2">
            <li>Payloads are never executed as JavaScript or shell scripts.</li>
            <li>Content is rendered as escaped text and syntax-highlighted code; arbitrary HTML is never injected into the DOM.</li>
            <li>XML payloads are parsed and formatted without entity expansion to eliminate XML External Entity (XXE) vulnerabilities.</li>
            <li>Payload size is capped at 512 KB per request to prevent memory exhaustion.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-500" />
            2. Server-Side Request Forgery (SSRF) Protection
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            When replaying captured webhooks to external destination URLs, HookLab validates target destinations to prevent proxying into internal infrastructure:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 space-y-1.5 pl-2">
            <li>Blocks loopback and localhost interfaces (<code className="font-mono text-2xs">127.0.0.1</code>, <code className="font-mono text-2xs">::1</code>, <code className="font-mono text-2xs">0.0.0.0</code>).</li>
            <li>Blocks private RFC 1918 IPv4 ranges (<code className="font-mono text-2xs">10.0.0.0/8</code>, <code className="font-mono text-2xs">172.16.0.0/12</code>, <code className="font-mono text-2xs">192.168.0.0/16</code>).</li>
            <li>Blocks link-local and cloud metadata IPs (<code className="font-mono text-2xs">169.254.169.254</code>, <code className="font-mono text-2xs">metadata.google.internal</code>).</li>
            <li>Performs DNS pre-resolution checks before dispatching requests.</li>
            <li>Enforces a 10-second timeout and 256 KB response truncation limit.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-neutral-500" />
            3. Serverless Credential Isolation
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Storage credentials (<code className="font-mono text-2xs">UPSTASH_REDIS_REST_URL</code> and <code className="font-mono text-2xs">UPSTASH_REDIS_REST_TOKEN</code>) are server-only environment variables. They are never exposed to browser bundles, never prefixed with client identifiers, and never transmitted in response headers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neutral-500" />
            4. Ingestion Rate Limiting
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Endpoints are governed by sliding-window token bucket limiters (default: 120 requests/minute per client IP and endpoint). Exceeded limits immediately return HTTP 429 Too Many Requests with a <code className="font-mono text-2xs">Retry-After</code> header to deter denial-of-service abuse.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <Link
          to="/privacy"
          className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          View Privacy & Retention Policy
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
