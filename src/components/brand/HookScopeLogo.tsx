import React from 'react';

interface HookScopeIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HookScopeIcon: React.FC<HookScopeIconProps> = ({ className = '', size = 'sm' }) => {
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
      aria-label="HookScope Icon"
    >
      <defs>
        <linearGradient id="hs-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f1f23" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="hs-logo-hook" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="hs-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#10b981" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Modern Squircle Base with Fine Hairline Border */}
      <rect
        width="32"
        height="32"
        rx="8"
        fill="url(#hs-logo-bg)"
        className="stroke-neutral-700/60 dark:stroke-neutral-800"
        strokeWidth="1"
      />

      {/* Reticle / Radar Scope Crosshairs */}
      <g opacity="0.4" stroke="#71717a" strokeWidth="0.9" strokeLinecap="round">
        <line x1="16" y1="4" x2="16" y2="6.5" />
        <line x1="16" y1="25.5" x2="16" y2="28" />
        <line x1="4" y1="16" x2="6.5" y2="16" />
        <line x1="25.5" y1="16" x2="28" y2="16" />
        <circle cx="16" cy="16" r="10.5" stroke="#52525b" strokeWidth="0.7" strokeDasharray="2 3" fill="none" />
      </g>

      {/* Webhook Loop with Ingestion Terminal & Target Blip */}
      <g filter="url(#hs-logo-glow)">
        <path
          d="M10 21V11.5C10 9.57 11.57 8 13.5 8H17C18.93 8 20.5 9.57 20.5 11.5C20.5 13.43 18.93 15 17 15H11.5"
          stroke="url(#hs-logo-hook)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Terminal receiving port */}
        <circle cx="10" cy="21.5" r="2" fill="#38bdf8" />
        {/* Scope target beacon */}
        <circle cx="22.5" cy="8.5" r="2.1" fill="#10b981" />
        <circle cx="22.5" cy="8.5" r="3.2" stroke="#10b981" strokeWidth="0.75" opacity="0.6" />
      </g>
    </svg>
  );
};

interface HookScopeLogoProps {
  className?: string;
  iconSize?: 'sm' | 'md';
}

export const HookScopeLogo: React.FC<HookScopeLogoProps> = ({
  className = '',
  iconSize = 'sm',
}) => {
  return (
    <div className={`flex items-center gap-2 group select-none ${className}`}>
      <HookScopeIcon size={iconSize} />
      <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
        Hook<span className="text-emerald-600 dark:text-emerald-400 font-bold">Scope</span>
      </span>
    </div>
  );
};

// Aliases for compatibility
export const HookLabIcon = HookScopeIcon;
export const HookLabLogo = HookScopeLogo;
