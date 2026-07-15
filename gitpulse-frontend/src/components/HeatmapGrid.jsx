import React from 'react';

export default function HeatmapGrid({ contributions }) {
  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 10) return 3;
    return 4;
  };

  const getBgColor = (level) => {
    switch (level) {
      case 0: return 'bg-slate-100 border border-slate-200/50';
      case 1: return 'bg-emerald-100 border border-emerald-200/30';
      case 2: return 'bg-emerald-300 border border-emerald-400/30';
      case 3: return 'bg-emerald-500 border border-emerald-600/30';
      case 4: return 'bg-emerald-700 border border-emerald-800/30';
      default: return 'bg-slate-100';
    }
  };

  // Group the contributions (365 days) into 53 weeks
  const weeks = [];
  let currentWeek = [];

  contributions.forEach((day) => {
    const dayOfWeek = new Date(day.date).getDay(); // 0 is Sunday, 6 is Saturday
    
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentWeek.push(day);
  });
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Ensure first week is padded
  const firstWeek = weeks[0];
  if (firstWeek && firstWeek.length < 7) {
    const firstDate = new Date(firstWeek[0].date);
    const dayOfWeek = firstDate.getDay();
    const padding = Array(dayOfWeek).fill(null);
    weeks[0] = [...padding, ...firstWeek];
  }

  // Ensure last week is padded
  const lastWeek = weeks[weeks.length - 1];
  if (lastWeek && lastWeek.length < 7) {
    const padding = Array(7 - lastWeek.length).fill(null);
    weeks[weeks.length - 1] = [...lastWeek, ...padding];
  }

  // Month labels position mapping
  const monthLabels = [];
  let prevMonth = -1;
  
  weeks.forEach((week, weekIndex) => {
    const validDay = week.find(day => day !== null);
    if (validDay) {
      const dateObj = new Date(validDay.date);
      const month = dateObj.getMonth();
      if (month !== prevMonth) {
        monthLabels.push({ 
          label: dateObj.toLocaleString('en-US', { month: 'short' }), 
          weekIndex 
        });
        prevMonth = month;
      }
    }
  });

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[780px] select-none pt-8 pb-2 px-1">
        {/* Month Labels */}
        <div className="relative h-5 text-[10px] text-slate-400 font-semibold ml-8 mb-1.5">
          {monthLabels.map((item, index) => (
            <span
              key={index}
              className="absolute"
              style={{ left: `${item.weekIndex * 13.9}px` }}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex gap-[3.5px]">
          {/* Day of Week Labels */}
          <div className="grid grid-rows-7 h-[104px] text-[9px] text-slate-400 font-semibold w-7 pr-1.5 justify-items-end select-none leading-none pt-1">
            <span className="row-start-2">Mon</span>
            <span className="row-start-4">Wed</span>
            <span className="row-start-6">Fri</span>
          </div>

          {/* Heatmap cells grouped by week */}
          <div className="flex gap-[3.5px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-rows-7 gap-[3.5px] h-[104px]">
                {week.map((day, dIdx) => {
                  if (!day) {
                    return <div key={dIdx} className="w-[11px] h-[11px] bg-transparent" />;
                  }
                  
                  const level = getLevel(day.count);
                  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={dIdx}
                      className={`w-[11px] h-[11px] rounded-[1.5px] transition-all duration-150 cursor-pointer ${getBgColor(level)} hover:scale-125 hover:z-50 relative group`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 bg-slate-900/95 text-slate-100 text-[10px] py-1.5 px-2 rounded-lg font-medium shadow-xl whitespace-nowrap transition-opacity pointer-events-none">
                        <span className="font-bold text-white">{day.count === 0 ? 'No' : day.count} contributions</span> on {formattedDate}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
