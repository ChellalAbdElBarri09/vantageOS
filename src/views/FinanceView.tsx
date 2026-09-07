import React, { useState } from 'react';
import { 
  Wallet, 
  PiggyBank, 
  Coins, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  Info,
  TrendingUp
} from 'lucide-react';
import { FinanceEntry } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';

interface FinanceViewProps {
  currentDateKey: string;
  financeEntries: FinanceEntry[];
  onAddFinanceEntry: (entry: FinanceEntry) => void;
  targetSavingsPercentage: number;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  currentDateKey,
  financeEntries,
  onAddFinanceEntry,
  targetSavingsPercentage
}) => {
  const [earned, setEarned] = useState<number>(100);
  const [saved, setSaved] = useState<number>(90);
  const [available, setAvailable] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>(currentDateKey);
  const [justLogged, setJustLogged] = useState(false);

  // Auto-calculate available when earned or saved changes
  const handleEarnedChange = (val: number) => {
    setEarned(val);
    const calculatedSaved = Math.round(val * 0.9);
    setSaved(calculatedSaved);
    setAvailable(val - calculatedSaved);
  };

  const handleSavedChange = (val: number) => {
    setSaved(val);
    setAvailable(Math.max(0, earned - val));
  };

  const handleLogShift = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFinanceEntry({
      id: `fin-${Date.now()}`,
      date: entryDate,
      isWorkDay: true,
      earned,
      saved,
      available,
      notes: notes.trim() || undefined
    });
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2500);
  };

  // Totals calculations
  const totalMonthlyIncome = financeEntries.reduce((acc, curr) => acc + curr.earned, 0);
  const totalMonthlySaved = financeEntries.reduce((acc, curr) => acc + curr.saved, 0);
  const totalMonthlyAvailable = financeEntries.reduce((acc, curr) => acc + curr.available, 0);
  const actualSavingsPercentage = totalMonthlyIncome > 0 
    ? Math.round((totalMonthlySaved / totalMonthlyIncome) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Finance & Savings Flow</h2>
        <p className="text-xs text-slate-500">
          Gentle tracking of earned income and intentional 90% savings — zero financial interrogation
        </p>
      </div>

      {/* Contextual Work Schedule Banner */}
      <div className="clay-card p-5 bg-gradient-to-r from-slate-50 via-blue-50/40 to-white">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Contextual Work Days & Reference Times
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="clay-card-subtle p-3 rounded-xl">
            <span className="font-bold text-slate-800 block">Friday</span>
            <span className="text-blue-600 font-semibold">08:00 → 14:00</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Morning shift</span>
          </div>

          <div className="clay-card-subtle p-3 rounded-xl">
            <span className="font-bold text-slate-800 block">Saturday</span>
            <span className="text-indigo-600 font-semibold">17:00 → 21:00</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Evening shift</span>
          </div>

          <div className="clay-card-subtle p-3 rounded-xl">
            <span className="font-bold text-slate-800 block">Sunday</span>
            <span className="text-indigo-600 font-semibold">17:00 → 21:00</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Evening shift</span>
          </div>

          <div className="clay-card-subtle p-3 rounded-xl">
            <span className="font-bold text-slate-800 block">Monday</span>
            <span className="text-indigo-600 font-semibold">17:00 → 21:00</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Evening shift</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 italic">
          These hours are helpful context only and never treated as rigid restrictions.
        </p>
      </div>

      {/* Totals & 90% Savings Target Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-5">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-xs font-semibold">Monthly Income</span>
          </div>
          <div className="text-2xl font-black text-slate-800">${totalMonthlyIncome}</div>
          <span className="text-[10px] text-slate-400">Total earned this month</span>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <PiggyBank className="w-4 h-4" />
            <span className="text-xs font-semibold">Total Saved</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">${totalMonthlySaved}</div>
          <span className="text-[10px] text-slate-400">Targeting 90% reserve</span>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-semibold">Available Funds</span>
          </div>
          <div className="text-2xl font-black text-indigo-800">${totalMonthlyAvailable}</div>
          <span className="text-[10px] text-slate-400">Freely spendable</span>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">Savings Percentage</span>
          </div>
          <div className="text-2xl font-black text-purple-800">{actualSavingsPercentage}%</div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {actualSavingsPercentage >= targetSavingsPercentage ? 'Target 90% met gracefully' : 'Close to 90% intention'}
          </span>
        </div>
      </div>

      {/* Form: Log Shift Earnings */}
      <div className="clay-card p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1">Log Shift Earnings</h3>
        <p className="text-xs text-slate-500 mb-4">
          Quick 3-number entry: amount earned, saved, and available.
        </p>

        <form onSubmit={handleLogShift} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Shift Date</label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Total Earned ($)</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={earned}
                onChange={(e) => handleEarnedChange(Number(e.target.value) || 0)}
                className="w-full clay-inset px-3 py-2 text-sm font-bold text-slate-800 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Amount Saved ($)</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={saved}
                onChange={(e) => handleSavedChange(Number(e.target.value) || 0)}
                className="w-full clay-inset px-3 py-2 text-sm font-bold text-emerald-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Amount Available ($)</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={available}
                onChange={(e) => setAvailable(Number(e.target.value) || 0)}
                className="w-full clay-inset px-3 py-2 text-sm font-bold text-indigo-700 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <input
              type="text"
              placeholder="Optional note (e.g. Friday morning shift completed)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full sm:flex-1 clay-inset px-3 py-2 text-xs text-slate-700 rounded-xl outline-none"
            />

            <button
              type="submit"
              className="clay-button-primary px-6 py-2.5 text-xs font-semibold shrink-0 flex items-center gap-2"
            >
              {justLogged && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
              <span>{justLogged ? 'Logged Successfully' : 'Log Earnings Entry'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* History List */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Recent Financial Log</h3>
        
        <div className="divide-y divide-slate-100">
          {financeEntries.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No shifts logged yet. Use the form above to record your first earnings starting September 8th.
            </div>
          ) : (
            financeEntries.map((entry) => (
              <div key={entry.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{formatFriendlyDate(entry.date)}</span>
                  {entry.workHours && (
                    <span className="text-slate-400 ml-2">({entry.workHours})</span>
                  )}
                  {entry.notes && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{entry.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Earned</span>
                    <span className="font-bold text-slate-700">${entry.earned}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Saved (90%)</span>
                    <span className="font-bold text-emerald-600">${entry.saved}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Available</span>
                    <span className="font-bold text-indigo-600">${entry.available}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
