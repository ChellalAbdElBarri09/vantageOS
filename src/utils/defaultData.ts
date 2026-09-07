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
import { formatDateToKey } from './dateUtils';

export const INITIAL_SETTINGS: AppSettings = {
  userName: 'Abd el barri',
  period1Dates: 'Sep 8 – Sep 20',
  period2Dates: 'Sep 20 – Sep 30',
  quranTotalPagesCompleted: 0, // Begins at 0 towards 604 pages Khatma
  targetSavingsPercentage: 90,
  totalQuranPagesTarget: 604,
  readingMonthlyTargetArabic: 150,
  readingMonthlyTargetEnglish: 150
};

// Generates the daily checklist tasks for a specific date based on the schedule rules
export function generateDefaultTasksForDate(dateKey: string): TaskItem[] {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  const isFriday = dayOfWeek === 5;
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;
  const isMonday = dayOfWeek === 1;
  const isTuesday = dayOfWeek === 2;
  const isWednesday = dayOfWeek === 3;
  const isThursday = dayOfWeek === 4;

  const tasks: TaskItem[] = [];

  // --- RELIGION (Daily) ---
  tasks.push({
    id: `${dateKey}-rel-prayers`,
    name: '5 Daily Prayers',
    category: 'religion',
    approximateDuration: 'Across the day (Fajr, Dhuhr, Asr, Maghrib, Isha)',
    frequency: 'Daily',
    completed: false,
    date: dateKey,
    isDefault: true
  });
  tasks.push({
    id: `${dateKey}-rel-adhkar`,
    name: 'Essential Adhkar',
    category: 'religion',
    approximateDuration: 'Morning & Noon Sessions',
    frequency: 'Daily',
    completed: false,
    date: dateKey,
    isDefault: true
  });
  tasks.push({
    id: `${dateKey}-rel-quran`,
    name: 'Quran Progress',
    category: 'religion',
    approximateDuration: '4 pages after each prayer',
    frequency: 'Daily',
    completed: false,
    date: dateKey,
    isDefault: true
  });

  // --- ACADEMICS ---
  // Lighter on weekends (Fri/Sat), heavier on Sun-Thu
  const academicNote = (isFriday || isSaturday) 
    ? 'Lighter academic review — weekend focus on SAT & skills'
    : 'Focus on 2–3 subjects • Deep understanding & practice';

  tasks.push({
    id: `${dateKey}-acad-main`,
    name: 'Main Study Block',
    category: 'academics',
    approximateDuration: '90+ mins',
    frequency: academicNote,
    completed: false,
    date: dateKey,
    isDefault: true
  });
  tasks.push({
    id: `${dateKey}-acad-practice`,
    name: 'Exercises / Practice Block',
    category: 'academics',
    approximateDuration: '45–60 mins',
    frequency: 'Practice questions & BAC preparation',
    completed: false,
    date: dateKey,
    isDefault: true
  });
  tasks.push({
    id: `${dateKey}-acad-review`,
    name: 'Review / New Academic Year Block',
    category: 'academics',
    approximateDuration: '45–60 mins',
    frequency: 'Grammar review, video overviews & prep for Sep 20',
    completed: false,
    date: dateKey,
    isDefault: true
  });

  // --- SAT (Tuesday, Friday, Saturday) ---
  if (isTuesday || isFriday || isSaturday) {
    tasks.push({
      id: `${dateKey}-sat-session`,
      name: 'SAT Session',
      category: 'sat',
      approximateDuration: '1–2 hours',
      frequency: 'Tue, Fri, Sat scheduled',
      completed: false,
      date: dateKey,
      notes: 'Diagnostic testing, identify weaknesses & build steady foundation',
      isDefault: true
    });
  }

  // --- PROJECTS & SKILLS ---
  // Data Analysis on Friday and Saturday only (~3-4 hours weekly)
  if (isFriday || isSaturday) {
    tasks.push({
      id: `${dateKey}-proj-data-analysis`,
      name: 'Data Analysis Session',
      category: 'projects_skills',
      approximateDuration: '90–120 mins',
      frequency: 'Fri & Sat only',
      completed: false,
      date: dateKey,
      isDefault: true
    });
  }

  // AI Automation: Sunday through Thursday (1 hour/day)
  if (isSunday || isMonday || isTuesday || isWednesday || isThursday) {
    tasks.push({
      id: `${dateKey}-proj-ai-automation`,
      name: 'AI Automation',
      category: 'projects_skills',
      approximateDuration: '1 hour',
      frequency: 'Sun through Thu',
      completed: false,
      date: dateKey,
      isDefault: true
    });
  }

  // --- RESEARCH (Preferred: Sun, Mon, Wed, Thu, and Fri occasionally) ---
  if (isSunday || isMonday || isWednesday || isThursday || isFriday) {
    tasks.push({
      id: `${dateKey}-res-session`,
      name: 'Research Session',
      category: 'research',
      approximateDuration: '35–60 mins',
      frequency: 'AI × Neuroscience explorations',
      completed: false,
      date: dateKey,
      isDefault: true
    });
  }

  // --- HEALTH & FITNESS ---
  // Diet: Daily
  tasks.push({
    id: `${dateKey}-health-diet`,
    name: 'Follow Diet',
    category: 'health',
    approximateDuration: 'Daily conscious nutrition',
    frequency: 'Daily',
    completed: false,
    date: dateKey,
    isDefault: true
  });

  // Gym: Friday, Saturday, Monday, Wednesday (~2 hours)
  if (isFriday || isSaturday || isMonday || isWednesday) {
    tasks.push({
      id: `${dateKey}-health-gym`,
      name: 'Gym',
      category: 'health',
      approximateDuration: '~2 hours',
      frequency: 'Fri, Sat, Mon, Wed',
      completed: false,
      date: dateKey,
      isDefault: true
    });
  }

  // --- READING (Daily gentle tracking) ---
  tasks.push({
    id: `${dateKey}-read-daily`,
    name: 'Reading (Arabic & English)',
    category: 'reading',
    approximateDuration: 'Flexible pages',
    frequency: 'Monthly target ~300 pages total',
    completed: false,
    date: dateKey,
    isDefault: true
  });

  // --- LANGUAGES ---
  tasks.push({
    id: `${dateKey}-lang-en`,
    name: 'English Improvement',
    category: 'languages',
    approximateDuration: 'Flexible listening/reading',
    frequency: 'Natural development',
    completed: false,
    date: dateKey,
    isDefault: true
  });
  tasks.push({
    id: `${dateKey}-lang-fr`,
    name: 'French Improvement',
    category: 'languages',
    approximateDuration: 'Flexible review/media',
    frequency: 'Natural development',
    completed: false,
    date: dateKey,
    isDefault: true
  });

  // --- PERSONAL WELL-BEING (Daily) ---
  tasks.push({
    id: `${dateKey}-wb-meditation`,
    name: 'Meditation',
    category: 'wellbeing',
    approximateDuration: '~15 minutes',
    frequency: 'Daily calm reset',
    completed: false,
    date: dateKey,
    isDefault: true
  });
  tasks.push({
    id: `${dateKey}-wb-journaling`,
    name: 'Journaling',
    category: 'wellbeing',
    approximateDuration: '~15 minutes',
    frequency: 'Daily reflection',
    completed: false,
    date: dateKey,
    isDefault: true
  });
  tasks.push({
    id: `${dateKey}-wb-podcast`,
    name: 'Podcast',
    category: 'wellbeing',
    approximateDuration: '~15 minutes',
    frequency: 'Curiosity & learning',
    completed: false,
    date: dateKey,
    isDefault: true
  });

  // --- FINANCE / WORK (Contextual) ---
  // Work days: Friday (08:00-14:00), Sat/Sun/Mon (17:00-21:00)
  if (isFriday) {
    tasks.push({
      id: `${dateKey}-fin-work`,
      name: 'Work Shift (08:00 → 14:00)',
      category: 'finance',
      approximateDuration: '6 hours',
      frequency: 'Friday work context',
      completed: false,
      date: dateKey,
      notes: 'Log earnings & 90% savings in Finance section',
      isDefault: true
    });
  } else if (isSaturday || isSunday || isMonday) {
    tasks.push({
      id: `${dateKey}-fin-work`,
      name: 'Work Shift (17:00 → 21:00)',
      category: 'finance',
      approximateDuration: '4 hours',
      frequency: 'Evening work context',
      completed: false,
      date: dateKey,
      notes: 'Log earnings & 90% savings in Finance section',
      isDefault: true
    });
  }

  return tasks;
}

