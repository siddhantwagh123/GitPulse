import React, { useState, useEffect } from 'react';
import { 
  GitBranch, GitCommit, GitPullRequest, Star, Calendar, 
  Code, FolderOpen, History, Copy, FileDown, ExternalLink,
  ChevronRight, Check, Sparkles, Flame, Activity, Sun, Moon, Award, Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import HeatmapGrid from '../components/HeatmapGrid';

// Skeleton Loading Component matching screen2.png layout
export function DashboardSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50/20 via-slate-50 to-blue-50/20 py-8 px-4 md:px-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Row skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="w-48 h-4 bg-slate-200 rounded" />
          <div className="w-48 h-7 bg-slate-200 rounded-full ml-auto sm:ml-0" />
        </div>

        {/* Upper Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Profile Card Skeleton */}
          <div className="lg:col-span-4 bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-5 flex flex-col items-center sm:items-start w-full">
              <div className="w-24 h-24 rounded-full bg-slate-200" />
              <div className="space-y-2 w-full">
                <div className="w-3/4 h-6 bg-slate-200 rounded mx-auto sm:mx-0" />
                <div className="w-1/2 h-4 bg-slate-200 rounded mx-auto sm:mx-0" />
                <div className="w-5/6 h-3 bg-slate-100 rounded mx-auto sm:mx-0" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 w-full text-center border-t border-slate-100">
                <div className="space-y-1"><div className="h-5 bg-slate-200 rounded w-1/2 mx-auto" /><div className="h-2.5 bg-slate-100 rounded w-3/4 mx-auto" /></div>
                <div className="space-y-1"><div className="h-5 bg-slate-200 rounded w-1/2 mx-auto" /><div className="h-2.5 bg-slate-100 rounded w-3/4 mx-auto" /></div>
                <div className="space-y-1"><div className="h-5 bg-slate-200 rounded w-1/2 mx-auto" /><div className="h-2.5 bg-slate-100 rounded w-3/4 mx-auto" /></div>
              </div>
            </div>
            <div className="w-full h-11 bg-slate-200 rounded-xl mt-4" />
          </div>

          {/* Contributions Card Skeleton */}
          <div className="lg:col-span-4 bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-28 h-3 bg-slate-200 rounded" />
              <div className="w-24 h-8 bg-slate-200 rounded" />
            </div>
            {/* Sparkline dummy bars */}
            <div className="h-24 w-full flex items-end justify-between px-2 gap-2 mt-6">
              <div className="w-full bg-slate-100 rounded-t h-8" />
              <div className="w-full bg-slate-200 rounded-t h-12" />
              <div className="w-full bg-slate-200 rounded-t h-16" />
              <div className="w-full bg-slate-100 rounded-t h-10" />
              <div className="w-full bg-slate-200 rounded-t h-20" />
              <div className="w-full bg-slate-100 rounded-t h-14" />
              <div className="w-full bg-slate-200 rounded-t h-12" />
              <div className="w-full bg-slate-100 rounded-t h-9" />
            </div>
          </div>

          {/* Languages Card Skeleton */}
          <div className="lg:col-span-4 bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="w-24 h-3 bg-slate-200 rounded" />
            <div className="grid grid-cols-12 items-center gap-4 h-full pt-4">
              <div className="col-span-6 flex justify-center">
                <div className="w-28 h-28 rounded-full border-[12px] border-slate-200 flex items-center justify-center">
                  <div className="w-8 h-4 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="col-span-6 space-y-3">
                <div className="h-3.5 bg-slate-200 rounded w-full" />
                <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                <div className="h-3.5 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="border-b border-slate-200 flex gap-4 h-12">
          <div className="w-24 bg-slate-200 rounded-t h-8" />
          <div className="w-24 bg-slate-100 rounded-t h-8" />
          <div className="w-24 bg-slate-100 rounded-t h-8" />
        </div>

        {/* Heatmap skeleton */}
        <div className="bg-white border border-slate-200/85 rounded-2xl p-6 shadow-sm h-52 flex flex-col justify-between">
          <div className="w-48 h-5 bg-slate-200 rounded" />
          <div className="w-full h-24 bg-slate-100 rounded-lg" />
          <div className="w-72 h-4 bg-slate-200 rounded" />
        </div>

      </div>
    </div>
  );
}

