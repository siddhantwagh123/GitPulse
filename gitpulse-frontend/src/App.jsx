import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import { analyzeUser, checkBackendHealth, getRateLimitStatus } from './services/api';

// Premium Bouncing Dot Loading Screen using Fetching.gif
function LoadingView() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50/20 via-slate-50 to-blue-50/20 flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-sm flex flex-col items-center">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xl shadow-blue-500/5 relative group hover:scale-[1.02] transition-transform duration-300">
          <img
            src="/Fetching.gif"
            alt="Fetching Data..."
            className="w-40 h-40 object-contain rounded-2xl"
          />
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            Fetching
            <span className="flex gap-0.5 items-end pb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            Gathering GitHub contribution profile
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' or 'dashboard'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [attempts, setAttempts] = useState(null);
  const [cooldownSec, setCooldownSec] = useState(0);

  // Initialize theme from localStorage or system scheme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const fetchRateLimit = async () => {
    try {
      const status = await getRateLimitStatus();
      if (status) {
        setAttempts(status.remaining);
        setCooldownSec(status.resetInSec);
      }
    } catch (e) {
      console.error('Failed to sync rate limit status:', e);
    }
  };

  // Cooldown countdown timer logic
  useEffect(() => {
    let timer = null;
    if (cooldownSec > 0) {
      timer = setInterval(() => {
        setCooldownSec((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Refresh attempts immediately when cooldown runs out
            fetchRateLimit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownSec]);

  // Parse URL query parameter (e.g. ?user=octocat) to load profiles automatically if shared
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      handleAnalyze(userParam);
    }
    
    // Quick preflight health check of backend
    checkBackendHealth();

    // Fetch initial rate limit attempts
    fetchRateLimit();
  }, []);

  const handleAnalyze = async (username) => {
    // Prevent searches if they are rate limited
    if (attempts === 0) {
      setError("Search limit reached. Please wait for the cooldown timer.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalyticsData(null); // Clear previous data

    const apiPromise = analyzeUser(username);
    // Create an artificial 2-second delay to show the fetching animation
    const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Wait for both the API response and the 2-second delay
      const [result] = await Promise.all([apiPromise, delayPromise]);

      if (result.success && result.data) {
        setAnalyticsData(result.data);
        setView('dashboard');
        
        // Update URL query parameter without reloading
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?user=${username}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        // Update rate limits from payload
        if (result.rateLimit) {
          setAttempts(result.rateLimit.remaining);
          setCooldownSec(result.rateLimit.resetInSec);
        }
      } else {
        throw new Error(result.error || 'Invalid API response format');
      }
    } catch (err) {
      console.error('Frontend analysis fetch error:', err);
      setError(err.message || 'Failed to fetch developer analytics');
      setView('landing'); // Revert back to landing on failure

      // Refresh limits in case we hit 429
      fetchRateLimit();
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateHome = () => {
    setView('landing');
    setAnalyticsData(null);
    setError(null);
    
    // Clear URL parameters
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: cleanUrl }, '', cleanUrl);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Universal header navigation */}
      <Header 
        currentView={view} 
        onNavigateHome={handleNavigateHome} 
        userAvatar={analyticsData?.profile?.avatar_url}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        attempts={attempts}
      />

      {/* Main layout contents */}
      <main className="flex-grow">
        {loading ? (
          <LoadingView />
        ) : view === 'landing' ? (
          <Landing 
            onAnalyze={handleAnalyze} 
            loading={loading} 
            apiError={error} 
            attempts={attempts}
            cooldownSec={cooldownSec}
          />
        ) : (
          <Dashboard 
            data={analyticsData} 
            loading={loading}
            onNewSearch={handleNavigateHome} 
          />
        )}
      </main>

      {/* Universal Footer Section */}
      <footer className="bg-slate-50/40 dark:bg-slate-900/10 border-t border-slate-200/50 dark:border-slate-800/30 py-6 px-6 md:px-8 mt-auto no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-extrabold tracking-tighter">GP</div>
            <span>© {new Date().getFullYear()} GitPulse. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>Designed & Built by</span>
            <a 
              href="https://github.com/siddhantwagh123" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-700 dark:text-slate-200 font-extrabold hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline decoration-blue-500 decoration-2 underline-offset-4"
            >
              Siddhant Wagh
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/siddhantwagh123" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="GitHub Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/siddhant-wagh-037540259/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
              aria-label="LinkedIn Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400">GitPulse v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
