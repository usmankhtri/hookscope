import React, { useState, useEffect } from 'react';
import { WebhookEndpoint } from '../types';
import { CopyButton } from '../components/common/CopyButton';
import { getPublicEndpointUrl } from '../utils/url';
import { formatDateFull } from '../utils/formatters';
import { Plus, Trash2, ArrowRight, Radio, ExternalLink, Sliders } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface EndpointsPageProps {
  endpoints: WebhookEndpoint[];
  onCreateEndpoint: () => Promise<WebhookEndpoint | void>;
  onDeleteEndpoint: (token: string) => Promise<void>;
}

export const EndpointsPage: React.FC<EndpointsPageProps> = ({
  endpoints,
  onCreateEndpoint,
  onDeleteEndpoint,
}) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    document.title = 'Endpoints – HookLab Workspace';
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await onCreateEndpoint();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Webhook Endpoints
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your active public webhook ingestion URLs and destination routing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{creating ? 'Creating...' : 'Create Endpoint'}</span>
        </button>
      </div>

      {/* Endpoints List */}
      {endpoints.length === 0 ? (
        <div className="py-20 text-center space-y-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-[#121214] p-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
            <Radio className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              No active endpoints
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Create an endpoint to receive, inspect, and test webhooks in your workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Endpoint</span>
          </button>
        </div>
      ) : (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-[#121214]">
          {endpoints.map(ep => {
            const publicUrl = getPublicEndpointUrl(ep.token);
            return (
              <div
                key={ep.token}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-[#161619] transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                      {ep.name || `Endpoint ${ep.token.slice(0, 6)}`}
                    </span>
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      /h/{ep.token}
                    </span>
                    {ep.mockResponse?.enabled && (
                      <span className="text-3xs font-mono px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                        Mocking HTTP {ep.mockResponse.statusCode}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 max-w-lg">
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className="text-xs font-mono bg-neutral-50 dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 rounded px-2.5 py-1 text-neutral-600 dark:text-neutral-400 w-full select-all truncate"
                    />
                    <CopyButton text={publicUrl} iconOnly />
                  </div>

                  <div className="text-3xs font-mono text-neutral-400 flex items-center gap-2">
                    <span>Created: {formatDateFull(ep.createdAt)}</span>
                    <span>·</span>
                    <span>Retention: {ep.retentionHours || 24}h</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/app/endpoints/${ep.token}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {endpoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteEndpoint(ep.token)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 rounded border border-neutral-200 dark:border-neutral-800 hover:border-rose-200 transition-colors"
                      title="Delete endpoint"
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
    </div>
  );
};