export default function Dashboard({ data, loading, onNewSearch }) {
  const [activeTab, setActiveTab] = useState('contributions');
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [hoveredPieIndex, setHoveredPieIndex] = useState(null);

  // Safe destructuring of data (handles null state before early return)
  const profile = data?.profile;
  const repositories = data?.repositories;
  const languages = data?.languages;
  const contributions = data?.contributions;
  const stats = data?.stats;
  const activity = data?.activity;

  // Format and group languages mathematically so they sum to exactly 100%
  const getProcessedLanguages = () => {
    const rawEntries = Object.entries(languages || {}).map(([name, value]) => ({
      name,
      value: parseFloat(value)
    }));

    // Sort descending by percentage
    rawEntries.sort((a, b) => b.value - a.value);

    if (rawEntries.length <= 4) {
      const sum = rawEntries.reduce((acc, item) => acc + item.value, 0);
      if (sum > 0) {
        return rawEntries.map(item => ({
          ...item,
          value: parseFloat(((item.value / sum) * 100).toFixed(1))
        }));
      }
      return rawEntries;
    }

    // Keep top 4, group the rest into "Others"
    const topFour = rawEntries.slice(0, 4);
    const rest = rawEntries.slice(4);
    const restSum = rest.reduce((acc, item) => acc + item.value, 0);

    const grouped = [
      ...topFour,
      { name: 'Others', value: parseFloat(restSum.toFixed(1)) }
    ];

    const totalSum = grouped.reduce((acc, item) => acc + item.value, 0);
    return grouped.map(item => ({
      ...item,
      value: parseFloat(((item.value / totalSum) * 100).toFixed(1))
    }));
  };

  const pieData = getProcessedLanguages();
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

  // The total codebase language composition is always exactly 100%
  const displayPercentage = pieData.length > 0 ? 100 : 0;

  // Get dynamic Activity Status Badge based on latest event timestamp (ACT 6)
  const getStatusBadge = () => {
    if (!activity || activity.length === 0) {
      return { text: 'Dormant', color: 'bg-slate-50 text-slate-500 border-slate-200/60 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/80' };
    }
    
    const latestEvent = activity[0];
    const latestDate = new Date(latestEvent.created_at);
    const diffMs = Date.now() - latestDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffDays <= 2) {
      return { text: 'Active', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' };
    } else if (diffDays <= 7) {
      return { text: 'Semi-active', color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' };
    } else {
      return { text: 'Dormant', color: 'bg-slate-50 text-slate-500 border-slate-200/60 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/80' };
    }
  };

  const statusBadge = getStatusBadge();

  // Get visualized Story Badges representing Acts 1-6 (gamified visual report)
  const getStoryBadges = () => {
    if (!profile) return [];

    const badges = [];

    // 1. Archetype Badge (ACT 3)
    let archetypeTitle = 'Public Contributor';
    let archetypeDesc = 'Building in the open';
    let primaryLangVal = 100;
    if (pieData && pieData.length > 0) {
      const topLang = pieData[0].name;
      primaryLangVal = Math.round(pieData[0].value);
      if (pieData.length >= 3 && (topLang === 'JavaScript' || topLang === 'TypeScript')) {
        archetypeTitle = 'Full-Stack Developer';
        archetypeDesc = `Specialized in ${topLang}`;
      } else {
        archetypeTitle = `${topLang} Developer`;
        archetypeDesc = `Focuses on ${topLang} coding`;
      }
    }
    badges.push({
      id: 'archetype',
      title: archetypeTitle,
      subtitle: archetypeDesc,
      icon: Code,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30',
      gradient: 'from-blue-50/40 via-white to-blue-50/10 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/10 border-slate-200/60 dark:border-slate-800/80',
      tag: 'STACK',
      tagColor: 'text-blue-600 bg-blue-50/80 border-blue-100 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30',
      visualVal: primaryLangVal
    });

    // 2. Productivity / Streak Badge (ACT 2)
    const totalConts = stats?.total_contributions || 0;
    const longestStrk = stats?.longest_streak || 0;
    let prodTitle = 'Consistent Coder';
    let prodDesc = `${totalConts} updates this year`;
    if (longestStrk > 15) {
      prodTitle = 'Daily Grinder';
      prodDesc = `${longestStrk}-day longest streak`;
    } else if (totalConts > 200) {
      prodTitle = 'High Output Coder';
      prodDesc = `${totalConts} updates this year`;
    } else if (totalConts === 0) {
      prodTitle = 'Code Explorer';
      prodDesc = 'Getting started on GitHub';
    }
    const streakProgress = longestStrk > 0 ? Math.min((longestStrk / 30) * 100, 100) : Math.min((totalConts / 100) * 100, 100);
    const streakText = longestStrk > 0 ? `Streak: ${longestStrk}d` : `Updates: ${totalConts}`;
    badges.push({
      id: 'productivity',
      title: prodTitle,
      subtitle: prodDesc,
      icon: longestStrk > 5 ? Flame : Activity,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/30',
      gradient: 'from-orange-50/40 via-white to-orange-50/10 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/10 border-slate-200/60 dark:border-slate-800/80',
      tag: 'VELOCITY',
      tagColor: 'text-orange-600 bg-orange-50/80 border-orange-100 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-900/30',
      visualVal: Math.round(streakProgress),
      visualText: streakText
    });

    // 3. Work Schedule Badge (ACT 4)
    let schedTitle = 'Weekday Professional';
    let schedDesc = 'Standard weekday coding hours';
    let weekdayPct = 100;
    if (contributions && contributions.length > 0) {
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];
      contributions.forEach(d => {
        const dayOfWeek = new Date(d.date).getDay();
        dayCounts[dayOfWeek] += d.count;
      });
      const weekdaysSum = dayCounts.slice(1, 6).reduce((a, b) => a + b, 0);
      const weekendsSum = dayCounts[0] + dayCounts[6];
      const total = weekdaysSum + weekendsSum;
      if (total > 0) {
        weekdayPct = (weekdaysSum / total) * 100;
      }
      
      if (weekendsSum > weekdaysSum * 0.6) {
        schedTitle = 'Weekend Warrior';
        schedDesc = 'Codes mostly on weekends';
      }
    }
    badges.push({
      id: 'schedule',
      title: schedTitle,
      subtitle: schedDesc,
      icon: schedTitle === 'Weekend Warrior' ? Moon : Sun,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30',
      gradient: 'from-purple-50/40 via-white to-purple-50/10 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/10 border-slate-200/60 dark:border-slate-800/80',
      tag: 'SCHEDULE',
      tagColor: 'text-purple-600 bg-purple-50/80 border-purple-100 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-900/30',
      visualVal: Math.round(weekdayPct)
    });

    // 4. Community Reach / Impact Badge (ACT 5)
    const totalStars = repositories?.reduce((sum, repo) => sum + repo.stars, 0) || 0;
    const followerCount = profile.followers || 0;
    let impactTitle = 'Active Builder';
    let impactDesc = `${followerCount} developers following work`;
    if (totalStars > 100) {
      impactTitle = 'Community Leader';
      impactDesc = `${totalStars} stars on projects`;
    } else if (totalStars > 10) {
      impactTitle = 'Trending Developer';
      impactDesc = `${totalStars} stars on projects`;
    }
    let starsRating = 1;
    if (totalStars > 100 || followerCount > 50) starsRating = 5;
    else if (totalStars > 30 || followerCount > 20) starsRating = 4;
    else if (totalStars > 10 || followerCount > 5) starsRating = 3;
    else if (totalStars > 0 || followerCount > 0) starsRating = 2;
    
    badges.push({
      id: 'impact',
      title: impactTitle,
      subtitle: impactDesc,
      icon: totalStars > 10 ? Award : Star,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30',
      gradient: 'from-amber-50/40 via-white to-amber-50/10 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/10 border-slate-200/60 dark:border-slate-800/80',
      tag: 'REACH',
      tagColor: 'text-amber-600 bg-amber-50/80 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30',
      visualVal: starsRating,
      visualText: starsRating === 5 ? 'High Trust' : starsRating >= 3 ? 'Sustained' : 'Growing'
    });

    // 5. Momentum Status Badge (ACT 6)
    let momTitle = 'Dormant Coder';
    let momDesc = 'No recent activity';
    let pulseText = 'Dormant';
    let pulseColor = 'bg-slate-400';
    let pulseBg = 'bg-slate-500';
    if (activity && activity.length > 0) {
      const latestEvent = activity[0];
      const latestDate = new Date(latestEvent.created_at);
      const diffDays = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 2) {
        momTitle = 'Active Now';
        momDesc = 'Coded recently';
        pulseText = 'Active Now';
        pulseColor = 'bg-emerald-400';
        pulseBg = 'bg-emerald-500';
      } else if (diffDays <= 7) {
        momTitle = 'Semi-Active';
        momDesc = 'Coded this past week';
        pulseText = 'Semi-Active';
        pulseColor = 'bg-amber-400';
        pulseBg = 'bg-amber-500';
      }
    }
    badges.push({
      id: 'momentum',
      title: momTitle,
      subtitle: momDesc,
      icon: Zap,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30',
      gradient: 'from-emerald-50/40 via-white to-emerald-50/10 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/10 border-slate-200/60 dark:border-slate-800/80',
      tag: 'STATUS',
      tagColor: 'text-emerald-600 bg-emerald-50/80 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30',
      visualText: pulseText,
      visualColor: pulseColor,
      visualBg: pulseBg
    });

    // 6. Project Velocity Badge
    const totalRepos = profile.public_repos || 0;
    let velTitle = 'Project Creator';
    let velDesc = `${totalRepos} public projects`;
    if (totalRepos > 30) {
      velTitle = 'Profound Author';
      velDesc = `${totalRepos} projects published`;
    }
    badges.push({
      id: 'velocity',
      title: velTitle,
      subtitle: velDesc,
      icon: FolderOpen,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30',
      gradient: 'from-indigo-50/40 via-white to-indigo-50/10 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/10 border-slate-200/60 dark:border-slate-800/80',
      tag: 'VOLUME',
      tagColor: 'text-indigo-600 bg-indigo-50/80 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30',
      visualVal: Math.min((totalRepos / 30) * 100, 100),
      visualText: totalRepos
    });

    return badges;
  };

  const storyBadges = getStoryBadges();

  // Aggregate contributions by Day of Week (ACT 4)
  const getDayOfWeekAggregation = () => {
    if (!contributions || contributions.length === 0) return [];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    contributions.forEach(day => {
      const dayOfWeek = new Date(day.date).getDay();
      counts[dayOfWeek] += day.count;
    });
    
    return dayNames.map((name, index) => ({
      day: name,
      count: counts[index]
    }));
  };

  const dayOfWeekData = getDayOfWeekAggregation();

  // Count up animation from 0 to designated displayPercentage in exactly 1 second (1000ms)
  useEffect(() => {
    if (loading || !data || displayPercentage === 0) return;

    setAnimatedPercentage(0);

    const duration = 1000; // 1 second total duration
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth decelerating ease-out curve for natural loading feel
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const currentVal = Math.round(easeOutQuad * displayPercentage);
      
      setAnimatedPercentage(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedPercentage(displayPercentage);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [displayPercentage, loading, data]);

  // Scale the pie data dynamically to expand from 0% to the designated coverage percentage in lockstep
  const scale = displayPercentage > 0 ? (animatedPercentage / displayPercentage) : 0;
  const activePieData = pieData.map(item => ({
    ...item,
    value: item.value * scale
  }));

  // If loading is true or data hasn't arrived, render the pulsing skeleton dashboard
  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  // Aggregate contributions dynamically for the last 6 months (makes the graph varied and adds labels)
  const getMonthlyAggregation = () => {
    if (!contributions || contributions.length === 0) return [];
    
    const monthlyMap = {};
    const monthsToInclude = [];
    
    // Generate the last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      monthsToInclude.push(monthLabel);
      monthlyMap[monthLabel] = 0;
    }

    contributions.forEach(day => {
      const dateObj = new Date(day.date);
      const monthLabel = dateObj.toLocaleString('en-US', { month: 'short' });
      if (monthlyMap[monthLabel] !== undefined) {
        monthlyMap[monthLabel] += day.count;
      }
    });

    return monthsToInclude.map(month => ({
      month,
      count: monthlyMap[month]
    }));
  };

  const monthlyChartData = getMonthlyAggregation();

  const handleCopyLink = () => {
    const usernameHandle = profile.profile_url?.split('/').pop() || '';
    navigator.clipboard.writeText(window.location.origin + `?user=${usernameHandle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 1000);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num;
  };

  const totalStars = repositories?.reduce((sum, repo) => sum + repo.stars, 0) || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50/20 via-slate-50 to-blue-50/20 py-8 px-4 md:px-8">
      {/* Custom print-only top header */}
      <div className="print-only-header">
        <span>{new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
        <span>GitPulse Analytics | Visualize Your GitHub Journey</span>
      </div>

      {/* Wrapping Layout Table for Multi-Page Print Header Spacing */}
      <table className="w-full border-none border-collapse p-0 m-0">
        <thead className="hidden print:table-header-group">
          <tr>
            <td className="p-0 border-none">
              {/* Top spacer acting as margin buffer to prevent overlap */}
              <div className="h-[25mm]" />
            </td>
          </tr>
        </thead>
        <tbody className="w-full">
          <tr>
            <td className="p-0 border-none print-content-cell">
              <div className="max-w-7xl mx-auto space-y-8">

        {/* Back navigation/Search header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
          <div className="text-sm text-slate-500 font-medium">
            Analyze another profile?{' '}
            <button 
              onClick={onNewSearch}
              className="text-blue-600 font-semibold hover:underline"
            >
              Search Username
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Live Developer Profile Analytics Active
          </div>
        </div>

        {/* Upper Grid: Profile, Total Contributions, Top Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: User Profile */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between lg:col-span-4">
            <div className="space-y-5 text-center sm:text-left flex flex-col items-center sm:items-start">
              <div className="relative">
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full border-2 border-slate-100 shadow-md object-cover"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.name}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.color}`}>
                    ● {statusBadge.text}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  @{profile.profile_url?.split('/').pop() || ''} • Full Stack Developer
                </p>
                {profile.bio && (
                  <p className="text-sm text-slate-600 leading-relaxed max-w-sm pt-1">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6 pt-2 w-full text-center border-t border-slate-100 mt-2">
                <div>
                  <div className="text-lg font-bold text-slate-900">{profile.public_repos}</div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Repos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{formatNumber(profile.followers)}</div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Followers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{formatNumber(totalStars)}</div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Stars</div>
                </div>
              </div>
            </div>

            <div className="pt-6 w-full no-print">
              <a
                href={profile.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-600/10 text-sm"
              >
                Follow Profile
              </a>
            </div>
          </div>

          {/* Card 2: Total Contributions (Animated Monthly Bar Chart) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Contributions</div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {stats?.total_contributions?.toLocaleString() || '0'}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  contributions this year
                </span>
              </div>
            </div>

            {/* Sparkline column chart with Month Labels */}
            <div className="h-32 pt-6 w-full flex items-end sparkline-container">
              {monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ bottom: 0, left: 5, right: 5 }}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59,130,246,0.05)' }} 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 11 }} 
                      formatter={(value) => [`${value} commits`, 'Contributions']}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#2563eb" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={true}
                      animationDuration={800} // Snappy 800ms loading entry animation
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-300 font-mono text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  No Graph Data
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Top Languages Donut (Animated Entry + Count-up percentage) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              Top Languages
            </div>

            <div className="grid grid-cols-12 items-center gap-2 h-full">
              {/* Donut Chart with dynamic count-up percentage */}
              <div className="col-span-6 relative flex items-center justify-center h-32 pie-chart-container">
                {activePieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                          isAnimationActive={false} // Disable Recharts default animation to let our requestAnimationFrame loop drive it
                          onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                          onMouseLeave={() => setHoveredPieIndex(null)}
                        >
                          {pieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              opacity={hoveredPieIndex === null || hoveredPieIndex === index ? 1 : 0.4}
                              style={{ transition: 'opacity 0.25s ease', cursor: 'pointer' }}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Text overlay center of donut (Counts up!) */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col pt-1 pointer-events-none select-none">
                      <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-none">
                        {hoveredPieIndex !== null ? `${pieData[hoveredPieIndex].value}%` : `${animatedPercentage}%`}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-300 font-mono text-[10px]">No languages data</div>
                )}
              </div>

              {/* Legends list */}
              <div className="col-span-6 space-y-1.5 pl-2 select-none">
                {pieData.map((item, index) => {
                  const isHovered = hoveredPieIndex === index;
                  return (
                    <div 
                      key={item.name} 
                      onMouseEnter={() => setHoveredPieIndex(index)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                      className={`flex items-center justify-between text-xs font-semibold px-2 py-1 -mx-2 rounded-lg transition-all cursor-pointer ${
                        isHovered 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.02]' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                        />
                        <span className="truncate max-w-[65px]">{item.name}</span>
                      </div>
                      <span className={isHovered ? 'text-blue-700 dark:text-blue-300 font-extrabold' : 'text-slate-800 dark:text-slate-300'}>
                        {item.value}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation Menu */}
        <div className="border-b border-slate-200 flex gap-2 overflow-x-auto scrollbar-none no-print">
          {[
            { id: 'contributions', name: 'Contributions', icon: Calendar },
            { id: 'languages', name: 'Languages', icon: Code },
            { id: 'repositories', name: 'Repositories', icon: FolderOpen },
            { id: 'activity', name: 'Activity', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Contents Panels */}
        <div className="transition-all duration-300">
          
          {/* View A: Contributions */}
          {activeTab === 'contributions' && (
            <div className="space-y-8">
              
              {/* Developer Pulse Story Card (Visualized!) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-6">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm select-none">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>DEVELOPER STORY & ACHIEVEMENTS</span>
                </div>
                
                {/* 3x2 Grid of Visual Infographic Achievement Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {storyBadges.map((badge) => {
                    const IconComponent = badge.icon;
                    return (
                      <div 
                        key={badge.id}
                        className={`flex flex-col justify-between p-5 rounded-2xl border bg-gradient-to-br ${badge.gradient} hover:scale-[1.02] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group cursor-default`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 truncate">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${badge.color}`}>
                              <IconComponent className="w-5 h-5 stroke-[1.8]" />
                            </div>
                            <div className="space-y-0.5 truncate">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{badge.title}</h4>
                              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-none">{badge.subtitle}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border tracking-wider select-none ${badge.tagColor}`}>
                            {badge.tag}
                          </span>
                        </div>
                        
                        {/* Visual Indicators (ACT 1-6 Specific Visualizations) */}
                        <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/40">
                          {badge.id === 'archetype' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                <span>Stack Focus</span>
                                <span className="text-slate-600 dark:text-slate-400">{badge.visualVal}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${badge.visualVal}%` }} />
                              </div>
                            </div>
                          )}

                          {badge.id === 'productivity' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                <span>Streak / Output</span>
                                <span className="text-slate-600 dark:text-slate-400">{badge.visualText}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${badge.visualVal}%` }} />
                              </div>
                            </div>
                          )}

                          {badge.id === 'schedule' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                <span>Weekday / Weekend Split</span>
                                <span className="text-slate-600 dark:text-slate-400">{Math.round(badge.visualVal)}% Weekday</span>
                              </div>
                              <div className="h-1.5 w-full bg-purple-100 dark:bg-purple-950/20 rounded-full overflow-hidden flex">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${badge.visualVal}%` }} />
                                <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${100 - badge.visualVal}%` }} />
                              </div>
                            </div>
                          )}

                          {badge.id === 'impact' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                <span>Community Trust</span>
                                <span className="text-slate-600 dark:text-slate-400">{badge.visualText}</span>
                              </div>
                              <div className="flex gap-0.5 text-amber-400 dark:text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${i < badge.visualVal ? 'fill-amber-400 dark:fill-amber-500' : 'text-slate-200 dark:text-slate-800'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {badge.id === 'momentum' && (
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                              <span>Momentum Check</span>
                              <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.visualColor}`} />
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.visualBg}`} />
                                </span>
                                <span className="text-slate-600 dark:text-slate-400">{badge.visualText}</span>
                              </div>
                            </div>
                          )}

                          {badge.id === 'velocity' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                <span>Project Count Strength</span>
                                <span className="text-slate-600 dark:text-slate-400">{badge.visualText} Repos</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${badge.visualVal}%` }} />
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Heatmap Grid Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Contribution Activity</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 select-none">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-[1px] border border-slate-200/50 dark:border-slate-700/50" />
                    <span className="w-2.5 h-2.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-[1px]" />
                    <span className="w-2.5 h-2.5 bg-emerald-300 dark:bg-emerald-800/40 rounded-[1px]" />
                    <span className="w-2.5 h-2.5 bg-emerald-500 dark:bg-emerald-600/40 rounded-[1px]" />
                    <span className="w-2.5 h-2.5 bg-emerald-700 dark:bg-emerald-400/40 rounded-[1px]" />
                    <span>More</span>
                  </div>
                </div>

                <HeatmapGrid contributions={contributions || []} />

                <div className="flex gap-10 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-sm font-semibold">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-bold mr-2 uppercase text-[10px] tracking-wider">Longest Streak:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{stats?.longest_streak || 0} days</span>
                  </div>
                  <div>
                    <span className="text-blue-500 dark:text-blue-400 font-bold mr-2 uppercase text-[10px] tracking-wider">Current Streak:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{stats?.current_streak || 0} days</span>
                  </div>
                </div>
              </div>

              {/* Day of Week Commit Activity Chart Card (ACT 4) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Weekly Coding Patterns</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">See which days of the week this developer writes code most often.</p>
                </div>
                <div className="h-48 w-full pt-2 weekly-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekData} margin={{ bottom: 5, left: 0, right: 0 }}>
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(59,130,246,0.05)' }} 
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 11 }} 
                        formatter={(value) => [`${value} contributions`, 'Activity']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={800}
                      >
                        {dayOfWeekData.map((entry, index) => {
                          const isWeekend = entry.day === 'Sat' || entry.day === 'Sun';
                          return <Cell key={`cell-${index}`} fill={isWeekend ? '#8b5cf6' : '#3b82f6'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Columns: Top Repositories Left, Recent Activity Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Column 1: Top Repos */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Top Repositories</h3>
                  
                  <div className="space-y-4">
                    {repositories && repositories.length > 0 ? (
                      repositories.slice(0, 3).map(repo => (
                        <div key={repo.name} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-blue-600 hover:underline text-base flex items-center gap-1"
                              >
                                {repo.name}
                                <ExternalLink className="w-3.5 h-3.5 stroke-[2] opacity-70" />
                              </a>
                              <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded-full px-2.5 py-0.5 bg-slate-50 uppercase tracking-wider">
                                Public
                              </span>
                            </div>
                            
                            {repo.description && (
                              <p className="text-slate-600 text-sm leading-relaxed max-w-xl">
                                {repo.description}
                              </p>
                            )}

                            <div className="flex items-center gap-5 text-xs font-semibold text-slate-500 pt-1">
                              {repo.language && (
                                <div className="flex items-center gap-1.5">
                                  <span 
                                    className="w-3 h-3 rounded-full border border-black/5" 
                                    style={{ backgroundColor: repo.language_color || '#3b82f6' }} 
                                  />
                                  <span>{repo.language}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-slate-400 stroke-[1.8]" />
                                <span>{repo.stars}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GitBranch className="w-4 h-4 text-slate-400 stroke-[1.8]" />
                                <span>{repo.forks}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Updated {new Date(repo.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <button className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors shrink-0">
                            <Star className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 bg-white border border-slate-200/80 rounded-2xl text-slate-400 font-semibold text-sm border-dashed">
                        No public repositories found
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Recent Activity Timeline */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Recent Activity</h3>
                  
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6">
                    <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      
                      {activity && activity.length > 0 ? (
                        activity.slice(0, 3).map((item) => {
                          let Icon = GitCommit;
                          let iconColor = 'text-blue-500 bg-blue-50 border-blue-100';
                          
                          if (item.type === 'PullRequestEvent') {
                            Icon = GitPullRequest;
                            iconColor = 'text-emerald-500 bg-emerald-50 border-emerald-100';
                          } else if (item.type === 'WatchEvent') {
                            Icon = Star;
                            iconColor = 'text-amber-500 bg-amber-50 border-amber-100';
                          }

                          return (
                            <div key={item.id} className="flex gap-4 relative">
                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 ${iconColor}`}>
                                <Icon className="w-3.5 h-3.5 stroke-[2]" />
                              </div>
                              
                              <div className="space-y-1.5 flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {item.description}
                                  </p>
                                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                    {new Date(item.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {item.detail && (
                                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 font-mono text-[11px] text-slate-600 break-words leading-normal max-w-full">
                                    {item.detail}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-slate-400 font-semibold text-xs">
                          No recent public activity logs
                        </div>
                      )}

                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button className="w-full py-2.5 text-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-slate-50 rounded-xl transition-all">
                        View Full Activity
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* View B: Languages Tab */}
          {activeTab === 'languages' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 text-lg">Language Statistics</h3>
              <p className="text-sm text-slate-500">Language distribution calculated by total byte counts across all public repositories.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{item.name}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${item.value}%`,
                            backgroundColor: COLORS[index % COLORS.length] 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="text-center space-y-2">
                    <Code className="w-8 h-8 text-blue-500 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">Primary Language Focus</h4>
                    <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                      You write mostly in <span className="font-bold text-slate-700">{pieData[0]?.name || 'N/A'}</span>, which makes up {pieData[0]?.value || 0}% of your codebase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View C: Repositories Tab */}
          {activeTab === 'repositories' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-lg">All Repositories</h3>
                <span className="text-xs font-semibold text-slate-500">{repositories?.length || 0} Total Repositories</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Repository</th>
                      <th className="px-6 py-4">Stars</th>
                      <th className="px-6 py-4">Forks</th>
                      <th className="px-6 py-4">Language</th>
                      <th className="px-6 py-4">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repositories?.map(repo => (
                      <tr key={repo.name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700">
                        <td className="px-6 py-4">
                          <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {repo.name}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-slate-900">⭐ {repo.stars}</td>
                        <td className="px-6 py-4">{repo.forks}</td>
                        <td className="px-6 py-4">{repo.language || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-400 font-normal">
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View D: Activity Timeline Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 text-lg">Full Event Timeline</h3>
              
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {activity?.map((item) => {
                  let Icon = GitCommit;
                  let iconColor = 'text-blue-500 bg-blue-50 border-blue-100';
                  
                  if (item.type === 'PullRequestEvent') {
                    Icon = GitPullRequest;
                    iconColor = 'text-emerald-500 bg-emerald-50 border-emerald-100';
                  } else if (item.type === 'WatchEvent') {
                    Icon = Star;
                    iconColor = 'text-amber-500 bg-amber-50 border-amber-100';
                  }

                  return (
                    <div key={item.id} className="flex gap-4 relative">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 ${iconColor}`}>
                        <Icon className="w-3.5 h-3.5 stroke-[2]" />
                      </div>
                      
                      <div className="space-y-1 flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-slate-800">{item.description}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        {item.detail && (
                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 font-mono text-[11px] text-slate-600 max-w-full">
                            {item.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Footer */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 no-print">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-extrabold text-slate-900 text-base">Share your pulse</h4>
            <p className="text-slate-500 text-xs font-medium">
              Generate a public link or embed code for your portfolio.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 md:flex-none py-3 px-5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex-1 md:flex-none py-3 px-5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 transition-colors active:scale-[0.98] disabled:bg-slate-300"
            >
              <FileDown className="w-4 h-4 text-blue-200" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>

              </div>
            </td>
          </tr>
        </tbody>
        <tfoot className="hidden print:table-footer-group">
          <tr>
            <td className="p-0 border-none">
              <div className="h-[15mm]" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
