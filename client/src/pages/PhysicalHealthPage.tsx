import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  Footprints,
  Dumbbell,
  Droplets,
  Flame,
  Clock,
  Heart,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Utensils,
  Zap,
  Target
} from 'lucide-react';
import { api } from '../services/api';
import { StepWorkoutTracker } from '../components/StepWorkoutTracker';
import { WaterTracker } from '../components/WaterTracker';
import { ChatInterface } from '../components/ChatInterface';
import { ActivitySummary } from '../types';

interface WorkoutPlan {
  id: string;
  title: string;
  level: string;
  duration: string;
  category: string;
  calories: string;
  description: string;
  image: string;
  exercises: { name: string; reps: string; tip: string }[];
}

const FIT_ACTIVITIES = [
  {
    id: 'overview',
    title: 'Daily Steps & Activity',
    subtitle: 'Cardiovascular Vitality',
    desc: 'Pedometry log, caloric burn calculations, distance tracking, and quick increment buttons.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
    badge: '10k Target',
    buttonText: 'View Tracker'
  },
  {
    id: 'plans',
    title: 'Guided Exercise Plans',
    subtitle: 'Strength & Mobility',
    desc: 'Desk worker posture resets, full-body beginner routines, and yoga flows with live timers.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    badge: 'Step-by-Step',
    buttonText: 'Start Routine'
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Clean Plate',
    subtitle: 'Cellular Nourishment',
    desc: 'The 50/25/25 anti-inflammatory plate method, micronutrients, and 8-cup hydration station.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
    badge: 'Clean Plate',
    buttonText: 'Explore Food'
  },
  {
    id: 'chat',
    title: 'Fit Companion AI Coach',
    subtitle: '24/7 Trainer Guidance',
    desc: 'Ask about exercise form, tailored home workout variations, and post-workout recovery tips.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    badge: 'AI Coach',
    buttonText: 'Ask Trainer'
  }
];

const EXERCISE_PLANS: WorkoutPlan[] = [
  {
    id: 'desk-stretch',
    title: 'Desk Worker Posture Reset',
    level: 'All Levels',
    duration: '6 mins',
    category: 'Stretching & Mobility',
    calories: '25 kcal',
    description: 'Relieve neck tension, open tight chest muscles, and decompress your lumbar spine.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    exercises: [
      { name: 'Chin Tucks & Neck Rolls', reps: '10 reps each side', tip: 'Slow and gentle. Keep shoulders relaxed.' },
      { name: 'Doorway Chest Opener', reps: '30 seconds hold', tip: 'Place forearm against frame and gently rotate away.' },
      { name: 'Seated Spinal Twist', reps: '5 deep breaths each side', tip: 'Sit tall before gently twisting from your torso.' },
      { name: 'Wrist Flexor & Extensor Stretch', reps: '30 seconds each', tip: 'Crucial for typing fatigue and carpal comfort.' }
    ]
  },
  {
    id: 'beginner-strength',
    title: 'Full-Body Foundation Routine',
    level: 'Beginner',
    duration: '20 mins',
    category: 'Gym / Home Strength',
    calories: '140 kcal',
    description: 'Build core stability, protect knees, and ignite functional metabolic energy.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    exercises: [
      { name: 'Bodyweight or Chair Squats', reps: '3 sets of 10 reps', tip: 'Drive through your heels; keep knees tracking over toes.' },
      { name: 'Incline Wall or Bench Push-ups', reps: '3 sets of 8 reps', tip: 'Keep a straight line from heels to head.' },
      { name: 'Glute Bridges', reps: '3 sets of 12 reps', tip: 'Squeeze glutes at the top for 2 seconds.' },
      { name: 'Bird-Dog Core Hold', reps: '10 alternating reps', tip: 'Move deliberately without arching your lower back.' }
    ]
  },
  {
    id: 'morning-flow',
    title: 'Sunrise Energy Yoga Flow',
    level: 'Gentle',
    duration: '15 mins',
    category: 'Yoga & Balance',
    calories: '65 kcal',
    description: 'Awaken joints, oxygenate blood flow, and establish a centered focus for the day.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    exercises: [
      { name: 'Cat-Cow Spinal Breathing', reps: '8 slow cycles', tip: 'Inhale arching up, exhale rounding your spine.' },
      { name: 'Downward-Facing Dog', reps: '5 slow breaths', tip: 'Pedal heels to gently wake up hamstrings.' },
      { name: 'Low Lunge Hip Opener', reps: '30 seconds each leg', tip: 'Tuck pelvis slightly to stretch the hip flexors.' },
      { name: 'Child’s Pose Integration', reps: '1 minute stillness', tip: 'Rest forehead gently on your mat and breathe deep.' }
    ]
  }
];

