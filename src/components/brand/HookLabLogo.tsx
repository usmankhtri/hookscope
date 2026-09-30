import React from 'react';

interface HookLabIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HookLabIcon: React.FC<HookLabIconProps> = ({ className = '', size = 'sm' }) => {
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  return (
    <svg
      className={`${sizeClass} ${className} shrink-0 select-none`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HookLab Icon"
    >
      <defs>
        <linearGradient id="hl-icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="hl-icon-hook" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      <rect
        width="32"
        height="32"
        rx="7.5"
        fill="url(#hl-icon-bg)"
        className="stroke-neutral-700/60 dark:stroke-neutral-800"
        strokeWidth="1"
      />

      {/* Webhook Loop */}
      <path
        d="M10 20.5V11.5C10 9.57 11.57 8 13.5 8H17C18.93 8 20.5 9.57 20.5 11.5C20.5 13.43 18.93 15 17 15H12"
        stroke="url(#hl-icon-hook)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Receiving Terminal */}
      <circle cx="10" cy="21.5" r="2" fill="#38bdf8" />
      {/* Active Signal Pulse */}
      <circle cx="23" cy="8.5" r="2.2" fill="#10b981" />
    </svg>
  );
};

interface HookLabLogoProps {
  className?: string;
  iconSize?: 'sm' | 'md';
}

export const HookLabLogo: React.FC<HookLabLogoProps> = ({
  className = '',
  iconSize = 'sm',
}) => {
  return (
    <div className={`flex items-center gap-2 group select-none ${className}`}>
      <HookLabIcon size={iconSize} />
      <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
        Hook<span className="text-emerald-600 dark:text-emerald-400">Lab</span>
      </span>
    </div>
  );
};
