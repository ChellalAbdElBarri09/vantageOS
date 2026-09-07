import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CheckSquare, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { googleSignIn, logout, createCalendarEvent, syncTaskToGoogleTasks } from '../services/googleWorkspace';
import { GoogleWorkspaceState, TaskItem } from '../types';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleState: GoogleWorkspaceState;
  setGoogleState: (state: GoogleWorkspaceState) => void;
  todayTasks: TaskItem[];
  currentDateKey: string;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  onClose,
  googleState,
  setGoogleState,
  todayTasks,
  currentDateKey
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const res = await googleSignIn();
      if (res?.user) {
        setGoogleState({
          isConnected: true,
          userEmail: res.user.email,
          displayName: res.user.displayName || res.user.email?.split('@')[0] || 'User',
          photoURL: res.user.photoURL,
          lastSyncedAt: new Date().toLocaleTimeString()
        });
        setStatusMessage({
          text: `Connected successfully as ${res.user.email}`,
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: err?.message || 'Could not complete Google sign-in. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logout();
      setGoogleState({
        isConnected: false,
        userEmail: null,
        displayName: null,
        photoURL: null,
        lastSyncedAt: null
      });
      setStatusMessage({ text: 'Signed out of Google Workspace.', type: 'info' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Sign out failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToCalendar = async () => {
    if (!googleState.isConnected) return;
    try {
      setIsLoading(true);
      setStatusMessage({ text: 'Creating study and focus blocks in Google Calendar...', type: 'info' });

      // Create contextual study & SAT blocks for today
      let syncedCount = 0;
      const baseDate = currentDateKey;

      // Filter meaningful schedule blocks
      const studyTasks = todayTasks.filter(t => 
        t.category === 'academics' || t.category === 'sat' || t.category === 'projects_skills' || t.category === 'finance'
      );

      for (const t of studyTasks.slice(0, 3)) {
        await createCalendarEvent({
          summary: `[Progress OS] ${t.name}`,
          description: `${t.frequency || ''} • Approximate duration: ${t.approximateDuration || 'Flexible'}`,
          startDateTime: `${baseDate}T10:00:00Z`,
          endDateTime: `${baseDate}T11:30:00Z`
        });
        syncedCount++;
      }

      setStatusMessage({
        text: `Successfully synced ${syncedCount} focus blocks to your Google Calendar!`,
        type: 'success'
      });
      setGoogleState({ ...googleState, lastSyncedAt: new Date().toLocaleTimeString() });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: `Calendar sync notice: ${err.message || 'Failed to sync calendar events'}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToTasks = async () => {
    if (!googleState.isConnected) return;
    try {
      setIsLoading(true);
      setStatusMessage({ text: 'Syncing daily checklist with Google Tasks...', type: 'info' });

      let count = 0;
      for (const task of todayTasks.slice(0, 5)) {
        await syncTaskToGoogleTasks(task);
        count++;
      }

      setStatusMessage({
        text: `Synced ${count} tasks to your Google Tasks list!`,
        type: 'success'
      });
      setGoogleState({ ...googleState, lastSyncedAt: new Date().toLocaleTimeString() });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: `Tasks sync notice: ${err.message || 'Failed to sync to Google Tasks'}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="clay-card w-full max-w-lg p-6 relative bg-white animate-in fade-in zoom-in duration-150">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Google Workspace Sync</h2>
            <p className="text-xs text-slate-500">Google Calendar & Google Tasks Harmonization</p>
          </div>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            statusMessage.type === 'error' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> :
             statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> :
             <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Connection State */}
        {!googleState.isConnected ? (
          <div className="py-5 text-center space-y-4 clay-card-subtle p-5 rounded-2xl mb-4">
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Connect your Google account to automatically sync your study and SAT blocks with 
              <span className="font-semibold text-slate-800"> Google Calendar</span> and your daily checklists with 
              <span className="font-semibold text-slate-800"> Google Tasks</span>.
            </p>

            <div className="pt-2">
              <button 
                id="btn-google-signin"
                onClick={handleSignIn} 
                disabled={isLoading}
                className="gsi-material-button shadow-sm"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoading ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            {/* Account Info Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
              <div className="flex items-center gap-3">
                {googleState.photoURL ? (
                  <img src={googleState.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-emerald-300" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-emerald-800">
                    {googleState.displayName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{googleState.displayName}</h4>
                  <p className="text-xs text-slate-500">{googleState.userEmail}</p>
                </div>
              </div>

              <button
                id="btn-google-signout"
                onClick={handleSignOut}
                disabled={isLoading}
                className="p-2 rounded-xl hover:bg-emerald-100 text-slate-600 hover:text-red-600 transition-colors"
                title="Disconnect Google Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Sync Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-sync-calendar-action"
                onClick={handleSyncToCalendar}
                disabled={isLoading}
                className="flex items-start gap-3 p-4 rounded-2xl clay-button text-left"
              >
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Push to Calendar</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send study & SAT blocks to Google Calendar</p>
                </div>
              </button>

              <button
                id="btn-sync-tasks-action"
                onClick={handleSyncToTasks}
                disabled={isLoading}
                className="flex items-start gap-3 p-4 rounded-2xl clay-button text-left"
              >
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Push to Google Tasks</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send today's checklist items to Tasks</p>
                </div>
              </button>
            </div>

            {googleState.lastSyncedAt && (
              <p className="text-[11px] text-center text-slate-400">
                Last synchronized: {googleState.lastSyncedAt}
              </p>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
