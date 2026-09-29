import React, { useEffect } from 'react';
import { GitCompare, KeyRound, Layers, ArrowRight, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToolsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Developer Toolbox – HookLab';
  }, []);
  const tools = [
    {
      title: 'Payload Comparison & Diff',
      description: 'Perform structural JSON diffing between two webhook payloads to detect added, removed, or modified properties.',
      path: '/app/tools/diff',
      icon: GitCompare,
      badge: 'Diff Engine',
    },
    {
      title: 'HMAC Signature Verifier',
      description: 'Deterministically verify webhook HMAC-SHA256, SHA-1, and SHA-512 signatures with support for Stripe, GitHub, and Shopify formats.',
      path: '/app/tools/signature',
      icon: KeyRound,
      badge: 'Web Crypto',
    },
    {
      title: 'Simulated Webhook Templates',
      description: 'Browse realistic sample webhook events for Stripe, GitHub, Shopify, Slack, and Discord, and dispatch them to test endpoints.',
      path: '/app/tools/templates',
      icon: Layers,
      badge: 'Templates',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <Wrench className="w-3.5 h-3.5" />
          <span>Developer Utilities</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Webhook Developer Toolbox
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Specialized debugging utilities for payload verification, cryptographic signature hashing, and simulated schema testing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map(tool => (
          <Link
            key={tool.path}
            to={tool.path}
            className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#121214] hover:border-neutral-400 dark:hover:border-neutral-700 transition-all flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                  <tool.icon className="w-4 h-4" />
                </div>
                <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  {tool.badge}
                </span>
              </div>

              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                {tool.title}
              </h2>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <span>Open tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
