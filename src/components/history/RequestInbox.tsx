import React, { useState, useMemo } from 'react';
import { WebhookEvent, WebhookEndpoint } from '../../types';
import { formatBytes, formatRelativeTime, formatDateFull, getStatusBadgeInfo } from '../../utils/formatters';
import { CopyButton } from '../common/CopyButton';
import { getPublicEndpointUrl } from '../../utils/url';
import {
  Search,
  ArrowUpDown,
  Trash2,
  Radio,
  Filter,
  Terminal,
  Clock,
  Send,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface RequestInboxProps {
  events: WebhookEvent[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  loading: boolean;
  onRefresh: () => void;
  endpoint: WebhookEndpoint;
  onOpenTestSender?: () => void;
  onOpenMockConfig?: () => void;
  workspaceMode: 'stream' | 'mock-config' | 'test-sender';
  onSetWorkspaceMode: (mode: 'stream' | 'mock-config' | 'test-sender') => void;
}

export const RequestInbox: React.FC<RequestInboxProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  onDeleteEvent,
  loading,
  onRefresh,
  endpoint,
  onOpenTestSender,
  onOpenMockConfig,
  workspaceMode,
  onSetWorkspaceMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const publicUrl = getPublicEndpointUrl(endpoint.token);

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        if (methodFilter !== 'ALL' && event.method !== methodFilter) {
          return false;
        }
        if (formatFilter !== 'ALL' && event.contentFormat !== formatFilter) {
          return false;
        }
        if (statusFilter !== 'ALL') {
          if (statusFilter === '2xx' && (event.statusCodeSent < 200 || event.statusCodeSent >= 300)) return false;
          if (statusFilter === '4xx' && (event.statusCodeSent < 400 || event.statusCodeSent >= 500)) return false;
          if (statusFilter === '5xx' && event.statusCodeSent < 500) return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchPath = event.path.toLowerCase().includes(q);
          const matchRaw = event.rawBody.toLowerCase().includes(q);
          const matchHeaders = Object.entries(event.headers).some(
            ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
          );
          if (!matchPath && !matchRaw && !matchHeaders) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [events, methodFilter, formatFilter, statusFilter, searchTerm, sortOrder]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121214] border-r border-neutral-200 dark:border-neutral-800">
      {/* Stream Control & Tools Bar */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2.5 bg-neutral-50/50 dark:bg-[#161619]">
        {/* Workspace Mode Sub-Tabs (No popups!) */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-lg text-2xs font-mono">
          <button
            type="button"
            onClick={() => onSetWorkspaceMode('stream')}
            className={`flex-1 py-1 rounded transition-colors text-center font-medium ${
              workspaceMode === 'stream'
                ? 'bg-white dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Stream ({events.length})
          </button>
          <button
            type="button"
            onClick={() => onSetWorkspaceMode('test-sender')}
            className={`flex-1 py-1 rounded transition-colors text-center font-medium ${
              workspaceMode === 'test-sender'
                ? 'bg-white dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Send Test
          </button>
          <button
            type="button"
            onClick={() => onSetWorkspaceMode('mock-config')}
            className={`flex-1 py-1 rounded transition-colors text-center font-medium ${
              workspaceMode === 'mock-config'
                ? 'bg-white dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Response Rules
          </button>
        </div>

        {/* Search Input with Keyboard Hint */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search stream (/ to focus)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-10 py-1.5 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 font-sans"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-2xs font-mono text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded px-1">
            /
          </span>
        </div>

        {/* Dense Filters Row */}
        <div className="flex items-center gap-1.5 text-2xs font-mono flex-wrap">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
          >
            <option value="ALL">All Methods</option>
            <option value="POST">POST</option>
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1 text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
          >
            <option value="ALL">All Status</option>
            <option value="2xx">2xx (OK)</option>
            <option value="4xx">4xx (Client)</option>
            <option value="5xx">5xx (Server)</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="inline-flex items-center gap-1 ml-auto px-2 py-1 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            title={`Sort order: ${sortOrder}`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span className="capitalize">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Events Stream / Timeline List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 font-sans">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-500">
              <Radio className="w-5 h-5 animate-pulse text-emerald-500" />
            </div>

            {events.length === 0 ? (
              <div className="space-y-3 max-w-xs">
                <div>
                  <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    No requests yet
                  </h3>
                  <p className="text-2xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Send an HTTP request to this endpoint to see it here.
                  </p>
                </div>

                {/* Prominent Endpoint URL & Copy */}
                <div className="p-3 bg-neutral-50 dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 rounded-lg text-left space-y-2">
                  <span className="text-2xs font-mono uppercase text-neutral-400 block">
                    Your Webhook URL
                  </span>
                  <div className="font-mono text-2xs text-neutral-900 dark:text-neutral-100 break-all select-all">
                    {publicUrl}
                  </div>
                  <div className="pt-1">
                    <CopyButton text={publicUrl} label="Copy endpoint" className="w-full justify-center" />
                  </div>
                </div>

                {onOpenTestSender && (
                  <button
                    type="button"
                    onClick={() => onSetWorkspaceMode('test-sender')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send a test webhook now</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  No matching events
                </p>
                <p className="text-2xs text-neutral-500">
                  Try clearing your search query or status filters.
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredEvents.map(event => {
            const isSelected = selectedEventId === event.id && workspaceMode === 'stream';
            const statusInfo = getStatusBadgeInfo(event.statusCodeSent);
            const timeObj = new Date(event.timestamp);
            const timeStr = timeObj.toLocaleTimeString('en-US', { hour12: false });

            return (
              <div
                key={event.id}
                onClick={() => {
                  onSelectEvent(event.id);
                  if (workspaceMode !== 'stream') onSetWorkspaceMode('stream');
                }}
                className={`group flex items-start justify-between p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 dark:bg-[#1c1c20] border-l-2 border-neutral-900 dark:border-neutral-100'
                    : 'hover:bg-neutral-50 dark:hover:bg-[#161619]'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  {/* Top Row: Method, Timestamp, Status */}
                  <div className="flex items-center gap-2 mb-1">
                    {/* Monochrome Method Badge */}
                    <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                      {event.method}
                    </span>

                    <span className="text-2xs font-mono text-neutral-400">
                      {timeStr}
                    </span>

                    <span
                      className={`text-3xs font-mono px-1.5 py-0.2 rounded border ml-auto ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                    >
                      {event.statusCodeSent}
                    </span>
                  </div>

                  {/* Middle Row: Path */}
                  <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300 truncate" title={event.path}>
                    {event.path}
                  </div>

                  {/* Bottom Row: Metadata info */}
                  <div className="flex items-center gap-2 text-2xs text-neutral-400 font-mono mt-1">
                    <span>{formatBytes(event.sizeBytes)}</span>
                    <span>·</span>
                    <span className="uppercase">{event.contentFormat}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(event.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-center">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteEvent(event.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-500 rounded transition-opacity"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-500 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stream Status Bar */}
      <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#141416] text-2xs text-neutral-500 font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Listening ({events.length} captured)</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};
