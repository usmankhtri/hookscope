import React, { useEffect } from 'react';
import {
  GitCompare,
  KeyRound,
  Layers,
  ArrowRight,
  Wrench,
  Radio,
  Sliders,
  Shield,
  FileCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToolsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Developer Toolbox – HookScope';
  }, []);

  const tools = [
    {
      title: 'Payload Comparison & Diff',
      description: 'Compare two JSON payloads side by side to detect added, removed, or modified properties.',
      path: '/app/tools/diff',
      icon: GitCompare,
      badge: 'Diff Tool',
    },
    {
      title: 'Webhook Signature Verifier',
      description: 'Verify HMAC signatures from Stripe, GitHub, and Shopify securely in your browser using Web Crypto.',
      path: '/app/tools/signature',
      icon: KeyRound,
      badge: 'Web Crypto',
    },
    {
      title: 'Webhook Event Templates',
      description: 'Browse realistic sample payloads from Stripe, GitHub, Shopify, and Slack, and send them directly to your endpoint.',
      path: '/app/tools/templates',
      icon: Layers,
      badge: 'Templates',
    },
    {
      title: 'Request Inspector & Replay',
      description: 'Inspect headers, query parameters, and raw JSON payloads, then replay requests safely with built-in SSRF guards.',
      path: '/app',
      icon: Radio,
      badge: 'Inspector',
    },
    {
      title: 'Custom Response Rules',
      description: 'Configure endpoints to return 429, 500, or custom status codes with delays (0–5000ms) to test upstream retry behavior.',
      path: '/app',
      icon: Sliders,
      badge: 'Simulation',
    },
    {
      title: 'REST API Reference',
      description: 'Explore the complete HookScope REST API documentation to automate endpoint generation and webhook workflows.',
      path: '/docs#api-reference',
      icon: FileCode,
      badge: 'API Specs',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <Wrench className="w-3.5 h-3.5 text-emerald-500" />
          <span>Developer Utilities</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Webhook Developer Toolbox
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Specialized debugging utilities for payload verification, cryptographic signature hashing, structural schema diffing, and simulated event testing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map(tool => (
          <Link
            key={tool.title}
            to={tool.path}
            className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] hover:border-neutral-400 dark:hover:border-neutral-700 transition-all flex flex-col justify-between group space-y-4 shadow-2xs hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <tool.icon className="w-4 h-4" />
                </div>
                <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  {tool.badge}
                </span>
              </div>

              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {tool.title}
              </h2>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
              <span>Launch tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
