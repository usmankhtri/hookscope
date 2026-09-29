export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(ms?: number): string {
  if (ms === undefined || ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d ago`;
  } catch {
    return isoString;
  }
}

export function formatDateFull(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function getStatusBadgeInfo(status: number): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  if (status >= 200 && status < 300) {
    return {
      label: `${status}`,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-900',
    };
  }
  if (status >= 300 && status < 400) {
    return {
      label: `${status}`,
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-900',
    };
  }
  if (status >= 400 && status < 500) {
    return {
      label: `${status}`,
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900',
    };
  }
  return {
    label: `${status}`,
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-900',
  };
}

export function getMethodBadgeClass(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    case 'GET':
      return 'text-blue-600 dark:text-blue-400 font-semibold';
    case 'PUT':
      return 'text-amber-600 dark:text-amber-400 font-semibold';
    case 'PATCH':
      return 'text-violet-600 dark:text-violet-400 font-semibold';
    case 'DELETE':
      return 'text-rose-600 dark:text-rose-400 font-semibold';
    default:
      return 'text-neutral-600 dark:text-neutral-400 font-semibold';
  }
}
