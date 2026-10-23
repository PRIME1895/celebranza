import React, { useState } from 'react';
import { Plus, ArrowRight, Calendar, Clock, CheckSquare, Users, Sparkles, Globe, Wand2 } from 'lucide-react';
import { EventItem, EventType, Guest } from '../types.ts';
import { formatCurrencyINR, calculateDaysLeft } from '../utils/eventCalculations.ts';
import { DashboardRsvpSummary } from './DashboardRsvpSummary.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardHomeProps {
  events: EventItem[];
  guests: Guest[];
  selectedEvent?: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onOpenCreate: (initialType?: EventType) => void;
  onOpenAiPlanner?: (initialPrompt?: string) => void;
  onViewAllEvents: () => void;
  onNavigateGuests?: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  events,
  guests,
  selectedEvent,
  onSelectEvent,
  onOpenCreate,
  onOpenAiPlanner,
  onViewAllEvents,
  onNavigateGuests,
}) => {
  const { user } = useAuth();
  const [homePrompt, setHomePrompt] = useState('');

  const handleLaunchAi = () => {
    if (!homePrompt.trim()) return;
    if (onOpenAiPlanner) {
      onOpenAiPlanner(homePrompt.trim());
    } else {
      onOpenCreate();
    }
  };

  // Category starter cards data matching blueprint
  const categoryStarters = [
    {
      type: 'wedding' as EventType,
      title: 'Wedding',
      subtitle: 'From vows to forever',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    },
    {
      type: 'birthday' as EventType,
      title: 'Birthday',
      subtitle: 'Celebrate every age in style',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    },
    {
      type: 'community' as EventType,
      title: 'Community Event',
      subtitle: 'Bring people together',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Dynamically computed stats per event using calculateDaysLeft
  const getEventStats = (ev: EventItem) => {
    const daysLeft = calculateDaysLeft(ev.date);
    if (ev.id === 'ev-1') {
      return { daysLeft, progress: 68, tasks: '32/47', vendors: '8/12', badgeBg: 'bg-[#E07A5F]/20 text-[#E07A5F]' };
    }
    if (ev.id === 'ev-2') {
      return { daysLeft, progress: 45, tasks: '12/28', vendors: '4/9', badgeBg: 'bg-purple-500/20 text-purple-300' };
    }
    return { daysLeft, progress: 22, tasks: '8/36', vendors: '3/10', badgeBg: 'bg-emerald-500/20 text-emerald-300' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-white tracking-tight">
            Welcome back, {user?.displayName || 'Harikrishna'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Let's make your next event unforgettable.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAiPlanner ? onOpenAiPlanner() : onOpenCreate()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#E07A5F]/15 hover:bg-[#E07A5F]/25 text-[#E07A5F] border border-[#E07A5F]/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI One-Prompt</span>
          </button>

          <button
            onClick={() => onOpenCreate()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#d56d52] text-white shadow-lg shadow-[#E07A5F]/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* AI One-Prompt Event & Budget Architect Hero Card */}
      <div className="relative rounded-3xl p-5 sm:p-7 overflow-hidden border border-[#E07A5F]/30 bg-gradient-to-br from-[#1b1e2a] via-[#141620] to-[#0d0f14] shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#E07A5F]/20 via-[#C85A3D]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#C85A3D] flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-serif-display">
                  Plan Any Celebration with AI in One Prompt
                </h3>
                <p className="text-xs text-zinc-400">
                  Gemini API grounds your budget in live Google Search market data, recommends real venues &amp; synthesizes a custom logo
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Real-Time Search Grounding
            </span>
          </div>

          {/* Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={homePrompt}
                onChange={(e) => setHomePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLaunchAi();
                }}
                placeholder="e.g. 3-day royal Rajasthani wedding in Udaipur for 200 guests with lakeside sangeet..."
                className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] transition-all"
              />
              {homePrompt && (
                <button
                  onClick={() => setHomePrompt('')}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleLaunchAi}
              disabled={!homePrompt.trim()}
              className="px-6 py-3.5 rounded-2xl bg-[#E07A5F] hover:bg-[#d56d52] disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-[#E07A5F]/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Event &amp; Budget</span>
            </button>
          </div>

          {/* One-click suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-zinc-500 font-medium">Try:</span>
            {[
              '🏰 Udaipur Heritage Wedding (200 guests)',
              '🎂 Indiranagar Rooftop 30th Birthday',
              '🌴 Goa Beach Sunset Sangeet (100 guests)',
              '⚡ KTPO Tech Founders Hackathon',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const promptText = chip.replace(/^[^\s]+\s*/, '');
                  if (onOpenAiPlanner) onOpenAiPlanner(promptText);
                  else onOpenCreate();
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guest RSVP Dashboard Summary Component */}
      <DashboardRsvpSummary
        guests={guests}
        onManageGuests={onNavigateGuests}
        eventTitle={selectedEvent?.title}
      />

      {/* Quick Category Starter Cards (3 horizontal cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {categoryStarters.map((cat) => (
          <div
            key={cat.type}
            onClick={() => onOpenCreate(cat.type)}
            className="group relative h-48 rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900 cursor-pointer shadow-lg hover:border-zinc-700 transition-all hover:scale-[1.01]"
          >
            <img
              src={cat.image}
              alt={cat.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 group-hover:opacity-80"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                <p className="text-xs text-zinc-300 mt-0.5">{cat.subtitle}</p>
              </div>

              <div className="flex justify-start">
                <div className="w-9 h-9 rounded-full bg-white/95 text-zinc-900 flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* "Your Events" Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">Your Events</h3>
          <button
            onClick={onViewAllEvents}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Event Cards matching blueprint layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {events.slice(0, 3).map((ev) => {
            const stats = getEventStats(ev);
            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className="group bg-[#161821] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl hover:border-zinc-700/80 transition-all hover:translate-y-[-2px] cursor-pointer flex flex-col"
              >
                {/* Event Photo with Pill Badge */}
                <div className="relative h-44 overflow-hidden bg-zinc-900">
                  <img
                    src={ev.heroImage}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161821] via-transparent to-black/30" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3.5 left-3.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md ${stats.badgeBg}`}
                    >
                      {ev.type === 'wedding' ? 'Wedding' : ev.type === 'birthday' ? 'Birthday' : 'Community'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-[#E07A5F] transition-colors">
                      {ev.title}
                    </h4>

                    {/* Date and Days Left */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {ev.displayDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {stats.daysLeft} days left
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-end">
                        <span className="text-xs font-semibold text-zinc-300">{stats.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#E07A5F] to-[#f4a261] rounded-full transition-all duration-700"
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3 Stats Columns */}
                  <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-3 text-center text-xs">
                    <div>
                      <p className="text-zinc-500 text-[11px]">Budget</p>
                      <p className="font-bold text-white mt-0.5">{formatCurrencyINR(ev.budget)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[11px]">Tasks</p>
                      <p className="font-bold text-white mt-0.5">{stats.tasks}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[11px]">Vendors</p>
                      <p className="font-bold text-white mt-0.5">{stats.vendors}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
