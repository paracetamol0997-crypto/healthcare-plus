import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldAlert, PhoneCall, Sparkles, Activity, Brain } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-50 dark:bg-wellness-darkCard border-t border-slate-200 dark:border-slate-800 transition-colors pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Emergency Crisis Hotline Notice Banner */}
        <div className="mb-10 p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-800 dark:text-rose-200">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">Need immediate support or feeling in crisis?</h4>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                Free, confidential support is available 24/7. Call or text <strong>988</strong> (US/Canada), <strong>111</strong> (UK), or <strong>9152987821</strong> (India).
              </p>
            </div>
          </div>
          <Link
            to="/emergency"
            className="whitespace-nowrap px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm hover:shadow"
          >
            Emergency Resources &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">Health Companion AI</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your personal wellness companion for mental and physical health. Combining the care of a family doctor, wellness mentor, fitness trainer, and mental health companion.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedicated strictly to wellness</span>
            </div>
          </div>

          {/* Mental Health */}
          <div>
            <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-emerald-500" />
              <span>Mind Companion</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/mental-health" className="hover:text-emerald-600 dark:hover:text-emerald-400">Mood Tracker</Link></li>
              <li><Link to="/mental-health" className="hover:text-emerald-600 dark:hover:text-emerald-400">Box & 4-7-8 Breathing</Link></li>
              <li><Link to="/mental-health" className="hover:text-emerald-600 dark:hover:text-emerald-400">Daily Affirmations</Link></li>
              <li><Link to="/mental-health" className="hover:text-emerald-600 dark:hover:text-emerald-400">Mindfulness Journaling</Link></li>
              <li><Link to="/mental-health" className="hover:text-emerald-600 dark:hover:text-emerald-400">Ambient Soundscapes</Link></li>
            </ul>
          </div>

          {/* Physical Health */}
          <div>
            <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Fit Companion</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/physical-health" className="hover:text-blue-600 dark:hover:text-blue-400">Daily Steps & Walking</Link></li>
              <li><Link to="/physical-health" className="hover:text-blue-600 dark:hover:text-blue-400">Water Intake Log</Link></li>
              <li><Link to="/physical-health" className="hover:text-blue-600 dark:hover:text-blue-400">Beginner & Home Workouts</Link></li>
              <li><Link to="/physical-health" className="hover:text-blue-600 dark:hover:text-blue-400">Yoga & Desk Stretching</Link></li>
              <li><Link to="/physical-health" className="hover:text-blue-600 dark:hover:text-blue-400">Nutrition & Hydration Tips</Link></li>
            </ul>
          </div>

          {/* Quick Support & Platform */}
          <div>
            <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Platform</h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/dashboard" className="hover:text-emerald-600">Personal Dashboard</Link></li>
              <li><Link to="/chat" className="hover:text-emerald-600">AI Conversation</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-600">Profile & BMI Settings</Link></li>
              <li><Link to="/emergency" className="text-rose-500 hover:text-rose-600">Crisis Helplines (24/7)</Link></li>
            </ul>
          </div>

        </div>

        {/* Medical Disclaimer */}
        <div className="pt-6 pb-2 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-2 max-w-3xl">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Medical Disclaimer:</strong> Health Companion AI is an informational wellness companion designed to support healthy habits and emotional well-being. It does not offer clinical medical diagnoses, prescription medications, or psychiatric treatment. Always consult a qualified physician or healthcare provider for medical conditions.
            </span>
          </div>
          <span className="shrink-0 text-slate-400">
            &copy; {new Date().getFullYear()} Health Companion AI. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
};
