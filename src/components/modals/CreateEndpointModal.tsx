import React, { useState, useEffect, useRef } from 'react';
import { Radio, X, Loader2 } from 'lucide-react';

interface CreateEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export const CreateEndpointModal: React.FC<CreateEndpointModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(null);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmittingRef.current) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Prevent duplicate submission
    if (isSubmittingRef.current) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter an endpoint name.');
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length > 50) {
      setError('Endpoint name cannot exceed 50 characters.');
      return;
    }

    setError(null);
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await onCreate(trimmed);
      // modal will be closed by caller or transition to success
    } catch {
      // Allow retry if failed
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-endpoint-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans select-none"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#161619] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Radio className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2 id="create-endpoint-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Create Endpoint
              </h2>
              <p className="text-2xs text-neutral-500">
                Generate an isolated public webhook ingestion URL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md transition-colors disabled:opacity-30"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="endpoint-name-input"
                  className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Endpoint name <span className="text-rose-500">*</span>
                </label>
                <span className="text-3xs text-neutral-400 font-mono">
                  {name.length}/50
                </span>
              </div>

              <input
                ref={inputRef}
                id="endpoint-name-input"
                type="text"
                maxLength={50}
                placeholder="e.g. My Stripe Webhook"
                value={name}
                disabled={isSubmitting}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-neutral-50 dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden transition-all ${
                  error
                    ? 'border-rose-400 dark:border-rose-600 focus:ring-1 focus:ring-rose-500'
                    : 'border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400'
                }`}
              />

              {error && (
                <p className="text-2xs text-rose-500 font-medium animate-in fade-in duration-100">
                  {error}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-neutral-50 dark:bg-[#121214] border border-neutral-100 dark:border-neutral-800/80 p-3 text-2xs text-neutral-500 space-y-1">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                Production Endpoint URL:
              </span>
              <p className="font-mono text-3xs text-neutral-400 truncate">
                https://hookscope-tools.vercel.app/h/&lt;unique-token&gt;
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-neutral-50/80 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Creating...' : 'Create endpoint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
