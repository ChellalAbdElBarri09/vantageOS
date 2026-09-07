import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  ShieldCheck, 
  CalendarCheck, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { GoogleWorkspaceState } from '../types';

interface SettingsViewProps {
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetData: () => void;
  savingsTarget: number;
  onUpdateSavingsTarget: (val: number) => void;
  googleState: GoogleWorkspaceState;
  onOpenGoogleSync: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onExportData,
  onImportData,
  onResetData,
  savingsTarget,
  onUpdateSavingsTarget,
  googleState,
  onOpenGoogleSync
}) => {
  const [importText, setImportText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportData(content);
        if (success) {
          setNotification({ text: 'Data restored successfully!', type: 'success' });
        } else {
          setNotification({ text: 'Invalid backup file format.', type: 'error' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (!importText.trim()) return;
    const success = onImportData(importText);
    if (success) {
      setNotification({ text: 'Data imported successfully!', type: 'success' });
      setImportText('');
    } else {
      setNotification({ text: 'Could not parse data backup JSON.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Settings & Data Management</h2>
        <p className="text-xs text-slate-500">
          Local-first persistence • Full privacy • Seamless data portability
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Persistence & Local Storage Guarantee */}
      <div className="clay-card p-6 flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 shrink-0">
          <Database className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">Local-First Storage Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All your daily tasks, prayer completions, Quran Khatma records, sleep logs, and finance entries are safely stored in your browser's persistent LocalStorage. Your data remains on your machine and survives refreshes and tab closures.
          </p>
        </div>
      </div>

      {/* Google Workspace Integration Section */}
      <div className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">Google Calendar & Tasks Harmonization</h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
            googleState.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {googleState.isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Allows you to export your daily academic focus blocks and SAT practice sessions directly into Google Calendar, and push daily checklists to Google Tasks.
        </p>

        <div className="pt-1">
          <button
            onClick={onOpenGoogleSync}
            className="clay-button px-4 py-2 text-xs font-semibold text-blue-700"
          >
            {googleState.isConnected ? 'Manage Google Workspace Connection' : 'Connect Google Workspace'}
          </button>
        </div>
      </div>

      {/* Financial Preferences */}
      <div className="clay-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Savings Target Intention</h3>
        <p className="text-xs text-slate-600">
          Adjust your target savings percentage (default is 90%):
        </p>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={savingsTarget}
            onChange={(e) => onUpdateSavingsTarget(Number(e.target.value))}
            className="w-48 accent-blue-600 cursor-pointer"
          />
          <span className="text-sm font-bold text-blue-600 clay-card-subtle px-3 py-1 rounded-xl">
            {savingsTarget}% Target
          </span>
        </div>
      </div>

      {/* Data Backup, Export & Import */}
      <div className="clay-card p-6 space-y-5">
        <h3 className="text-base font-bold text-slate-800">Data Portability & Backup</h3>
        <p className="text-xs text-slate-600">
          Export your entire tracking history to a JSON file, or restore from a previous backup.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="clay-card-subtle p-4 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Export Full Backup</span>
            <p className="text-[11px] text-slate-500">
              Downloads all tasks, habits, sleep, goals, and finance logs as a JSON file.
            </p>
            <button
              onClick={onExportData}
              className="clay-button inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* File Upload Import */}
          <div className="clay-card-subtle p-4 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Restore from Backup File</span>
            <p className="text-[11px] text-slate-500">
              Select a JSON file previously exported from Progress OS.
            </p>
            <label className="clay-button inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Reset / Clear Data */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-rose-700 block">Reset to Default Data</span>
              <p className="text-[11px] text-slate-500">
                Restores the standard healthy September template and clear custom logs.
              </p>
            </div>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="clay-button px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 self-start sm:self-auto"
              >
                Reset Database...
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetData();
                    setShowResetConfirm(false);
                    setNotification({ text: 'Reset completed to default healthy data.', type: 'success' });
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-sm"
                >
                  Yes, Reset Everything
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
