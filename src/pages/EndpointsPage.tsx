import React, { useState, useEffect, useMemo } from 'react';
import { WebhookEndpoint } from '../types';
import { CopyButton } from '../components/common/CopyButton';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { getPublicEndpointUrl } from '../utils/url';
import { formatDateFull } from '../utils/formatters';
import {
  Plus,
  Trash2,
  ArrowRight,
  Radio,
  Search,
  Shield,
  Activity,
  Sliders,
  Play,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EndpointsPageProps {
  endpoints: WebhookEndpoint[];
  onRequestCreateEndpoint: () => void;
  onDeleteEndpoint: (token: string) => Promise<void>;
}

export const EndpointsPage: React.FC<EndpointsPageProps> = ({
  endpoints,
  onRequestCreateEndpoint,
  onDeleteEndpoint,
}) => {
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    document.title = 'Endpoints – HookScope Workspace';
  }, []);

  // Strict deduplication by token
  const uniqueEndpoints = useMemo(() => {
    const map = new Map<string, WebhookEndpoint>();
    for (const ep of endpoints) {
      if (ep?.token) {
        map.set(ep.token, ep);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [endpoints]);

  const filteredEndpoints = useMemo(() => {
    if (!searchFilter.trim()) return uniqueEndpoints;
    const q = searchFilter.toLowerCase();
    return uniqueEndpoints.filter(
      ep =>
        (ep.name && ep.name.toLowerCase().includes(q)) ||
        ep.token.toLowerCase().includes(q)
    );
  }, [uniqueEndpoints, searchFilter]);

  const confirmDelete = async () => {
    if (!tokenToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteEndpoint(tokenToDelete);
    } finally {
      setIsDeleting(false);
      setTokenToDelete(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Webhook Endpoints
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your test endpoints, view request history, and configure mock response rules.
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestCreateEndpoint}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-white transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Endpoint</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] space-y-1">
          <span className="text-3xs uppercase font-mono text-neutral-400">Total Endpoints</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {uniqueEndpoints.length}
            </span>
            <Radio className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] space-y-1">
          <span className="text-3xs uppercase font-mono text-neutral-400">Receiver Status</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] space-y-1">
          <span className="text-3xs uppercase font-mono text-neutral-400">Replay Protection</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-neutral-700 dark:text-neutral-300">
              SSRF Guard Active
            </span>
            <Shield className="w-4 h-4 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search Input when multiple endpoints exist */}
      {uniqueEndpoints.length > 2 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Filter endpoints by name or token..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      )}

      {/* Endpoints List */}
      {filteredEndpoints.length === 0 ? (
        <div className="py-16 text-center space-y-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] p-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
            <Radio className="w-6 h-6 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {searchFilter ? 'No matching endpoints' : 'No active endpoints'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {searchFilter
                ? 'Try a different search keyword or clear the filter.'
                : 'Create an endpoint to capture, inspect, and replay webhooks in real time.'}
            </p>
          </div>
          {!searchFilter && (
            <button
              type="button"
              onClick={onRequestCreateEndpoint}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-white transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Endpoint</span>
            </button>
          )}
        </div>
      ) : (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-[#121214] shadow-xs">
          {filteredEndpoints.map(ep => {
            const publicUrl = getPublicEndpointUrl(ep.token);
            return (
              <div
                key={ep.token}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/60 dark:hover:bg-[#161619] transition-colors"
              >
                {/* Left info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                      {ep.name || `Endpoint ${ep.token.slice(0, 6)}`}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-3xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Listening
                    </span>

                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      /h/{ep.token}
                    </span>

                    {ep.mockResponse?.enabled && (
                      <span className="text-3xs font-mono px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                        Custom HTTP {ep.mockResponse.statusCode}
                      </span>
                    )}
                  </div>

                  {/* Public URL Box */}
                  <div className="flex items-center gap-2 max-w-lg">
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className="text-xs font-mono bg-neutral-50 dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1 text-neutral-700 dark:text-neutral-300 w-full select-all truncate"
                    />
                    <CopyButton text={publicUrl} iconOnly />
                  </div>

                  <div className="text-3xs font-mono text-neutral-400 flex items-center gap-2">
                    <span>Created: {formatDateFull(ep.createdAt)}</span>
                    <span>·</span>
                    <span>TTL Retention: {ep.retentionHours || 24}h</span>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/app/endpoints/${ep.token}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-all shadow-2xs"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/app/endpoints/${ep.token}/replay`}
                    className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Replay workspace"
                  >
                    <Play className="w-4 h-4" />
                  </Link>

                  {uniqueEndpoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTokenToDelete(ep.token)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete endpoint"
                      aria-label={`Delete endpoint ${ep.name || ep.token}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible In-App Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={tokenToDelete !== null}
        title="Delete endpoint?"
        message="Requests stored for this endpoint will also be permanently purged from storage."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete endpoint'}
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setTokenToDelete(null)}
      />
    </div>
  );
};
