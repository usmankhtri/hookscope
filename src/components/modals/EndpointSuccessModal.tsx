import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, X } from 'lucide-react';
import { WebhookEndpoint } from '../../types';
import { getPublicEndpointUrl } from '../../utils/url';
import { useToast } from '../../context/ToastContext';

interface EndpointSuccessModalProps {
  endpoint: WebhookEndpoint | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEndpoint: (token: string) => void;
}

export const EndpointSuccessModal: React.FC<EndpointSuccessModalProps> = ({
  endpoint,
  isOpen,
  onClose,
  onOpenEndpoint,
}) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !endpoint) return null;

  const publicUrl = getPublicEndpointUrl(endpoint.token);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = publicUrl;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    success('Endpoint URL copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="endpoint-created-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans select-none"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="endpoint-created-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Endpoint created
              </h2>
              <p className="text-2xs text-neutral-500">
                Ready to receive and inspect incoming webhooks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Endpoint Name */}
          <div className="space-y-1">
            <span className="text-2xs uppercase tracking-wider font-mono text-neutral-400 block">
              Endpoint name
            </span>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {endpoint.name || `Endpoint ${endpoint.token.slice(0, 6)}`}
            </p>
          </div>

          {/* Prominent Endpoint URL Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-wider font-mono text-neutral-400 block">
                Endpoint URL
              </span>
              <span className="text-3xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active & Listening
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-neutral-50 dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100 break-all select-all flex-1 py-1 px-1">
                {publicUrl}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                  copied
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-neutral-50/80 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => onOpenEndpoint(endpoint.token)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            <span>Open endpoint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
