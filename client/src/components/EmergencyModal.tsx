import React from 'react';
import { PhoneCall, ShieldAlert, Heart, X, ExternalLink, LifeBuoy } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const HOTLINES = [
    { country: 'United States & Canada', number: '988', desc: 'Suicide & Crisis Lifeline (24/7, Call or Text, Free)' },
    { country: 'United Kingdom', number: '111', desc: 'NHS Mental Health Helpline / 999 for physical emergency' },
    { country: 'India', number: '9152987821', desc: 'KIRAN National Mental Health 24/7 Helpline' },
    { country: 'International Crisis Text Line', number: 'Text HOME to 741741', desc: 'Free 24/7 crisis support via SMS' },
    { country: 'European Union', number: '112', desc: 'Universal European Emergency Service' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-wellness-darkCard rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 dark:border-rose-900/60 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
            <LifeBuoy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Emergency & Crisis Support</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              You are not alone. Caring human help is available right now.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          If you are having thoughts of suicide, experiencing an acute mental health crisis, or are in immediate physical danger, please reach out to one of the trusted hotlines below immediately or go to the nearest emergency room.
        </p>

        {/* Hotlines List */}
        <div className="space-y-3 mb-6">
          {HOTLINES.map((h, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl border border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                  {h.country}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {h.desc}
                </span>
              </div>
              <a
                href={h.number.startsWith('Text') ? 'sms:741741' : `tel:${h.number.replace(/\D/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{h.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Immediate Grounding Exercise */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <span className="font-bold text-slate-800 dark:text-white block flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            Immediate Grounding (5-4-3-2-1)
          </span>
          <p>
            Take one slow, deep breath into your stomach. Name <strong>5 things you see</strong>, <strong>4 things you can touch</strong>, <strong>3 sounds you hear</strong>, <strong>2 things you smell</strong>, and take <strong>1 sip of cool water</strong>.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
