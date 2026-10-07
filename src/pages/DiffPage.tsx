import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { WebhookEvent } from '../types';
import { summarizeJsonDiff, DiffSummary } from '../engine/diff/jsonDiff';
import { GitCompare, Plus, Minus, RefreshCw, ArrowLeft, Copy, Check } from 'lucide-react';
import { CopyButton } from '../components/common/CopyButton';

interface DiffPageProps {
  events?: WebhookEvent[];
  initialEvent?: WebhookEvent | null;
}

export const DiffPage: React.FC<DiffPageProps> = ({
  events = [],
  initialEvent,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Payload Comparison & Diff – HookScope';
  }, []);
  const [selectedEventIdA, setSelectedEventIdA] = useState<string>(initialEvent?.id || '');
  const [selectedEventIdB, setSelectedEventIdB] = useState<string>('');

  const [textA, setTextA] = useState<string>(
    initialEvent?.parsedBody
      ? JSON.stringify(initialEvent.parsedBody, null, 2)
      : '{\n  "user": {\n    "id": "usr_9182",\n    "name": "Alex Vance",\n    "email": "alex.vance@example.com",\n    "status": "pending"\n  },\n  "subscription": {\n    "tier": "starter",\n    "active": false\n  }\n}'
  );

  const [textB, setTextB] = useState<string>(
    '{\n  "user": {\n    "id": "usr_9182",\n    "name": "Alex Vance",\n    "email": "alex.vance@company.org",\n    "status": "verified",\n    "mfa_enabled": true\n  },\n  "subscription": {\n    "tier": "enterprise",\n    "active": true\n  }\n}'
  );

  const [diffFilter, setDiffFilter] = useState<'all' | 'changed' | 'added' | 'removed'>('all');
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSelectA = (id: string) => {
    setSelectedEventIdA(id);
    const ev = events.find(e => e.id === id);
    if (ev) {
      setTextA(ev.parsedBody ? JSON.stringify(ev.parsedBody, null, 2) : ev.rawBody);
    }
  };

  const handleSelectB = (id: string) => {
    setSelectedEventIdB(id);
    const ev = events.find(e => e.id === id);
    if (ev) {
      setTextB(ev.parsedBody ? JSON.stringify(ev.parsedBody, null, 2) : ev.rawBody);
    }
  };

  let diffSummary: DiffSummary | null = null;
  try {
    const objA = JSON.parse(textA);
    const objB = JSON.parse(textB);
    diffSummary = summarizeJsonDiff(objA, objB);
    if (parseError) setParseError(null);
  } catch {
    if (!parseError) setParseError('Both inputs must be valid JSON to generate structural comparison.');
  }

  const displayedDiffs = diffSummary?.differences.filter(d => {
    if (diffFilter === 'all') return d.type !== 'unchanged';
    return d.type === diffFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Top Header */}
      <div className="p-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121214] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/tools')}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Return to Tools"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-neutral-500" />
              Payload Comparison &amp; Diff
            </h1>
            <p className="text-xs text-neutral-500">
              Compare two JSON payloads side by side to detect structural changes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Payloads Input Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Baseline Payload A */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-[#121214] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100/60 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 text-xs">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Baseline (Payload A)
              </span>
              {events.length > 0 && (
                <select
                  value={selectedEventIdA}
                  onChange={e => handleSelectA(e.target.value)}
                  className="text-2xs px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded font-mono"
                >
                  <option value="">-- Load from stream --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.method} {ev.path} ({ev.id.slice(-6)})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              rows={8}
              value={textA}
              onChange={e => setTextA(e.target.value)}
              className="w-full flex-1 p-3 text-xs font-mono bg-transparent border-none focus:outline-hidden resize-none leading-relaxed text-neutral-900 dark:text-neutral-100"
              placeholder="Paste JSON for baseline payload..."
            />
          </div>

          {/* Comparison Payload B */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-[#121214] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100/60 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 text-xs">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Comparison (Payload B)
              </span>
              {events.length > 0 && (
                <select
                  value={selectedEventIdB}
                  onChange={e => handleSelectB(e.target.value)}
                  className="text-2xs px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded font-mono"
                >
                  <option value="">-- Load from stream --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.method} {ev.path} ({ev.id.slice(-6)})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              rows={8}
              value={textB}
              onChange={e => setTextB(e.target.value)}
              className="w-full flex-1 p-3 text-xs font-mono bg-transparent border-none focus:outline-hidden resize-none leading-relaxed text-neutral-900 dark:text-neutral-100"
              placeholder="Paste JSON for comparison payload..."
            />
          </div>
        </div>

        {/* Diff Results Container */}
        {parseError ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            {parseError}
          </div>
        ) : diffSummary ? (
          <div className="space-y-4">
            {/* Filter buttons */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <button
                type="button"
                onClick={() => setDiffFilter('all')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  diffFilter === 'all'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent font-semibold'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                All Changes ({diffSummary.addedCount + diffSummary.removedCount + diffSummary.changedCount})
              </button>
              <button
                type="button"
                onClick={() => setDiffFilter('added')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  diffFilter === 'added'
                    ? 'bg-emerald-600 text-white border-transparent font-semibold'
                    : 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                + {diffSummary.addedCount} Added
              </button>
              <button
                type="button"
                onClick={() => setDiffFilter('removed')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  diffFilter === 'removed'
                    ? 'bg-rose-600 text-white border-transparent font-semibold'
                    : 'bg-white dark:bg-neutral-900 text-rose-700 dark:text-rose-400 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                - {diffSummary.removedCount} Removed
              </button>
              <button
                type="button"
                onClick={() => setDiffFilter('changed')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  diffFilter === 'changed'
                    ? 'bg-amber-600 text-white border-transparent font-semibold'
                    : 'bg-white dark:bg-neutral-900 text-amber-700 dark:text-amber-400 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                ~ {diffSummary.changedCount} Modified
              </button>
            </div>

            {/* Diff Cards */}
            {displayedDiffs && displayedDiffs.length === 0 ? (
              <div className="py-16 text-center text-xs text-neutral-500 font-mono border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900">
                No differences found matching the current filter.
              </div>
            ) : (
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900 font-mono text-xs">
                {displayedDiffs?.map((d, idx) => (
                  <div key={idx} className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {d.type === 'added' && (
                        <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded font-semibold">
                          <Plus className="w-3 h-3" /> ADDED
                        </span>
                      )}
                      {d.type === 'removed' && (
                        <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded font-semibold">
                          <Minus className="w-3 h-3" /> REMOVED
                        </span>
                      )}
                      {d.type === 'changed' && (
                        <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded font-semibold">
                          <RefreshCw className="w-3 h-3" /> MODIFIED
                        </span>
                      )}
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {d.path}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-2xs">
                      {d.type !== 'added' && (
                        <div className="p-3 bg-neutral-50 dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg">
                          <span className="text-neutral-400 block mb-1">Baseline value:</span>
                          <pre className="text-rose-700 dark:text-rose-400 whitespace-pre-wrap break-all m-0">
                            {typeof d.oldValue === 'object' ? JSON.stringify(d.oldValue, null, 2) : String(d.oldValue)}
                          </pre>
                        </div>
                      )}
                      {d.type !== 'removed' && (
                        <div className="p-3 bg-neutral-50 dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg">
                          <span className="text-neutral-400 block mb-1">Comparison value:</span>
                          <pre className="text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap break-all m-0">
                            {typeof d.newValue === 'object' ? JSON.stringify(d.newValue, null, 2) : String(d.newValue)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
