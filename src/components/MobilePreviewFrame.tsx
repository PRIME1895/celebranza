import React, { useState } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Plus,
  Calendar,
  Home,
  Users,
  Lightbulb,
  MoreHorizontal,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { EventItem } from '../types.ts';

interface MobilePreviewFrameProps {
  events: EventItem[];
  selectedEvent: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onOpenCreate: () => void;
  onCloseMobileView: () => void;
}

export const MobilePreviewFrame: React.FC<MobilePreviewFrameProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onOpenCreate,
  onCloseMobileView,
}) => {
  const [mobileTab, setMobileTab] = useState<'events' | 'home' | 'vendors' | 'ideas' | 'more'>('events');
  const [mobileSegment, setMobileSegment] = useState<'upcoming' | 'past'>('upcoming');

  return (
    <div className="flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="mb-4 flex items-center justify-between w-full max-w-[390px]">
        <button
          onClick={onCloseMobileView}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Desktop Dashboard</span>
        </button>
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">Blueprint Mobile Spec</span>
      </div>

      {/* Phone Shell */}
      <div className="w-[375px] sm:w-[390px] h-[780px] rounded-[48px] bg-black p-3.5 shadow-2xl border-[4px] border-zinc-700/80 relative flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker notch */}
        <div className="w-28 h-5 bg-black rounded-full absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
        </div>

        {/* Inner Phone Screen Content */}
        <div className="w-full h-full bg-[#111319] rounded-[38px] flex flex-col justify-between overflow-hidden relative">
          {/* Status Bar */}
          <div className="h-11 px-7 pt-2 flex items-center justify-between text-xs text-white select-none z-20">
            <span className="font-semibold text-xs tracking-tight">9:41</span>
            <div className="flex items-center gap-1.5 text-white/90">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Body */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">My Events</h2>
              <button
                onClick={onOpenCreate}
                className="w-8 h-8 rounded-full bg-[#E07A5F] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Upcoming / Past Segmented Pills */}
            <div className="p-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center">
              <button
                onClick={() => setMobileSegment('upcoming')}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  mobileSegment === 'upcoming'
                    ? 'bg-[#E07A5F] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setMobileSegment('past')}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  mobileSegment === 'past'
                    ? 'bg-[#E07A5F] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Past
              </button>
            </div>

            {/* Event List matching blueprint mobile cards */}
            <div className="space-y-3.5 pb-6">
              {events.map((ev) => {
                const isSelected = ev.id === selectedEvent.id;
                const days = ev.id === 'ev-1' ? 64 : ev.id === 'ev-2' ? 39 : 95;
                const progress = ev.id === 'ev-1' ? 68 : ev.id === 'ev-2' ? 45 : 22;

                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1d28] border-[#E07A5F]/70 shadow-lg'
                        : 'bg-[#151720] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <img
                        src={ev.heroImage}
                        alt={ev.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white truncate">{ev.title}</h4>
                          <span className="text-[10px] uppercase font-bold text-[#E07A5F] px-2 py-0.5 rounded-full bg-[#E07A5F]/15">
                            {ev.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {ev.displayDate} • {days} days left
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-[#E07A5F] rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-400">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Mobile Navigation Bar matching blueprint */}
          <div className="h-16 bg-[#151720] border-t border-zinc-800/80 px-6 flex items-center justify-between z-20">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'vendors', label: 'Vendors', icon: Users },
              { id: 'ideas', label: 'Ideas', icon: Lightbulb },
              { id: 'more', label: 'More', icon: MoreHorizontal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMobileTab(tab.id as any)}
                  className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                    isActive ? 'text-[#E07A5F]' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Home indicator bar */}
          <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mb-1.5 shrink-0 z-30" />
        </div>
      </div>
    </div>
  );
};
