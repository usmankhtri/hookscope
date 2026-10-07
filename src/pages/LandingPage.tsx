import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Plus,
  Terminal,
  Shield,
  RefreshCw,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Radio,
  Sliders,
  KeyRound,
  GitCompare,
  Layers,
  ChevronDown,
  ChevronUp,
  Code2,
  Zap,
  Lock,
  Globe,
  Database,
  Play,
  Flame,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClient } from '../engine/client/apiClient';
import { CopyButton } from '../components/common/CopyButton';
import { WebhookEndpoint } from '../types';

interface LandingPageProps {
  onCreateEndpoint: () => Promise<WebhookEndpoint | void>;
  onRequestCreateEndpoint?: () => void;
}

interface SandboxPreset {
  id: string;
  name: string;
  provider: string;
  method: 'POST' | 'PUT' | 'PATCH';
  path: string;
  headers: Record<string, string>;
  payload: Record<string, any>;
  statusCode: number;
}

const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: 'stripe-payment',
    name: 'payment_intent.succeeded',
    provider: 'Stripe',
    method: 'POST',
    path: '/charges/v1',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': 't=1728284400,v1=9e38d6f1a8c90b4e2f1a6c8b9d0e2f1a',
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
    },
    payload: {
      id: 'evt_3Nk2Z8LkdIwHu7ix1aB2c3d4',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_3Nk2Z8LkdIwHu7ix',
          amount: 8900,
          currency: 'usd',
          status: 'succeeded',
          customer: 'cus_O9Kld8wHa9',
          payment_method_types: ['card'],
        },
      },
    },
    statusCode: 200,
  },
  {
    id: 'github-push',
    name: 'push (main branch)',
    provider: 'GitHub',
    method: 'POST',
    path: '/deploy/hooks',
    headers: {
      'content-type': 'application/json',
      'x-github-event': 'push',
      'x-hub-signature-256': 'sha256=4f2a7e9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
      'user-agent': 'GitHub-Hookshot/7b63f4',
    },
    payload: {
      ref: 'refs/heads/main',
      repository: {
        id: 92837465,
        name: 'api-service',
        full_name: 'acme-corp/api-service',
      },
      head_commit: {
        id: '9f8e7d6c5b4a3210',
        message: 'fix: enforce RFC 1918 SSRF destination validation',
        author: { name: 'DevOps Lead', email: 'dev@acme.com' },
      },
    },
    statusCode: 200,
  },
  {
    id: 'shopify-order',
    name: 'orders/create',
    provider: 'Shopify',
    method: 'POST',
    path: '/inventory/sync',
    headers: {
      'content-type': 'application/json',
      'x-shopify-topic': 'orders/create',
      'x-shopify-hmac-sha256': 'dGVzdC1zaWduYXR1cmUtaGV4LWJhc2U2NA==',
      'x-shopify-shop-domain': 'acme-merch.myshopify.com',
    },
    payload: {
      id: 8209829119461,
      total_price: '142.50',
      currency: 'USD',
      financial_status: 'paid',
      line_items: [
        { title: 'Developer mechanical keyboard', quantity: 1, price: '120.00' },
        { title: 'Braided USB-C Cable', quantity: 1, price: '22.50' },
      ],
    },
    statusCode: 200,
  },
  {
    id: 'slack-interaction',
    name: 'interactive_message',
    provider: 'Slack',
    method: 'POST',
    path: '/bot/events',
    headers: {
      'content-type': 'application/json',
      'x-slack-signature': 'v0=a2114d57b48eac39b9ad189dd831627a4148a315',
      'x-slack-request-timestamp': '1728284410',
    },
    payload: {
      type: 'block_actions',
      user: { id: 'U024BE7LH', username: 'alex.engineer' },
      actions: [
        { action_id: 'approve_deployment', value: 'deploy_prod_release_v2' },
      ],
    },
    statusCode: 200,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateEndpoint,
  onRequestCreateEndpoint,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'HookScope – Inspect, Test, Replay & Debug Webhooks';
  }, []);

  // Sandbox playground interactive state
  const [selectedPreset, setSelectedPreset] = useState<SandboxPreset>(SANDBOX_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'headers' | 'body' | 'replay'>('overview');
  const [mockStatus, setMockStatus] = useState<number>(200);
  const [mockDelay, setMockDelay] = useState<number>(0);
  const [simulatedEvents, setSimulatedEvents] = useState<SandboxPreset[]>([
    SANDBOX_PRESETS[0],
    SANDBOX_PRESETS[1],
  ]);
  const [curlCopied, setCurlCopied] = useState(false);

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCreateAndOpen = async () => {
    if (onRequestCreateEndpoint) {
      onRequestCreateEndpoint();
      return;
    }
    try {
      const ep = await ApiClient.createEndpoint();
      navigate(`/app/endpoints/${ep.token}`);
    } catch {
      navigate('/app/endpoints');
    }
  };

  const handleDispatchSandbox = (preset: SandboxPreset) => {
    setSelectedPreset(preset);
    if (!simulatedEvents.some(e => e.id === preset.id)) {
      setSimulatedEvents(prev => [preset, ...prev]);
    }
  };

  const sampleCurl = `curl -X POST https://hookscope-tools.vercel.app/h/wh_live_a9f82c \\
  -H "Content-Type: application/json" \\
  -H "X-HookScope-Debug: true" \\
  -d '{"event":"order.completed","amount":8900,"currency":"usd"}'`;

  const copySampleCurl = async () => {
    try {
      await navigator.clipboard.writeText(sampleCurl);
      setCurlCopied(true);
      setTimeout(() => setCurlCopied(false), 2000);
    } catch {}
  };

  const faqs = [
    {
      q: 'How does HookScope protect against Server-Side Request Forgery (SSRF)?',
      a: 'When you replay captured webhooks to destination URLs, HookScope performs pre-flight DNS resolution and enforces strict network boundary validation. Requests to local addresses (127.0.0.1, localhost), private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), and cloud metadata endpoints (169.254.169.254) are blocked before any request is dispatched.',
    },
    {
      q: 'Do I need to install a CLI or create an account?',
      a: 'No installation or sign-up is required. HookScope generates immediate, public HTTPS URLs that third-party services like Stripe, GitHub, Shopify, and Slack can send webhooks to right away. You can view all requests live in your browser and replay them to your local server whenever you want.',
    },
    {
      q: 'How long are webhook requests retained, and can I delete them?',
      a: 'Every captured webhook is automatically stored with an expiration window (default 24 hours), after which it is automatically deleted. You can also delete single events or clear your entire request history with one click in the workspace at any time.',
    },
    {
      q: 'Are secret keys sent to a server when verifying webhook signatures?',
      a: 'No. The HookScope Signature Verifier runs entirely in your browser using the native Web Crypto API (SubtleCrypto). Your secret keys and raw payloads are processed locally and are never sent over the network or saved in server logs.',
    },
    {
      q: 'Can I test how webhook providers handle rate limits and server errors?',
      a: 'Yes. HookScope allows you to configure Custom Response Rules for any endpoint. You can choose response status codes (such as 200, 400, 429, 500, or 503), configure custom response bodies, and inject artificial delays from 0ms to 5000ms to observe upstream retry mechanics.',
    },
  ];

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-24 font-sans">
      {/* 1. Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-2">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141416] text-2xs font-mono text-neutral-600 dark:text-neutral-400 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>HookScope v1.2 · Real-Time Webhook Observability</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 text-balance leading-[1.12]">
          Real-time webhook inspection, testing, &amp; replay.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Create instant public endpoints to capture HTTP webhooks. Inspect headers and payloads live, simulate custom status codes, and replay requests directly to your local development server.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCreateAndOpen}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-white transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test Endpoint</span>
          </button>

          <button
            type="button"
            onClick={copySampleCurl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all font-mono"
          >
            {curlCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Terminal className="w-3.5 h-3.5 text-neutral-500" />}
            <span>{curlCopied ? 'cURL Command Copied' : 'Copy cURL Example'}</span>
          </button>

          <Link
            to="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <span>View Documentation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Trust Highlights */}
        <div className="flex items-center justify-center gap-6 pt-4 text-2xs text-neutral-500 font-mono flex-wrap">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            No account required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            SSRF Replay Guard
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Local Web Crypto
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Automated 24h Cleanup
          </span>
        </div>
      </section>

      {/* 2. Interactive Live Sandbox */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              Interactive Webhook Preview
            </h2>
            <p className="text-xs text-neutral-500">
              Select a sample event below to see how HookScope captures, inspects, and replays requests in real time.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            {SANDBOX_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleDispatchSandbox(preset)}
                className={`px-2.5 py-1 text-2xs font-mono rounded-md transition-colors cursor-pointer ${
                  selectedPreset.id === preset.id
                    ? 'bg-white dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {preset.provider}
              </button>
            ))}
          </div>
        </div>

        {/* The Mock Terminal / Workspace Frame */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-[#121214] shadow-2xl">
          {/* Top Address Bar */}
          <div className="px-4 py-2.5 bg-neutral-100/80 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-2xs font-mono text-neutral-500 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 font-semibold text-neutral-800 dark:text-neutral-200 select-all">
                https://hookscope-tools.vercel.app/h/wh_live_a9f82c
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Receiver
              </span>
              <span className="text-3xs text-neutral-400">
                Rule: HTTP {mockStatus} · {mockDelay}ms Delay
              </span>
            </div>
          </div>

          {/* 2-Column Split Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px] divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 font-sans">
            {/* Left Stream Inbox Column */}
            <div className="md:col-span-4 p-3 space-y-2 bg-neutral-50/60 dark:bg-[#141416]">
              <div className="flex items-center justify-between px-2 text-2xs font-mono uppercase text-neutral-400">
                <span>Captured Stream ({simulatedEvents.length})</span>
                <span className="text-emerald-600 dark:text-emerald-400">Live</span>
              </div>

              <div className="space-y-1.5">
                {simulatedEvents.map(evt => {
                  const isSelected = selectedPreset.id === evt.id;
                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => setSelectedPreset(evt)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs font-mono cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-[#1c1c20] border-neutral-300 dark:border-neutral-700 shadow-2xs'
                          : 'bg-transparent border-transparent hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {evt.method}
                        </span>
                        <span className="text-3xs px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                          {mockStatus}
                        </span>
                      </div>
                      <div className="text-2xs truncate text-neutral-700 dark:text-neutral-300 font-medium">
                        {evt.name}
                      </div>
                      <div className="text-3xs text-neutral-400 flex items-center justify-between mt-1">
                        <span>{evt.provider}</span>
                        <span>Just now</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Response Simulator Controls */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/80 px-2 space-y-2">
                <span className="text-3xs uppercase font-mono text-neutral-400 block">
                  Simulate Response Rule:
                </span>
                <div className="grid grid-cols-3 gap-1 text-2xs font-mono">
                  <button
                    type="button"
                    onClick={() => setMockStatus(200)}
                    className={`py-1 rounded border text-center transition-colors ${
                      mockStatus === 200
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    200 OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setMockStatus(429)}
                    className={`py-1 rounded border text-center transition-colors ${
                      mockStatus === 429
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    429 Limit
                  </button>
                  <button
                    type="button"
                    onClick={() => setMockStatus(500)}
                    className={`py-1 rounded border text-center transition-colors ${
                      mockStatus === 500
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    500 Error
                  </button>
                </div>
              </div>
            </div>

            {/* Right Detailed Inspector Column */}
            <div className="md:col-span-8 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-white dark:bg-[#121214]">
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`pb-1 border-b-2 font-medium transition-colors cursor-pointer ${
                        activeTab === 'overview'
                          ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-bold'
                          : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                      }`}
                    >
                      Payload
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('headers')}
                      className={`pb-1 border-b-2 font-medium transition-colors cursor-pointer ${
                        activeTab === 'headers'
                          ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-bold'
                          : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                      }`}
                    >
                      Headers ({Object.keys(selectedPreset.headers).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('replay')}
                      className={`pb-1 border-b-2 font-medium transition-colors cursor-pointer ${
                        activeTab === 'replay'
                          ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-bold'
                          : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                      }`}
                    >
                      SSRF Replay
                    </button>
                  </div>

                  <span className="text-3xs font-mono text-neutral-400">
                    Format: application/json
                  </span>
                </div>

                {/* Tab 1: Overview Payload */}
                {activeTab === 'overview' && (
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 font-mono text-xs overflow-x-auto max-h-64">
                      <pre className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                        {JSON.stringify(selectedPreset.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Tab 2: Headers */}
                {activeTab === 'headers' && (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                      {Object.entries(selectedPreset.headers).map(([k, v]) => (
                        <div key={k} className="p-2.5 flex items-start justify-between gap-3 bg-neutral-50/50 dark:bg-[#161619]">
                          <span className="text-neutral-500 font-medium shrink-0">{k}</span>
                          <span className="text-neutral-800 dark:text-neutral-200 select-all truncate">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Replay Preview */}
                {activeTab === 'replay' && (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 space-y-2">
                      <div className="text-neutral-500 text-3xs uppercase">Destination URL Target</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">POST</span>
                        <input
                          type="text"
                          readOnly
                          value="https://api.myapp.com/api/webhooks/stripe"
                          className="flex-1 px-2.5 py-1 rounded bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-3xs text-emerald-600 dark:text-emerald-400">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Pre-flight DNS passed · Private RFC 1918 subnets restricted</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick Action */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                <span className="text-3xs font-mono text-neutral-400">
                  Ready to test with real webhook sources?
                </span>
                <button
                  type="button"
                  onClick={handleCreateAndOpen}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-all shadow-xs cursor-pointer"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four Core Features */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Engineered for high reliability &amp; security
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Everything developers need to receive, inspect, simulate, and debug API webhooks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1 */}
          <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Instant Public Endpoints
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Generate secure public HTTP endpoints in one click. Receive payloads up to 512 KB from Stripe, GitHub, Shopify, Slack, Twilio, or custom APIs.
              </p>
            </div>
            <div className="text-3xs font-mono text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              POST, PUT, PATCH, GET, DELETE
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                SSRF-Safe Request Replay
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Forward captured requests to your local development server or staging API. Automated pre-flight checks block requests to private internal networks.
              </p>
            </div>
            <div className="text-3xs font-mono text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              Pre-flight DNS + 10s Timeout Guard
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Response &amp; Latency Simulator
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Test how webhook senders handle failures. Configure endpoints to return custom status codes (200, 429, 500) and delays up to 5000ms.
              </p>
            </div>
            <div className="text-3xs font-mono text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              Custom HTTP Status + Delay Injection
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                In-Browser Web Crypto
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Verify HMAC-SHA256 and SHA-1 signatures directly inside your browser. Your secret keys and raw payloads are never sent to external servers.
              </p>
            </div>
            <div className="text-3xs font-mono text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              Web Crypto API · Zero Network Transmission
            </div>
          </div>
        </div>
      </section>

      {/* 4. Supported Providers & Ecosystem Grid */}
      <section className="space-y-6 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121214]">
        <div className="max-w-xl space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Works out of the box with any webhook provider
          </h2>
          <p className="text-xs text-neutral-500">
            HookScope accepts standard HTTP payloads from any webhook delivery service.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2 text-xs font-mono">
          {[
            { name: 'Stripe', tag: 'Payments' },
            { name: 'GitHub', tag: 'CI/CD' },
            { name: 'Shopify', tag: 'E-Commerce' },
            { name: 'Slack', tag: 'Messaging' },
            { name: 'Twilio', tag: 'SMS / Voice' },
            { name: 'Discord', tag: 'Bots' },
            { name: 'Paddle', tag: 'Billing' },
            { name: 'SendGrid', tag: 'Email' },
            { name: 'Square', tag: 'POS' },
            { name: 'Linear', tag: 'Issues' },
            { name: 'AWS SNS', tag: 'Events' },
            { name: 'Custom APIs', tag: 'REST' },
          ].map(prov => (
            <div
              key={prov.name}
              className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/60 dark:bg-[#161619] flex flex-col justify-between space-y-1 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
            >
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {prov.name}
              </span>
              <span className="text-3xs text-neutral-400">
                {prov.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Feature Comparison Matrix */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Why developers choose HookScope
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            How HookScope compares against traditional tunneling and print debugging methods.
          </p>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-[#121214]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-neutral-50 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 text-2xs uppercase tracking-wider font-mono text-neutral-500">
                <tr>
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">HookScope</th>
                  <th className="py-3 px-4">ngrok / CLI</th>
                  <th className="py-3 px-4">Generic RequestBin</th>
                  <th className="py-3 px-4">Console Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-xs">
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-neutral-900 dark:text-neutral-100">Zero installation required</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">✓ Browser only</td>
                  <td className="py-3 px-4 text-neutral-500">✗ CLI required</td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">✓ Browser only</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Server deploy</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-neutral-900 dark:text-neutral-100">SSRF Replay Protection</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">✓ RFC 1918 Guard</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Direct open port</td>
                  <td className="py-3 px-4 text-neutral-500">✗ None / Open proxy</td>
                  <td className="py-3 px-4 text-neutral-500">✗ N/A</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-neutral-900 dark:text-neutral-100">Simulate 429 &amp; 500 Responses</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full custom rules</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Requires code edits</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Usually 200 only</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Requires code edits</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-neutral-900 dark:text-neutral-100">In-Browser HMAC Verifier</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">✓ Web Crypto</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Not included</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Not included</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Key in server log</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-neutral-900 dark:text-neutral-100">JSON Payload Diffing</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">✓ Built-in tool</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Not included</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Not included</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Manual diffing</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-neutral-900 dark:text-neutral-100">Automated 24h Data Purge</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">✓ Redis TTL</td>
                  <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">✓ Ephemeral stream</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Unclear retention</td>
                  <td className="py-3 px-4 text-neutral-500">✗ Kept in log files</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Technical FAQ Accordion */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Technical answers to common questions about HookScope architecture and security.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-[#141416]/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom High-Impact Call to Action */}
      <section className="border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 text-center bg-white dark:bg-[#121214] shadow-xl space-y-6">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center mx-auto shadow-md">
            <Radio className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Ready to debug your first webhook?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Create an isolated public endpoint in seconds. No credit card, no sign-up, and no software installation required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleCreateAndOpen}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-white transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open HookScope Workspace</span>
          </button>
          <Link
            to="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <span>View Documentation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
