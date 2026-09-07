import React, { useState } from 'react';
import { 
  Flame, 
  Check, 
  Sparkles, 
  Calendar, 
  Clock, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { HabitItem } from '../types';
import { getWeekRange, formatFriendlyDate, parseDateFromKey } from '../utils/dateUtils';

interface HabitsViewProps {
  currentDateKey: string;
  habits: HabitItem[];
  onUpdateHabits: (habits: HabitItem[]) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  currentDateKey,
  habits,
  onUpdateHabits
}) => {
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'specific-days'>('all');
  const weekInfo = getWeekRange(currentDateKey);

  const handleToggleHabitDay = (habitId: string, dateKey: string) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const exists = h.completedDates.includes(dateKey);
        const newDates = exists 
          ? h.completedDates.filter(d => d !== dateKey)
          : [...h.completedDates, dateKey];
        return { ...h, completedDates: newDates };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    // Calculate recent consecutive days
    const sorted = [...completedDates].sort().reverse();
    let streak = 0;
    let checkDate = parseDateFromKey(currentDateKey);

    for (let i = 0; i < 30; i++) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;

      if (sorted.includes(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today is not done yet, don't break immediately on index 0
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const filteredHabits = habits.filter(h => {
    if (filterType === 'all') return true;
    return h.frequencyType === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Gentle Philosophy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Habit System</h2>
          <p className="text-xs text-slate-500">
            Streaks are purely informative and never used for pressure or shame
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              filterType === 'all' ? 'clay-pill-active' : 'clay-pill text-slate-600'
            }`}
          >
            All Habits
          </button>
          <button
            onClick={() => setFilterType('daily')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              filterType === 'daily' ? 'clay-pill-active' : 'clay-pill text-slate-600'
            }`}
          >
            Daily Anchors
          </button>
          <button
            onClick={() => setFilterType('specific-days')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              filterType === 'specific-days' ? 'clay-pill-active' : 'clay-pill text-slate-600'
            }`}
          >
            Specific Days
          </button>
        </div>
      </div>

      {/* Philosophy Callout */}
      <div className="clay-card-subtle p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-600 bg-blue-50/40 border border-blue-100">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p>
          Missing a day does not reset your genuine growth. Life has natural ebbs and flows. You can complete any day retroactively or leave it calmly uncompleted.
        </p>
      </div>

      {/* Habits Matrix Card */}
      <div className="clay-card p-6 overflow-x-auto">
        <div className="min-w-[620px]">
          
          {/* Table Header: Days of the Current Week */}
          <div className="grid grid-cols-12 gap-2 pb-4 border-b border-slate-100 items-center text-xs font-semibold text-slate-500">
            <div className="col-span-5">Habit & Frequency</div>
            <div className="col-span-5 grid grid-cols-7 text-center gap-1">
              {weekInfo.dates.map((dateKey) => {
                const date = parseDateFromKey(dateKey);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });
                const dayNum = date.getDate();
                const isToday = dateKey === currentDateKey;

                return (
                  <div key={dateKey} className={`p-1 rounded-xl ${isToday ? 'bg-blue-100/80 text-blue-800 font-bold' : ''}`}>
                    <div className="text-[10px] uppercase text-slate-400">{dayName}</div>
                    <div className="text-xs">{dayNum}</div>
                  </div>
                );
              })}
            </div>
            <div className="col-span-2 text-right pr-2">Rhythm</div>
          </div>

          {/* Habit Rows */}
          <div className="divide-y divide-slate-100">
            {filteredHabits.map((habit) => {
              const streak = calculateStreak(habit.completedDates);
              const weeklyCompletedInWeek = weekInfo.dates.filter(d => habit.completedDates.includes(d)).length;

              return (
                <div key={habit.id} className="grid grid-cols-12 gap-2 py-3.5 items-center hover:bg-slate-50/50 rounded-xl px-1">
                  
                  {/* Title & Frequency Label */}
                  <div className="col-span-5 pr-2">
                    <h4 className="text-xs font-bold text-slate-800">{habit.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{habit.daysLabel || 'Daily'}</span>
                  </div>

                  {/* 7-Day interactive check buttons */}
                  <div className="col-span-5 grid grid-cols-7 gap-1">
                    {weekInfo.dates.map((dKey) => {
                      const isDone = habit.completedDates.includes(dKey);
                      const isToday = dKey === currentDateKey;

                      return (
                        <button
                          key={dKey}
                          onClick={() => handleToggleHabitDay(habit.id, dKey)}
                          className={`h-8 rounded-xl flex items-center justify-center transition-all ${
                            isDone 
                              ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30' 
                              : isToday 
                              ? 'bg-blue-50 border border-blue-200 text-blue-400 hover:bg-blue-100'
                              : 'bg-slate-100/70 hover:bg-slate-200 text-transparent'
                          }`}
                          title={`${habit.title} on ${dKey}`}
                        >
                          {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Streak and Summary */}
                  <div className="col-span-2 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700">
                      <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                      <span>{streak} days</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{weeklyCompletedInWeek}/7 this week</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
};
