import React from 'react';
import { PhoneCall, ShieldAlert, Heart, LifeBuoy, AlertTriangle, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EMERGENCY_RESOURCES = [
  {
    region: 'United States & Canada',
    title: '988 Suicide & Crisis Lifeline',
    number: '988',
    type: 'Call or Text',
    desc: 'Free, confidential support available 24/7/365 for anyone in distress, prevention, and crisis resources.'
  },
  {
    region: 'United States',
    title: 'The Trevor Project (LGBTQ Youth)',
    number: '1-866-488-7386',
    type: 'Call or Text START to 678-678',
    desc: '24/7 confidential crisis intervention and suicide prevention services.'
  },
  {
    region: 'United Kingdom',
    title: 'NHS 111 Mental Health Services',
    number: '111',
    type: 'Call 111 (Free from landline or mobile)',
    desc: 'Access urgent mental health assessment and speak to trained mental health nurses.'
  },
  {
    region: 'India',
    title: 'KIRAN Mental Health National Helpline',
    number: '9152987821',
    type: '24/7 Toll-Free Toll Helpline',
    desc: 'Operated by the Ministry of Social Justice to provide first-line psychological support.'
  },
  {
    region: 'Australia',
    title: 'Lifeline Australia',
    number: '13 11 14',
    type: '24/7 Telephone Crisis Support',
    desc: 'Short-term support for people overwhelmed or in distress.'
  },
  {
    region: 'Global / International',
    title: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    type: 'SMS Text Message',
    desc: 'Free, 24/7 support via text message from anywhere in the US, UK, and Canada.'
  },
  {
    region: 'European Union',
    title: 'Universal Emergency Number',
    number: '112',
    type: 'Direct Emergency Call',
    desc: 'Free emergency call available in all 27 EU member states.'
  }
];

export const EmergencyPage: React.FC = () => {
  return (
    <div className="min-h-screen pb-20 bg-slate-50/50 dark:bg-wellness-dark transition-colors">
      
      {/* Top Banner */}
      <section className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-md">
              <LifeBuoy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Emergency &amp; Crisis Support Resources
              </h1>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 font-medium">
                Immediate, free, confidential assistance available 24/7.
              </p>
            </div>
          </div>

        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Urgent Note Banner */}
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Important Medical Safety Notice:</strong> Health Companion AI is an informational wellness support platform. It cannot dispatch emergency medical services or perform clinical interventions. If you or someone you know is in immediate danger of hurting themselves or others, please contact emergency services (such as 911, 999, 112, or local hotlines) immediately.
          </div>
        </div>

        {/* Hotlines Directory */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-600" />
            <span>Crisis Lines &amp; Helplines</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMERGENCY_RESOURCES.map((res, i) => (
              <div
                key={i}
                className="p-5 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                    {res.region}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{res.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {res.desc}
                  </p>
                  <span className="text-[11px] text-slate-400 block mt-2">{res.type}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={res.number.startsWith('Text') ? 'sms:741741' : `tel:${res.number.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{res.number}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panic / Acute Anxiety Immediate Coping Protocol */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-emerald-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <Heart className="w-5 h-5 fill-emerald-500/20 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Immediate Grounding Steps for Panic or Severe Stress
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 block mb-1">
                1. Lengthen the Exhale
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Inhale gently through your nose for 4 seconds, then blow smoothly through your lips for 7 seconds. A longer exhale immediately lowers your heart rate.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
              <span className="font-bold text-xs text-teal-800 dark:text-teal-300 block mb-1">
                2. Cold Water Reset
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Splash cold water on your wrists or face, or hold an ice cube. This engages the mammalian dive reflex to halt adrenaline rushes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="font-bold text-xs text-blue-800 dark:text-blue-300 block mb-1">
                3. Physical Grounding
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Plant both feet flat on the floor. Press your heels down firmly. Remind yourself: &ldquo;I am physically safe in this room right now.&rdquo;
              </p>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};
