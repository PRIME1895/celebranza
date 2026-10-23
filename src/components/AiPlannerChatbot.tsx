import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Calendar,
  Download,
  Check,
  Plus,
  RefreshCw,
  Sparkles,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { EventItem, EventType } from '../types.ts';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: 'gemini' | 'fallback';
  eventPlan?: Partial<EventItem> | null;
  logo?: {
    name: string;
    theme: string;
    svg: string;
    dataUrl: string;
  } | null;
  timestamp: string;
}

interface AiPlannerChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvent: EventItem;
  theme: 'dark' | 'light';
  onApplyNewEvent: (newEvent: EventItem) => void;
}

export const AiPlannerChatbot: React.FC<AiPlannerChatbotProps> = ({
  isOpen,
  onClose,
  activeEvent,
  theme,
  onApplyNewEvent,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Welcome to Celebranza AI Planning Studio powered by the Gemini API! 

I can help you plan any celebration from scratch — whether it's an intimate beach ceremony in Goa, a luxury destination wedding, a milestone birthday, or a tech summit. 

Every time we plan, I'll synthesize a custom minimalist brand logo, budget blueprint, and milestone timeline tailored to your theme. What event are you imagining?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    '🌴 Sunset Beach Wedding in Goa with ₹15L budget',
    "🎂 Maya's 25th Silver Gala in Mumbai",
    '💍 Tuscan Rustic Vineyard Celebration with 120 guests',
    '⚡ Global AI Founders Summit at The Leela',
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/planning/chat-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-4).map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text })),
          activeEvent,
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is your customized event blueprint and branding mark.',
        source: data.source || 'gemini',
        eventPlan: data.eventPlan || null,
        logo: data.logo || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to reach the Gemini API planner right now. Please check your network and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyEvent = (plan: Partial<EventItem>, logo?: { dataUrl: string }) => {
    const newId = `ev-${Date.now()}`;
    const newEvent: EventItem = {
      id: newId,
      title: plan.title || 'New Planned Event',
      type: (plan.type as EventType) || 'wedding',
      date: plan.date || '2026-06-20',
      displayDate: plan.displayDate || '20 Jun 2026',
      venue: plan.venue || 'The Leela Palace, Bengaluru',
      city: plan.city || 'Bengaluru',
      heroImage:
        plan.heroImage ||
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      bannerImage:
        plan.bannerImage ||
        'https://images.unsplash.com/photo-1519225429402-98b64e56993a?auto=format&fit=crop&w=1200&q=80',
      budget: plan.budget || 500000,
      expectedGuests: plan.expectedGuests || 100,
      tagline: plan.tagline || 'Modern bespoke celebration',
      quote: plan.quote || 'Created with passion, remembered forever',
      logoImage: logo?.dataUrl || plan.logoImage || '/logos/ananya-rohan.jpg',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onApplyNewEvent(newEvent);
    setCreatedEventId(newId);
  };

  const handleDownloadSvg = (svgContent: string, name: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(name || 'event-logo').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-logo.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chatbot-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-end p-0 sm:p-6 transition-all animate-in fade-in"
    >
      <div
        className={`w-full sm:w-[480px] h-[92vh] sm:h-[680px] rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          isLight
            ? 'bg-[#FCFAF7] border-[#E8DFD3] text-[#1F2421]'
            : 'bg-[#131620] border-zinc-700/80 text-zinc-100'
        }`}
      >
        {/* Chatbot Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
            isLight
              ? 'bg-[#F5EFE6] border-[#E8DFD3]'
              : 'bg-[#181c28] border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#C85A3D] text-white flex items-center justify-center shadow-md shadow-[#E07A5F]/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-chatbot-title" className="text-base font-bold font-serif-display tracking-tight">
                  AI Planning & Logo Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30">
                  Gemini API
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-zinc-400'}`}>
                Plan custom events & auto-generate bespoke logos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI Planning & Logo Studio"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isLight
                ? 'hover:bg-stone-200 text-stone-600'
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 space-y-2.5 leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#E07A5F] text-white rounded-tr-none'
                    : isLight
                    ? 'bg-white border border-[#EBE2D7] text-[#1F2421] rounded-tl-none'
                    : 'bg-[#1c202d] border border-zinc-800 text-zinc-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.sender === 'assistant' && msg.id !== 'welcome' && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {msg.source === 'gemini' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Sparkles className="w-2.5 h-2.5" /> Live Gemini 2.5 Flash
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Demo Mode
                      </span>
                    )}
                  </div>
                )}

                {/* Custom Generated Event Blueprint Card */}
                {msg.eventPlan && (
                  <div
                    className={`mt-3 p-3.5 rounded-2xl border transition-all ${
                      isLight
                        ? 'bg-[#F9F5EE] border-[#E5DACD]'
                        : 'bg-[#151822] border-zinc-700/80'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-700/40">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#E07A5F] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Event Blueprint Generated
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {msg.eventPlan.displayDate || '2026'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm truncate font-serif-display text-white">
                        {msg.eventPlan.title}
                      </h4>
                      <p className={`text-[11px] truncate italic ${isLight ? 'text-stone-600' : 'text-zinc-400'}`}>
                        "{msg.eventPlan.tagline || 'Modern Celebration'}"
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#E07A5F] font-semibold pt-1">
                        <span>{msg.eventPlan.venue}</span>
                        <span>•</span>
                        <span>₹{((msg.eventPlan.budget || 500000) / 100000).toFixed(1)}L Budget</span>
                        <span>•</span>
                        <span>{msg.eventPlan.expectedGuests || 100} Guests</span>
                      </div>
                    </div>

                    {/* Apply Event Action CTA */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-700/40">
                      {createdEventId ? (
                        <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                          <Check className="w-4 h-4" />
                          <span>Event Created & Set Active!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplyEvent(msg.eventPlan!)}
                          className="w-full py-2 px-3 rounded-xl bg-[#E07A5F] hover:bg-[#d66e53] text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create & Switch to Event</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[10px] text-right mt-1 ${
                    msg.sender === 'user' ? 'text-white/75' : isLight ? 'text-stone-400' : 'text-zinc-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-[#E07A5F] p-3 rounded-2xl bg-zinc-900/40 w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gemini is designing event logistics & logo...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div
          className={`px-4 py-2 border-t overflow-x-auto flex items-center gap-2 scrollbar-none transition-colors ${
            isLight ? 'bg-[#FAF6F0] border-[#E8DFD3]' : 'bg-[#11131a] border-zinc-800'
          }`}
        >
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                isLight
                  ? 'bg-white hover:bg-stone-100 text-stone-700 border border-[#E5DACD]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          className={`p-3.5 border-t flex items-center gap-2 transition-colors ${
            isLight ? 'bg-[#F5EFE6] border-[#E8DFD3]' : 'bg-[#181c28] border-zinc-800'
          }`}
        >
          <input
            type="text"
            placeholder="e.g. Plan a 30th Birthday Gala in Delhi with royal theme & ₹8L budget..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className={`flex-1 px-4 py-2.5 rounded-2xl text-xs focus:outline-none transition-all ${
              isLight
                ? 'bg-white border border-[#E0D7C9] text-stone-900 placeholder-stone-400 focus:border-[#E07A5F]'
                : 'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-[#E07A5F]'
            }`}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 rounded-2xl bg-[#E07A5F] hover:bg-[#d66e53] disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
