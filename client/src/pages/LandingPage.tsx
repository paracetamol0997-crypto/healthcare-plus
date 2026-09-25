import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Brain,
  Activity,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Droplets,
  Footprints,
  Wind,
  Smile,
  Quote,
  Flame,
  Moon,
  ChevronRight,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { ChatInterface } from '../components/ChatInterface';
import { BreathingExercise } from '../components/BreathingExercise';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  const handleDemo = async () => {
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const FEATURES = [
    {
      title: 'Mind Companion AI',
      category: 'Mental Well-Being',
      icon: Brain,
      color: 'from-emerald-500 to-teal-400',
      description: 'An empathetic guide for stress management, anxiety relief, emotional validation, and guided breathing exercises.',
      points: ['Mood tracking & emotional reflections', 'Box, 4-7-8, and Coherent breathing', 'Daily affirmations & soundscapes', 'Digital gratitude journaling']
    },
    {
      title: 'Fit Companion AI',
      category: 'Physical Vitality',
      icon: Activity,
      color: 'from-blue-500 to-teal-400',
      description: 'A motivating trainer and nutrition mentor tailored to your schedule, fitness level, and daily goals.',
      points: ['Step tracking & calorie estimation', 'Customized workout programming', 'Visual water intake tracker', 'Form tips & gentle desk stretches']
    },
    {
      title: 'Family Doctor Wisdom',
      category: 'Holistic Health',
      icon: Heart,
      color: 'from-rose-500 to-amber-500',
      description: 'Translates health principles into friendly, plain-language habits while knowing when to recommend licensed care.',
      points: ['Sleep hygiene recommendations', 'BMI & personalized metrics', 'Zero medical jargon', 'Strictly health & wellness focused']
    }
  ];

  const TESTIMONIALS = [
    {
      name: 'Dr. Sarah Lin, MD',
      role: 'Preventive Health Advocate',
      avatar: '🩺',
      quote: "What impresses me most about Health Companion AI is its unwavering focus on holistic lifestyle medicine—calming the nervous system while encouraging daily movement."
    },
    {
      name: 'Pavan Kumar',
      role: 'Software Engineer & Daily User',
      avatar: '👨‍💻',
      quote: "As someone who sits at a desk for 9 hours, having both Fit Companion reminding me of steps and Mind Companion guiding my breathing breaks has transformed my daily energy."
    },
    {
      name: 'Maya Henderson',
      role: 'Yoga Practitioner',
      avatar: '🧘‍♀️',
      quote: "The soundscapes and 4-7-8 breathing circle help me wind down every night. It feels soothing and respectful, not like a sterile medical app."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-blue/40 via-white to-wellness-green/30 dark:from-wellness-dark dark:via-slate-900 dark:to-wellness-dark transition-colors">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        
        {/* Subtle Decorative Background Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-300/30 to-blue-300/30 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide shadow-sm animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Your All-In-One Wellness &amp; Fitness Sanctuary</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Health Companion <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 bg-clip-text text-transparent">AI</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              &ldquo;Your personal wellness companion for mental and physical health.&rdquo;
            </p>

            {/* Detailed Description */}
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Experience the gentle harmony of a family doctor, wellness mentor, fitness trainer, and mental health companion in one calm, supportive platform.
            </p>

            {/* Hero CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleDemo}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span>Try as Pavan (Demo)</span>
                  </button>
                </>
              )}
            </div>

            {/* Quick Benefits Ticker */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Dedicated strictly to health
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                Private &amp; Empathetic
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Zero Medical Jargon
              </span>
            </div>

          </div>

          {/* Hero Visual Showcase Cards (Meditation, Fitness, Nutrition) */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Card 1: Meditation */}
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-wellness-darkCard/80 backdrop-blur-md border border-emerald-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 mb-4">
                <Wind className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Mental Serenity
              </span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1 mb-2">
                Meditation &amp; Breathing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Guided Box Breathing, 4-7-8 natural relaxers, and mindful journaling to dissolve everyday anxiety and stress.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Try Breathing Sphere</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Fitness */}
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-wellness-darkCard/80 backdrop-blur-md border border-blue-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 mb-4">
                <Footprints className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Physical Energy
              </span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1 mb-2">
                Fitness &amp; Movement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Log daily steps, record gym and home workouts, and receive adaptive routines that meet you at your current strength.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>View Exercise Plans</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Healthy Lifestyle */}
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-wellness-darkCard/80 backdrop-blur-md border border-teal-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 flex items-center justify-center text-teal-600 mb-4">
                <Droplets className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Holistic Habits
              </span>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1 mb-2">
                Hydration &amp; Nourishment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Interactive 8-cup water tracker, clean plate nutrition frameworks, and restorative sleep hygiene guidance.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400">
                <span>Track Habits Today</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-wellness-darkCard border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                About The Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Designed to feel like a sanctuary, not a sterile hospital room.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Traditional healthcare is reactive and often stressful. Health Companion AI was built on a simple truth: <strong>mental well-being and physical vitality are deeply intertwined</strong>.
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                When you are stressed, your sleep suffers and energy drops. When you move your body, endorphins calm your mind. Health Companion AI unites both worlds into a warm, daily dialogue that encourages you every step of the way.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 dark:text-white block">Strictly Health &amp; Wellness Focused</strong>
                    <span className="text-xs text-slate-500">The assistant will not answer coding, politics, or entertainment. It keeps your headspace focused on your self-care.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 dark:text-white block">Personalized Around Your Goals</strong>
                    <span className="text-xs text-slate-500">Adapts advice based on your age, BMI metrics, fitness aspirations, and current emotional state.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Breathing Sphere Preview */}
            <div className="flex justify-center">
              <BreathingExercise compact={true} />
            </div>

          </div>

        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Two Dedicated AI Mentors, One Unified Vision
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Switch smoothly between mental and physical support whenever your routine calls for it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {feat.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>

                    <ul className="space-y-2 pt-2">
                      {feat.points.map((pt, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to={feat.title.includes('Mind') ? '/mental-health' : feat.title.includes('Fit') ? '/physical-health' : '/chat'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                    >
                      <span>Explore {feat.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Live AI Demo Section */}
      <section className="py-16 sm:py-24 bg-wellness-blue/30 dark:bg-wellness-darkCard/50 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Interactive AI Preview
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Try a Conversation with Your Companion
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Ask about stress, workouts, or test our health domain guardrail right below!
            </p>
          </div>

          <ChatInterface compact={true} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Voices of Wellness
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Loved by everyday achievers &amp; wellness seekers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <Quote className="w-8 h-8 text-emerald-400/40" />
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-2xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
                    {t.avatar}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{t.name}</h5>
                    <span className="text-[10px] text-slate-400 block">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Start Your Health Journey Today
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Take one intentional breath, step toward your fitness goals, and let Health Companion AI walk beside you.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-xl hover:bg-emerald-50 transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
            <button
              onClick={handleDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-800/80 text-white font-bold text-sm border border-emerald-400/40 hover:bg-emerald-800 transition-all"
            >
              Sign In as Demo User
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
