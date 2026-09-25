import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Droplets, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface WaterTrackerProps {
  initialGlasses?: number;
  targetGlasses?: number;
  onUpdate?: (newGlasses: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  initialGlasses = 6,
  targetGlasses = 8,
  onUpdate
}) => {
  const [glasses, setGlasses] = useState<number>(initialGlasses);
  const [saving, setSaving] = useState(false);

  const percentage = Math.min(100, Math.round((glasses / targetGlasses) * 100));

  const updateWater = async (newVal: number) => {
    const clamped = Math.max(0, newVal);
    setGlasses(clamped);
    if (onUpdate) onUpdate(clamped);

    if (clamped === targetGlasses && clamped > glasses) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    }

    try {
      setSaving(true);
      await api.logActivity({
        activityType: 'water',
        metricValue: clamped,
        details: { target: targetGlasses, unit: 'glasses', ml: clamped * 250 },
        replaceToday: true
      });
    } catch (e) {
      console.warn('Could not sync water intake to server:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-wellness-darkCard border border-blue-100 dark:border-slate-800 shadow-sm transition-all">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
            <Droplets className="w-5 h-5 fill-blue-500/20" />
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Hydration Tracker</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Target: {targetGlasses * 250} ml (8 glasses)</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {glasses}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500"> / {targetGlasses} cups</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-blue-100 dark:bg-slate-800 rounded-full h-3 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-400 to-teal-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Interactive Glasses Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-6">
        {Array.from({ length: targetGlasses }).map((_, index) => {
          const isFilled = index < glasses;
          return (
            <button
              key={index}
              onClick={() => updateWater(isFilled && index === glasses - 1 ? index : index + 1)}
              className={`group flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                isFilled
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
              title={`Glass ${index + 1}`}
            >
              <div
                className={`w-6 h-9 rounded-b-lg border-2 transition-all flex items-end justify-center pb-1 ${
                  isFilled
                    ? 'border-blue-500 bg-gradient-to-t from-blue-500 to-blue-300 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {isFilled && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                250ml
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Action +/- Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {glasses >= targetGlasses
            ? '🎉 Hydration target reached!'
            : `${targetGlasses - glasses} more glasses to optimal hydration.`}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateWater(glasses - 1)}
            disabled={glasses === 0}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateWater(glasses + 1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Drink Glass</span>
          </button>
        </div>
      </div>

    </div>
  );
};
