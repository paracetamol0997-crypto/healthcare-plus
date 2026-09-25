import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Heart,
  Activity,
  Brain,
  Scale,
  Ruler,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  Key,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || 'Pavan');
  const [age, setAge] = useState(user?.age ? String(user.age) : '28');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [heightCm, setHeightCm] = useState(user?.heightCm ? String(user.heightCm) : '175');
  const [weightKg, setWeightKg] = useState(user?.weightKg ? String(user.weightKg) : '72');
  const [fitnessGoals, setFitnessGoals] = useState(
    user?.fitnessGoals || 'Maintain daily 10,000 steps, build core strength, and improve posture.'
  );
  const [mentalWellnessGoals, setMentalWellnessGoals] = useState(
    user?.mentalWellnessGoals || 'Manage work stress, practice daily 5-minute breathing, and achieve 7.5 hours of sleep.'
  );
  
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('hc_gemini_key') || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state if user loads later
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.age) setAge(String(user.age));
      if (user.gender) setGender(user.gender);
      if (user.heightCm) setHeightCm(String(user.heightCm));
      if (user.weightKg) setWeightKg(String(user.weightKg));
      if (user.fitnessGoals) setFitnessGoals(user.fitnessGoals);
      if (user.mentalWellnessGoals) setMentalWellnessGoals(user.mentalWellnessGoals);
    }
  }, [user]);

  // Live BMI calculation
  const hM = Number(heightCm) > 0 ? Number(heightCm) / 100 : 0;
  const bmiVal = hM > 0 && Number(weightKg) > 0 ? (Number(weightKg) / (hM * hM)).toFixed(1) : null;

  let bmiCategory = 'Normal weight';
  let bmiColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200';
  if (bmiVal) {
    const num = Number(bmiVal);
    if (num < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200';
    } else if (num >= 25 && num < 29.9) {
      bmiCategory = 'Overweight';
      bmiColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200';
    } else if (num >= 30) {
      bmiCategory = 'Obesity';
      bmiColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200';
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      if (geminiKey.trim()) {
        localStorage.setItem('hc_gemini_key', geminiKey.trim());
      } else {
        localStorage.removeItem('hc_gemini_key');
      }

      await updateProfile({
        name,
        age: age ? Number(age) : undefined,
        gender,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        fitnessGoals,
        mentalWellnessGoals
      });

      setSuccessMsg('Profile and wellness goals updated successfully!');
      confetti({
        particleCount: 30,
        spread: 45
      });

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-slate-50/50 dark:bg-wellness-dark transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Personalized Wellness Blueprint
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Your Health Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Information provided here informs your Mind Companion and Fit Companion guidance.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-white block">{name}</span>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Section 1: Vital Metrics & BMI Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-500" />
              <span>Physical Attributes &amp; Body Mass Index (BMI)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Age (years)
                </label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Gender (optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="90"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 72"
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Live BMI Display */}
              <div className="flex flex-col justify-end">
                <div className={`p-3 rounded-2xl border ${bmiColor} flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">Calculated BMI</span>
                    <span className="font-extrabold text-base">{bmiVal || '--'}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/80">
                    {bmiCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Fitness Goals & Mental Wellness Goals */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Personal Wellness Aspirations</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Physical Fitness Goals
                </label>
                <textarea
                  rows={2}
                  value={fitnessGoals}
                  onChange={(e) => setFitnessGoals(e.target.value)}
                  placeholder="e.g. Maintain 10k steps daily, improve posture, build core strength, or run 5k."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Mental Well-Being &amp; Mindset Goals
                </label>
                <textarea
                  rows={2}
                  value={mentalWellnessGoals}
                  onChange={(e) => setMentalWellnessGoals(e.target.value)}
                  placeholder="e.g. Manage work anxiety, practice evening 4-7-8 breathing, build consistent 7+ hours of sleep."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Gemini API Key Setting (Optional) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" />
              <span>AI Engine Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The application operates smoothly with the built-in Health &amp; Wellness Engine. If you wish to connect your own Google Gemini API key directly, paste it below.
            </p>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Google Gemini API Key (optional)"
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
