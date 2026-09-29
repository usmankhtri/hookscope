import React, { useEffect } from 'react';
import { Terminal, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About HookLab – Product Overview';
  }, []);
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-3 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>Product Overview</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          About HookLab
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
          HookLab is a dedicated developer workspace engineered to eliminate webhook integration guesswork.
        </p>
      </div>

      {/* What HookLab Does */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          What HookLab Does
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          HookLab generates unpredictable public HTTP endpoints capable of receiving and persisting webhooks from any external provider (Stripe, GitHub, Shopify, Slack, Twilio, Paddle, custom APIs). Developers can immediately inspect incoming headers, raw bytes, parsed JSON/XML structures, test error scenarios with mock status codes, and replay requests to local tunnels or staging servers.
        </p>
      </section>

      {/* What Problem It Solves */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          The Problem It Solves
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              No More Print-Debugging
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Eliminates the cycle of deploying temporary logging code to staging servers just to understand what headers and payload fields a provider sends.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Reliable Retry Testing
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Allows developers to configure mock 500, 502, or 429 status codes with artificial latency to observe how upstream webhook providers retry failed deliveries.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Cryptographic Signature Confidence
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Provides deterministic HMAC verification in-browser to debug signature mismatches without leaking secret keys in server log outputs.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Fast Client Reproduction
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Instant generation of cURL, Fetch, Axios, Node.js, and Python snippets corresponding exactly to captured incoming requests.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-neutral-500" />
          Who It Is For
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-mono">
          <li className="flex items-center gap-2 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#121214]">
            <CheckCircle2 className="w-4 h-4 text-neutral-400" />
            <span>Backend Engineers</span>
          </li>
          <li className="flex items-center gap-2 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#121214]">
            <CheckCircle2 className="w-4 h-4 text-neutral-400" />
            <span>API & Platform Developers</span>
          </li>
          <li className="flex items-center gap-2 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#121214]">
            <CheckCircle2 className="w-4 h-4 text-neutral-400" />
            <span>SaaS Builders & Freelancers</span>
          </li>
          <li className="flex items-center gap-2 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#121214]">
            <CheckCircle2 className="w-4 h-4 text-neutral-400" />
            <span>QA & Integration Testers</span>
          </li>
        </ul>
      </section>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <Link
          to="/docs"
          className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Read Technical Documentation
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
