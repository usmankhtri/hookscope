import React, { useEffect } from 'react';
import {
  Terminal,
  Users,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Layers,
  Code2,
  Server,
  Cpu,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About HookScope – Architecture, Mission & Story';
  }, []);

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-16 font-sans">
      {/* Header */}
      <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          <span>Product Overview &amp; Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Built to eliminate webhook integration guesswork
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          HookScope was engineered because debugging webhooks in 2026 should not require deploying temporary console.log statements to staging servers or wrestling with brittle local tunnels.
        </p>
      </div>

      {/* The Core Problem We Solve */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          The Webhook Developer Experience Gap
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <p>
            When building integrations with services like Stripe, GitHub, Shopify, or Twilio, testing is notoriously difficult. Unlike REST APIs where you originate requests and inspect immediate responses, webhooks are asynchronous HTTP requests pushed into your systems by third parties.
          </p>
          <p>
            Traditionally, developers either set up local tunnels like ngrok (which open broad ports into local workstations), deploy dummy endpoints with print statements, or use generic request bins that store sensitive payloads indefinitely without SSRF protections.
          </p>
          <p>
            HookScope solves this by providing an isolated, zero-setup developer cockpit: capture incoming requests instantly, inspect exact headers and raw bodies, test custom failure scenarios with mock response rules, and replay requests to destination endpoints with automated SSRF guards.
          </p>
        </div>
      </section>

      {/* The 4 Architectural Pillars */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Four Core Engineering Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              1. Sub-Millisecond Ingestion
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Accepting incoming requests without blocking upstream callers is critical. HookScope receives and returns receipt acknowledgments in under 15ms.
            </p>
          </div>

          <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              2. Defense-in-Depth SSRF Guard
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every replay destination undergoes DNS pre-resolution to block private RFC 1918 subnets, loopback addresses, and cloud metadata services.
            </p>
          </div>

          <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              3. Client-Side Cryptography
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              HMAC signature verification runs in the user's browser using the native Web Crypto API. Secrets are never transmitted to backend servers or written to logs.
            </p>
          </div>

          <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              4. Ephemeral Storage Discipline
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              All stored records are subject to an automated 24-hour TTL expiration. No customer data persists indefinitely, and full manual purge is always 1-click away.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack Architecture */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Architecture &amp; Technology Stack
        </h2>
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-[#121214] space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-3xs uppercase text-neutral-400">Frontend Tier</span>
              <p className="text-neutral-900 dark:text-neutral-100 font-bold">React 19 + TypeScript</p>
              <p className="text-3xs text-neutral-500 font-sans">Tailwind CSS v4, Lucide Icons, Web Crypto API</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xs uppercase text-neutral-400">Runtime &amp; API</span>
              <p className="text-neutral-900 dark:text-neutral-100 font-bold">Node.js Express + TSX</p>
              <p className="text-3xs text-neutral-500 font-sans">Strict payload guards, streaming parsers, rate limiting</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xs uppercase text-neutral-400">Persistence Engine</span>
              <p className="text-neutral-900 dark:text-neutral-100 font-bold">Upstash Redis REST</p>
              <p className="text-3xs text-neutral-500 font-sans">Serverless-friendly, TTL-evicted key-value storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Developers & Use Cases */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-neutral-500" />
          Who Uses HookScope
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] space-y-1.5">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Payment &amp; Billing Engineers</h3>
            <p className="text-neutral-500 leading-relaxed font-sans">
              Validating Stripe, PayPal, and Paddle subscription webhooks, verifying payment_intent signatures, and testing failed charge retry logic.
            </p>
          </div>
          <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] space-y-1.5">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">CI/CD &amp; DevOps Teams</h3>
            <p className="text-neutral-500 leading-relaxed font-sans">
              Monitoring GitHub push, release, and pull request event streams, debugging webhook payload differences between deployment stages.
            </p>
          </div>
          <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] space-y-1.5">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">E-Commerce Developers</h3>
            <p className="text-neutral-500 leading-relaxed font-sans">
              Receiving Shopify orders/create and inventory update webhooks, inspecting orderline schemas, and simulating fulfillment delays.
            </p>
          </div>
          <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] space-y-1.5">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Chatbot &amp; Messaging Integrators</h3>
            <p className="text-neutral-500 leading-relaxed font-sans">
              Inspecting Slack interactive block payloads, Discord bot slash-commands, and Twilio inbound SMS messages.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-4">
        <Link
          to="/docs"
          className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          Explore Technical Documentation &rarr;
        </Link>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors shadow-2xs"
        >
          <span>Open HookScope Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
