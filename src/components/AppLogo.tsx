import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  showBadge = false,
}) => {
  const dimensions = {
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-16 h-16 rounded-[22px]',
    xl: 'w-20 h-20 rounded-[28px]',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Outer Glow / Gradient Border */}
      <div
        className={`${dimensions} p-[2px] bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 shadow-lg shadow-indigo-500/25 transition-transform duration-300 hover:scale-105`}
      >
        {/* Inner container */}
        <div className="w-full h-full bg-slate-950 rounded-[inherit] flex items-center justify-center overflow-hidden relative">
          {/* Subtle film strip pattern background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col justify-between py-1 px-0.5">
            <div className="flex justify-between">
              <span className="w-1 h-1 rounded-sm bg-white" />
              <span className="w-1 h-1 rounded-sm bg-white" />
            </div>
            <div className="flex justify-between">
              <span className="w-1 h-1 rounded-sm bg-white" />
              <span className="w-1 h-1 rounded-sm bg-white" />
            </div>
          </div>

          {/* SVG Custom Logo: Stylized Film + Precise Scissors Cut */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${iconSizes} text-indigo-400 drop-shadow`}
          >
            {/* Cut line / blade accent */}
            <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.4" />
            {/* Scissor top loop & blade */}
            <circle cx="6" cy="6" r="3" stroke="url(#logo-grad-1)" />
            <path d="M8.5 7.5L19 18" stroke="url(#logo-grad-1)" />
            {/* Scissor bottom loop & blade */}
            <circle cx="6" cy="18" r="3" stroke="url(#logo-grad-2)" />
            <path d="M8.5 16.5L19 6" stroke="url(#logo-grad-2)" />

            <defs>
              <linearGradient id="logo-grad-1" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="logo-grad-2" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showBadge && (
        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-950" />
        </span>
      )}
    </div>
  );
};
