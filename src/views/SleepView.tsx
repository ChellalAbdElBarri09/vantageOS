import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { SleepRecord } from '../types';
import { calculateSleepDuration, getSeptemberPeriodInfo, formatFriendlyDate } from '../utils/dateUtils';

interface SleepViewProps {
  currentDateKey: string;
  sleepRecords: SleepRecord[];
  onSaveSleepRecord: (record: SleepRecord) => void;
}

export const SleepView: React.FC<SleepViewProps> = ({
  currentDateKey,
  sleepRecords,
  onSaveSleepRecord
}) => {
  const periodInfo = getSeptemberPeriodInfo(currentDateKey);

  // Find existing record for current date or provide default
  const existingRecord = sleepRecords.find(r => r.date === currentDateKey);
  const [sleepTime, setSleepTime] = useState(existingRecord ? existingRecord.sleepTime : periodInfo.sleepTime);
  const [wakeTime, setWakeTime] = useState(existingRecord ? existingRecord.wakeTime : periodInfo.wakeTime);
  const [justSaved, setJustSaved] = useState(false);

  const duration = calculateSleepDuration(sleepTime, wakeTime);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSleepRecord({
      id: existingRecord ? existingRecord.id : `sleep-${currentDateKey}`,
      date: currentDateKey,
      sleepTime,
      wakeTime,
      durationHours: duration
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  // Calculate stats
  const weeklyRecords = sleepRecords.slice(-7);
  const weeklyAvg = weeklyRecords.length > 0 
    ? (weeklyRecords.reduce((s, r) => s + r.durationHours, 0) / weeklyRecords.length).toFixed(1)
    : '0.0';

  const monthlyAvg = sleepRecords.length > 0
    ? (sleepRecords.reduce((s, r) => s + r.durationHours, 0) / sleepRecords.length).toFixed(1)
    : '0.0';

  // SVG Line Chart coordinates calculation
  // Map last 7 days of sleep records
  const chartPoints = weeklyRecords.map((r, i) => {
    const x = 40 + i * 70; // 7 days: 40 to 460
    // Height: min 5 hrs, max 11 hrs
    const clamped = Math.max(5, Math.min(11, r.durationHours));
    const y = 160 - ((clamped - 5) / 6) * 120; // y between 40 and 160
    return { x, y, duration: r.durationHours, date: r.date };
  });

  const pathD = chartPoints.length > 0 
    ? chartPoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '')
    : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sleep Tracker</h2>
        <p className="text-xs text-slate-500">
          Clean, minimal logging: only bedtime and wake time — no subjective interrogation
        </p>
      </div>

      {/* Main Input Card */}
      <div className="clay-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <form onSubmit={handleSave} className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Moon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Log Sleep for {formatFriendlyDate(currentDateKey)}
                </h3>
                <p className="text-xs text-slate-500">
                  Reference target for this period: Wake {periodInfo.wakeTime} / Sleep {periodInfo.sleepTime}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="clay-card-subtle p-3.5 rounded-2xl">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Time You Slept</span>
                </label>
                <input
                  type="time"
                  required
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full clay-inset px-3 py-2 text-sm font-bold text-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="clay-card-subtle p-3.5 rounded-2xl">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Time You Woke Up</span>
                </label>
                <input
                  type="time"
                  required
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full clay-inset px-3 py-2 text-sm font-bold text-slate-800 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-600">
                Calculated Duration: <strong className="text-indigo-700 text-sm font-extrabold">{duration} hours</strong>
                <span className="text-slate-400 block sm:inline sm:ml-2">(Crosses midnight automatically)</span>
              </div>

              <button
                type="submit"
                className="clay-button-primary px-5 py-2 text-xs font-semibold flex items-center gap-2"
              >
                {justSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : null}
                <span>{justSaved ? 'Saved Calmly' : 'Save Sleep Entry'}</span>
              </button>
            </div>
          </form>

          {/* Quick Metrics Display */}
          <div className="flex sm:flex-col gap-3 justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 shrink-0">
            <div className="clay-card-subtle px-4 py-3 rounded-2xl text-center min-w-[120px]">
              <span className="text-[11px] text-slate-400 font-medium">Daily Duration</span>
              <div className="text-xl font-bold text-indigo-900 mt-0.5">{duration} hrs</div>
            </div>
            <div className="clay-card-subtle px-4 py-3 rounded-2xl text-center min-w-[120px]">
              <span className="text-[11px] text-slate-400 font-medium">Weekly Average</span>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{weeklyAvg} hrs</div>
            </div>
            <div className="clay-card-subtle px-4 py-3 rounded-2xl text-center min-w-[120px]">
              <span className="text-[11px] text-slate-400 font-medium">Monthly Average</span>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{monthlyAvg} hrs</div>
            </div>
          </div>

        </div>
      </div>

      {/* Sleep Trend Line Chart */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">Recent Sleep Rhythm & Trend</h3>
          </div>
          <span className="text-xs text-slate-500">Last 7 recorded days</span>
        </div>

        {/* SVG Chart Container */}
        <div className="w-full overflow-x-auto py-2">
          <svg viewBox="0 0 500 200" className="w-full h-48 max-w-2xl mx-auto">
            {/* Horizontal Grid guidelines */}
            <line x1="40" y1="40" x2="480" y2="40" stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x="15" y="44" fill="#94a3b8" fontSize="10">10h</text>

            <line x1="40" y1="80" x2="480" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x="15" y="84" fill="#94a3b8" fontSize="10">8h</text>

            <line x1="40" y1="120" x2="480" y2="120" stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x="15" y="124" fill="#94a3b8" fontSize="10">6h</text>

            {/* Optimal Range Highlight Box (7.5h to 9h) */}
            <rect x="40" y="60" width="440" height="40" fill="#e0e7ff" fillOpacity="0.3" rx="6" />

            {/* Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Empty state indicator */}
            {chartPoints.length === 0 && (
              <text x="250" y="105" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="500">
                Beginning September 8th — save your first sleep record above
              </text>
            )}

            {/* Data Points */}
            {chartPoints.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  className="fill-indigo-600 stroke-white stroke-2 hover:r-7 transition-all cursor-pointer"
                />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill="#4338ca"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {pt.duration}h
                </text>
                <text
                  x={pt.x}
                  y="180"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                >
                  {pt.date.slice(8)}th
                </text>
              </g>
            ))}
          </svg>
        </div>

        <p className="text-[11px] text-slate-400 text-center italic">
          Shaded area represents your optimal 7.5h – 9h recovery window.
        </p>
      </div>

    </div>
  );
};
