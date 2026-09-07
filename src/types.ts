export type TaskCategory = 
  | 'religion'
  | 'academics'
  | 'sat'
  | 'projects_skills'
  | 'research'
  | 'health'
  | 'reading'
  | 'languages'
  | 'wellbeing'
  | 'finance';

export interface TaskItem {
  id: string;
  name: string;
  category: TaskCategory;
  approximateDuration?: string;
  frequency?: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  notes?: string;
  isDefault?: boolean;
}

export interface ReligionState {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  morningAdhkar: boolean;
  noonAdhkar: boolean;
  quranPagesToday: number;
}

export interface ReadingLog {
  date: string; // YYYY-MM-DD
  arabicPages: number;
  englishPages: number;
}

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  sleepTime: string; // e.g. "23:00"
  wakeTime: string; // e.g. "07:30"
  durationHours: number;
  notes?: string;
}

export interface FinanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  isWorkDay: boolean;
  workHours?: string;
  earned: number;
  saved: number;
  available: number;
  notes?: string;
}

export interface WeeklyTarget {
  id: string;
  category: TaskCategory;
  title: string;
  targetCount: number;
  unit: string;
  subtext?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalItem {
  id: string;
  category: TaskCategory;
  title: string;
  description: string;
  type: 'numeric' | 'milestones' | 'habitual';
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  milestones?: GoalMilestone[];
  icon?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: TaskCategory;
  frequencyType: 'daily' | 'specific-days' | 'weekly';
  targetDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  daysLabel?: string;
  completedDates: string[]; // YYYY-MM-DD
}

export interface AppSettings {
  userName: string;
  period1Dates: string; // "Sep 8 - Sep 20"
  period2Dates: string; // "Sep 20 - Sep 30"
  quranTotalPagesCompleted: number; // For Khatma tracking
  targetSavingsPercentage: number; // 90%
  totalQuranPagesTarget: number; // 604 pages in mushaf
  readingMonthlyTargetArabic: number; // 150
  readingMonthlyTargetEnglish: number; // 150
}

export interface GoogleWorkspaceState {
  isConnected: boolean;
  userEmail: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastSyncedAt: string | null;
}

export type ActiveView = 
  | 'dashboard'
  | 'daily'
  | 'weekly'
  | 'goals'
  | 'habits'
  | 'sleep'
  | 'analytics'
  | 'finance'
  | 'settings';

export interface AppState {
  currentDate: string;
  activeView: ActiveView;
  tasks: Record<string, TaskItem[]>;
  weeklyTargets: WeeklyTarget[];
  goals: GoalItem[];
  habits: HabitItem[];
  sleepRecords: SleepRecord[];
  reading: Record<string, ReadingLog>;
  finance: FinanceEntry[];
  religion: Record<string, ReligionState>;
  settings: AppSettings;
  savingsTargetPercentage: number;
}

