import React from 'react';

export interface Root4TechLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string | boolean;
  variant?: 'color' | 'dark' | 'light' | 'print';
  className?: string;
  textClassName?: string;
}

export const Root4TechLogo: React.FC<Root4TechLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle = false,
  variant = 'color',
  className = '',
  textClassName = ''
}) => {
  // Dimensions mapping
  const sizeMap = {
    xs: { box: 22, font: 'text-xs', subFont: 'text-[9px]' },
    sm: { box: 30, font: 'text-sm', subFont: 'text-[10px]' },
    md: { box: 38, font: 'text-base', subFont: 'text-[11px]' },
    lg: { box: 48, font: 'text-lg', subFont: 'text-xs' },
    xl: { box: 64, font: 'text-2xl', subFont: 'text-xs' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isPrint = variant === 'print';
  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <svg
        width={currentSize.box}
        height={currentSize.box}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
        aria-label="Root 4 Tech Official Logo"
      >
        <defs>
          <linearGradient id="r4t-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isPrint ? '#0F172A' : '#0F172A'} />
            <stop offset="45%" stopColor={isPrint ? '#1E3A8A' : '#1E40AF'} />
            <stop offset="100%" stopColor={isPrint ? '#2563EB' : '#0284C7'} />
          </linearGradient>

          <linearGradient id="r4t-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          <linearGradient id="r4t-cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <filter id="r4t-glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0284C7" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Squircle Background Base */}
        <rect
          x="6"
          y="6"
          width="116"
          height="116"
          rx="28"
          fill="url(#r4t-bg-grad)"
          stroke="#38BDF8"
          strokeWidth="2.5"
          strokeOpacity={isPrint ? '0.25' : '0.55'}
        />

        {/* Tech Circuit Root Bus Nodes */}
        <path
          d="M16 64 H28 M100 64 H112 M64 16 V26 M64 102 V112"
          stroke="#38BDF8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity={isPrint ? '0.2' : '0.4'}
        />
        <circle cx="16" cy="64" r="3" fill="#38BDF8" fillOpacity="0.8" />
        <circle cx="112" cy="64" r="3" fill="#38BDF8" fillOpacity="0.8" />
        <circle cx="64" cy="16" r="3" fill="#38BDF8" fillOpacity="0.8" />
        <circle cx="64" cy="112" r="3" fill="#38BDF8" fillOpacity="0.8" />

        {/* Integrated R4 Monogram */}
        <g filter={isPrint ? undefined : 'url(#r4t-glow-effect)'}>
          {/* 'R' Left Pillar */}
          <path
            d="M34 32 C34 29.5 35.8 28 38 28 H46 C48.2 28 50 29.5 50 32 V96 C50 98.5 48.2 100 46 100 H38 C35.8 100 34 98.5 34 96 Z"
            fill="#FFFFFF"
          />

          {/* Root Circuit Anchor */}
          <path d="M34 88 L24 96" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="22" cy="98" r="2.5" fill="#38BDF8" />

          {/* 'R' Upper Loop */}
          <path
            d="M48 28 H66 C77.5 28 85 35 85 45 C85 55 77.5 62 66 62 H48 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="11"
            strokeLinejoin="round"
          />

          {/* '4' Angled Beam to Horizontal Crossbar */}
          <path
            d="M84 32 L52 72 H96"
            fill="none"
            stroke="url(#r4t-accent-grad)"
            strokeWidth="9.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* '4' Right Vertical Mast */}
          <path
            d="M80 50 V94 C80 96.5 78.5 98 76 98 H72 C69.5 98 68 96.5 68 94 V50 C68 47.5 69.5 46 72 46 H76 C78.5 46 80 47.5 80 50 Z"
            fill="url(#r4t-cyan-grad)"
          />

          {/* 'R' Diagonal Leg */}
          <path
            d="M60 58 L84 96 C85.5 98 84 100 81 100 H72 C69.5 100 68 98.5 66.5 96 L48 68"
            fill="url(#r4t-accent-grad)"
          />

          {/* Glowing Digital Pulse Node */}
          <circle cx="80" cy="72" r="6" fill="#38BDF8" />
          <circle cx="80" cy="72" r="3" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Brand Wordmark & Typography */}
      {showText && (
        <div className={`min-w-0 flex flex-col justify-center ${textClassName}`}>
          <div
            className={`font-black tracking-tight flex items-center gap-1.5 leading-none ${currentSize.font} ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <span>Root 4 Tech</span>
            {!isPrint && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            )}
          </div>
          {subtitle && (
            <div
              className={`font-semibold uppercase tracking-wider mt-0.5 leading-tight ${currentSize.subFont} ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {typeof subtitle === 'string'
                ? subtitle
                : isPrint
                ? 'Software Development & Technology Operations'
                : 'Enterprise CRM Platform'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
