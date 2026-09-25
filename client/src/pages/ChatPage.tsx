import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatInterface } from '../components/ChatInterface';
import { Sparkles, Heart } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const companionParam = searchParams.get('companion') as 'mind' | 'fit' | 'unified' || 'unified';

  return (
    <div className="min-h-screen pb-16 bg-slate-50/50 dark:bg-wellness-dark transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                AI Wellness Sanctuary
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Health Companion AI Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Personalized mental health and physical fitness guidance in a supportive, judgment-free space.
            </p>
          </div>
        </div>

        {/* Full Chat Component */}
        <ChatInterface initialCompanion={companionParam} />

      </div>
    </div>
  );
};
