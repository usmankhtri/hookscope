import React, { useEffect } from 'react';
import {
  EyeOff,
  Database,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Cookie,
  Server,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy & Data Retention – HookScope';
  }, []);

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-16 font-sans">
      {/* Header */}
      <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-2xs font-mono text-neutral-600 dark:text-neutral-400">
          <EyeOff className="w-3.5 h-3.5 text-emerald-500" />
          <span>Data Privacy &amp; Retention Manifesto</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Privacy Policy &amp; Retention Model
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          HookScope is built on transparency: zero tracking analytics, zero advertising cookies, automatic 24-hour TTL data expiration, and complete user deletion control.
        </p>
      </div>

      {/* Grid of Privacy Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Automatic Time-To-Live (TTL) Eviction
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            All stored webhook events and endpoints are governed by automated Time-To-Live expiration keys (default 24 hours). Once the TTL expires, the records are permanently purged by Redis without requiring manual intervention.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <EyeOff className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Zero Tracking &amp; Zero Behavioral SDKs
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            HookScope does not embed Google Analytics, Mixpanel, Facebook Pixels, or any third-party behavioral monitoring scripts. Your IP address and inspection workflows remain completely private.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Immediate 1-Click User Purge
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            You can delete any captured request instantly or purge all requests for an endpoint with a single click. When you delete an endpoint, all associated metadata and captured payloads are immediately removed from storage.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Local In-Browser Hashing
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            When you use the HMAC signature verifier tool, secrets and messages are computed locally in your browser using the native Web Crypto API. Secrets are never transmitted across the network or written to logs.
          </p>
        </div>
      </div>

      {/* Local Storage & Cookie Transparency Table */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Cookie className="w-4 h-4 text-emerald-500" />
          Browser Storage &amp; Cookie Audit
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          HookScope only utilizes browser storage to persist your workspace session and visual theme preferences:
        </p>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-[#161619] border-b border-neutral-200 dark:border-neutral-800 text-2xs uppercase text-neutral-400">
              <tr>
                <th className="p-3">Key Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Lifespan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-[#121214] text-neutral-700 dark:text-neutral-300">
              <tr>
                <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100">hookscope_session_id</td>
                <td className="p-3 text-2xs">localStorage / Cookie</td>
                <td className="p-3 font-sans text-xs">Isolates your endpoints so other users cannot view your webhook stream.</td>
                <td className="p-3 text-2xs">30 Days / User Cleared</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100">hookscope_theme</td>
                <td className="p-3 text-2xs">localStorage</td>
                <td className="p-3 font-sans text-xs">Remembers dark mode or light mode appearance preferences.</td>
                <td className="p-3 text-2xs">Persistent</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Nav */}
      <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-4">
        <Link
          to="/security"
          className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          View Security Model &amp; Architecture &rarr;
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
