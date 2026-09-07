import React, { useState, useEffect } from 'react';
import { 
  AppState, 
  ActiveView, 
  TaskItem, 
  GoalItem, 
  HabitItem, 
  SleepRecord, 
  WeeklyTarget, 
  FinanceEntry, 
  ReligionState, 
  ReadingLog,
  GoogleWorkspaceState 
} from './types';
import { loadAppState, saveAppState, clearAppState, exportAppStateToJSON, importAppStateFromJSON } from './utils/storage';
import { getTodayDateKey } from './utils/dateUtils';
import { generateDefaultTasksForDate } from './utils/defaultData';
import { Navigation, MobileNavigation } from './components/Navigation';
import { Header } from './components/Header';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { onAuthStateChange } from './services/googleWorkspace';

// Views
import { DashboardView } from './views/DashboardView';
import { DailyView } from './views/DailyView';
import { WeeklyView } from './views/WeeklyView';
import { GoalsView } from './views/GoalsView';
import { HabitsView } from './views/HabitsView';
import { SleepView } from './views/SleepView';
import { AnalyticsView } from './views/AnalyticsView';
import { FinanceView } from './views/FinanceView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleState, setGoogleState] = useState<GoogleWorkspaceState>({
    isConnected: false,
    userEmail: null,
    displayName: null,
    photoURL: null,
    lastSyncedAt: null
  });

  // Keep state synchronized with LocalStorage
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Listen to Firebase Auth state for Google account connection
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setGoogleState({
          isConnected: true,
          userEmail: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL,
          lastSyncedAt: new Date().toLocaleTimeString()
        });
      } else {
        setGoogleState(prev => ({
          ...prev,
          isConnected: false,
          userEmail: null,
          displayName: null,
          photoURL: null
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const currentDateKey = appState.currentDate;
  const currentTasks = appState.tasks[currentDateKey] || [];
  const currentReligion = appState.religion[currentDateKey] || {
    date: currentDateKey,
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    morningAdhkar: false,
    noonAdhkar: false,
    quranPagesToday: 0
  };
  const currentReading = appState.reading[currentDateKey] || {
    date: currentDateKey,
    arabicPages: 0,
    englishPages: 0
  };

  // Aggregated total Quran pages across all days starting clean from 0
  const totalQuranPages = (Object.values(appState.religion) as ReligionState[]).reduce<number>((sum, r) => sum + (r.quranPagesToday || 0), 0);
  const totalReadingPages = (Object.values(appState.reading) as ReadingLog[]).reduce<number>((sum, r) => sum + (r.arabicPages || 0) + (r.englishPages || 0), 0);

  // Handlers for App Navigation
  const handleSelectView = (view: ActiveView) => {
    setAppState(prev => ({ ...prev, activeView: view }));
  };

  const handleChangeDate = (newDateKey: string) => {
    setAppState(prev => {
      // If tasks for this new date haven't been seeded yet, seed them cleanly
      let updatedTasks = { ...prev.tasks };
      if (!updatedTasks[newDateKey] || updatedTasks[newDateKey].length === 0) {
        updatedTasks[newDateKey] = generateDefaultTasksForDate(newDateKey);
      }
      return { ...prev, tasks: updatedTasks, currentDate: newDateKey };
    });
  };

  // Task actions
  const handleToggleTask = (taskId: string) => {
    setAppState(prev => {
      const dayTasks = prev.tasks[currentDateKey] || [];
      const updatedDayTasks = dayTasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return {
        ...prev,
        tasks: { ...prev.tasks, [currentDateKey]: updatedDayTasks }
      };
    });
  };

  const handleAddTask = (taskData: Partial<TaskItem>) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      name: taskData.name || 'Untitled task',
      category: taskData.category || 'academics',
      date: taskData.date || currentDateKey,
      completed: false,
      approximateDuration: taskData.approximateDuration,
      notes: taskData.notes
    };

    setAppState(prev => {
      const dateKey = newTask.date;
      const existing = prev.tasks[dateKey] || [];
      return {
        ...prev,
        tasks: { ...prev.tasks, [dateKey]: [...existing, newTask] }
      };
    });
  };

  const handleUpdateTask = (task: TaskItem) => {
    setAppState(prev => {
      const dateKey = task.date;
      const dayTasks = prev.tasks[dateKey] || [];
      const updated = dayTasks.map(t => t.id === task.id ? task : t);
      return {
        ...prev,
        tasks: { ...prev.tasks, [dateKey]: updated }
      };
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setAppState(prev => {
      const dayTasks = prev.tasks[currentDateKey] || [];
      const updated = dayTasks.filter(t => t.id !== taskId);
      return {
        ...prev,
        tasks: { ...prev.tasks, [currentDateKey]: updated }
      };
    });
  };

  const handleMoveTask = (taskId: string, targetDateKey: string) => {
    setAppState(prev => {
      const originTasks = prev.tasks[currentDateKey] || [];
      const taskToMove = originTasks.find(t => t.id === taskId);
      if (!taskToMove) return prev;

      const updatedOriginTasks = originTasks.filter(t => t.id !== taskId);
      const targetTasks = prev.tasks[targetDateKey] || [];
      const movedTask: TaskItem = { ...taskToMove, date: targetDateKey };

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [currentDateKey]: updatedOriginTasks,
          [targetDateKey]: [...targetTasks, movedTask]
        }
      };
    });
  };

  // Religion state updates
  const handleUpdateReligionState = (newReligionState: ReligionState) => {
    setAppState(prev => ({
      ...prev,
      religion: { ...prev.religion, [currentDateKey]: newReligionState }
    }));
  };

  // Reading log updates
  const handleUpdateReadingLog = (arabic: number, english: number) => {
    setAppState(prev => ({
      ...prev,
      reading: {
        ...prev.reading,
        [currentDateKey]: {
          date: currentDateKey,
          arabicPages: arabic,
          englishPages: english
        }
      }
    }));
  };

  // Weekly targets update
  const handleUpdateWeeklyTargets = (targets: WeeklyTarget[]) => {
    setAppState(prev => ({ ...prev, weeklyTargets: targets }));
  };

  // Goals update
  const handleUpdateGoals = (goals: GoalItem[]) => {
    setAppState(prev => ({ ...prev, goals }));
  };

  // Habits update
  const handleUpdateHabits = (habits: HabitItem[]) => {
    setAppState(prev => ({ ...prev, habits }));
  };

  // Sleep record save
  const handleSaveSleepRecord = (record: SleepRecord) => {
    setAppState(prev => {
      const existing = prev.sleepRecords.filter(r => r.date !== record.date);
      return { ...prev, sleepRecords: [...existing, record] };
    });
  };

  // Finance entry add
  const handleAddFinanceEntry = (entry: FinanceEntry) => {
    setAppState(prev => ({
      ...prev,
      finance: [entry, ...prev.finance]
    }));
  };

  // Settings: Export, Import, Reset
  const handleExport = () => {
    exportAppStateToJSON(appState);
  };

  const handleImport = (jsonStr: string): boolean => {
    const parsed = importAppStateFromJSON(jsonStr);
    if (parsed) {
      setAppState(parsed);
      return true;
    }
    return false;
  };

  const handleReset = () => {
    clearAppState();
    const fresh = loadAppState();
    setAppState(fresh);
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] text-slate-800 flex flex-col antialiased selection:bg-blue-200">
      
      {/* Main Layout Shell */}
      <div className="flex-1 flex w-full">
        
        {/* Desktop Sidebar Navigation */}
        <Navigation
          activeView={appState.activeView}
          onSelectView={handleSelectView}
          onOpenGoogleSync={() => setIsGoogleModalOpen(true)}
          isGoogleConnected={googleState.isConnected}
        />

        {/* Content Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
          
          {/* Top Header */}
          <Header
            currentDateKey={currentDateKey}
            onChangeDate={handleChangeDate}
            onOpenGoogleSync={() => setIsGoogleModalOpen(true)}
            googleState={googleState}
          />

          {/* Core View Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            
            {appState.activeView === 'dashboard' && (
              <DashboardView
                currentDateKey={currentDateKey}
                tasks={currentTasks}
                goals={appState.goals}
                sleepRecords={appState.sleepRecords}
                weeklyTargets={appState.weeklyTargets}
                onNavigate={handleSelectView}
                quranPagesTotal={totalQuranPages}
                readingTotal={totalReadingPages}
                financeEntries={appState.finance}
                allTasks={appState.tasks}
                habits={appState.habits}
              />
            )}

            {appState.activeView === 'daily' && (
              <DailyView
                currentDateKey={currentDateKey}
                tasks={currentTasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                religionState={currentReligion}
                onUpdateReligionState={handleUpdateReligionState}
                readingLog={currentReading}
                onUpdateReadingLog={handleUpdateReadingLog}
                totalQuranPages={totalQuranPages}
              />
            )}

            {appState.activeView === 'weekly' && (
              <WeeklyView
                currentDateKey={currentDateKey}
                weeklyTargets={appState.weeklyTargets}
                onUpdateWeeklyTargets={handleUpdateWeeklyTargets}
                allTasks={appState.tasks}
              />
            )}

            {appState.activeView === 'goals' && (
              <GoalsView
                goals={appState.goals}
                onUpdateGoals={handleUpdateGoals}
                quranPagesTotal={totalQuranPages}
                readingTotal={totalReadingPages}
              />
            )}

            {appState.activeView === 'habits' && (
              <HabitsView
                currentDateKey={currentDateKey}
                habits={appState.habits}
                onUpdateHabits={handleUpdateHabits}
              />
            )}

            {appState.activeView === 'sleep' && (
              <SleepView
                currentDateKey={currentDateKey}
                sleepRecords={appState.sleepRecords}
                onSaveSleepRecord={handleSaveSleepRecord}
              />
            )}

            {appState.activeView === 'analytics' && (
              <AnalyticsView
                allTasks={appState.tasks}
                sleepRecords={appState.sleepRecords}
              />
            )}

            {appState.activeView === 'finance' && (
              <FinanceView
                currentDateKey={currentDateKey}
                financeEntries={appState.finance}
                onAddFinanceEntry={handleAddFinanceEntry}
                targetSavingsPercentage={appState.savingsTargetPercentage}
              />
            )}

            {appState.activeView === 'settings' && (
              <SettingsView
                onExportData={handleExport}
                onImportData={handleImport}
                onResetData={handleReset}
                savingsTarget={appState.savingsTargetPercentage}
                onUpdateSavingsTarget={(val) => setAppState(prev => ({ ...prev, savingsTargetPercentage: val }))}
                googleState={googleState}
                onOpenGoogleSync={() => setIsGoogleModalOpen(true)}
              />
            )}

          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigation
        activeView={appState.activeView}
        onSelectView={handleSelectView}
        onOpenGoogleSync={() => setIsGoogleModalOpen(true)}
        isGoogleConnected={googleState.isConnected}
      />

      {/* Google Workspace Harmonization Modal */}
      <GoogleSyncModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        googleState={googleState}
        setGoogleState={setGoogleState}
        todayTasks={currentTasks}
        currentDateKey={currentDateKey}
      />

    </div>
  );
}

