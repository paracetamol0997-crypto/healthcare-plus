import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Brain,
  Activity,
  Heart,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  Key,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  initialCompanion?: 'mind' | 'fit' | 'unified';
  compact?: boolean;
}

const COMPANIONS = [
  {
    id: 'mind' as const,
    name: 'Mind Companion AI',
    role: 'Mental Wellness & Calming Guide',
    icon: Brain,
    color: 'from-emerald-500 to-teal-500',
    badge: 'Mental Health',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300',
    welcome: "Hello! I'm your Mind Companion AI. I'm here to support your mental well-being, guide breathing exercises, and listen without judgment. How are you feeling today?",
    quickPrompts: [
      "I am feeling stressed today",
      "Give me a 3-minute grounding exercise",
      "I can't sleep, what should I do?",
      "How can I manage work burnout?",
      "Daily affirmation for peace"
    ]
  },
  {
    id: 'fit' as const,
    name: 'Fit Companion AI',
    role: 'Physical Fitness & Nutrition Coach',
    icon: Activity,
    color: 'from-blue-500 to-teal-400',
    badge: 'Physical Health',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300',
    welcome: "Hi there! I'm your Fit Companion AI. Whether you're planning your workouts, building daily step habits, or looking for nourishing meal ideas, let's keep your body thriving! What is our goal today?",
    quickPrompts: [
      "I want a beginner gym plan",
      "How to reach 10,000 steps easily?",
      "Healthy high-protein meal ideas",
      "5-minute posture stretch for desk workers",
      "How much water should I drink daily?"
    ]
  },
  {
    id: 'unified' as const,
    name: 'Health Companion AI',
    role: 'Holistic Family Doctor & Wellness Mentor',
    icon: Heart,
    color: 'from-emerald-500 via-teal-500 to-blue-500',
    badge: 'Mind & Body Unified',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300',
    welcome: "Welcome! I'm your unified Health Companion AI. I bring together the care of a family doctor, the mindfulness of a wellness mentor, and the motivation of a trainer. How can I support your vitality today?",
    quickPrompts: [
      "Help me balance exercise and stress",
      "Healthy morning routine for energy",
      "What are simple habits for long-term health?",
      "How does sleep impact physical fitness?",
      "Check in on my overall wellness"
    ]
  }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialCompanion = 'unified',
  compact = false
}) => {
  const { user } = useAuth();
  const [selectedCompanionId, setSelectedCompanionId] = useState<'mind' | 'fit' | 'unified'>(initialCompanion);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [customKey, setCustomKey] = useState<string>(() => localStorage.getItem('hc_gemini_key') || '');
  const [keySaved, setKeySaved] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentCompanion = COMPANIONS.find(c => c.id === selectedCompanionId) || COMPANIONS[2];

  // Load chat history or set initial welcome message
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await api.getChatHistory(selectedCompanionId);
        if (isMounted) {
          if (res.messages && res.messages.length > 0) {
            setMessages(res.messages);
          } else {
            setMessages([
              {
                id: 'welcome',
                companionType: selectedCompanionId,
                role: 'assistant',
                content: currentCompanion.welcome,
                createdAt: new Date().toISOString()
              }
            ]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setMessages([
            {
              id: 'welcome',
              companionType: selectedCompanionId,
              role: 'assistant',
              content: currentCompanion.welcome,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [selectedCompanionId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || loading) return;

    setInputText('');

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      companionType: selectedCompanionId,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await api.sendChatMessage(message, selectedCompanionId);
      
      const assistantMsg: ChatMessage = {
        id: response.messageId || Date.now() + 1,
        companionType: selectedCompanionId,
        role: 'assistant',
        content: response.reply,
        createdAt: response.timestamp || new Date().toISOString(),
        guardrailTriggered: response.guardrailTriggered
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: Date.now() + 1,
        companionType: selectedCompanionId,
        role: 'assistant',
        content: "I am here to support your mental and physical wellness. Could you please share a little more about how you're feeling or what health goal you'd like to work on?",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.clearChatHistory(selectedCompanionId);
      setMessages([
        {
          id: 'welcome-cleared',
          companionType: selectedCompanionId,
          role: 'assistant',
          content: currentCompanion.welcome,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (e) {
      console.warn('Error clearing history:', e);
    }
  };

  // Web Speech API Voice synthesis
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      // Remove markdown asterisks and hashtags for smooth reading
      const cleanText = text.replace(/[*#_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const saveCustomApiKey = () => {
    if (customKey.trim()) {
      localStorage.setItem('hc_gemini_key', customKey.trim());
    } else {
      localStorage.removeItem('hc_gemini_key');
    }
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 1200);
  };

  return (
    <div className={`flex flex-col rounded-3xl bg-white dark:bg-wellness-darkCard border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all ${compact ? 'h-[500px]' : 'h-[680px]'}`}>
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        
        {/* Companion Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-2xl">
          {COMPANIONS.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCompanionId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompanionId(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{c.name.replace(' AI', '')}</span>
                <span className="sm:hidden">{c.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Personalized for {user.name}</span>
            </span>
          )}

          <button
            onClick={() => setShowKeyModal(true)}
            title="Configure Gemini API Key"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        
        {/* Guardrail Policy Disclaimer Banner */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
          <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>
            <strong>Health & Wellness Protected:</strong> This assistant focuses exclusively on your mental and physical health. It provides compassionate wellness guidance and cannot diagnose conditions or answer off-topic queries.
          </span>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs'
                    : `bg-gradient-to-tr ${currentCompanion.color} text-white`
                }`}
              >
                {isUser ? (
                  user ? user.name.charAt(0).toUpperCase() : 'U'
                ) : (
                  <Heart className="w-4 h-4 fill-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isUser ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed transition-all ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/15'
                      : msg.guardrailTriggered
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 rounded-tl-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Guardrail badge if off-topic */}
                  {msg.guardrailTriggered && (
                    <div className="flex items-center gap-1.5 mb-2 font-bold text-amber-700 dark:text-amber-400 text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Health Domain Redirect</span>
                    </div>
                  )}

                  {/* Render content with clean linebreaks */}
                  <div className="space-y-2 whitespace-pre-line">
                    {msg.content}
                  </div>
                </div>

                {/* Bottom message meta */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => speakMessage(msg.content)}
                      title={isSpeaking ? 'Stop Audio' : 'Listen with Speech'}
                      className="hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-500" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3 animate-fadeIn">
            <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-tr ${currentCompanion.color} text-white shadow-sm`}>
              <Heart className="w-4 h-4 fill-white animate-pulse" />
            </div>
            <div className="p-4 rounded-3xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Thinking mindfully for your wellness...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Suggestions:
        </span>
        {currentCompanion.quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white dark:bg-wellness-darkCard border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${currentCompanion.name} anything about fitness, nutrition, stress, or habits...`}
            className="flex-1 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-40 transition-all hover:scale-105 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Optional Gemini API Key Drawer / Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-wellness-darkCard rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" />
              <span>Google Gemini API Configuration</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Health Companion AI includes a rich built-in Health &amp; Wellness Engine that works right out of the box. You can optionally connect your own Gemini API key for live Gemini 1.5 / 2.0 generation.
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 block">
                Keys are stored locally in your browser. Leave blank to use the offline medical engine.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCustomApiKey}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
              >
                {keySaved && <CheckCircle className="w-3.5 h-3.5" />}
                <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
