import React, { useEffect } from 'react';
import { EyeOff, Database, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy & Data Retention – HookLab';
  }, []);
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-3 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Data Privacy & Retention</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Privacy Policy
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
          HookLab is built for transparency: no tracking analytics, no cookie banners, automatic time-to-live expiration, and full user data deletion controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Automatic Time-To-Live (TTL)
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            All stored webhook events are configured with an automated expiration TTL (default 24 hours). Once the TTL expires, the keys are automatically evicted by Redis without requiring manual intervention.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Zero Analytics & Zero Telemetry
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            HookLab does not include third-party tracking libraries, advertising beacons, or behavioral monitoring SDKs. Your sessions and inspection workflows remain completely private.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Immediate User Purge
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            You can delete any captured request instantly or purge all requests for an endpoint with a single click. When an endpoint is deleted, all associated metadata and captured events are immediately removed.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Deterministic In-Browser Hashing
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            When you use the HMAC signature verifier tool, secrets and messages are computed locally in your browser using the Web Crypto API. Secrets are never transmitted across the network or written to logs.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <Link
          to="/security"
          className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          View Security Model
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
