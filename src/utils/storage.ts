import {
  TaskItem,
  WeeklyTarget,
  GoalItem,
  HabitItem,
  AppSettings,
  SleepRecord,
  FinanceEntry,
  ReadingLog,
  ReligionState
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_WEEKLY_TARGETS,
  INITIAL_GOALS,
  INITIAL_HABITS,
  INITIAL_SLEEP_RECORDS,
  INITIAL_READING_LOGS,
  INITIAL_FINANCE_ENTRIES,
  INITIAL_RELIGION_STATES,
  generateDefaultTasksForDate
} from './defaultData';

const STORAGE_KEYS = {
  TASKS: 'ppt_tasks_v2',
  WEEKLY_TARGETS: 'ppt_weekly_targets_v2',
  GOALS: 'ppt_goals_v2',
  HABITS: 'ppt_habits_v2',
  SETTINGS: 'ppt_settings_v2',
  SLEEP: 'ppt_sleep_records_v2',
  READING: 'ppt_reading_logs_v2',
  FINANCE: 'ppt_finance_entries_v2',
  RELIGION: 'ppt_religion_states_v2'
};

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export function loadAllTasks(): Record<string, TaskItem[]> {
  const loaded = safeGetItem<Record<string, TaskItem[]>>(STORAGE_KEYS.TASKS, {});
  return loaded;
}

export function saveAllTasks(tasks: Record<string, TaskItem[]>): void {
  safeSetItem(STORAGE_KEYS.TASKS, tasks);
}

export function getTasksForDate(dateKey: string): TaskItem[] {
  const allTasks = loadAllTasks();
  if (allTasks[dateKey] && allTasks[dateKey].length > 0) {
    return allTasks[dateKey];
  }
  // Generate defaults for this date if not already stored
  const defaultList = generateDefaultTasksForDate(dateKey);
  allTasks[dateKey] = defaultList;
  saveAllTasks(allTasks);
  return defaultList;
}

export function loadWeeklyTargets(): WeeklyTarget[] {
  return safeGetItem<WeeklyTarget[]>(STORAGE_KEYS.WEEKLY_TARGETS, INITIAL_WEEKLY_TARGETS);
}

export function saveWeeklyTargets(targets: WeeklyTarget[]): void {
  safeSetItem(STORAGE_KEYS.WEEKLY_TARGETS, targets);
}

export function loadGoals(): GoalItem[] {
  return safeGetItem<GoalItem[]>(STORAGE_KEYS.GOALS, INITIAL_GOALS);
}

export function saveGoals(goals: GoalItem[]): void {
  safeSetItem(STORAGE_KEYS.GOALS, goals);
}

export function loadHabits(): HabitItem[] {
  return safeGetItem<HabitItem[]>(STORAGE_KEYS.HABITS, INITIAL_HABITS);
}

export function saveHabits(habits: HabitItem[]): void {
  safeSetItem(STORAGE_KEYS.HABITS, habits);
}

export function loadSettings(): AppSettings {
  return safeGetItem<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  safeSetItem(STORAGE_KEYS.SETTINGS, settings);
}

export function loadSleepRecords(): SleepRecord[] {
  return safeGetItem<SleepRecord[]>(STORAGE_KEYS.SLEEP, INITIAL_SLEEP_RECORDS);
}

export function saveSleepRecords(records: SleepRecord[]): void {
  safeSetItem(STORAGE_KEYS.SLEEP, records);
}

export function loadReadingLogs(): Record<string, ReadingLog> {
  return safeGetItem<Record<string, ReadingLog>>(STORAGE_KEYS.READING, INITIAL_READING_LOGS);
}

export function saveReadingLogs(logs: Record<string, ReadingLog>): void {
  safeSetItem(STORAGE_KEYS.READING, logs);
}

export function loadFinanceEntries(): FinanceEntry[] {
  return safeGetItem<FinanceEntry[]>(STORAGE_KEYS.FINANCE, INITIAL_FINANCE_ENTRIES);
}

export function saveFinanceEntries(entries: FinanceEntry[]): void {
  safeSetItem(STORAGE_KEYS.FINANCE, entries);
}

