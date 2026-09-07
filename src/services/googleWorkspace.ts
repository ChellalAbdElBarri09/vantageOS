import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { TaskItem } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with desired Workspace scopes
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/tasks');

// In-memory token cache (strictly NOT in localStorage or sessionStorage per skill rule)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google using popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from credentials.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/* --- GOOGLE CALENDAR API --- */
export interface CalendarEventPayload {
  summary: string;
  description?: string;
  startDateTime: string; // ISO string e.g. "2026-09-07T09:00:00Z"
  endDateTime: string; // ISO string e.g. "2026-09-07T10:30:00Z"
}

export async function createCalendarEvent(event: CalendarEventPayload): Promise<any> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication required: No active Google access token.');
  }

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description || 'Personal Progress Tracker scheduled block',
      start: {
        dateTime: event.startDateTime,
      },
      end: {
        dateTime: event.endDateTime,
      }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create calendar event (${response.status})`);
  }

  return await response.json();
}

export async function listUpcomingCalendarEvents(): Promise<any[]> {
  const token = getAccessToken();
  if (!token) return [];

  const now = new Date().toISOString();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&maxResults=10&singleEvents=true&orderBy=startTime`, 
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  if (!response.ok) return [];
  const data = await response.json();
  return data.items || [];
}

/* --- GOOGLE TASKS API --- */
export async function getPrimaryTaskListId(): Promise<string> {
  const token = getAccessToken();
  if (!token) throw new Error('No access token available');

  const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('Failed to retrieve Google Task lists');
  const data = await response.json();
  if (data.items && data.items.length > 0) {
    return data.items[0].id;
  }
  return '@default';
}

export async function syncTaskToGoogleTasks(task: TaskItem): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error('No access token available');

  const listId = await getPrimaryTaskListId();
  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: task.name,
      notes: `Category: ${task.category} • Duration: ${task.approximateDuration || 'Flexible'} • Tracked in Personal Progress Tracker`,
      status: task.completed ? 'completed' : 'needsAction',
      due: `${task.date}T23:59:59.000Z`
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to sync to Google Tasks (${response.status})`);
  }

  return await response.json();
}
