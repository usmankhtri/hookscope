import React, { useState, useEffect } from 'react';
import { WebhookEvent, HttpMethod, ReplayResponse } from '../../types';
import { formatBytes, formatDateFull, formatDuration, getStatusBadgeInfo } from '../../utils/formatters';
import { CodeBlock } from '../common/CodeBlock';
import { CopyButton } from '../common/CopyButton';
import { generateCodeForLanguage, CodeLanguage } from '../../engine/codeGen/generators';
import { ApiClient } from '../../engine/client/apiClient';
import {
  FileText,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  ShieldCheck,
  ArrowLeft,
  GitCompare,
  Layers,
  Terminal,
} from 'lucide-react';

interface RequestInspectorProps {
  event: WebhookEvent | null;
  defaultTab?: 'overview' | 'headers' | 'query' | 'body' | 'raw' | 'code' | 'replay';
  onCloseMobile?: () => void;
  onOpenDiffWithEvent?: (event: WebhookEvent) => void;
}

export const RequestInspector: React.FC<RequestInspectorProps> = ({
  event,
  defaultTab = 'overview',
  onCloseMobile,
  onOpenDiffWithEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'headers' | 'query' | 'body' | 'raw' | 'code' | 'replay'>(defaultTab);
  const [headerSearch, setHeaderSearch] = useState('');
  const [codeLang, setCodeLang] = useState<CodeLanguage>('curl');

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Replay state
  const [replayUrl, setReplayUrl] = useState('');
  const [replayMethod, setReplayMethod] = useState<HttpMethod>('POST');
  const [replayHeadersText, setReplayHeadersText] = useState('');
  const [replayBody, setReplayBody] = useState('');
  const [replaying, setReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<ReplayResponse | null>(null);

  useEffect(() => {
    if (event) {
      setReplayUrl('');
      setReplayMethod(event.method);
      const hLines = Object.entries(event.headers)
        .filter(([k]) => !['host', 'content-length', 'connection'].includes(k.toLowerCase()))
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      setReplayHeadersText(hLines);
      setReplayBody(event.rawBody || '');
      setReplayResult(null);
    }
  }, [event?.id]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-neutral-400 font-sans">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-400 mb-3">
          <Terminal className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          No request selected
        </h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm">
          Select an incoming request from the event stream to inspect headers, payload parameters, generated client code, or replay.
        </p>
      </div>
    );
  }

  const statusInfo = getStatusBadgeInfo(event.statusCodeSent);
  const timeObj = new Date(event.timestamp);
  const timeFormatted = timeObj.toLocaleTimeString('en-US', { hour12: false });

  // Filtered headers
  const filteredHeaders = Object.entries(event.headers).filter(([k, v]) => {
    if (!headerSearch.trim()) return true;
    const q = headerSearch.toLowerCase();
    return k.toLowerCase().includes(q) || v.toLowerCase().includes(q);
  });

  // Replay executor
  const handleExecuteReplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replayUrl.trim()) return;

    setReplaying(true);
    setReplayResult(null);

    try {
      const headersObj: Record<string, string> = {};
      const lines = replayHeadersText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const colon = trimmed.indexOf(':');
        if (colon > 0) {
          headersObj[trimmed.slice(0, colon).trim()] = trimmed.slice(colon + 1).trim();
        }
      }

      const res = await ApiClient.replayRequest({
        url: replayUrl.trim(),
        method: replayMethod,
        headers: headersObj,
        body: replayBody,
        timeoutMs: 10000,
      });
      setReplayResult(res);
    } catch (err: any) {
      setReplayResult({
        success: false,
        durationMs: 0,
        headers: {},
        body: '',
        sizeBytes: 0,
        error: err.message || 'Replay request failed',
        targetUrl: replayUrl,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setReplaying(false);
    }
  };

  const codeSnippet = generateCodeForLanguage(codeLang, {
    method: event.method,
    url: event.url,
    headers: event.headers,
    rawBody: event.rawBody,
    contentType: event.contentType,
  });

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'headers', label: `Headers (${Object.keys(event.headers).length})` },
    { id: 'query', label: `Query (${Object.keys(event.query).length})` },
    { id: 'body', label: 'Body' },
    { id: 'raw', label: 'Raw Payload' },
    { id: 'code', label: 'Code' },
    { id: 'replay', label: 'Replay' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121214] overflow-hidden font-sans">
      {/* Top Request Summary Bar */}
      <div className="p-3 sm:px-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-[#161619] flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              title="Back to stream"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
            {event.method}
          </span>

          <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300 truncate max-w-xs sm:max-w-md" title={event.path}>
            {event.path}
          </span>

          <span className={`text-3xs font-mono px-2 py-0.5 rounded border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
            HTTP {event.statusCodeSent}
          </span>

          <span className="text-2xs font-mono text-neutral-400 hidden sm:inline">
            {timeFormatted} · {formatBytes(event.sizeBytes)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDiffWithEvent && (
            <button
              type="button"
              onClick={() => onOpenDiffWithEvent(event)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <GitCompare className="w-3 h-3" />
              <span>Compare</span>
            </button>
          )}

          <CopyButton text={event.rawBody || event.url} label="Copy Body" />
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto gap-4 text-xs font-medium bg-white dark:bg-[#121214] shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2.5 border-b-2 whitespace-nowrap transition-colors font-mono text-xs ${
              activeTab === tab.id
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-950 dark:text-neutral-50 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-4xl font-sans">
            {/* Metadata Definition List */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-[#141417]">
              <div className="px-4 py-2.5 bg-neutral-100/60 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 text-2xs font-mono uppercase text-neutral-500">
                Request Specifications
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-mono text-xs">
                <div className="grid grid-cols-3 sm:grid-cols-4 p-3">
                  <span className="text-neutral-500 text-2xs uppercase">METHOD</span>
                  <span className="col-span-2 sm:col-span-3 font-semibold text-neutral-900 dark:text-neutral-100">{event.method}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 p-3">
                  <span className="text-neutral-500 text-2xs uppercase">STATUS SENT</span>
                  <span className="col-span-2 sm:col-span-3 text-neutral-900 dark:text-neutral-100">{event.statusCodeSent}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 p-3">
                  <span className="text-neutral-500 text-2xs uppercase">LATENCY</span>
                  <span className="col-span-2 sm:col-span-3 text-neutral-900 dark:text-neutral-100">{formatDuration(event.durationMs)}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 p-3">
                  <span className="text-neutral-500 text-2xs uppercase">PAYLOAD SIZE</span>
                  <span className="col-span-2 sm:col-span-3 text-neutral-900 dark:text-neutral-100">{formatBytes(event.sizeBytes)} ({event.sizeBytes} bytes)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 p-3">
                  <span className="text-neutral-500 text-2xs uppercase">RECEIVED AT</span>
                  <span className="col-span-2 sm:col-span-3 text-neutral-900 dark:text-neutral-100">{formatDateFull(event.timestamp)}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 p-3">
                  <span className="text-neutral-500 text-2xs uppercase">CONTENT-TYPE</span>
                  <span className="col-span-2 sm:col-span-3 text-neutral-900 dark:text-neutral-100 break-all">{event.contentType || 'None specified'}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 p-3">
                  <span className="text-neutral-500 text-2xs uppercase">FORMAT DETECTED</span>
                  <span className="col-span-2 sm:col-span-3 text-neutral-900 dark:text-neutral-100 uppercase">{event.contentFormat}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 p-3">
                  <span className="text-neutral-500 text-2xs uppercase">CLIENT IP</span>
                  <span className="col-span-2 sm:col-span-3 text-neutral-900 dark:text-neutral-100">{event.ip || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Ingestion URL */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 bg-neutral-50 dark:bg-[#141416] space-y-1">
              <span className="text-2xs font-mono uppercase text-neutral-400 block">
                Full Ingestion Path
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-neutral-900 dark:text-neutral-100 break-all select-all">
                  {event.url}
                </span>
                <CopyButton text={event.url} label="Copy" />
              </div>
            </div>
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search header keys or values..."
                  value={headerSearch}
                  onChange={e => setHeaderSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden font-sans"
                />
              </div>
              <CopyButton
                text={JSON.stringify(event.headers, null, 2)}
                label="Copy Headers JSON"
              />
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-[#121214]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-100/70 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 text-2xs uppercase text-neutral-500">
                  <tr>
                    <th className="py-2.5 px-4 w-1/3">Header Key</th>
                    <th className="py-2.5 px-4">Value</th>
                    <th className="py-2.5 px-3 w-16 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
                  {filteredHeaders.map(([k, v]) => (
                    <tr key={k} className="hover:bg-neutral-50 dark:hover:bg-[#161619] transition-colors">
                      <td className="py-2.5 px-4 text-neutral-900 dark:text-neutral-100 font-semibold select-all break-all">
                        {k}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-300 select-all break-all">
                        {v}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <CopyButton text={v} iconOnly />
                      </td>
                    </tr>
                  ))}
                  {filteredHeaders.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-neutral-400">
                        No headers matching search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QUERY TAB */}
        {activeTab === 'query' && (
          <div className="space-y-4 max-w-4xl">
            {Object.keys(event.query).length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">
                No query parameters were present on this request.
              </p>
            ) : (
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-[#121214]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-100/70 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 text-2xs uppercase text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-4 w-1/3">Parameter</th>
                      <th className="py-2.5 px-4">Value</th>
                      <th className="py-2.5 px-3 w-16 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
                    {Object.entries(event.query).map(([k, v]) => {
                      const displayVal = Array.isArray(v) ? v.join(', ') : String(v);
                      return (
                        <tr key={k} className="hover:bg-neutral-50 dark:hover:bg-[#161619] transition-colors">
                          <td className="py-2.5 px-4 text-neutral-900 dark:text-neutral-100 font-semibold select-all">
                            {k}
                          </td>
                          <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-300 select-all">
                            {displayVal}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <CopyButton text={displayVal} iconOnly />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BODY TAB (Formatted Code Inspector) */}
        {activeTab === 'body' && (
          <div className="space-y-3">
            {event.bodyError && (
              <div className="flex items-center gap-2 p-3 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{event.bodyError} Showing raw payload below.</span>
              </div>
            )}

            {!event.rawBody || event.rawBody.trim() === '' ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                This request contained an empty body.
              </div>
            ) : event.contentFormat === 'json' && event.parsedBody ? (
              <CodeBlock
                code={JSON.stringify(event.parsedBody, null, 2)}
                language="json"
                maxHeight="max-h-[600px]"
                allowDownload
                downloadFilename={`webhook_${event.id}.json`}
              />
            ) : (
              <CodeBlock
                code={event.rawBody}
                language={event.contentFormat === 'xml' ? 'xml' : 'text'}
                maxHeight="max-h-[600px]"
                allowDownload
                downloadFilename={`webhook_${event.id}.txt`}
              />
            )}
          </div>
        )}

        {/* RAW TAB */}
        {activeTab === 'raw' && (
          <div className="space-y-3">
            <CodeBlock
              code={event.rawBody || '(Empty body)'}
              language="text"
              maxHeight="max-h-[600px]"
              allowDownload
              downloadFilename={`raw_${event.id}.txt`}
            />
          </div>
        )}

        {/* CODE TAB (Client Snippets) */}
        {activeTab === 'code' && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center gap-1.5 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-mono">
              {(['curl', 'fetch', 'axios', 'node', 'python'] as CodeLanguage[]).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setCodeLang(lang)}
                  className={`px-3 py-1.5 rounded-md transition-colors capitalize ${
                    codeLang === lang
                      ? 'bg-white dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  {lang === 'node' ? 'Node.js' : lang === 'curl' ? 'cURL' : lang}
                </button>
              ))}
            </div>

            <CodeBlock
              code={codeSnippet}
              language={codeLang === 'python' ? 'python' : codeLang === 'curl' ? 'bash' : 'javascript'}
              maxHeight="max-h-[500px]"
            />
          </div>
        )}

        {/* REPLAY TAB (SSRF Protected) */}
        {activeTab === 'replay' && (
          <div className="space-y-5 max-w-3xl font-sans">
            <div className="p-3.5 bg-neutral-50 dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <strong>SSRF Protection Active:</strong> Forward requests safely. Requests targeting loopback (127.0.0.1, localhost), private networks (10.x, 192.168.x, 172.16.x), or cloud metadata are blocked.
              </p>
            </div>

            <form onSubmit={handleExecuteReplay} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-1 space-y-1">
                  <label className="block text-2xs font-mono uppercase text-neutral-400">
                    Method
                  </label>
                  <select
                    value={replayMethod}
                    onChange={e => setReplayMethod(e.target.value as HttpMethod)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono font-semibold focus:outline-hidden"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-2xs font-mono uppercase text-neutral-400">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.yourdomain.com/webhooks"
                    value={replayUrl}
                    onChange={e => setReplayUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Editable Headers */}
              <div className="space-y-1">
                <label className="block text-2xs font-mono uppercase text-neutral-400">
                  Headers (Key: Value per line)
                </label>
                <textarea
                  rows={3}
                  value={replayHeadersText}
                  onChange={e => setReplayHeadersText(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden"
                />
              </div>

              {/* Editable Body */}
              {['POST', 'PUT', 'PATCH', 'DELETE'].includes(replayMethod) && (
                <div className="space-y-1">
                  <label className="block text-2xs font-mono uppercase text-neutral-400">
                    Payload
                  </label>
                  <textarea
                    rows={6}
                    value={replayBody}
                    onChange={e => setReplayBody(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={replaying || !replayUrl.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{replaying ? 'Sending Replay...' : 'Send Request'}</span>
                </button>
              </div>
            </form>

            {/* Replay Result */}
            {replayResult && (
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden mt-6 bg-white dark:bg-[#141416]">
                <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {replayResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {replayResult.success
                        ? `Delivered: HTTP ${replayResult.statusCode} ${replayResult.statusText || ''}`
                        : `Failed: ${replayResult.error || `HTTP ${replayResult.statusCode}`}`}
                    </span>
                  </div>
                  <span className="text-neutral-400 text-2xs">
                    {replayResult.durationMs}ms
                  </span>
                </div>

                <div className="p-4 space-y-3 font-mono text-xs">
                  <div className="text-2xs text-neutral-400 truncate">
                    Target: {replayResult.targetUrl}
                  </div>

                  {replayResult.body && (
                    <div className="space-y-1">
                      <span className="text-2xs uppercase text-neutral-400 block">Response Body</span>
                      <CodeBlock code={replayResult.body} language="json" maxHeight="max-h-52" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
