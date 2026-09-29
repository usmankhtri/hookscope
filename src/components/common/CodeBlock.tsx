import React, { useState, useMemo } from 'react';
import { CopyButton } from './CopyButton';
import { Download, WrapText, AlignLeft } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: string;
  allowDownload?: boolean;
  downloadFilename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

/**
 * Clean, subtle syntax tokenization without garish neon colors.
 * Optimized for readability in dark charcoal and light neutral themes.
 */
function highlightCode(code: string, language: string): React.ReactNode[] {
  const lines = code.split('\n');

  if (language.toLowerCase() === 'json') {
    return lines.map((line, idx) => {
      // JSON line tokenizer: keys, strings, numbers, booleans, null
      const tokenized = line.replace(
        /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
        (match, str, isKey, bool, num) => {
          if (str) {
            if (isKey) {
              return `<span class="text-neutral-900 dark:text-neutral-100 font-semibold">${str}</span>${isKey}`;
            }
            return `<span class="text-neutral-600 dark:text-neutral-400">${str}</span>`;
          }
          if (bool) {
            return `<span class="text-amber-700 dark:text-amber-400 font-mono">${bool}</span>`;
          }
          if (num) {
            return `<span class="text-sky-700 dark:text-sky-400 font-mono">${num}</span>`;
          }
          return match;
        }
      );

      return (
        <span
          key={idx}
          className="block"
          dangerouslySetInnerHTML={{ __html: tokenized || '&nbsp;' }}
        />
      );
    });
  }

  // Generic fallback with line preservation
  return lines.map((line, idx) => (
    <span key={idx} className="block">
      {line || '\u00A0'}
    </span>
  ));
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'json',
  maxHeight = 'max-h-96',
  allowDownload = false,
  downloadFilename = 'payload.json',
  showLineNumbers = true,
  className = '',
}) => {
  const [wrapLines, setWrapLines] = useState(false);

  const lines = useMemo(() => code.split('\n'), [code]);
  const tokenizedLines = useMemo(() => highlightCode(code, language), [code, language]);

  const handleDownload = () => {
    const mimeType = language === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-[#121214] text-neutral-800 dark:text-neutral-200 ${className}`}
    >
      {/* Top Code Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-100/70 dark:bg-[#18181b] border-b border-neutral-200 dark:border-neutral-800 text-2xs text-neutral-500 font-mono select-none">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
            {language}
          </span>
          <span>·</span>
          <span>{lines.length} lines</span>
          <span>·</span>
          <span>{new Blob([code]).size} B</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWrapLines(!wrapLines)}
            className={`p-1 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors ${
              wrapLines ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' : ''
            }`}
            title={wrapLines ? 'Disable line wrap' : 'Enable line wrap'}
          >
            {wrapLines ? <WrapText className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
          </button>

          {allowDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}

          <CopyButton text={code} label="Copy" />
        </div>
      </div>

      {/* Editor Surface */}
      <div
        className={`flex font-mono text-xs leading-relaxed overflow-x-auto overflow-y-auto ${maxHeight}`}
      >
        {/* Line Numbers Column */}
        {showLineNumbers && (
          <div className="select-none py-3 pl-3 pr-3 text-right text-neutral-400 dark:text-neutral-600 bg-neutral-50/50 dark:bg-[#141416] border-r border-neutral-200/60 dark:border-neutral-800/60 shrink-0 font-mono text-2xs tabular-nums">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}

        {/* Code Viewport */}
        <pre
          className={`flex-1 m-0 p-3 select-text ${
            wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
          }`}
        >
          <code>{tokenizedLines}</code>
        </pre>
      </div>
    </div>
  );
};
