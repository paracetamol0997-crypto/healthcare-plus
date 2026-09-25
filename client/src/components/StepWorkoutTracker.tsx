import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Footprints, Dumbbell, Flame, Compass, Plus, Clock, Check, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { WorkoutLog } from '../types';

interface StepWorkoutTrackerProps {
  initialSteps?: number;
  stepsGoal?: number;
  initialWorkouts?: WorkoutLog[];
  onRefresh?: () => void;
}

const WORKOUT_TYPES = [
  { name: 'Walking', icon: '🚶‍♂️', caloriesPerMin: 4.2 },
  { name: 'Running', icon: '🏃‍♂️', caloriesPerMin: 11.5 },
  { name: 'Gym Workouts', icon: '🏋️‍♂️', caloriesPerMin: 6.5 },
  { name: 'Yoga', icon: '🧘‍♀️', caloriesPerMin: 3.8 },
  { name: 'Stretching', icon: '🤸‍♂️', caloriesPerMin: 2.9 },
  { name: 'HIIT', icon: '⚡', caloriesPerMin: 12.0 },
  { name: 'Cycling', icon: '🚴‍♂️', caloriesPerMin: 8.0 }
];

export const StepWorkoutTracker: React.FC<StepWorkoutTrackerProps> = ({
  initialSteps = 7420,
  stepsGoal = 10000,
  initialWorkouts = [],
  onRefresh
}) => {
  const [steps, setSteps] = useState<number>(initialSteps);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedWorkout, setSelectedWorkout] = useState<string>('Walking');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [intensity, setIntensity] = useState<string>('Moderate');
  const [saving, setSaving] = useState<boolean>(false);
  const [workoutsList, setWorkoutsList] = useState<WorkoutLog[]>(initialWorkouts);

  const stepsPercentage = Math.min(100, Math.round((steps / stepsGoal) * 100));
  const distanceKm = (steps * 0.00075).toFixed(1);
  const stepsCalories = Math.round(steps * 0.04);

  const addSteps = async (count: number) => {
    const updated = steps + count;
    setSteps(updated);

    if (updated >= stepsGoal && steps < stepsGoal) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    try {
      await api.logActivity({
        activityType: 'steps',
        metricValue: updated,
        details: { distanceKm: (updated * 0.00075).toFixed(1), calories: Math.round(updated * 0.04) },
        replaceToday: true
      });
      if (onRefresh) onRefresh();
    } catch (e) {
      console.warn('Error saving steps:', e);
    }
  };

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const typeConfig = WORKOUT_TYPES.find(w => w.name === selectedWorkout);
    const multiplier = intensity === 'High' ? 1.3 : intensity === 'Light' ? 0.8 : 1.0;
    const estCalories = Math.round((typeConfig?.caloriesPerMin || 5) * durationMinutes * multiplier);

    try {
      await api.logActivity({
        activityType: 'workout',
        metricValue: durationMinutes,
        details: {
          workoutType: selectedWorkout,
          intensity,
          calories: estCalories
        }
      });

      const newLog: WorkoutLog = {
        id: Date.now(),
        userId: 1,
        activityType: 'workout',
        metricValue: durationMinutes,
        details: {
          workoutType: selectedWorkout,
          intensity,
          calories: estCalories
        },
        logDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      setWorkoutsList([newLog, ...workoutsList]);
      setShowLogModal(false);

      confetti({
        particleCount: 30,
        spread: 45
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn('Error logging workout:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Steps Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-wellness-darkCard border border-emerald-100 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Daily Steps</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Goal: {stepsGoal.toLocaleString()} steps</p>
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {steps.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-emerald-100 dark:bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${stepsPercentage}%` }}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Compass className="w-4 h-4 text-teal-500" />
            <div>
              <span className="text-[11px] text-slate-400 block">Distance</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{distanceKm} km</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <div>
              <span className="text-[11px] text-slate-400 block">Burned</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">~{stepsCalories} kcal</span>
            </div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">Quick Log:</span>
          <button
            onClick={() => addSteps(500)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
          >
            +500 steps
          </button>
          <button
            onClick={() => addSteps(1000)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
          >
            +1,000 steps
          </button>
          <button
            onClick={() => addSteps(2500)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
          >
            +2,500 steps
          </button>
        </div>
      </div>

      {/* Workout Logger Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-wellness-darkCard border border-blue-100 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Workout Log</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track gym, running, yoga, or stretching</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Log Exercise</span>
          </button>
        </div>

        {/* Recent Workouts List */}
        {workoutsList.length > 0 ? (
          <div className="space-y-2 mt-4">
            {workoutsList.slice(0, 4).map((w, idx) => (
              <div
                key={w.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-base shadow-sm">
                    {WORKOUT_TYPES.find(wt => wt.name === w.details?.workoutType)?.icon || '💪'}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {w.details?.workoutType || 'Workout Session'}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      Intensity: {w.details?.intensity || 'Moderate'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                    {w.metricValue} mins
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ~{w.details?.calories || Math.round(Number(w.metricValue) * 5)} kcal
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">No workouts logged yet today. Click &quot;Log Exercise&quot; to begin!</p>
          </div>
        )}
      </div>

      {/* Workout Logger Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-wellness-darkCard rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Record Workout Session</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogWorkout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  Select Activity
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WORKOUT_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.name}
                      onClick={() => setSelectedWorkout(type.name)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all ${
                        selectedWorkout === type.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{type.icon}</span>
                      <span>{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Duration (minutes): <span className="text-blue-600 dark:text-blue-400 font-bold">{durationMinutes} min</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Intensity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Light', 'Moderate', 'High'].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setIntensity(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        intensity === lvl
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
