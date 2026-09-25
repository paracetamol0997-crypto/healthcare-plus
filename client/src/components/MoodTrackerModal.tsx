import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Smile, Frown, Meh, Sparkles, HeartHandshake, X } from 'lucide-react';
import { api } from '../services/api';
import { MoodLog } from '../types';

interface MoodOption {
  level: number;
  tag: string;
  emoji: string;
  description: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { level: 5, tag: 'Joyful', emoji: '🌟', description: 'Energetic, grateful, happy', color: 'text-amber-500', bgLight: 'bg-amber-50 border-amber-300', bgDark: 'dark:bg-amber-950/40 dark:border-amber-800' },
  { level: 4, tag: 'Calm', emoji: '🌿', description: 'Peaceful, centered, relaxed', color: 'text-emerald-500', bgLight: 'bg-emerald-50 border-emerald-300', bgDark: 'dark:bg-emerald-950/40 dark:border-emerald-800' },
  { level: 3, tag: 'Neutral', emoji: '☁️', description: 'Okay, balanced, steady', color: 'text-blue-500', bgLight: 'bg-blue-50 border-blue-300', bgDark: 'dark:bg-blue-950/40 dark:border-blue-800' },
  { level: 2, tag: 'Anxious', emoji: '🌊', description: 'Restless, worried, racing thoughts', color: 'text-indigo-500', bgLight: 'bg-indigo-50 border-indigo-300', bgDark: 'dark:bg-indigo-950/40 dark:border-indigo-800' },
  { level: 2, tag: 'Stressed', emoji: '🔥', description: 'Overwhelmed, tense, pressured', color: 'text-rose-500', bgLight: 'bg-rose-50 border-rose-300', bgDark: 'dark:bg-rose-950/40 dark:border-rose-800' },
  { level: 1, tag: 'Low', emoji: '🌧️', description: 'Sad, tired, drained', color: 'text-slate-500', bgLight: 'bg-slate-100 border-slate-300', bgDark: 'dark:bg-slate-800 dark:border-slate-700' },
];

const SUGGESTED_TAGS = ['Work', 'Sleep', 'Exercise', 'Nutrition', 'Family', 'Quiet Time', 'Social'];

interface MoodTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged?: (log: MoodLog) => void;
}

export const MoodTrackerModal: React.FC<MoodTrackerModalProps> = ({
  isOpen,
  onClose,
  onLogged
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[1]);
  const [note, setNote] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullNote = selectedTags.length > 0 
        ? `[${selectedTags.join(', ')}] ${note}`.trim()
        : note;

      const res = await api.logMood(selectedMood.level, selectedMood.tag, fullNote);

      if (selectedMood.level >= 4) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 }
        });
      }

      let feedback = "Thank you for checking in with yourself. Every feeling is valid.";
      if (selectedMood.tag === 'Joyful' || selectedMood.tag === 'Calm') {
        feedback = "Wonderful to hear you're feeling peaceful! Soak in this calm moment.";
      } else if (selectedMood.tag === 'Stressed' || selectedMood.tag === 'Anxious') {
        feedback = "I hear you. Remember to take a slow, gentle breath. Would you like a guided breathing session?";
      }

      setSubmittedFeedback(feedback);

      if (onLogged) {
        onLogged(res.log);
      }

      setTimeout(() => {
        setSubmittedFeedback(null);
        onClose();
      }, 2000);

    } catch (err) {
      console.warn('Error saving mood:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-wellness-darkCard rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedFeedback ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-3xl">
              🌿
            </div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Check-in Saved</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {submittedFeedback}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <HeartHandshake className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Daily Mood Check-in</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                How is your emotional landscape right now? Acknowledge it without judgment.
              </p>
            </div>

            {/* Mood Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = selectedMood.tag === m.tag;
                return (
                  <button
                    type="button"
                    key={m.tag}
                    onClick={() => setSelectedMood(m)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                      isSelected
                        ? `${m.bgLight} ${m.bgDark} ring-2 ring-emerald-500 shadow-sm`
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-900/40'
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {m.tag}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {m.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Context Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                What is contributing to this feeling?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                        active
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reflection Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Private Reflection (Optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a few words about what is on your mind..."
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-105"
              >
                {loading ? 'Recording...' : 'Save Mood'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
