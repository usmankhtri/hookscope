import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
      <div className="font-mono text-4xl font-bold text-neutral-400">404</div>
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Page not found
      </h1>
      <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
        The requested URL does not exist or has expired.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go to HookScope</span>
        </Link>
      </div>
    </div>
  );
};
