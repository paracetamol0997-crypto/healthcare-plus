import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Wind, Radio, Sparkles } from 'lucide-react';

interface SoundOption {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const SOUNDS: SoundOption[] = [
  { id: 'rain', name: 'Gentle Rain', icon: CloudRain, color: 'text-blue-500' },
  { id: 'waves', name: 'Ocean Waves', icon: Waves, color: 'text-teal-500' },
  { id: 'wind', name: 'Mountain Breeze', icon: Wind, color: 'text-emerald-500' },
  { id: 'drone', name: 'Meditation Drone (432Hz)', icon: Radio, color: 'text-purple-500' }
];

export const Soundscapes: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const generatorNodesRef = useRef<any[]>([]);

  const stopCurrentSound = () => {
    generatorNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    generatorNodesRef.current = [];
    setActiveSoundId(null);
  };

  const playSound = (id: string) => {
    if (activeSoundId === id) {
      stopCurrentSound();
      return;
    }

    stopCurrentSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (id === 'drone') {
        // 432 Hz warm binaural drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.frequency.setValueAtTime(216, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();
        generatorNodesRef.current = [osc1, osc2, filter, masterGain];
      } else if (id === 'rain' || id === 'waves' || id === 'wind') {
        // Synthesize colored noise buffer for natural elements
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.1;
          b2 = 0.85 * b2 + white * 0.2;
          output[i] = b0 + b1 + b2;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (id === 'rain') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000, ctx.currentTime);
          filter.Q.setValueAtTime(0.5, ctx.currentTime);
        } else if (id === 'waves') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, ctx.currentTime);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(200, ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        generatorNodesRef.current = [whiteNoise, filter, masterGain];
      }

      setActiveSoundId(id);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopCurrentSound();
    };
  }, []);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Calming Soundscapes</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pure synthesized ambient audio for focus & calm</p>
          </div>
        </div>
        {activeSoundId && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Playing
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {SOUNDS.map((s) => {
          const Icon = s.icon;
          const isPlaying = activeSoundId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => playSound(s.id)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 ${
                isPlaying
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${s.color}`} />
                {isPlaying && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {s.name}
              </span>
            </button>
          );
        })}
      </div>

      {activeSoundId && (
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
          <button
            onClick={stopCurrentSound}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1"
          >
            Stop
          </button>
        </div>
      )}
    </div>
  );
};
