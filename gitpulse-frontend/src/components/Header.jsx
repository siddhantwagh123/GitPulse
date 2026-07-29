import React from 'react';

export default function Header({ currentView, onNavigateHome, isDark, onToggleTheme, attempts }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Side: Brand Logo */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <img 
            src="/gitlab.png" 
            alt="GitPulse Logo" 
            className="w-9 h-9 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
          />
          <span className="font-bold text-lg text-slate-900 tracking-tight transition-all duration-300 group-hover:text-blue-600 group-hover:translate-x-0.5">
            GitPulse <span className="text-blue-600 font-semibold transition-colors duration-300 group-hover:text-blue-700">Analytics</span>
          </span>
        </div>

        {/* Right Side: Attempts counter and Theme Switch */}
        <div className="flex items-center gap-4">
          {attempts !== null && attempts !== undefined && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold select-none shadow-sm transition-all border ${
              attempts === 0 
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 shadow-rose-500/5' 
                : 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-100/60 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 shadow-blue-500/5'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                attempts === 0 ? 'bg-rose-500' : 'bg-blue-500'
              }`} />
              <span className="no-print">
                Searches Left:{' '}
                <span className={attempts === 0 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'}>
                  {attempts}
                </span>
              </span>
            </div>
          )}
          
          {/* Uiverse.io Switch Theme Button */}
          <div className="flex items-center shrink-0">
            <label className="switch scale-[0.85]">
              <input 
                type="checkbox" 
                className="input" 
                checked={isDark} 
                onChange={onToggleTheme} 
              />
              <span className="slider">
                <span className="sun">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g fill="#f59e0b">
                      <circle cx="12" cy="12" r="5"></circle>
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"></path>
                    </g>
                  </svg>
                </span>
                <span className="moon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10C2.2 6.8 6.3 2.5 11.5 2c.3 0 .6.2.7.5.1.3.1.6-.2.8-2.4 2-3.6 5.2-3.1 8.5.5 3.3 2.9 6 6.2 6.5 1.1.2 2.3-.1 3.2-.7.3-.2.6-.1.8.1.2.3.2.6.1.8-1.5 2.2-4.1 3.5-6.9 3.5z" fill="#f59e0b"></path>
                  </svg>
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}
