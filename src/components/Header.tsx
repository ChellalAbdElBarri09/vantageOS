import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { formatFriendlyDate, getSeptemberPeriodInfo, parseDateFromKey, formatDateToKey, getTodayDateKey } from '../utils/dateUtils';
import { GoogleWorkspaceState } from '../types';

interface HeaderProps {
  currentDateKey: string;
  onChangeDate: (newDateKey: string) => void;
  onOpenGoogleSync: () => void;
  googleState: GoogleWorkspaceState;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateKey,
  onChangeDate,
  onOpenGoogleSync,
  googleState
}) => {
  const periodInfo = getSeptemberPeriodInfo(currentDateKey);

  const handlePrevDay = () => {
    const d = parseDateFromKey(currentDateKey);
    d.setDate(d.getDate() - 1);
    onChangeDate(formatDateToKey(d));
  };

  const handleNextDay = () => {
    const d = parseDateFromKey(currentDateKey);
    d.setDate(d.getDate() + 1);
    onChangeDate(formatDateToKey(d));
  };

  const handleToday = () => {
    onChangeDate(getTodayDateKey());
  };

  return (
    <header id="app-header" className="bg-white/60 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Date Switcher & Today Button */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center clay-card-subtle px-1 py-1 rounded-2xl">
            <button
              id="btn-prev-day"
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-600 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 text-slate-800 font-semibold text-sm sm:text-base">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span>{formatFriendlyDate(currentDateKey)}</span>
            </div>

            <button
              id="btn-next-day"
              onClick={handleNextDay}
              className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-600 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            id="btn-jump-today"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100/70 border border-blue-200/60 transition-all shadow-xs"
          >
            Today
          </button>
        </div>

        {/* Right: Ambient Period Context & Workspace Status */}
        <div className="flex items-center flex-wrap gap-3 text-xs">
          {/* Period Context Badge */}
          <div 
            id="badge-period-context"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl clay-card-subtle text-slate-600"
            title={periodInfo.contextNote}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-700">{periodInfo.badgeText}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">Wake {periodInfo.wakeTime} / Sleep {periodInfo.sleepTime}</span>
          </div>

          {/* Google Sync Chip */}
          <button
            id="btn-header-sync-chip"
            onClick={onOpenGoogleSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl clay-button text-xs font-medium text-slate-700"
          >
            {googleState.isConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-700 font-medium truncate max-w-[120px]">
                  {googleState.displayName || 'Google Connected'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Connect Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
