import {
  User,
  MoodLog,
  ActivitySummary,
  JournalEntry,
  ChatMessage,
  Affirmation,
  HealthTip
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('hc_token');
  const customKey = localStorage.getItem('hc_gemini_key') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (customKey) {
    headers['x-gemini-key'] = customKey;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async register(data: Partial<User> & { password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  async demoLogin(): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Demo login failed');
    }
    return res.json();
  },

  async getProfile(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch profile');
    }
    return res.json();
  },

  async updateProfile(profile: Partial<User>): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update profile');
    }
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to request password reset');
    }
    return res.json();
  },

  // AI Chat
  async sendChatMessage(message: string, companionType: 'mind' | 'fit' | 'unified'): Promise<{
    reply: string;
    companionType: string;
    guardrailTriggered: boolean;
    source: string;
    messageId: number;
    timestamp: string;
  }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, companionType }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send message to AI');
    }
    return res.json();
  },

  async getChatHistory(companionType: 'mind' | 'fit' | 'unified' | 'all'): Promise<{ messages: ChatMessage[] }> {
    const res = await fetch(`${API_BASE}/ai/history?companionType=${companionType}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return { messages: [] };
    }
    return res.json();
  },

  async clearChatHistory(companionType: 'mind' | 'fit' | 'unified' | 'all'): Promise<void> {
    await fetch(`${API_BASE}/ai/clear`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ companionType }),
    });
  },

  // Wellness
  async getMoods(): Promise<{ moods: MoodLog[] }> {
    const res = await fetch(`${API_BASE}/wellness/mood`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { moods: [] };
    return res.json();
  },

  async logMood(moodLevel: number, moodTag: string, note?: string): Promise<{ log: MoodLog }> {
    const res = await fetch(`${API_BASE}/wellness/mood`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ moodLevel, moodTag, note }),
    });
    if (!res.ok) throw new Error('Failed to record mood');
    return res.json();
  },

  async getActivitySummary(): Promise<ActivitySummary> {
    const res = await fetch(`${API_BASE}/wellness/activity`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      // Default fallback activity state
      return {
        today: {
          steps: 7420,
          stepsGoal: 10000,
          water: 6,
          waterGoal: 8,
          workoutMinutes: 30,
          workoutGoal: 45,
          caloriesBurned: 420
        },
        weeklyTrends: [
          { date: '2026-09-19', day: 'Sat', steps: 8500, water: 7, workoutMinutes: 40 },
          { date: '2026-09-20', day: 'Sun', steps: 6200, water: 6, workoutMinutes: 20 },
          { date: '2026-09-21', day: 'Mon', steps: 9100, water: 8, workoutMinutes: 45 },
          { date: '2026-09-22', day: 'Tue', steps: 7800, water: 7, workoutMinutes: 30 },
          { date: '2026-09-23', day: 'Wed', steps: 10400, water: 8, workoutMinutes: 50 },
          { date: '2026-09-24', day: 'Thu', steps: 8900, water: 7, workoutMinutes: 35 },
          { date: '2026-09-25', day: 'Fri', steps: 7420, water: 6, workoutMinutes: 30 }
        ],
        recentWorkouts: []
      };
    }
    return res.json();
  },

  async logActivity(data: {
    activityType: 'steps' | 'water' | 'workout';
    metricValue: number;
    details?: any;
    replaceToday?: boolean;
  }): Promise<void> {
    await fetch(`${API_BASE}/wellness/activity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  async getJournals(): Promise<{ entries: JournalEntry[] }> {
    const res = await fetch(`${API_BASE}/wellness/journal`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { entries: [] };
    return res.json();
  },

  async addJournal(title: string, content: string, moodAssociated?: string, tags?: string[]): Promise<{ entry: JournalEntry }> {
    const res = await fetch(`${API_BASE}/wellness/journal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, content, moodAssociated, tags }),
    });
    if (!res.ok) throw new Error('Failed to save journal');
    return res.json();
  },

  async deleteJournal(id: number): Promise<void> {
    await fetch(`${API_BASE}/wellness/journal/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  async getAffirmations(): Promise<{
    todayAffirmation: Affirmation;
    allAffirmations: Affirmation[];
    healthTips: HealthTip[];
  }> {
    const res = await fetch(`${API_BASE}/wellness/affirmations`);
    if (!res.ok) {
      return {
        todayAffirmation: {
          text: "My mind is calm, my body is strong, and I take things one breath at a time.",
          category: "Peace"
        },
        allAffirmations: [],
        healthTips: []
      };
    }
    return res.json();
  }
};
