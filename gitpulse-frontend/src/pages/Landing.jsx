import React, { useState } from 'react';
import { ArrowRight, Shield, BarChart3, Users2 } from 'lucide-react';

export default function Landing({ onAnalyze, loading, apiError, attempts, cooldownSec }) {
  const [username, setUsername] = useState('');

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && attempts !== 0) {
      onAnalyze(username.trim());
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50/40 via-slate-50 to-blue-50/40 py-12 px-6 relative interactive-glow overflow-hidden z-10"
    >
      {/* Interactive Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle base grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.5)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(30,41,59,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.25)_1px,transparent_1px)] bg-[size:36px_36px]" />
        
        {/* Spotlight active glow grid */}
        <div className="absolute inset-0 interactive-grid bg-[linear-gradient(to_right,rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(96,165,250,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(96,165,250,0.22)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Upper Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 pt-4">
          
          {/* Left Hero Content: Column 1-7 */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/20 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-lg shadow-xl shadow-slate-100/50 dark:shadow-black/20 hover:scale-[1.01] transition-transform duration-300">
              <div className="glass-shimmer absolute inset-0 z-0 pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold tracking-wider text-xs uppercase">
                  <span className="w-8 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                  Advanced Developer Intelligence
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-normal leading-[1.25] pb-1">
                  Audit Your Public <br />
                  <span className="text-gradient italic px-1.5 pb-1.5 inline-block">GitHub Profile</span>
                </h1>
                
                <p className="text-slate-600 text-base md:text-lg font-normal leading-relaxed max-w-xl">
                  Enter any username to instantly compile language byte-sizes, calculate contribution streaks, index key repository stars, and explore a full interactive activity timeline.
                </p>
              </div>
            </div>

            {/* Input Lookup Form */}
            <form onSubmit={handleSubmit} className="pt-4 max-w-lg">
              <div className={`bg-white border rounded-2xl p-2 shadow-lg shadow-blue-500/5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all flex items-center gap-3 ${
                attempts === 0 ? 'border-rose-200/80 bg-rose-50/20' : 'border-slate-200/80'
              }`}>
                <div className="pl-3 text-slate-400 font-medium text-lg">@</div>
                <input
                  type="text"
                  placeholder="github-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                  disabled={loading || attempts === 0}
                />
                <button
                  type="submit"
                  disabled={loading || !username.trim() || attempts === 0}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {attempts === 0 && cooldownSec > 0 && (
                <div className="mt-3 text-xs text-rose-600 font-bold bg-rose-50/60 border border-rose-100 rounded-xl py-2.5 px-4 flex items-center justify-between shadow-sm animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Search limit reached. Please wait for cooldown.</span>
                  </div>
                  <div className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-lg font-mono">
                    Reset in {cooldownSec}s
                  </div>
                </div>
              )}

              {apiError && !cooldownSec && (
                <div className="mt-3 text-sm text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl py-2.5 px-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {apiError}
                </div>
              )}
            </form>

          </div>

          {/* Right Hero Visuals: Column 8-12 */}
          <div className="lg:col-span-5 relative min-h-[420px] hidden md:block">
            
            {/* Visual 1: Stats Chart Box */}
            <div className="absolute top-4 left-4 z-20 w-[280px] bg-white rounded-2xl border border-slate-200 shadow-xl p-4 transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">repository_stats.json</span>
              </div>
              
              {/* Mini Mock Graph Bars */}
              <div className="flex items-end justify-between h-24 px-2 pt-2 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <div className="w-5 bg-blue-900 rounded-t-sm h-12" />
                <div className="w-5 bg-blue-800 rounded-t-sm h-16" />
                <div className="w-5 bg-blue-700 rounded-t-sm h-20" />
                <div className="w-5 bg-blue-600 rounded-t-sm h-18" />
                <div className="w-5 bg-blue-500 rounded-t-sm h-22" />
                <div className="w-5 bg-blue-400 rounded-t-sm h-14" />
                <div className="w-5 bg-blue-300 rounded-t-sm h-19" />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="w-3/4 h-2.5 bg-slate-100 rounded-full" />
                <div className="w-1/2 h-2.5 bg-slate-100/70 rounded-full" />
              </div>
            </div>

            {/* Visual 2: Blue Contributions Badge */}
            <div className="absolute top-4 right-4 z-20 w-[140px] bg-blue-900 text-white rounded-2xl shadow-xl p-5 hover:scale-115 transition-transform duration-300">
              <BarChart3 className="w-5 h-5 text-blue-300 mb-6" />
              <div className="text-3xl font-extrabold tracking-tight">2,481</div>
              <div className="text-[10px] font-bold tracking-widest text-blue-200 mt-1 uppercase">Contributions</div>
            </div>

            {/* Visual 3: Dark Code Snippet */}
            <div className="absolute bottom-6 left-10 z-30 w-[300px] bg-slate-900 text-slate-300 rounded-2xl shadow-2xl p-4 border border-slate-800 font-mono text-xs hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center gap-1.5 mb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              </div>
              <div className="space-y-1">
                <div><span className="text-blue-400">const</span> <span className="text-emerald-400">pulse</span> = <span className="text-blue-400">new</span> <span className="text-indigo-300">GitPulse</span>();</div>
                <div><span className="text-emerald-400">pulse</span>.<span className="text-yellow-200">analyze</span>(<span className="text-orange-300">'octocat'</span>);</div>
              </div>
            </div>

            {/* Visual 4: Floating World Map Card */}
            <div className="absolute bottom-4 right-0 z-10 w-[160px] bg-white rounded-2xl border border-slate-200 shadow-lg p-3 hover:scale-105 transition-transform duration-300">
              {/* Grid representation of map */}
              <div className="h-20 bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]" />
                <div className="w-3.5 h-3.5 bg-blue-100 border border-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                </div>
              </div>
              <div className="mt-2.5 space-y-1">
                <div className="w-1/2 h-2 bg-slate-200 rounded-full" />
                <div className="w-full h-1.5 bg-slate-100 rounded-full" />
              </div>
            </div>

          </div>
        </div>

        {/* Feature Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
          
          {/* Feature 1 */}
          <div className="space-y-3 p-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <BarChart3 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">53-Week Calendar Grid</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Map your daily contribution logs into a responsive grid matching official profiles, complete with cursor-hover contribution details.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-3 p-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Codebase Composition</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Extract primary programming languages based on codebase byte sizes and render them in a synchronized count-up donut chart.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-3 p-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Shield className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Recent Public Activity</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Audit push commits, repository stars, watch list triggers, and pull request events structured in a clear timeline format.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
