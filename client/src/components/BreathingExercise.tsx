import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';

interface BreathingPattern {
  name: string;
  description: string;
  phases: { name: string; duration: number; instruction: string }[];
}

const PATTERNS: Record<string, BreathingPattern> = {
  box: {
    name: 'Box Breathing',
    description: '4-4-4-4 rhythm used for instant stress reduction and peak mental focus.',
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose...' },
      { name: 'Hold', duration: 4, instruction: 'Hold your breath gently. Relax your shoulders.' },
      { name: 'Exhale', duration: 4, instruction: 'Release breath smoothly through your mouth...' },
      { name: 'Hold', duration: 4, instruction: 'Rest in stillness before the next breath.' }
    ]
  },
  relax: {
    name: '4-7-8 Tranquilizer',
    description: 'Natural nervous system reset to ease anxiety and promote restful sleep.',
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Quietly inhale through your nose...' },
      { name: 'Hold', duration: 7, instruction: 'Hold gently. Let peace settle in.' },
      { name: 'Exhale', duration: 8, instruction: 'Exhale completely with a gentle whoosh...' }
    ]
  },
  calm: {
    name: 'Deep Resonance (5-5)',
    description: 'Coherent breathing to synchronize heart rate variability and calm your mind.',
    phases: [
      { name: 'Inhale', duration: 5, instruction: 'Deep nourishing inhale down to your belly...' },
      { name: 'Exhale', duration: 5, instruction: 'Smooth, unbroken exhale of all tension...' }
    ]
  }
};

export const BreathingExercise: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [selectedPatternKey, setSelectedPatternKey] = useState<string>('box');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PATTERNS['box'].phases[0].duration);
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [targetRounds, setTargetRounds] = useState<number>(4);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const pattern = PATTERNS[selectedPatternKey];
  const currentPhase = pattern.phases[currentPhaseIndex];

  // Play gentle web audio chime
  const playChime = (freq = 432) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Timer loop
  useEffect(() => {
    let interval: any = null;

    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Next phase
            const nextPhaseIndex = (currentPhaseIndex + 1) % pattern.phases.length;
            if (nextPhaseIndex === 0) {
              const newRound = completedRounds + 1;
              setCompletedRounds(newRound);
              if (newRound >= targetRounds) {
                setIsActive(false);
                setIsCompleted(true);
                playChime(528);
                confetti({
                  particleCount: 50,
                  spread: 60,
                  origin: { y: 0.7 }
                });
                return 0;
              }
            }
            setCurrentPhaseIndex(nextPhaseIndex);
            playChime(nextPhaseIndex % 2 === 0 ? 432 : 528);
            return pattern.phases[nextPhaseIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentPhaseIndex, pattern, completedRounds, targetRounds, isCompleted, soundEnabled]);

  const handleStartStop = () => {
    if (isCompleted) {
      resetSession();
    }
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setIsCompleted(false);
    setCurrentPhaseIndex(0);
    setCompletedRounds(0);
    setSecondsRemaining(pattern.phases[0].duration);
  };

  const handleSelectPattern = (key: string) => {
    setSelectedPatternKey(key);
    setIsActive(false);
    setIsCompleted(false);
    setCurrentPhaseIndex(0);
    setCompletedRounds(0);
    setSecondsRemaining(PATTERNS[key].phases[0].duration);
  };

  // Animation scaling calculation based on phase
  const isExpanding = currentPhase.name === 'Inhale';
  const isHolding = currentPhase.name === 'Hold';
  const isContracting = currentPhase.name === 'Exhale';

  let circleScale = 'scale-100';
  if (isActive) {
    if (isExpanding) circleScale = 'scale-125';
    if (isHolding) circleScale = 'scale-125';
    if (isContracting) circleScale = 'scale-90';
  }

  return (
    <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-emerald-100 dark:border-slate-800 shadow-sm transition-all ${compact ? 'max-w-md' : 'w-full'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Guided Breathing
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {pattern.description}
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Pattern Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-8">
        {Object.entries(PATTERNS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => handleSelectPattern(key)}
            className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all ${
              selectedPatternKey === key
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {p.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Animated Visual Breathing Sphere */}
      <div className="relative flex flex-col items-center justify-center my-6 min-h-[220px]">
        {/* Ambient Ring */}
        <div
          className={`absolute w-44 h-44 rounded-full transition-all duration-1000 ease-in-out ${
            isActive
              ? 'bg-emerald-400/20 dark:bg-emerald-500/10 blur-xl scale-150'
              : 'bg-emerald-200/20 dark:bg-slate-800 blur-md'
          }`}
        />

        {/* Dynamic Breathing Bubble */}
        <div
          className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-center p-4 transition-transform duration-[3500ms] ease-in-out shadow-lg ${circleScale} ${
            isExpanding
              ? 'bg-gradient-to-tr from-emerald-400 to-teal-300 text-white shadow-emerald-400/40'
              : isHolding
              ? 'bg-gradient-to-tr from-teal-500 to-blue-400 text-white shadow-teal-400/40'
              : 'bg-gradient-to-tr from-blue-400 to-indigo-300 text-white shadow-blue-400/40'
          }`}
        >
          {isCompleted ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-white mb-1" />
              <span className="text-xs font-bold uppercase tracking-wider">Peaceful</span>
            </div>
          ) : (
            <>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {isActive ? currentPhase.name : 'Ready'}
              </span>
              <span className="text-3xl font-extrabold my-0.5 tracking-tight">
                {isActive ? secondsRemaining : pattern.phases[0].duration}
              </span>
              <span className="text-[10px] opacity-80">seconds</span>
            </>
          )}
        </div>

        {/* Phase Instruction Text */}
        <p className="mt-8 text-center text-sm font-medium text-slate-700 dark:text-slate-300 max-w-xs h-6 animate-fadeIn">
          {isCompleted
            ? 'Wonderful job! Notice the calm in your chest and mind.'
            : isActive
            ? currentPhase.instruction
            : 'Press start to begin your calming breath cycle.'}
        </p>
      </div>

      {/* Progress & Controls */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Round: <span className="font-bold text-slate-800 dark:text-white">{completedRounds}</span> / {targetRounds}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetSession}
            title="Reset Session"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStartStop}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-105'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{isCompleted ? 'Restart' : 'Begin'}</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
