import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SIMULATED_PAYLOAD_TEMPLATES, PayloadTemplate } from '../engine/templates/testPayloads';
import { CodeBlock } from '../components/common/CodeBlock';
import { CopyButton } from '../components/common/CopyButton';
import { Layers, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { WebhookEndpoint } from '../types';
import { ApiClient } from '../engine/client/apiClient';
import { useToast } from '../context/ToastContext';

interface TemplatesPageProps {
  activeEndpoint: WebhookEndpoint | null;
  onTemplateDispatched?: () => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  activeEndpoint,
  onTemplateDispatched,
}) => {
  const navigate = useNavigate();
  const { warning, error: toastError, success } = useToast();

  useEffect(() => {
    document.title = 'Simulated Webhook Templates – HookLab';
  }, []);
  const [selectedTemplate, setSelectedTemplate] = useState<PayloadTemplate>(SIMULATED_PAYLOAD_TEMPLATES[0]);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleDispatch = async () => {
    if (!activeEndpoint) {
      warning('Please select or create an active endpoint first.');
      return;
    }
    setSending(true);
    setSendSuccess(false);

    try {
      const publicUrl = `/h/${activeEndpoint.token}`;
      await ApiClient.sendTestRequest(
        publicUrl,
        selectedTemplate.method,
        selectedTemplate.headers,
        selectedTemplate.body
      );
      setSendSuccess(true);
      success('Template webhook dispatched');
      if (onTemplateDispatched) {
        onTemplateDispatched();
      }
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err: any) {
      toastError(`Failed to send simulated template: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

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
              <Layers className="w-4 h-4 text-neutral-500" />
              Simulated Webhook Templates
            </h1>
            <p className="text-xs text-neutral-500">
              Representative event payloads for testing webhook ingestion and routing logic.
            </p>
          </div>
        </div>

        {activeEndpoint && (
          <button
            type="button"
            onClick={handleDispatch}
            disabled={sending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors disabled:opacity-50"
          >
            {sendSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Dispatched to /h/{activeEndpoint.token.slice(0, 6)}!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Dispatching...' : `Send to /h/${activeEndpoint.token}`}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Templates Sidebar */}
        <div className="md:col-span-4 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto p-4 space-y-1.5 bg-white dark:bg-[#121214]">
          <span className="text-2xs font-mono uppercase text-neutral-400 px-2 block mb-1">
            Available Templates ({SIMULATED_PAYLOAD_TEMPLATES.length})
          </span>
          {SIMULATED_PAYLOAD_TEMPLATES.map(tpl => {
            const isSelected = selectedTemplate.id === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl)}
                className={`w-full text-left p-3 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 dark:bg-neutral-800/80 border-l-2 border-neutral-900 dark:border-neutral-100 font-semibold'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/30 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between text-2xs font-mono mb-1">
                  <span className="text-neutral-400 uppercase">{tpl.provider}</span>
                  <span className="text-neutral-500">{tpl.method}</span>
                </div>
                <div className="text-neutral-900 dark:text-neutral-100">{tpl.name}</div>
                <div className="text-2xs text-neutral-500 line-clamp-1 mt-0.5 font-normal">
                  {tpl.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Template Detail Area */}
        <div className="md:col-span-8 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-2xs font-mono uppercase text-neutral-400">
                  {selectedTemplate.provider}
                </span>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {selectedTemplate.name}
                </h2>
              </div>
              <CopyButton text={selectedTemplate.body} label="Copy Payload" />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {selectedTemplate.description}
            </p>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <span className="text-2xs font-mono uppercase text-neutral-400">
              Simulated Request Headers
            </span>
            <div className="p-3 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono text-2xs space-y-1">
              {Object.entries(selectedTemplate.headers).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-neutral-400 select-all">{k}:</span>
                  <span className="text-neutral-900 dark:text-neutral-100 break-all select-all">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payload Body */}
          <div className="space-y-2">
            <span className="text-2xs font-mono uppercase text-neutral-400">
              Payload Body
            </span>
            <CodeBlock
              code={selectedTemplate.body}
              language="json"
              maxHeight="max-h-[500px]"
              allowDownload
              downloadFilename={`${selectedTemplate.id}.json`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
