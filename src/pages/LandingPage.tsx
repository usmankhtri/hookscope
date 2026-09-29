import React, { useEffect } from 'react';
import { ArrowRight, Plus, Terminal, Shield, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClient } from '../engine/client/apiClient';

import { WebhookEndpoint } from '../types';

interface LandingPageProps {
  onCreateEndpoint: () => Promise<WebhookEndpoint | void>;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateEndpoint }) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'HookLab – Inspect, test, replay, and understand webhooks';
  }, []);

  const handleCreateAndOpen = async () => {
    try {
      const ep = await ApiClient.createEndpoint();
      navigate(`/app/endpoints/${ep.token}`);
    } catch {
      navigate('/app/endpoints');
    }
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Webhook Observability Workspace</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 text-balance leading-tight">
          See exactly what your webhooks send.
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Create a public endpoint, inspect incoming headers and payloads, edit requests, and replay them to your local server.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCreateAndOpen}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create endpoint</span>
          </button>

          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <span>Read the docs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Visual Product Mockup / Interface Preview Centerpiece */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-[#121214] shadow-xl">
        {/* Mock Top bar */}
        <div className="px-4 py-2.5 bg-neutral-100/70 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-2xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
            <span className="ml-2 text-neutral-700 dark:text-neutral-300 font-semibold">
              https://hookscope.vercel.app/h/demo-endpoint
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Listening</span>
          </div>
        </div>

        {/* Mock 2-panel interface */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 font-mono text-xs">
          {/* Left panel: Sample stream */}
          <div className="md:col-span-5 p-3 space-y-1.5 bg-neutral-50/50 dark:bg-[#141416]">
            <div className="text-3xs uppercase tracking-wider text-neutral-400 px-2 py-1">
              Captured Stream
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-[#1c1c20] border-l-2 border-neutral-900 dark:border-neutral-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">POST</span>
                <span className="text-3xs text-neutral-400">14:32:04</span>
                <span className="text-3xs px-1.5 py-0.2 rounded border border-emerald-300 text-emerald-600 dark:border-emerald-800">
                  200
                </span>
              </div>
              <div className="text-neutral-700 dark:text-neutral-300 text-2xs truncate">
                /h/demo-endpoint/charges
              </div>
              <div className="text-3xs text-neutral-400">2.4 KB · JSON</div>
            </div>

            <div className="p-2.5 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 text-neutral-500 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">POST</span>
                <span className="text-3xs">14:31:51</span>
                <span className="text-3xs px-1.5 py-0.2 rounded border border-neutral-200 dark:border-neutral-800">
                  200
                </span>
              </div>
              <div className="text-2xs truncate">/h/demo-endpoint/push</div>
              <div className="text-3xs text-neutral-400">4.1 KB · JSON</div>
            </div>
          </div>

          {/* Right panel: Sample inspector */}
          <div className="md:col-span-7 p-4 sm:p-5 space-y-4 bg-white dark:bg-[#121214]">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-2 text-2xs font-semibold">
              <span className="text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 -mb-2.5">
                Overview
              </span>
              <span className="text-neutral-400">Headers (8)</span>
              <span className="text-neutral-400">Payload</span>
              <span className="text-neutral-400">Replay</span>
            </div>

            <div className="space-y-2 text-2xs leading-relaxed">
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 space-y-1">
                <div className="text-neutral-400 uppercase text-3xs">Sample Payload Preview</div>
                <pre className="text-neutral-800 dark:text-neutral-200 whitespace-pre overflow-x-auto m-0">
{`{
  "event": "payment_intent.succeeded",
  "amount": 4900,
  "currency": "usd",
  "customer": "cus_O8LkdIwHu7",
  "status": "succeeded"
}`}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-neutral-400 text-3xs">
                  SSRF-Safe Replay Engine Available
                </span>
                <button
                  type="button"
                  onClick={handleCreateAndOpen}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
                >
                  <span>Open live workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] space-y-2">
          <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-mono text-xs">
            01
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Real Ingestion & Inspection
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Provision real public endpoints to receive webhooks from any external platform. View raw bytes, formatted JSON/XML, headers, and query parameters.
          </p>
        </div>

        <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] space-y-2">
          <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-mono text-xs">
            02
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Replay with SSRF Protection
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Forward captured webhooks to your local development server or staging environment with built-in protections against localhost and internal subnet proxying.
          </p>
        </div>

        <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] space-y-2">
          <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-mono text-xs">
            03
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Simulate Response Failures
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Return 400, 429, 500, or 503 status codes with artificial latency to test how webhook senders handle retry schedules and failure backoffs.
          </p>
        </div>
      </div>
    </div>
  );
};
