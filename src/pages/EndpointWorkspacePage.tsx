import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { WebhookEndpoint, WebhookEvent, HttpMethod } from '../types';
import { ApiClient } from '../engine/client/apiClient';
import { RequestInbox } from '../components/history/RequestInbox';
import { RequestInspector } from '../components/inspector/RequestInspector';
import { getPublicEndpointUrl } from '../utils/url';
import { CopyButton } from '../components/common/CopyButton';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { SIMULATED_PAYLOAD_TEMPLATES } from '../engine/templates/testPayloads';
import {
  RotateCcw,
  Trash2,
  Sliders,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowLeft,
  ChevronRight,
  Play,
} from 'lucide-react';

interface EndpointWorkspacePageProps {
  endpoints: WebhookEndpoint[];
  activeEndpoint: WebhookEndpoint | null;
  onSelectEndpoint: (token: string) => void;
  onUpdateEndpoint: (token: string, updates: Partial<WebhookEndpoint>) => Promise<void>;
  onDeleteEndpoint: (token: string) => Promise<void>;
}

export const EndpointWorkspacePage: React.FC<EndpointWorkspacePageProps> = ({
  endpoints,
  activeEndpoint,
  onSelectEndpoint,
  onUpdateEndpoint,
  onDeleteEndpoint,
}) => {
  const { endpointToken, requestId } = useParams<{ endpointToken: string; requestId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isReplayRoute = location.pathname.endsWith('/replay');

  const endpoint =
    endpoints.find(e => e.token === endpointToken) ||
    (activeEndpoint?.token === endpointToken ? activeEndpoint : null) ||
    activeEndpoint;

  const { success, error: toastError } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<'stream' | 'mock-config' | 'test-sender'>('stream');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isDeletingEndpoint, setIsDeletingEndpoint] = useState(false);

  // Inline Mock Config Form State
  const [mockEnabled, setMockEnabled] = useState(false);
  const [mockStatusCode, setMockStatusCode] = useState(200);
  const [mockDelayMs, setMockDelayMs] = useState(0);
  const [mockContentType, setMockContentType] = useState('application/json');
  const [mockBody, setMockBody] = useState('{\n  "status": "ok",\n  "message": "Webhook processed successfully"\n}');
  const [endpointName, setEndpointName] = useState('');
  const [retentionHours, setRetentionHours] = useState(24);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Inline Test Sender Form State
  const [testMethod, setTestMethod] = useState<HttpMethod>('POST');
  const [testHeadersText, setTestHeadersText] = useState('Content-Type: application/json\nX-HookScope-Test: true');
  const [testBodyText, setTestBodyText] = useState('{\n  "event": "test.ping",\n  "timestamp": "' + new Date().toISOString() + '",\n  "data": {\n    "message": "Live test payload sent from HookScope workspace"\n  }\n}');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ status: number; durationMs: number; body: string } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Sync route token with active endpoint
  useEffect(() => {
    if (endpointToken && (!activeEndpoint || activeEndpoint.token !== endpointToken)) {
      onSelectEndpoint(endpointToken);
    }
  }, [endpointToken, activeEndpoint, onSelectEndpoint]);

  useEffect(() => {
    if (endpointToken) {
      document.title = `/h/${endpointToken} – HookScope Workspace`;
    } else {
      document.title = 'HookScope Workspace';
    }
  }, [endpointToken]);

  // Sync mock response settings
  useEffect(() => {
    if (endpoint) {
      setEndpointName(endpoint.name || '');
      setRetentionHours(endpoint.retentionHours || 24);
      if (endpoint.mockResponse) {
        setMockEnabled(endpoint.mockResponse.enabled);
        setMockStatusCode(endpoint.mockResponse.statusCode || 200);
        setMockDelayMs(endpoint.mockResponse.delayMs || 0);
        setMockContentType(endpoint.mockResponse.contentType || 'application/json');
        setMockBody(endpoint.mockResponse.body || '{\n  "status": "ok"\n}');
      }
    }
  }, [endpoint?.token]);

  // Fetch events for active endpoint
  const fetchEvents = useCallback(async (isPolling: boolean = false) => {
    const currentToken = endpointToken || endpoint?.token;
    if (!currentToken) return;

    if (!isPolling) setLoading(true);

    try {
      const res = await ApiClient.getEvents(currentToken, { limit: 100 });
      setEvents(res.events || []);
      setTotalEvents(res.total || 0);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [endpointToken, endpoint?.token]);

  useEffect(() => {
    fetchEvents(false);
  }, [fetchEvents]);

  // Polling every 3 seconds
  useEffect(() => {
    const currentToken = endpointToken || endpoint?.token;
    if (!currentToken) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchEvents(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [endpointToken, endpoint?.token, fetchEvents]);

  // Selected event from route param `requestId` or fallback to first
  const currentEvent =
    (requestId && events.find(e => e.id === requestId)) ||
    (events.length > 0 ? events[0] : null);

  const handleSelectEvent = (id: string) => {
    const currentToken = endpointToken || endpoint?.token;
    if (currentToken) {
      navigate(`/app/endpoints/${currentToken}/requests/${id}`);
      setWorkspaceMode('stream');
    }
  };

  const handleCloseMobileInspector = () => {
    const currentToken = endpointToken || endpoint?.token;
    if (currentToken) {
      navigate(`/app/endpoints/${currentToken}`);
    }
  };

  const handleDeleteEvent = async (token: string, eventId: string) => {
    await ApiClient.deleteEvent(token, eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setTotalEvents(prev => Math.max(0, prev - 1));
    success('Request deleted');
    if (requestId === eventId) {
      navigate(`/app/endpoints/${token}`);
    }
  };

  const handleClearHistory = async () => {
    const currentToken = endpointToken || endpoint?.token;
    if (!currentToken || isClearing) return;
    setIsClearing(true);

    try {
      await ApiClient.clearEvents(currentToken);
      setEvents([]);
      setTotalEvents(0);
      success('Request history cleared');
      setShowClearConfirm(false);
      navigate(`/app/endpoints/${currentToken}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteEndpointConfirm = async () => {
    const currentToken = endpointToken || endpoint?.token;
    if (!currentToken || isDeletingEndpoint) return;
    setIsDeletingEndpoint(true);

    try {
      await onDeleteEndpoint(currentToken);
      success('Endpoint deleted');
      setShowDeleteConfirm(false);
      navigate('/app/endpoints');
    } finally {
      setIsDeletingEndpoint(false);
    }
  };

  // Mock config save handler
  const handleSaveMockConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentToken = endpointToken || endpoint?.token;
    if (!currentToken || !endpoint) return;
    setSavingConfig(true);
    setConfigSavedNotice(false);

    try {
      await onUpdateEndpoint(currentToken, {
        name: endpointName,
        retentionHours: Number(retentionHours),
        mockResponse: {
          enabled: mockEnabled,
          statusCode: Number(mockStatusCode),
          delayMs: Math.min(5000, Math.max(0, Number(mockDelayMs))),
          contentType: mockContentType,
          body: mockBody,
          headers: endpoint.mockResponse?.headers || {},
        },
      });
      setConfigSavedNotice(true);
      success('Configuration saved');
      setTimeout(() => setConfigSavedNotice(false), 3000);
    } catch (err: any) {
      toastError(`Failed to save configuration: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  // Send Test Request Handler
  const handleSendTestWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentToken = endpointToken || endpoint?.token;
    if (!currentToken) return;
    setSendingTest(true);
    setTestResult(null);
    setTestError(null);

    try {
      const parsedHeaders: Record<string, string> = {};
      const lines = testHeadersText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const colon = trimmed.indexOf(':');
        if (colon > 0) {
          parsedHeaders[trimmed.slice(0, colon).trim()] = trimmed.slice(colon + 1).trim();
        }
      }

      const publicUrl = `/h/${currentToken}`;
      const res = await ApiClient.sendTestRequest(publicUrl, testMethod, parsedHeaders, testBodyText);
      setTestResult({
        status: res.status,
        durationMs: res.durationMs,
        body: res.body,
      });
      fetchEvents(false);
    } catch (err: any) {
      setTestError(err.message || 'Failed to dispatch test request');
    } finally {
      setSendingTest(false);
    }
  };

  const handleLoadTemplateIntoSender = (tplId: string) => {
    const tpl = SIMULATED_PAYLOAD_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setTestMethod(tpl.method as HttpMethod);
      const hStr = Object.entries(tpl.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      setTestHeadersText(hStr);
      setTestBodyText(tpl.body);
    }
  };

  if (!endpoint) {
    if (endpoints.length === 0 && loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 font-sans">
          <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-800 dark:border-neutral-700 dark:border-t-neutral-200 rounded-full animate-spin"></div>
          <p className="text-xs text-neutral-500 font-mono">Loading workspace...</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 font-sans">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Endpoint not found
        </h2>
        <p className="text-xs text-neutral-500">
          The requested endpoint identifier (/h/{endpointToken}) does not exist or has expired.
        </p>
        <Link
          to="/app/endpoints"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View All Endpoints</span>
        </Link>
      </div>
    );
  }

  const publicUrl = getPublicEndpointUrl(endpoint.token);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Clean Endpoint Header */}
      <div className="bg-white dark:bg-[#141417] border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3 text-xs">
        {/* Left: Endpoint Name, Listening Badge, URL, and Copy */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {endpoint.name || `Endpoint ${endpoint.token.slice(0, 6)}`}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-3xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Listening
              </span>
              <span className="text-2xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                /h/{endpoint.token}
              </span>
              {endpoint.mockResponse?.enabled && (
                <span className="text-3xs font-mono px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                  Custom HTTP {endpoint.mockResponse.statusCode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 max-w-full">
              <span className="font-mono text-2xs text-neutral-500 dark:text-neutral-400 select-all truncate max-w-[200px] xs:max-w-xs sm:max-w-sm md:max-w-md">
                {publicUrl}
              </span>
              <CopyButton text={publicUrl} label="Copy" iconOnly={false} className="py-0.5 px-2 text-2xs shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Context Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={isReplayRoute ? `/app/endpoints/${endpoint.token}` : `/app/endpoints/${endpoint.token}/replay`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-2xs rounded border transition-colors ${
              isReplayRoute
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border-neutral-200 dark:border-neutral-800'
            }`}
            title="Toggle Replay Workspace"
          >
            <Play className="w-3 h-3" />
            <span>Replay</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={totalEvents === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded border border-neutral-200 dark:border-neutral-800 transition-colors disabled:opacity-40 cursor-pointer"
            title="Clear all events for this endpoint"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear History</span>
          </button>

          {endpoints.length > 1 && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
              title="Delete endpoint"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Request Stream List */}
        <div
          className={`w-full lg:w-96 xl:w-104 shrink-0 h-full ${
            requestId && workspaceMode === 'stream' ? 'hidden lg:block' : 'block'
          }`}
        >
          <RequestInbox
            events={events}
            selectedEventId={currentEvent?.id || null}
            onSelectEvent={handleSelectEvent}
            onDeleteEvent={id => handleDeleteEvent(endpoint.token, id)}
            loading={loading}
            onRefresh={() => fetchEvents(false)}
            endpoint={endpoint}
            workspaceMode={workspaceMode}
            onSetWorkspaceMode={setWorkspaceMode}
          />
        </div>

        {/* Right Viewport: Stream Inspector, Mock Setup, or Test Dispatcher */}
        <div
          className={`flex-1 h-full min-w-0 bg-white dark:bg-[#121214] ${
            !requestId && workspaceMode === 'stream' ? 'hidden lg:block' : 'block'
          }`}
        >
          {workspaceMode === 'stream' && (
            <RequestInspector
              event={currentEvent}
              defaultTab={isReplayRoute ? 'replay' : 'overview'}
              onCloseMobile={handleCloseMobileInspector}
              onOpenDiffWithEvent={ev => navigate('/app/tools/diff')}
            />
          )}

          {/* Mode 2: Mock Setup View */}
          {workspaceMode === 'mock-config' && (
            <div className="h-full overflow-y-auto p-5 sm:p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-neutral-500" />
                    Custom Response Rules
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Configure custom HTTP responses, headers, and artificial delays for /h/{endpoint.token}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('stream')}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800 cursor-pointer"
                >
                  Back to Requests
                </button>
              </div>

              {configSavedNotice && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Configuration saved successfully.</span>
                </div>
              )}

              <form onSubmit={handleSaveMockConfig} className="space-y-4">
                <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-[#161619] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
                        Enable Custom HTTP Response
                      </span>
                      <span className="text-2xs text-neutral-500">
                        When enabled, incoming webhooks receive this configured status code and payload instead of 200 OK.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mockEnabled}
                        onChange={e => setMockEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100 dark:peer-checked:after:bg-neutral-900"></div>
                    </label>
                  </div>

                  {mockEnabled && (
                    <div className="space-y-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 font-mono text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-2xs uppercase text-neutral-400">
                            HTTP Status Code
                          </label>
                          <select
                            value={mockStatusCode}
                            onChange={e => setMockStatusCode(Number(e.target.value))}
                            className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden"
                          >
                            <option value={200}>200 OK</option>
                            <option value={201}>201 Created</option>
                            <option value={202}>202 Accepted</option>
                            <option value={204}>204 No Content</option>
                            <option value={400}>400 Bad Request</option>
                            <option value={401}>401 Unauthorized</option>
                            <option value={403}>403 Forbidden</option>
                            <option value={404}>404 Not Found</option>
                            <option value={422}>422 Unprocessable Entity</option>
                            <option value={429}>429 Too Many Requests</option>
                            <option value={500}>500 Internal Server Error</option>
                            <option value={502}>502 Bad Gateway</option>
                            <option value={503}>503 Service Unavailable</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-2xs uppercase text-neutral-400">
                            Artificial Latency (ms)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="5000"
                            step="100"
                            value={mockDelayMs}
                            onChange={e => setMockDelayMs(Number(e.target.value))}
                            className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-2xs uppercase text-neutral-400">
                          Content-Type Header
                        </label>
                        <input
                          type="text"
                          value={mockContentType}
                          onChange={e => setMockContentType(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-2xs uppercase text-neutral-400">
                          Custom Response Body
                        </label>
                        <textarea
                          rows={6}
                          value={mockBody}
                          onChange={e => setMockBody(e.target.value)}
                          className="w-full text-xs p-3 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="block text-2xs uppercase text-neutral-400">Endpoint Label</label>
                    <input
                      type="text"
                      value={endpointName}
                      onChange={e => setEndpointName(e.target.value)}
                      placeholder="e.g. Stripe Webhooks"
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-2xs uppercase text-neutral-400">Retention Window (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={retentionHours}
                      onChange={e => setRetentionHours(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {savingConfig ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mode 3: Test Dispatcher View */}
          {workspaceMode === 'test-sender' && (
            <div className="h-full overflow-y-auto p-5 sm:p-6 space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Send className="w-4 h-4 text-neutral-500" />
                    Send Test Webhook
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Dispatch an HTTP request directly to /h/{endpoint.token} to verify ingestion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('stream')}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800 cursor-pointer"
                >
                  Back to Requests
                </button>
              </div>

              {/* Template quick loader */}
              <div className="space-y-1">
                <label className="block text-2xs font-mono uppercase text-neutral-400">
                  Load Simulated Payload Template
                </label>
                <select
                  defaultValue=""
                  onChange={e => handleLoadTemplateIntoSender(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-neutral-50 dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden font-sans"
                >
                  <option value="">-- Choose preset template --</option>
                  {SIMULATED_PAYLOAD_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleSendTestWebhook} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="block text-2xs uppercase text-neutral-400">Method</label>
                    <select
                      value={testMethod}
                      onChange={e => setTestMethod(e.target.value as HttpMethod)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg font-semibold focus:outline-hidden"
                    >
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-2xs uppercase text-neutral-400">Destination Endpoint</label>
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className="w-full text-xs px-3 py-2 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-500 select-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-2xs uppercase text-neutral-400">Request Headers</label>
                  <textarea
                    rows={3}
                    value={testHeadersText}
                    onChange={e => setTestHeadersText(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden"
                  />
                </div>

                {['POST', 'PUT', 'PATCH', 'DELETE'].includes(testMethod) && (
                  <div className="space-y-1">
                    <label className="block text-2xs uppercase text-neutral-400">Request Payload</label>
                    <textarea
                      rows={6}
                      value={testBodyText}
                      onChange={e => setTestBodyText(e.target.value)}
                      className="w-full text-xs p-3 bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden"
                    />
                  </div>
                )}

                {testError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg text-xs">
                    {testError}
                  </div>
                )}

                {testResult && (
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>HTTP {testResult.status} Response</span>
                      </div>
                      <span className="text-2xs text-neutral-400">{testResult.durationMs}ms</span>
                    </div>
                    {testResult.body && (
                      <pre className="text-2xs bg-white/70 dark:bg-black/50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {testResult.body}
                      </pre>
                    )}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingTest}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingTest ? 'Sending...' : 'Send Request'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Accessible Confirmation Modals */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear request history?"
        message="All captured webhook requests stored for this endpoint will be permanently deleted."
        confirmLabel={isClearing ? 'Clearing...' : 'Clear history'}
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete endpoint?"
        message="This endpoint and all its stored requests will be permanently deleted."
        confirmLabel={isDeletingEndpoint ? 'Deleting...' : 'Delete endpoint'}
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteEndpointConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
