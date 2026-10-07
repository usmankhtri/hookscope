import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const STORAGE_KEY = 'hookscope_theme';
const LEGACY_STORAGE_KEY = 'hooklab_theme';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  const applyTheme = (t: 'light' | 'dark') => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  useEffect(() => {
    // Initial sync with localStorage / system preference
    const saved = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    applyTheme(initial);

    // Sync across instances / tabs
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<'light' | 'dark'>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      } else {
        const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        setTheme(current);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if ((e.key === STORAGE_KEY || e.key === LEGACY_STORAGE_KEY) && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener('hookscope:theme-change', handleSync);
    window.addEventListener('hooklab:theme-change', handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('hookscope:theme-change', handleSync);
      window.removeEventListener('hooklab:theme-change', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    localStorage.setItem(LEGACY_STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent('hookscope:theme-change', { detail: next }));
    window.dispatchEvent(new CustomEvent('hooklab:theme-change', { detail: next }));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-700" />
      )}
    </button>
  );
};