export const INITIAL_WEEKLY_TARGETS: WeeklyTarget[] = [
  {
    id: 'wt-prayers',
    category: 'religion',
    title: '5 Daily Prayers',
    targetCount: 35,
    unit: 'prayers',
    subtext: '7 days × 5 prayers'
  },
  {
    id: 'wt-adhkar',
    category: 'religion',
    title: 'Essential Adhkar',
    targetCount: 7,
    unit: 'sessions',
    subtext: 'Morning & Noon sessions'
  },
  {
    id: 'wt-quran',
    category: 'religion',
    title: 'Quran Progress',
    targetCount: 7,
    unit: 'sessions',
    subtext: '4 pages after each prayer'
  },
  {
    id: 'wt-acad-days',
    category: 'academics',
    title: 'Academic Work Days',
    targetCount: 6,
    unit: 'days',
    subtext: '~4–5 hours/day average'
  },
  {
    id: 'wt-acad-main',
    category: 'academics',
    title: 'Main Subjects Study Blocks',
    targetCount: 10,
    unit: 'blocks',
    subtext: 'Target 8–12 blocks/week'
  },
  {
    id: 'wt-acad-practice',
    category: 'academics',
    title: 'Exercises & Practice',
    targetCount: 7,
    unit: 'blocks',
    subtext: 'Target 6–8 blocks/week'
  },
  {
    id: 'wt-sat',
    category: 'sat',
    title: 'SAT Sessions',
    targetCount: 3,
    unit: 'sessions',
    subtext: 'Tuesday, Friday, Saturday'
  },
  {
    id: 'wt-data-analysis',
    category: 'projects_skills',
    title: 'Data Analysis',
    targetCount: 2,
    unit: 'sessions',
    subtext: 'Friday & Saturday (~3–4 hrs total)'
  },
  {
    id: 'wt-ai-automation',
    category: 'projects_skills',
    title: 'AI Automation',
    targetCount: 5,
    unit: 'sessions',
    subtext: 'Sunday through Thursday (1 hr/day)'
  },
  {
    id: 'wt-research',
    category: 'research',
    title: 'Research Sessions',
    targetCount: 4,
    unit: 'sessions',
    subtext: 'Preferred Sun, Mon, Wed, Thu, Fri'
  },
  {
    id: 'wt-gym',
    category: 'health',
    title: 'Gym Workouts',
    targetCount: 4,
    unit: 'sessions',
    subtext: 'Friday, Saturday, Monday, Wednesday'
  },
  {
    id: 'wt-meditation',
    category: 'wellbeing',
    title: 'Meditation Resets',
    targetCount: 7,
    unit: 'sessions',
    subtext: 'Daily mindfulness'
  },
  {
    id: 'wt-journaling',
    category: 'wellbeing',
    title: 'Daily Journaling',
    targetCount: 7,
    unit: 'sessions',
    subtext: 'Evening reflections'
  },
  {
    id: 'wt-podcasts',
    category: 'wellbeing',
    title: 'Podcasts',
    targetCount: 7,
    unit: 'sessions',
    subtext: 'Curiosity & overview episodes'
  }
];

