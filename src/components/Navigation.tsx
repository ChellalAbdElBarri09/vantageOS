import React from 'react';
import { 
  LayoutDashboard, 
  Sun, 
  CalendarDays, 
  Target, 
  Flame, 
  Moon, 
  BarChart3, 
  Wallet, 
  Settings,
  CalendarCheck
} from 'lucide-react';
import { ActiveView } from '../types';

interface NavigationProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onOpenGoogleSync: () => void;
  isGoogleConnected: boolean;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'daily', label: 'Daily', icon: Sun },
  { id: 'weekly', label: 'Weekly', icon: CalendarDays },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'habits', label: 'Habits', icon: Flame },
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  onSelectView,
  onOpenGoogleSync,
  isGoogleConnected
}) => {
  return (
    <aside 
      id="main-navigation-sidebar"
      className="hidden lg:flex flex-col w-64 bg-white/70 backdrop-blur-md p-5 border-r border-slate-200/60 shrink-0 select-none shadow-[4px_0_24px_rgba(174,190,215,0.2)]"
    >
      {/* Brand / App Title */}
      <div className="flex items-center gap-3 px-3 py-2 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Sun className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-slate-800 tracking-tight text-base">Progress OS</h1>
          <p className="text-xs text-slate-400 font-medium">Calm Personal System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'clay-pill-active text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-blue-600' : 'text-slate-400'}`} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Google Workspace Quick Sync Banner */}
      <div className="mt-auto pt-4 border-t border-slate-200/60">
        <button
          id="btn-sidebar-google-sync"
          onClick={onOpenGoogleSync}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/80 hover:border-blue-300 transition-all text-left shadow-sm group"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isGoogleConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 truncate flex items-center gap-1.5">
              <span>Google Sync</span>
              <span className={`w-2 h-2 rounded-full ${isGoogleConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {isGoogleConnected ? 'Calendar & Tasks synced' : 'Connect Calendar & Tasks'}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export const MobileNavigation: React.FC<NavigationProps> = ({
  activeView,
  onSelectView,
  onOpenGoogleSync,
  isGoogleConnected
}) => {
  return (
    <nav 
      id="mobile-navigation-bar" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200/70 px-2 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(174,190,215,0.25)]"
      aria-label="Mobile Navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => onSelectView(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
