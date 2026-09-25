import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  Wind,
  BookOpen,
  Smile,
  Sparkles,
  Heart,
  Moon,
  Trash2,
  Plus,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { BreathingExercise } from '../components/BreathingExercise';
import { Soundscapes } from '../components/Soundscapes';
import { MoodTrackerModal } from '../components/MoodTrackerModal';
import { ChatInterface } from '../components/ChatInterface';
import { JournalEntry, MoodLog, Affirmation } from '../types';

const JOURNAL_PROMPTS = [
  "What are 3 simple things you feel grateful for today?",
  "What is something that made you smile, even briefly?",
  "What thoughts are you ready to release and let go of right now?",
  "How did you honor your body or mind today?",
  "What would you tell a dear friend who feels the way you do right now?"
];

export const MentalHealthPage: React.FC = () => {
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [activeTab, setActiveTab] = useState<'breathing' | 'journal' | 'moods' | 'soundscapes' | 'chat'>('breathing');
  
  // Journal Form State
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState('Calm');
  const [journalTag, setJournalTag] = useState('Gratitude');
  const [savingJournal, setSavingJournal] = useState(false);
  
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const loadData = async () => {
    try {
      const [mRes, jRes, aRes] = await Promise.all([
        api.getMoods(),
        api.getJournals(),
        api.getAffirmations()
      ]);
      setMoods(mRes.moods || []);
      setJournals(jRes.entries || []);
      setAffirmations(aRes.allAffirmations || []);
    } catch (e) {
      console.warn('Error loading mental health data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;

    setSavingJournal(true);
    try {
      const res = await api.addJournal(
        journalTitle || 'Reflective Journal',
        journalContent,
        journalMood,
        [journalTag]
      );
      setJournals([res.entry, ...journals]);
      setJournalTitle('');
      setJournalContent('');
      confetti({
        particleCount: 30,
        spread: 40
      });
    } catch (err) {
      console.warn('Error saving journal:', err);
    } finally {
      setSavingJournal(false);
    }
  };

  const handleDeleteJournal = async (id: number) => {
    try {
      await api.deleteJournal(id);
      setJournals(journals.filter(j => j.id !== id));
    } catch (e) {
      console.warn('Error deleting journal:', e);
    }
  };

  const usePrompt = (p: string) => {
    setJournalContent(prev => (prev ? `${prev}\n\nPrompt: ${p}\n` : `Prompt: ${p}\n`));
  };

  return (
    <div className="min-h-screen pb-16 bg-slate-50/50 dark:bg-wellness-dark transition-colors">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-emerald-100/60 via-teal-50 to-blue-50/60 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border-b border-emerald-100 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-sm">
                  <Brain className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Mind Companion AI Hub
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Mental Well-Being &amp; Serenity
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                A calm, judgment-free space to regulate your nervous system, release stress, journal reflections, and find peace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMoodModal(true)}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Smile className="w-4 h-4" />
                <span>Log Mood Check-in</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar pt-2">
            {[
              { id: 'breathing', label: 'Guided Breathing', icon: Wind },
              { id: 'journal', label: 'Mindful Journal', icon: BookOpen },
              { id: 'moods', label: 'Mood History', icon: Smile },
              { id: 'soundscapes', label: 'Soundscapes', icon: Moon },
              { id: 'chat', label: 'Mind Companion AI', icon: MessageSquare, highlight: true }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* TAB 1: GUIDED BREATHING */}
        {activeTab === 'breathing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BreathingExercise />
            </div>

            <div className="space-y-6">
              {/* Daily Affirmations Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Mindful Affirmations</span>
                  </h4>
                </div>
                <div className="space-y-3">
                  {affirmations.slice(0, 3).map((aff, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs"
                    >
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 block mb-1">
                        {aff.category}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 italic font-medium">
                        &ldquo;{aff.text}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soothing Soundscapes */}
              <Soundscapes />
            </div>
          </div>
        )}

        {/* TAB 2: MINDFUL JOURNAL */}
        {activeTab === 'journal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Editor (2 Cols) */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Reflective Journal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Putting your feelings into words calms the emotional centers of your brain.
                </p>
              </div>

              {/* Prompt Suggestions Carousel / Ticker */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  Suggested Prompt
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {JOURNAL_PROMPTS[activePromptIndex]}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => usePrompt(JOURNAL_PROMPTS[activePromptIndex])}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Insert Prompt into Entry
                  </button>
                  <button
                    onClick={() => setActivePromptIndex((activePromptIndex + 1) % JOURNAL_PROMPTS.length)}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Next Prompt &rarr;
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveJournal} className="space-y-4">
                <input
                  type="text"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  placeholder="Journal Title (e.g. Finding Peace Today)..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />

                <textarea
                  rows={6}
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Let your thoughts flow freely. No judgment, no right or wrong words..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400">Tag:</span>
                    {['Gratitude', 'Mindfulness', 'Stress Release', 'Growth'].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setJournalTag(t)}
                        className={`px-3 py-1 rounded-xl font-medium border ${
                          journalTag === t
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={savingJournal || !journalContent.trim()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-40 transition-all hover:scale-105"
                  >
                    {savingJournal ? 'Saving...' : 'Save Journal'}
                  </button>
                </div>
              </form>
            </div>

            {/* Saved Entries History (1 Col) */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Past Reflections</h4>
              {journals.length > 0 ? (
                <div className="space-y-3">
                  {journals.map((j) => (
                    <div
                      key={j.id}
                      className="p-5 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {j.tags?.[0] || 'Reflection'}
                        </span>
                        <button
                          onClick={() => handleDeleteJournal(j.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">{j.title}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {j.content}
                      </p>
                      <span className="text-[10px] text-slate-400 block pt-1">
                        {new Date(j.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Your journal is currently empty. Write your first reflection on the left!</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: MOOD HISTORY */}
        {activeTab === 'moods' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Mood Journey</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Observe emotional patterns over time with self-compassion.</p>
              </div>
              <button
                onClick={() => setShowMoodModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                + Check-in Now
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moods.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                    {m.moodTag === 'Joyful' ? '🌟' : m.moodTag === 'Calm' ? '🌿' : m.moodTag === 'Stressed' ? '🔥' : '☁️'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{m.moodTag}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {m.note && <p className="text-xs text-slate-600 dark:text-slate-300">{m.note}</p>}
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(m.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SOUNDSCAPES */}
        {activeTab === 'soundscapes' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Soundscapes />
            <div className="p-6 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Why Ambient Sounds Help</h4>
              <p>
                Pink and brown noise frequencies soften sudden environmental audio spikes, promoting alpha brain wave production associated with relaxed alertness and deep sleep states.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: DEDICATED MIND COMPANION AI CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <ChatInterface initialCompanion="mind" />
          </div>
        )}

      </main>

      {/* Mood Tracker Modal */}
      <MoodTrackerModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onLogged={(log) => setMoods([log, ...moods])}
      />

    </div>
  );
};
