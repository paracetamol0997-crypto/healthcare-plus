import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  Heart,
  Brain,
  Activity,
  Footprints,
  Droplets,
  Flame,
  Clock,
  Sparkles,
  Smile,
  ArrowRight,
  Plus,
  RefreshCw,
  Wind,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MoodTrackerModal } from '../components/MoodTrackerModal';
import { BreathingExercise } from '../components/BreathingExercise';
import { WaterTracker } from '../components/WaterTracker';
import { ActivitySummary, MoodLog, Affirmation, HealthTip } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [showMoodModal, setShowMoodModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartMetric, setChartMetric] = useState<'steps' | 'water' | 'workoutMinutes'>('steps');

  // Compute time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user ? user.name : 'Pavan';
  const latestMood = moods.length > 0 ? moods[0] : null;

  const loadData = async () => {
    try {
      setLoading(true);
      const [actRes, moodRes, affRes] = await Promise.all([
        api.getActivitySummary(),
        api.getMoods(),
        api.getAffirmations()
      ]);
      setActivity(actRes);
      setMoods(moodRes.moods || []);
      setAffirmation(affRes.todayAffirmation);
      setHealthTips(affRes.healthTips || []);
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todaySteps = activity?.today.steps || 7420;
  const todayGoal = activity?.today.stepsGoal || 10000;
  const stepsPercent = Math.min(100, Math.round((todaySteps / todayGoal) * 100));

  const todayWater = activity?.today.water || 6;
  const waterGoal = activity?.today.waterGoal || 8;

  const todayWorkoutMin = activity?.today.workoutMinutes || 35;
  const todayCalories = activity?.today.caloriesBurned || 420;

  return (
    <div className="min-h-screen pb-16 bg-slate-50/50 dark:bg-wellness-dark transition-colors">
      
      {/* Top Banner / Hero Greeting */}
      <section className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-blue-50/70 dark:from-slate-900 dark:via-wellness-darkCard dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
                  🔥 7-Day Wellness Streak
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {getGreeting()}, <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{userName}</span>!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
                How are you feeling today? Your companions are ready to support you.
              </p>
            </div>

            {/* Quick Mood Status & Log Button */}
            <div className="flex items-center gap-3">
              {latestMood ? (
                <div className="p-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-xl">
                    {latestMood.moodTag === 'Joyful' ? '🌟' : latestMood.moodTag === 'Calm' ? '🌿' : latestMood.moodTag === 'Stressed' ? '🔥' : '☁️'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Mood</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {latestMood.moodTag}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowMoodModal(true)}
                    className="ml-2 text-xs text-emerald-600 hover:text-emerald-700 font-bold underline"
                  >
                    Update
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMoodModal(true)}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Smile className="w-4 h-4" />
                  <span>Log Daily Mood</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Daily Affirmation Card */}
        {affirmation && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                  Today&apos;s Mindful Affirmation
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 italic">
                  &ldquo;{affirmation.text}&rdquo;
                </p>
              </div>
            </div>
            <Link
              to="/mental-health"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
            >
              <span>Mind Space</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 4 Core Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Steps */}
          <div className="p-5 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Daily Steps
              </span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <Footprints className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {todaySteps.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">/ {todayGoal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-emerald-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stepsPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {stepsPercent}% of daily 10,000 steps goal
            </span>
          </div>

          {/* Water */}
          <div className="p-5 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Hydration
              </span>
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {todayWater}
              </span>
              <span className="text-xs text-slate-400">/ {waterGoal} glasses</span>
            </div>
            <div className="w-full bg-blue-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((todayWater / waterGoal) * 100))}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {todayWater * 250} ml drank today
            </span>
          </div>

          {/* Workout Minutes */}
          <div className="p-5 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Movement
              </span>
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {todayWorkoutMin}
              </span>
              <span className="text-xs text-slate-400">mins active</span>
            </div>
            <div className="w-full bg-amber-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((todayWorkoutMin / 45) * 100))}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Goal: 45 active minutes
            </span>
          </div>

          {/* Caloric Burn */}
          <div className="p-5 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Energy
              </span>
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ~{todayCalories}
              </span>
              <span className="text-xs text-slate-400">kcal</span>
            </div>
            <div className="w-full bg-rose-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-rose-500 h-full rounded-full w-3/4" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Steps &amp; workout combined
            </span>
          </div>

        </div>

        {/* Middle Row: Progress Charts & Quick AI Companion Launch */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 7-Day Wellness Trends Chart (2 Columns) */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  7-Day Wellness Progress
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consistency is the root of sustainable vitality.
                </p>
              </div>

              {/* Metric Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto">
                <button
                  onClick={() => setChartMetric('steps')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    chartMetric === 'steps'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Steps
                </button>
                <button
                  onClick={() => setChartMetric('water')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    chartMetric === 'water'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Water
                </button>
                <button
                  onClick={() => setChartMetric('workoutMinutes')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    chartMetric === 'workoutMinutes'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Workouts
                </button>
              </div>
            </div>

            {/* Recharts Component */}
            <div className="h-64 w-full">
              {activity && activity.weeklyTrends ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activity.weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={chartMetric === 'steps' ? '#10b981' : chartMetric === 'water' ? '#3b82f6' : '#f59e0b'}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor={chartMetric === 'steps' ? '#10b981' : chartMetric === 'water' ? '#3b82f6' : '#f59e0b'}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={chartMetric}
                      stroke={chartMetric === 'steps' ? '#10b981' : chartMetric === 'water' ? '#3b82f6' : '#f59e0b'}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorMetric)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading progress chart...
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Goal Target: {chartMetric === 'steps' ? '10,000 steps/day' : chartMetric === 'water' ? '8 cups/day' : '45 active mins'}</span>
              <Link to="/physical-health" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                View Full Workout Logs &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Launch Companions (1 Column) */}
          <div className="space-y-4">
            
            {/* Mind Companion Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20">
                    Mental Health
                  </span>
                </div>
                <h4 className="font-extrabold text-lg">Mind Companion AI</h4>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Feeling overwhelmed or need a quick breathing exercise? Let&apos;s talk through it.
                </p>
                <div className="pt-2">
                  <Link
                    to="/chat?companion=mind"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow hover:bg-emerald-50 transition-all hover:scale-105"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Talk to Mind Companion</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Fit Companion Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20">
                    Physical Fitness
                  </span>
                </div>
                <h4 className="font-extrabold text-lg">Fit Companion AI</h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Looking for workout routines, form guidance, or nutritious meal ideas?
                </p>
                <div className="pt-2">
                  <Link
                    to="/chat?companion=fit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-800 font-bold text-xs shadow hover:bg-blue-50 transition-all hover:scale-105"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Talk to Fit Companion</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Lower Row: Breathing Exercise Widget & Water Tracker & Health Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quick Guided Breathing Session */}
          <div>
            <BreathingExercise />
          </div>

          {/* Quick Water Tracker & Health Tips */}
          <div className="space-y-6">
            <WaterTracker
              initialGlasses={todayWater}
              targetGlasses={waterGoal}
              onUpdate={(newG) => {
                if (activity) {
                  setActivity({
                    ...activity,
                    today: { ...activity.today, water: newG }
                  });
                }
              }}
            />

            {/* Daily Health Tips Accordion/Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Doctor&apos;s Daily Health Tip</span>
              </h4>
              {healthTips.length > 0 ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300">
                  <strong className="block text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                    {healthTips[0].title}
                  </strong>
                  <p>{healthTips[0].text}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Hydrate before coffee, aim for 8,000+ steps, and take 3 deep belly breaths whenever tense.
                </p>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Mood Tracker Modal */}
      <MoodTrackerModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onLogged={(log) => {
          setMoods([log, ...moods]);
        }}
      />

    </div>
  );
};
