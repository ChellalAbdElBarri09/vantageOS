import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Moon, 
  CalendarDays, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Cpu, 
  Sparkles,
  ArrowRight,
  Sun
} from 'lucide-react';
import { TaskItem, GoalItem, SleepRecord, WeeklyTarget, ActiveView, FinanceEntry, HabitItem } from '../types';
import { formatFriendlyDate, getWeekRange } from '../utils/dateUtils';

interface DashboardViewProps {
  currentDateKey: string;
  tasks: TaskItem[];
  goals: GoalItem[];
  sleepRecords: SleepRecord[];
  weeklyTargets: WeeklyTarget[];
  onNavigate: (view: ActiveView) => void;
  quranPagesTotal: number;
  readingTotal?: number;
  financeEntries?: FinanceEntry[];
  allTasks?: Record<string, TaskItem[]>;
  habits?: HabitItem[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentDateKey,
  tasks,
  goals,
  sleepRecords,
  weeklyTargets,
  onNavigate,
  quranPagesTotal,
  readingTotal = 0,
  financeEntries = [],
  allTasks = {},
  habits = []
}) => {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const remainingTasks = totalTasks - completedTasks;

  // Sleep summary calculations
  const lastSleep = sleepRecords.length > 0 ? `${sleepRecords[sleepRecords.length - 1].durationHours} hrs` : '--';
  const weeklySleepAvg = sleepRecords.length > 0 
    ? (sleepRecords.slice(-7).reduce((sum, r) => sum + r.durationHours, 0) / Math.min(sleepRecords.length, 7)).toFixed(1)
    : '0.0';
  const monthlySleepAvg = sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, r) => sum + r.durationHours, 0) / sleepRecords.length).toFixed(1)
    : '0.0';

  // Weekly snapshot calculations from actual week
  const weekInfo = getWeekRange(currentDateKey);
  const weekTasks = weekInfo.dates.flatMap(d => allTasks[d] || []);
  const totalWeekTasks = weekTasks.length;
  const completedWeekTasks = weekTasks.filter(t => t.completed).length;
  const weeklyCompletionRate = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0;

  const satCompletedThisWeek = weekTasks.filter(t => t.category === 'sat' && t.completed).length;
  const gymCompletedThisWeek = weekTasks.filter(t => t.category === 'health' && t.name.includes('Gym') && t.completed).length;

  // Habit consistency this week
  const totalHabitChecks = habits.length * 7;
  const completedHabitChecks = habits.reduce((sum, h) => {
    return sum + h.completedDates.filter(d => weekInfo.dates.includes(d)).length;
  }, 0);
  const habitConsistencyPct = totalHabitChecks > 0 ? Math.round((completedHabitChecks / totalHabitChecks) * 100) : 0;

  // Finance calculations
  const totalEarned = financeEntries.reduce((sum, f) => sum + f.earned, 0);
  const totalSaved = financeEntries.reduce((sum, f) => sum + f.saved, 0);
  const actualSavingsPercentage = totalEarned > 0 ? Math.round((totalSaved / totalEarned) * 100) : 0;

  // Gentle non-judgmental intelligent insight
  let insightTone = {
    color: 'emerald',
    icon: '🟢',
    title: "You're progressing steadily.",
    message: "Your rhythm across study, health, and personal routines is balanced and calm."
  };

  if (completedTasks === 0) {
    insightTone = {
      color: 'blue',
      icon: '✨',
      title: "Welcome to Day 1 — your fresh beginning.",
      message: "September 8th is your anchor. Approach your goals with tranquility and focus on one block at a time."
    };
  } else if (completionPercentage < 40 && new Date().getHours() > 18) {
    insightTone = {
      color: 'amber',
      icon: '🟡',
      title: "You're moving at your own pace, and there is still room to adjust.",
      message: "Focus on what matters most for tonight — no pressure to finish everything."
    };
  } else if (completionPercentage >= 65) {
    insightTone = {
      color: 'blue',
      icon: '🔵',
      title: "Your consistency is solid today.",
      message: "You have completed your primary anchor blocks with great presence."
    };
  }

  // Circular progress dimensions
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Gentle Insight Banner */}
      <div 
        id="gentle-progress-insight"
        className="clay-card p-5 sm:p-6 bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40 border-l-4 border-blue-500 flex items-start gap-4"
      >
        <div className="text-2xl pt-0.5">{insightTone.icon}</div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-800 tracking-tight">
            {insightTone.title}
          </h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {insightTone.message}
          </p>
        </div>
      </div>

      {/* Top Grid: Today Overview & Sleep Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today Overview Card (Takes 2 cols on lg) */}
        <div className="lg:col-span-2 clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <Sun className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                Today Overview
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {formatFriendlyDate(currentDateKey)}
            </h2>

            <p className="text-sm text-slate-600 font-medium">
              «{completedTasks} / {totalTasks} completed • {completionPercentage}% Daily Progress»
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
              <div className="clay-card-subtle px-4 py-2 rounded-2xl">
                <div className="text-xs text-slate-400">Completed</div>
                <div className="text-lg font-bold text-emerald-600">{completedTasks}</div>
              </div>
              <div className="clay-card-subtle px-4 py-2 rounded-2xl">
                <div className="text-xs text-slate-400">Remaining</div>
                <div className="text-lg font-bold text-slate-700">{remainingTasks}</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-dash-open-daily"
                onClick={() => onNavigate('daily')}
                className="clay-button inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>Open Daily Checklist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-blue-600 transition-all duration-700 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800">{completionPercentage}%</span>
              <span className="text-[11px] text-slate-500 font-medium">Progress</span>
            </div>
          </div>
        </div>

        {/* Sleep Summary Card */}
        <div className="clay-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Moon className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-800">Sleep Summary</h3>
            </div>
            <button
              onClick={() => onNavigate('sleep')}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Details
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between p-3 rounded-2xl bg-indigo-50/50">
              <span className="text-xs text-slate-600 font-medium">Last Recorded Sleep</span>
              <span className="text-xl font-bold text-indigo-900">{lastSleep}</span>
            </div>

            <div className="flex items-center justify-between text-xs px-1 text-slate-600">
              <span>Weekly Average:</span>
              <span className="font-semibold text-slate-800">{weeklySleepAvg} hrs/night</span>
            </div>

            <div className="flex items-center justify-between text-xs px-1 text-slate-600">
              <span>Monthly Average:</span>
              <span className="font-semibold text-slate-800">{monthlySleepAvg} hrs/night</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Calm sleep rhythm maintains peak academic and physical recovery.
          </p>
        </div>
      </div>

      {/* Goal Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Monthly Goals Overview</h3>
              <p className="text-xs text-slate-500">Steady progression across your core anchors</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('goals')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View All Goals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Quran Progress */}
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Quran Khatma</span>
              <span className="text-xs text-blue-600 font-semibold">{quranPagesTotal} / 604 p.</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((quranPagesTotal / 604) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">4 pages after each prayer • 604 total pages</p>
          </div>

          {/* SAT Progress */}
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">SAT Foundation</span>
              <span className="text-xs text-indigo-600 font-semibold">{satCompletedThisWeek} / 3 Sessions</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((satCompletedThisWeek / 3) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Tuesday, Friday, Saturday (1–2 hrs)</p>
          </div>

          {/* Data Analysis & AI Automation */}
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Skills & Automation</span>
              <span className="text-xs text-purple-600 font-semibold">Active Cycle</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${weeklyCompletionRate}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Data Analysis (Fri/Sat) • AI Automation (Sun-Thu)</p>
          </div>

          {/* Reading Progress */}
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Monthly Reading</span>
              <span className="text-xs text-amber-600 font-semibold">{readingTotal} / 300 p.</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((readingTotal / 300) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Target: 150 Arabic pages • 150 English pages</p>
          </div>

          {/* Academic & BAC */}
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Academic & BAC Prep</span>
              <span className="text-xs text-blue-600 font-semibold">Period 1 Prep</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${weeklyCompletionRate}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">2–3 subjects focus • Pre-school prep by Sep 20</p>
          </div>

          {/* Finance & Savings */}
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Savings Target (90%)</span>
              <span className="text-xs text-emerald-600 font-semibold">{actualSavingsPercentage}% Saved</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, actualSavingsPercentage)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">${totalSaved} saved of ${totalEarned} earned</p>
          </div>
        </div>
      </div>

      {/* Weekly Snapshot Section */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <CalendarDays className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Weekly Snapshot</h3>
              <p className="text-xs text-slate-500">Current rhythm and target balance</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('weekly')}
            className="clay-button px-3 py-1.5 text-xs font-semibold text-blue-700"
          >
            Weekly Targets
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="clay-card-subtle p-4 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium">Weekly Completion</span>
            <div className="text-xl font-bold text-blue-700 mt-1">{weeklyCompletionRate}%</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Real-time pacing</span>
          </div>

          <div className="clay-card-subtle p-4 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium">Habit Consistency</span>
            <div className="text-xl font-bold text-indigo-700 mt-1">{habitConsistencyPct}%</div>
            <span className="text-[10px] text-slate-400 font-medium">7 daily anchors</span>
          </div>

          <div className="clay-card-subtle p-4 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium">SAT Sessions</span>
            <div className="text-xl font-bold text-purple-700 mt-1">{satCompletedThisWeek} / 3</div>
            <span className="text-[10px] text-purple-600 font-medium">{Math.max(0, 3 - satCompletedThisWeek)} remaining</span>
          </div>

          <div className="clay-card-subtle p-4 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium">Gym Workouts</span>
            <div className="text-xl font-bold text-teal-700 mt-1">{gymCompletedThisWeek} / 4</div>
            <span className="text-[10px] text-teal-600 font-medium">{Math.max(0, 4 - gymCompletedThisWeek)} remaining</span>
          </div>
        </div>
      </div>
    </div>
  );
};
