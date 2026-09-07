/**
 * Date and time helper utilities for Personal Progress Tracker
 */

export function getTodayDateKey(): string {
  return '2026-09-08';
}

export function formatDateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatFriendlyDate(key: string): string {
  const date = parseDateFromKey(key);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDayOfWeekIndex(key: string): number {
  return parseDateFromKey(key).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
}

export function getWeekRange(key: string): { startKey: string; endKey: string; dates: string[] } {
  const date = parseDateFromKey(key);
  const day = date.getDay(); // 0 is Sunday
  // Let week start on Sunday or Monday. Let's align with Sunday through Saturday or Monday through Sunday.
  // The schedule has AI Automation Sun-Thu, SAT Tue/Fri/Sat, Gym Fri/Sat/Mon/Wed. Sunday is start of work/study week for school.
  // So Sunday to Saturday is natural.
  const diff = date.getDate() - day; // Sunday of this week
  const sunday = new Date(date.setDate(diff));
  
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    dates.push(formatDateToKey(nextDate));
  }

  return {
    startKey: dates[0],
    endKey: dates[6],
    dates
  };
}

export interface PeriodInfo {
  periodName: string;
  badgeText: string;
  wakeTime: string;
  sleepTime: string;
  activeWindow: string;
  contextNote: string;
  isSchoolPeriod: boolean;
}

export function getSeptemberPeriodInfo(key: string): PeriodInfo {
  const date = parseDateFromKey(key);
  const month = date.getMonth(); // 8 = September (0-indexed)
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday / Saturday or Sat/Sun

  // If in September and 20 or later
  if (month === 8 && day >= 20) {
    if (dayOfWeek >= 0 && dayOfWeek <= 4) {
      // Sunday through Thursday (School period)
      return {
        periodName: 'Period 2: School Term (Sep 20–30)',
        badgeText: 'School Routine',
        wakeTime: '05:00',
        sleepTime: '21:00',
        activeWindow: '05:00 → 21:00',
        contextNote: 'School 08:00–15:00 • Productive blocks: 05:00–07:00 & 16:30–20:00',
        isSchoolPeriod: true
      };
    } else {
      // Weekend
      return {
        periodName: 'Period 2: Weekend (Sep 20–30)',
        badgeText: 'Weekend Flexibility',
        wakeTime: '08:00',
        sleepTime: '23:00',
        activeWindow: '08:00 → 23:00',
        contextNote: 'Focus on SAT, Research, Skills, and lighter academics',
        isSchoolPeriod: false
      };
    }
  }

  // Otherwise Period 1 (Sep 8–20 or general pre-school preparation)
  return {
    periodName: 'Period 1: Foundation & Prep (Sep 8–20)',
    badgeText: 'Pre-School Foundation',
    wakeTime: '08:00',
    sleepTime: '23:00',
    activeWindow: '08:00 → 23:00',
    contextNote: 'Daily wake at 08:00, sleep at 23:00 • Deep study blocks & preparation',
    isSchoolPeriod: false
  };
}

export function calculateSleepDuration(sleepTime: string, wakeTime: string): number {
  if (!sleepTime || !wakeTime) return 0;
  const [sleepH, sleepM] = sleepTime.split(':').map(Number);
  const [wakeH, wakeM] = wakeTime.split(':').map(Number);

  let sleepMinutes = sleepH * 60 + sleepM;
  let wakeMinutes = wakeH * 60 + wakeM;

  // Handle midnight crossing
  if (wakeMinutes <= sleepMinutes) {
    wakeMinutes += 24 * 60;
  }

  const diffMinutes = wakeMinutes - sleepMinutes;
  return Number((diffMinutes / 60).toFixed(1));
}
