export interface User {
  id: number;
  name: string;
  email: string;
  age?: number | null;
  gender?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  fitnessGoals?: string;
  mentalWellnessGoals?: string;
  bmiInfo?: BmiInfo | null;
}

export interface BmiInfo {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity';
  advice: string;
}

export interface MoodLog {
  id: number;
  userId: number;
  moodLevel: number; // 1 to 5
  moodTag: string; // e.g. "Joyful", "Calm", "Neutral", "Anxious", "Stressed", "Low"
  note: string;
  loggedAt: string;
}

export interface ActivityToday {
  steps: number;
  stepsGoal: number;
  water: number;
  waterGoal: number;
  workoutMinutes: number;
  workoutGoal: number;
  caloriesBurned: number;
}

export interface WeeklyTrend {
  date: string;
  day: string;
  steps: number;
  water: number;
  workoutMinutes: number;
}

export interface WorkoutLog {
  id: number;
  userId: number;
  activityType: 'workout' | 'steps' | 'water';
  metricValue: number;
  details: {
    workoutType?: string;
    intensity?: string;
    calories?: number;
    distanceKm?: number;
    target?: number;
  };
  logDate: string;
  createdAt: string;
}

export interface ActivitySummary {
  today: ActivityToday;
  weeklyTrends: WeeklyTrend[];
  recentWorkouts: WorkoutLog[];
}

export interface JournalEntry {
  id: number;
  userId: number;
  title: string;
  content: string;
  moodAssociated: string;
  tags: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: number | string;
  companionType: 'mind' | 'fit' | 'unified';
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  guardrailTriggered?: boolean;
}

export interface Affirmation {
  text: string;
  category: string;
}

export interface HealthTip {
  title: string;
  text: string;
  icon: string;
}