export function loadReligionStates(): Record<string, ReligionState> {
  return safeGetItem<Record<string, ReligionState>>(STORAGE_KEYS.RELIGION, INITIAL_RELIGION_STATES);
}

export function saveReligionStates(states: Record<string, ReligionState>): void {
  safeSetItem(STORAGE_KEYS.RELIGION, states);
}

export function exportFullBackup(): string {
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tasks: loadAllTasks(),
    weeklyTargets: loadWeeklyTargets(),
    goals: loadGoals(),
    habits: loadHabits(),
    settings: loadSettings(),
    sleep: loadSleepRecords(),
    reading: loadReadingLogs(),
    finance: loadFinanceEntries(),
    religion: loadReligionStates()
  };
  return JSON.stringify(backup, null, 2);
}

export function importFullBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.tasks) safeSetItem(STORAGE_KEYS.TASKS, data.tasks);
    if (data.weeklyTargets) safeSetItem(STORAGE_KEYS.WEEKLY_TARGETS, data.weeklyTargets);
    if (data.goals) safeSetItem(STORAGE_KEYS.GOALS, data.goals);
    if (data.habits) safeSetItem(STORAGE_KEYS.HABITS, data.habits);
    if (data.settings) safeSetItem(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.sleep) safeSetItem(STORAGE_KEYS.SLEEP, data.sleep);
    if (data.reading) safeSetItem(STORAGE_KEYS.READING, data.reading);
    if (data.finance) safeSetItem(STORAGE_KEYS.FINANCE, data.finance);
    if (data.religion) safeSetItem(STORAGE_KEYS.RELIGION, data.religion);
    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}

export function resetAllDataToDefault(): void {
  safeSetItem(STORAGE_KEYS.TASKS, {});
  safeSetItem(STORAGE_KEYS.WEEKLY_TARGETS, INITIAL_WEEKLY_TARGETS);
  safeSetItem(STORAGE_KEYS.GOALS, INITIAL_GOALS);
  safeSetItem(STORAGE_KEYS.HABITS, INITIAL_HABITS);
  safeSetItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  safeSetItem(STORAGE_KEYS.SLEEP, INITIAL_SLEEP_RECORDS);
  safeSetItem(STORAGE_KEYS.READING, INITIAL_READING_LOGS);
  safeSetItem(STORAGE_KEYS.FINANCE, INITIAL_FINANCE_ENTRIES);
  safeSetItem(STORAGE_KEYS.RELIGION, INITIAL_RELIGION_STATES);
}

export function loadAppState(): import('../types').AppState {
  const tasks = loadAllTasks();
  // Ensure default tasks for beginning date 2026-09-08 exist cleanly
  if (!tasks['2026-09-08'] || tasks['2026-09-08'].length === 0) {
    tasks['2026-09-08'] = generateDefaultTasksForDate('2026-09-08');
    saveAllTasks(tasks);
  }

  return {
    currentDate: '2026-09-08',
    activeView: 'dashboard',
    tasks,
    weeklyTargets: loadWeeklyTargets(),
    goals: loadGoals(),
    habits: loadHabits(),
    sleepRecords: loadSleepRecords(),
    reading: loadReadingLogs(),
    finance: loadFinanceEntries(),
    religion: loadReligionStates(),
    settings: loadSettings(),
    savingsTargetPercentage: 90
  };
}

export function saveAppState(state: import('../types').AppState): void {
  saveAllTasks(state.tasks);
  saveWeeklyTargets(state.weeklyTargets);
  saveGoals(state.goals);
  saveHabits(state.habits);
  saveSleepRecords(state.sleepRecords);
  saveReadingLogs(state.reading);
  saveFinanceEntries(state.finance);
  saveReligionStates(state.religion);
  saveSettings(state.settings);
}

export function clearAppState(): void {
  resetAllDataToDefault();
}

export function exportAppStateToJSON(state: import('../types').AppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `progress-os-backup-${state.currentDate}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAppStateFromJSON(jsonStr: string): import('../types').AppState | null {
  try {
    const data = JSON.parse(jsonStr) as import('../types').AppState;
    if (data && data.tasks && data.weeklyTargets) {
      saveAppState(data);
      return data;
    }
    return null;
  } catch (err) {
    console.error('Failed to parse state json', err);
    return null;
  }
}

