import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { verifyWebhookSignature, HmacAlgorithm, EncodingFormat, VerificationResult } from '../engine/hmac/hmacVerifier';
import { KeyRound, ArrowLeft, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface SignaturePageProps {
  initialPayload?: string;
}

export const SignaturePage: React.FC<SignaturePageProps> = ({
  initialPayload = '{\n  "event": "charge.succeeded",\n  "amount": 2500,\n  "currency": "usd"\n}',
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'HMAC Signature Verifier – HookLab';
  }, []);
  const [secret, setSecret] = useState('');
  const [payload, setPayload] = useState(initialPayload);
  const [signature, setSignature] = useState('');
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>('SHA-256');
  const [encoding, setEncoding] = useState<EncodingFormat>('hex');
  const [timestamp, setTimestamp] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const loadPreset = (presetName: string) => {
    if (presetName === 'stripe') {
      setAlgorithm('SHA-256');
      setEncoding('hex');
      setTimestamp('1695984000');
      setSignature('v1=5a73e61c56f8f78b849e7a9b0c2a8f9182374650192837465019283746501928');
    } else if (presetName === 'github') {
      setAlgorithm('SHA-256');
      setEncoding('hex');
      setTimestamp('');
      setSignature('sha256=8f0a394ec5642d9f37929d2bf9c811234567890abcdef1234567890abcdef12');
    } else if (presetName === 'shopify') {
      setAlgorithm('SHA-256');
      setEncoding('base64');
      setTimestamp('');
      setSignature('2c7a38e8fb92a0d9b4c81a2e76f920==');
    }
  };

  useEffect(() => {
    let isCurrent = true;

    async function compute() {
      if (!secret.trim() || !signature.trim()) {
        if (isCurrent) setResult(null);
        return;
      }

      const res = await verifyWebhookSignature(secret, payload, signature, {
        algorithm,
        encoding,
        timestamp: timestamp.trim() || undefined,
      });

      if (isCurrent) setResult(res);
    }

    compute();
    return () => {
      isCurrent = false;
    };
  }, [secret, payload, signature, algorithm, encoding, timestamp]);

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
              <KeyRound className="w-4 h-4 text-neutral-500" />
              Webhook Signature & HMAC Verifier
            </h1>
            <p className="text-xs text-neutral-500">
              Deterministic, client-side signature computation. Secrets are never transmitted.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-2xs font-mono text-neutral-400">Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('stripe')}
            className="px-2.5 py-1 text-2xs font-mono rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Stripe
          </button>
          <button
            type="button"
            onClick={() => loadPreset('github')}
            className="px-2.5 py-1 text-2xs font-mono rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            GitHub
          </button>
          <button
            type="button"
            onClick={() => loadPreset('shopify')}
            className="px-2.5 py-1 text-2xs font-mono rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Shopify
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Security Notice */}
        <div className="p-4 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-neutral-600 dark:text-neutral-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              In-Browser Cryptographic Verification
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              All HMAC operations run using Web Crypto directly inside your browser. Secret keys are never sent to HookLab servers or any third-party APIs. Note that providers vary in timestamp prepend formats (e.g. Stripe prepends <code className="font-mono text-2xs">timestamp.payload</code>).
            </p>
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-2xs font-mono uppercase text-neutral-500">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value as HmacAlgorithm)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden"
            >
              <option value="SHA-256">HMAC-SHA256 (Standard)</option>
              <option value="SHA-1">HMAC-SHA1</option>
              <option value="SHA-512">HMAC-SHA512</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-2xs font-mono uppercase text-neutral-500">
              Encoding Format
            </label>
            <select
              value={encoding}
              onChange={e => setEncoding(e.target.value as EncodingFormat)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden"
            >
              <option value="hex">Hexadecimal (e.g. GitHub, Stripe)</option>
              <option value="base64">Base64 (e.g. Shopify)</option>
            </select>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-2xs font-mono uppercase text-neutral-500">
              Signing Secret Key
            </label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="e.g. whsec_98721635..."
              className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-2xs font-mono uppercase text-neutral-500">
              Timestamp Header (Optional, for Stripe-style t.payload hashing)
            </label>
            <input
              type="text"
              value={timestamp}
              onChange={e => setTimestamp(e.target.value)}
              placeholder="e.g. 1695984000"
              className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-2xs font-mono uppercase text-neutral-500">
              Raw Payload Body
            </label>
            <textarea
              rows={6}
              value={payload}
              onChange={e => setPayload(e.target.value)}
              placeholder="Paste exact raw body..."
              className="w-full text-xs p-3 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-2xs font-mono uppercase text-neutral-500">
              Expected Signature (from webhook request header)
            </label>
            <input
              type="text"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              placeholder="e.g. sha256=5a73e61c... or 5a73e61c..."
              className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>

        {/* Live Deterministic Result */}
        {result && (
          <div
            className={`p-5 rounded-xl border font-mono text-xs space-y-3 ${
              result.valid
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300'
                : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {result.valid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>SIGNATURE VALID</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>SIGNATURE MISMATCH</span>
                </>
              )}
            </div>

            <p className="text-2xs opacity-90">{result.explanation}</p>

            <div className="space-y-1.5 pt-2 border-t border-current/10 text-2xs">
              <div>
                <span className="opacity-70">Computed Hash: </span>
                <span className="font-semibold break-all select-all">{result.computedSignature}</span>
              </div>
              <div>
                <span className="opacity-70">Expected Hash: </span>
                <span className="font-semibold break-all select-all">{result.expectedSignature}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
