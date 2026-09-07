import React, { useState } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Edit3, 
  Sparkles,
  BookOpen,
  GraduationCap,
  Moon,
  Activity,
  Cpu,
  Heart,
  Wallet
} from 'lucide-react';
import { WeeklyTarget, TaskCategory, TaskItem } from '../types';
import { getWeekRange, formatFriendlyDate, parseDateFromKey, formatDateToKey } from '../utils/dateUtils';

interface WeeklyViewProps {
  currentDateKey: string;
  weeklyTargets: WeeklyTarget[];
  onUpdateWeeklyTargets: (targets: WeeklyTarget[]) => void;
  allTasks: Record<string, TaskItem[]>;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  currentDateKey,
  weeklyTargets,
  onUpdateWeeklyTargets,
  allTasks
}) => {
  const [selectedWeekAnchor, setSelectedWeekAnchor] = useState(currentDateKey);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const weekInfo = getWeekRange(selectedWeekAnchor);

  // Calculate actual completion for this week's 7 days
  const weekTasks = weekInfo.dates.flatMap(d => allTasks[d] || []);

  const getCompletedCountForTarget = (target: WeeklyTarget): number => {
    switch (target.id) {
      case 'wt-prayers':
        // 5 prayers per day if completed
        return weekTasks.filter(t => t.category === 'religion' && t.id.includes('prayers') && t.completed).length * 5;
      case 'wt-adhkar':
        return weekTasks.filter(t => t.category === 'religion' && t.id.includes('adhkar') && t.completed).length;
      case 'wt-quran':
        return weekTasks.filter(t => t.category === 'religion' && t.id.includes('quran') && t.completed).length;
      case 'wt-acad-days': {
        // Distinct days where an academic task was completed
        const acadDays = new Set(weekTasks.filter(t => t.category === 'academics' && t.completed).map(t => t.date));
        return acadDays.size;
      }
      case 'wt-acad-main':
        return weekTasks.filter(t => t.category === 'academics' && t.name.includes('Main') && t.completed).length;
      case 'wt-acad-practice':
        return weekTasks.filter(t => t.category === 'academics' && t.name.includes('Practice') && t.completed).length;
      case 'wt-sat':
        return weekTasks.filter(t => t.category === 'sat' && t.completed).length;
      case 'wt-data-analysis':
        return weekTasks.filter(t => t.category === 'projects_skills' && t.name.includes('Data Analysis') && t.completed).length;
      case 'wt-ai-automation':
        return weekTasks.filter(t => t.category === 'projects_skills' && t.name.includes('AI Automation') && t.completed).length;
      case 'wt-research':
        return weekTasks.filter(t => t.category === 'research' && t.completed).length;
      case 'wt-gym':
        return weekTasks.filter(t => t.category === 'health' && t.name.includes('Gym') && t.completed).length;
      case 'wt-meditation':
        return weekTasks.filter(t => t.category === 'wellbeing' && t.name.includes('Meditation') && t.completed).length;
      case 'wt-journaling':
        return weekTasks.filter(t => t.category === 'wellbeing' && t.name.includes('Journaling') && t.completed).length;
      case 'wt-podcasts':
        return weekTasks.filter(t => t.category === 'wellbeing' && t.name.includes('Podcast') && t.completed).length;
      default:
        return weekTasks.filter(t => t.category === target.category && t.completed).length;
    }
  };

  const handlePrevWeek = () => {
    const d = parseDateFromKey(selectedWeekAnchor);
    d.setDate(d.getDate() - 7);
    setSelectedWeekAnchor(formatDateToKey(d));
  };

  const handleNextWeek = () => {
    const d = parseDateFromKey(selectedWeekAnchor);
    d.setDate(d.getDate() + 7);
    setSelectedWeekAnchor(formatDateToKey(d));
  };

  const handleCurrentWeek = () => {
    setSelectedWeekAnchor(currentDateKey);
  };

  const handleSaveTargetEdit = (targetId: string) => {
    const updated = weeklyTargets.map(t => {
      if (t.id === targetId) {
        return { ...t, targetCount: editValue };
      }
      return t;
    });
    onUpdateWeeklyTargets(updated);
    setEditingTargetId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Week Range Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Weekly System & Targets</h2>
          <p className="text-xs text-slate-500">
            Gentle progress towards your weekly anchors • Preserves historical weeks
          </p>
        </div>

        {/* Week Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center clay-card-subtle px-2 py-1 rounded-2xl">
            <button
              onClick={handlePrevWeek}
              className="p-1 hover:bg-slate-200/60 rounded-xl text-slate-600"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-slate-800 px-3">
              {formatFriendlyDate(weekInfo.startKey)} – {formatFriendlyDate(weekInfo.endKey)}
            </span>

            <button
              onClick={handleNextWeek}
              className="p-1 hover:bg-slate-200/60 rounded-xl text-slate-600"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCurrentWeek}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            This Week
          </button>
        </div>
      </div>

      {/* Target Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {weeklyTargets.map((target) => {
          const currentCount = getCompletedCountForTarget(target);
          const percentage = Math.min(100, Math.round((currentCount / target.targetCount) * 100));
          const isComplete = currentCount >= target.targetCount;
          const isEditing = editingTargetId === target.id;

          return (
            <div key={target.id} className="clay-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {target.category.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">{target.title}</h4>
                  </div>

                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleSaveTargetEdit(target.id);
                      } else {
                        setEditingTargetId(target.id);
                        setEditValue(target.targetCount);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Customize target count"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {target.subtext && (
                  <p className="text-[11px] text-slate-500 mt-1">{target.subtext}</p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {currentCount} / {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="w-12 clay-inset px-1 py-0.5 text-center text-xs font-bold text-blue-600 rounded-lg outline-none"
                      />
                    ) : (
                      target.targetCount
                    )} {target.unit}
                  </span>
                  <span className={`font-bold ${isComplete ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    {isComplete ? 'Target achieved calmly' : `${target.targetCount - currentCount} ${target.unit} remaining`}
                  </span>
                  {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Schedule Reference Overview */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-800">Weekly Rhythm Context (Non-Obligatory)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="clay-card-subtle p-3.5 rounded-2xl space-y-1">
            <span className="font-bold text-indigo-700 block">SAT Sessions</span>
            <p className="text-slate-600">Tuesday, Friday, Saturday</p>
            <p className="text-[11px] text-slate-400">1–2 hrs • 3 sessions/week</p>
          </div>

          <div className="clay-card-subtle p-3.5 rounded-2xl space-y-1">
            <span className="font-bold text-purple-700 block">Data Analysis</span>
            <p className="text-slate-600">Friday & Saturday</p>
            <p className="text-[11px] text-slate-400">3–4 hours estimated weekly</p>
          </div>

          <div className="clay-card-subtle p-3.5 rounded-2xl space-y-1">
            <span className="font-bold text-blue-700 block">AI Automation</span>
            <p className="text-slate-600">Sunday through Thursday</p>
            <p className="text-[11px] text-slate-400">1 hour per day (5 sessions)</p>
          </div>

          <div className="clay-card-subtle p-3.5 rounded-2xl space-y-1">
            <span className="font-bold text-teal-700 block">Gym Workouts</span>
            <p className="text-slate-600">Friday, Saturday, Monday, Wednesday</p>
            <p className="text-[11px] text-slate-400">~2 hours • 4 sessions</p>
          </div>
        </div>
      </div>

    </div>
  );
};