export const PhysicalHealthPage: React.FC = () => {
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'nutrition' | 'chat'>('overview');
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan>(EXERCISE_PLANS[0]);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const summary = await api.getActivitySummary();
      setActivity(summary);
    } catch (e) {
      console.warn('Error loading physical health activity:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer loop for workout exercises
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && activeTimer !== null && activeTimer > 0) {
      interval = setInterval(() => {
        setActiveTimer(t => (t ? t - 1 : 0));
      }, 1000);
    } else if (activeTimer === 0) {
      setTimerRunning(false);
      confetti({ particleCount: 30, spread: 50 });
    }
    return () => clearInterval(interval);
  }, [timerRunning, activeTimer]);

  const startExerciseTimer = (seconds: number) => {
    setActiveTimer(seconds);
    setTimerRunning(true);
  };

  return (
    <div className="min-h-screen pb-16 bg-slate-50/50 dark:bg-wellness-dark transition-colors">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-100/60 via-teal-50 to-emerald-50/60 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-b border-blue-100 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                  <Activity className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  Fit Companion AI Hub
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Physical Fitness &amp; Vitality
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                Track daily steps, log workouts, maintain hydration, and follow guided exercise plans suited to your pace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('plans')}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Explore Workouts</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar pt-2">
            {[
              { id: 'overview', label: 'Activity & Tracker', icon: Footprints },
              { id: 'plans', label: 'Guided Exercise Plans', icon: Dumbbell },
              { id: 'nutrition', label: 'Nutrition & Hydration', icon: Utensils },
              { id: 'chat', label: 'Fit Companion AI', icon: MessageSquare, highlight: true }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Fit Activities Visual Showcase Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Physical Vitality Activities
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Energize your body with functional movement, daily steps, hydration, and nutrition
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FIT_ACTIVITIES.map((act) => {
              const isCurrent = activeTab === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setActiveTab(act.id as any)}
                  className={`group cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-wellness-darkCard border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
                    isCurrent
                      ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={act.image}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-600/90 text-white shadow-sm backdrop-blur-sm">
                      {act.badge}
                    </span>
                    <span className="absolute bottom-2 left-3 right-3 text-xs font-bold text-white drop-shadow truncate">
                      {act.title}
                    </span>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                        {act.subtitle}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {act.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`}>
                        {isCurrent ? '● Active Now' : act.buttonText}
                      </span>
                      <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TAB 1: OVERVIEW & TRACKERS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <StepWorkoutTracker
                initialSteps={activity?.today.steps}
                stepsGoal={activity?.today.stepsGoal}
                initialWorkouts={activity?.recentWorkouts}
                onRefresh={loadData}
              />
            </div>

            <div className="space-y-6">
              <WaterTracker
                initialGlasses={activity?.today.water}
                targetGlasses={activity?.today.waterGoal}
                onUpdate={(newG) => {
                  if (activity) {
                    setActivity({
                      ...activity,
                      today: { ...activity.today, water: newG }
                    });
                  }
                }}
              />

              {/* Quick Workout Motivation */}
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white shadow-sm space-y-3">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20">
                  Trainer Reminder
                </span>
                <h4 className="font-bold text-base">Aim for Non-Exercise Activity (NEAT)</h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Taking the stairs, pacing during phone calls, and 5-minute movement snacks burn more cumulative energy than an isolated 30-minute gym trip.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GUIDED EXERCISE PLANS */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Plans List (1 Col) */}
            <div className="space-y-3">
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">Curated Routines</h4>
              {EXERCISE_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full text-left p-3.5 rounded-3xl border transition-all flex items-center gap-3.5 ${
                    selectedPlan.id === plan.id
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-wellness-darkCard hover:border-slate-300'
                  }`}
                >
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {plan.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">{plan.duration}</span>
                    </div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{plan.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{plan.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Plan Details & Step-by-Step (2 Cols) */}
            <div className="lg:col-span-2 overflow-hidden rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Routine Image Header */}
              <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                <img
                  src={selectedPlan.image}
                  alt={selectedPlan.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600/90 text-white shadow-sm backdrop-blur-sm">
                    {selectedPlan.level}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                    ~{selectedPlan.calories}
                  </span>
                </div>
                <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                    {selectedPlan.category} &bull; {selectedPlan.duration}
                  </span>
                  <h3 className="font-black text-xl sm:text-2xl drop-shadow-md">
                    {selectedPlan.title}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-1">{selectedPlan.description}</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0 space-y-6">
                {/* Active Exercise Timer */}
                {activeTimer !== null && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600 animate-spin" />
                      <div>
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block">Stretch / Hold Timer</span>
                        <span className="text-xl font-black text-blue-600">{activeTimer}s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTimerRunning(!timerRunning)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                      >
                        {timerRunning ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => setActiveTimer(null)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* Step-by-Step Exercise Cards */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Movement Steps</h4>
                  {selectedPlan.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">{ex.name}</h5>
                        </div>
                        <p className="text-xs text-slate-500 pl-7">{ex.tip}</p>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 pl-7 block">
                          Target: {ex.reps}
                        </span>
                      </div>

                      {ex.reps.includes('second') && (
                        <button
                          onClick={() => startExerciseTimer(30)}
                          className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-200 shrink-0"
                        >
                          ⏱ 30s Timer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: NUTRITION & HYDRATION */}
        {activeTab === 'nutrition' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  The Clean Plate Framework
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nourishing your cells with balanced, anti-inflammatory nutrition without counting every gram.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="group overflow-hidden rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex flex-col justify-between">
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
                      alt="Fresh colorful greens and salad"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-xs font-bold text-white drop-shadow">
                      50% Plate Proportion
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">50% Colorful Greens</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      High fiber, micronutrients, polyphenols, and prebiotics for optimal gut biome and mental clarity.
                    </p>
                  </div>
                </div>

                <div className="group overflow-hidden rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between">
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"
                      alt="High quality clean protein bowl"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-xs font-bold text-white drop-shadow">
                      25% Plate Proportion
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300">25% Quality Protein</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Eggs, lentils, tofu, poultry, or wild fish to synthesize neurotransmitters and repair muscle tissue.
                    </p>
                  </div>
                </div>

                <div className="group overflow-hidden rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex flex-col justify-between">
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
                      alt="Smart complex carbohydrates and healthy fats"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-xs font-bold text-white drop-shadow">
                      25% Plate Proportion
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">25% Smart Carbohydrates</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Sweet potatoes, oats, quinoa, brown rice, paired with avocado or olive oil for slow-burning glucose.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <strong className="text-slate-800 dark:text-white block font-bold">Trainer&apos;s Hydration Rule of Thumb:</strong>
                <p>
                  Drink 500ml upon waking, sip throughout the day, and match every 30 minutes of vigorous sweat with 250ml of water and an electrolyte pinch.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEDICATED FIT COMPANION AI CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <ChatInterface initialCompanion="fit" />
          </div>
        )}

      </main>

    </div>
  );
};