export const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'goal-religion-prayers',
    category: 'religion',
    title: 'Maintain Five Daily Prayers',
    description: 'Establish mindful consistency with Fajr, Dhuhr, Asr, Maghrib, and Isha without feeling rushed.',
    type: 'habitual',
    icon: 'Moon',
    milestones: [
      { id: 'm1', title: 'Consistent Fajr on time', completed: false },
      { id: 'm2', title: 'Prayer spaces organized and calm', completed: false },
      { id: 'm3', title: 'Complete all 5 daily prayers for 20+ consecutive days', completed: false }
    ]
  },
  {
    id: 'goal-religion-quran',
    category: 'religion',
    title: 'Complete or Advance Toward One Quran Khatma',
    description: 'Read 4 pages after each of the 5 daily prayers (20 pages/day) to complete all 604 pages.',
    type: 'numeric',
    targetValue: 604,
    currentValue: 0,
    unit: 'pages',
    icon: 'BookOpen'
  },
  {
    id: 'goal-sat-foundation',
    category: 'sat',
    title: 'Build Sustainable SAT Foundation',
    description: 'Take a diagnostic test, identify priority weakness areas, and solidify math/reading fundamentals.',
    type: 'milestones',
    icon: 'Target',
    milestones: [
      { id: 'sat-m1', title: 'Complete full diagnostic test', completed: false },
      { id: 'sat-m2', title: 'Map error log and pinpoint algebra/grammar weaknesses', completed: false },
      { id: 'sat-m3', title: 'Complete 12 focused practice sets across September', completed: false },
      { id: 'sat-m4', title: 'Review timed section strategies', completed: false }
    ]
  },
  {
    id: 'goal-academics-bac',
    category: 'academics',
    title: 'Academic Mastery & BAC Preparation',
    description: 'Review previous curricula, master main subjects through 90+ min deep blocks, and prep for school by Sep 20.',
    type: 'milestones',
    icon: 'GraduationCap',
    milestones: [
      { id: 'ac-m1', title: 'Review key mathematics and physics concepts', completed: false },
      { id: 'ac-m2', title: 'Complete formal language and grammar refreshers', completed: false },
      { id: 'ac-m3', title: 'Overview memorization subjects via podcasts/documentaries', completed: false },
      { id: 'ac-m4', title: 'Smooth transition to official school schedule on Sep 20', completed: false }
    ]
  },
  {
    id: 'goal-skills-data-ai',
    category: 'projects_skills',
    title: 'Data Analysis & AI Automation Consistency',
    description: 'Dedicate Friday & Saturday to Data Analysis (3–4 hrs) and Sunday–Thursday to 1 hr of AI Automation.',
    type: 'milestones',
    icon: 'Cpu',
    milestones: [
      { id: 'sk-m1', title: 'Set up reproducible data analysis workflow', completed: false },
      { id: 'sk-m2', title: 'Build and deploy first end-to-end automation workflow', completed: false },
      { id: 'sk-m3', title: 'Document practical data pipelines', completed: false }
    ]
  },
  {
    id: 'goal-research-neuro',
    category: 'research',
    title: 'AI × Neuroscience Research Routine',
    description: 'Maintain flexible 35–60 minute reading and note-taking sessions across Sunday, Monday, Wednesday, and Thursday.',
    type: 'milestones',
    icon: 'Sparkles',
    milestones: [
      { id: 'res-m1', title: 'Synthesize foundational cognitive architecture papers', completed: false },
      { id: 'res-m2', title: 'Maintain active research notes and conceptual mindmaps', completed: false }
    ]
  },
  {
    id: 'goal-reading-monthly',
    category: 'reading',
    title: 'Monthly Reading Target (300 Pages)',
    description: 'Balanced reading journey of 150 Arabic pages and 150 English pages without rigid daily quotas.',
    type: 'numeric',
    targetValue: 300,
    currentValue: 0,
    unit: 'pages',
    icon: 'Bookmark'
  },
  {
    id: 'goal-health-gym-diet',
    category: 'health',
    title: 'Gym Consistency & Sustainable Diet',
    description: 'Train 4 days per week (Fri, Sat, Mon, Wed) and maintain a clean, nourishing, and friendly diet.',
    type: 'habitual',
    icon: 'Activity',
    milestones: [
      { id: 'h-m1', title: '4 workouts completed in consecutive weeks', completed: false },
      { id: 'h-m2', title: 'Hydration and post-workout recovery routines established', completed: false },
      { id: 'h-m3', title: 'Keep diet friendly, natural, and guilt-free', completed: false }
    ]
  },
  {
    id: 'goal-finance-savings',
    category: 'finance',
    title: 'Work Diligence & 90% Savings Target',
    description: 'Complete scheduled shifts and allocate 90% of earned income directly into savings.',
    type: 'numeric',
    targetValue: 90,
    currentValue: 0,
    unit: '% saved',
    icon: 'PiggyBank'
  }
];

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'hab-prayers',
    title: '5 Daily Prayers',
    category: 'religion',
    frequencyType: 'daily',
    daysLabel: 'Every day',
    completedDates: []
  },
  {
    id: 'hab-adhkar',
    title: 'Essential Adhkar',
    category: 'religion',
    frequencyType: 'daily',
    daysLabel: 'Morning & Noon',
    completedDates: []
  },
  {
    id: 'hab-diet',
    title: 'Follow Diet',
    category: 'health',
    frequencyType: 'daily',
    daysLabel: 'Every day',
    completedDates: []
  },
  {
    id: 'hab-meditation',
    title: 'Meditation (~15m)',
    category: 'wellbeing',
    frequencyType: 'daily',
    daysLabel: 'Every day',
    completedDates: []
  },
  {
    id: 'hab-journaling',
    title: 'Journaling (~15m)',
    category: 'wellbeing',
    frequencyType: 'daily',
    daysLabel: 'Every day',
    completedDates: []
  },
  {
    id: 'hab-sat',
    title: 'SAT Session (1–2 hrs)',
    category: 'sat',
    frequencyType: 'specific-days',
    targetDays: [2, 5, 6], // Tue, Fri, Sat
    daysLabel: 'Tue, Fri, Sat',
    completedDates: []
  },
  {
    id: 'hab-gym',
    title: 'Gym Workout (~2 hrs)',
    category: 'health',
    frequencyType: 'specific-days',
    targetDays: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
    daysLabel: 'Mon, Wed, Fri, Sat',
    completedDates: []
  },
  {
    id: 'hab-work',
    title: 'Work Shift',
    category: 'finance',
    frequencyType: 'specific-days',
    targetDays: [0, 1, 5, 6], // Sun, Mon, Fri, Sat
    daysLabel: 'Fri, Sat, Sun, Mon',
    completedDates: []
  },
  {
    id: 'hab-data-analysis',
    title: 'Data Analysis (~3–4 hrs)',
    category: 'projects_skills',
    frequencyType: 'specific-days',
    targetDays: [5, 6], // Fri, Sat
    daysLabel: 'Fri, Sat',
    completedDates: []
  },
  {
    id: 'hab-ai-automation',
    title: 'AI Automation (1 hr)',
    category: 'projects_skills',
    frequencyType: 'specific-days',
    targetDays: [0, 1, 2, 3, 4], // Sun-Thu
    daysLabel: 'Sun through Thu',
    completedDates: []
  },
  {
    id: 'hab-research',
    title: 'Research Session (~45m)',
    category: 'research',
    frequencyType: 'specific-days',
    targetDays: [0, 1, 3, 4, 5], // Sun, Mon, Wed, Thu, Fri
    daysLabel: 'Sun, Mon, Wed, Thu, Fri',
    completedDates: []
  }
];

export const INITIAL_SLEEP_RECORDS: SleepRecord[] = [];

export const INITIAL_READING_LOGS: Record<string, ReadingLog> = {};

export const INITIAL_FINANCE_ENTRIES: FinanceEntry[] = [];

export const INITIAL_RELIGION_STATES: Record<string, ReligionState> = {
  '2026-09-08': {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    morningAdhkar: false,
    noonAdhkar: false,
    quranPagesToday: 0
  }
};
