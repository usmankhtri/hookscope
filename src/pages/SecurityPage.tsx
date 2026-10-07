import React, { useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Server,
  Terminal,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  Radio,
  FileCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SecurityPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Security Architecture & Model – HookScope';
  }, []);

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-16 font-sans">
      {/* Header */}
      <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Security Architecture &amp; Threat Safeguards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          HookScope Security Architecture
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          Technical specifications for untrusted payload isolation, SSRF prevention during webhook replay, client-side cryptographic isolation, and defensive rate-limiting controls.
        </p>
      </div>

      {/* Primary Caution */}
      <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1.5 font-sans">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Security &amp; Data Handling Advisory
          </p>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
            Do not send private production encryption keys, master database credentials, or unredacted user credentials to public inspection endpoints.
          </p>
          <p className="text-amber-700 dark:text-amber-400 leading-relaxed text-2xs">
            HookScope is engineered for webhook verification, integration inspection, and payload debugging. Always utilize test webhooks, sandbox accounts, or sanitized payloads when validating integrations.
          </p>
        </div>
      </div>

      {/* Threat Models and Defenses */}
      <div className="space-y-10">
        {/* Section 1: SSRF */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            1. Server-Side Request Forgery (SSRF) Protection
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            When replaying captured webhooks to external destination URLs, HookScope validates target destinations to prevent proxying into internal infrastructure or private cloud VPCs:
          </p>
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden text-xs font-mono">
            <div className="bg-neutral-50 dark:bg-[#161619] px-4 py-2 font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
              SSRF Destination Filter Matrix
            </div>
            <div className="p-4 space-y-2 bg-white dark:bg-[#121214] text-neutral-700 dark:text-neutral-300 text-2xs">
              <div><span className="text-neutral-400">Loopback Addresses:</span> 127.0.0.1, ::1, 0.0.0.0, localhost (BLOCKED)</div>
              <div><span className="text-neutral-400">Private Subnets (RFC 1918):</span> 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 (BLOCKED)</div>
              <div><span className="text-neutral-400">Cloud Metadata APIs:</span> 169.254.169.254, metadata.google.internal (BLOCKED)</div>
              <div><span className="text-neutral-400">Carrier-Grade NAT (RFC 6598):</span> 100.64.0.0/10 (BLOCKED)</div>
              <div><span className="text-neutral-400">DNS Resolution:</span> Hostnames resolved before connection; private IP targets denied</div>
              <div><span className="text-neutral-400">Outbound Timeouts:</span> Enforces 10-second request timeout and 256 KB response body cap</div>
            </div>
          </div>
        </section>

        {/* Section 2: Untrusted Payload Isolation */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            2. Untrusted Payload Isolation &amp; Memory Bounds
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Incoming webhook payloads originate from external, untrusted clients. HookScope enforces strict defensive boundaries:
          </p>
          <ul className="list-disc list-inside text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 pl-2">
            <li>Payloads are never executed as JavaScript or system commands.</li>
            <li>Content is rendered as escaped text and syntax-highlighted code; arbitrary HTML is never injected into the DOM.</li>
            <li>XML payloads are parsed and formatted without entity expansion to eliminate XML External Entity (XXE) vulnerabilities.</li>
            <li>Payload size is strictly capped at 512 KB per request to prevent buffer overflow and memory exhaustion attacks.</li>
          </ul>
        </section>

        {/* Section 3: Web Crypto Isolation */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-500" />
            3. Client-Side Cryptographic Isolation
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Webhook signature verification often requires providing your webhook secret (e.g., Stripe <code className="font-mono text-2xs">whsec_...</code>).
            HookScope computes all cryptographic hashes using the native browser <code className="font-mono text-2xs">SubtleCrypto</code> API.
            Secret keys are never transmitted over HTTP and never written to backend server storage or diagnostic logs.
          </p>
        </section>

        {/* Section 4: Ingestion Rate Limiting */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            4. Ingestion Rate Limiting &amp; DoS Deterrence
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Endpoints are governed by sliding-window token bucket limiters (default: 120 requests/minute per client IP and endpoint). Exceeded limits immediately return HTTP 429 Too Many Requests with a <code className="font-mono text-2xs">Retry-After</code> header to deter denial-of-service abuse.
          </p>
        </section>
      </div>

      {/* Bottom Nav */}
      <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-4">
        <Link
          to="/privacy"
          className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          View Privacy &amp; Data Retention Policy &rarr;
        </Link>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors shadow-2xs"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
