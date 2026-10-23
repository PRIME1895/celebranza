import React from 'react';
import {
  Calendar,
  MapPin,
  Share2,
  Edit3,
  Wallet,
  CheckSquare,
  Users,
  UserCheck,
  Download,
  Trash2,
} from 'lucide-react';
import { EventItem } from '../types.ts';
import { formatCurrencyINR } from '../utils/eventCalculations.ts';

interface EventOverviewProps {
  event: EventItem;
  tasksCompleted: number;
  totalTasks: number;
  vendorsConfirmed: number;
  totalVendors: number;
  daysLeft: number;
  onEditEvent: () => void;
  onDeleteEvent?: () => void;
  onShare: () => void;
  onExportSummary?: () => void;
  onNavigateTab: (tab: any) => void;
}

export const EventOverview: React.FC<EventOverviewProps> = ({
  event,
  tasksCompleted,
  totalTasks,
  vendorsConfirmed,
  totalVendors,
  daysLeft,
  onEditEvent,
  onDeleteEvent,
  onShare,
  onExportSummary,
  onNavigateTab,
}) => {
  const progressPercent = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 68;
  const [imgError, setImgError] = React.useState(false);

  const subTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'budget', label: 'Budget' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'guests', label: 'Guest List' },
    { id: 'ideas', label: 'Ideas & Inspiration' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Event Sub-Navigation Tabs matching top-right blueprint */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800/80">
        {subTabs.map((st) => (
          <button
            key={st.id}
            onClick={() => onNavigateTab(st.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              st.id === 'overview'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Top Bar with Event Title, Location, and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {event.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-[#E07A5F]" />
              {event.displayDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
              {event.venue}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onExportSummary && (
            <button
              onClick={onExportSummary}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors hover:text-white cursor-pointer"
              title="Export event summary (PDF, Markdown, CSV)"
            >
              <Download className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Export Summary</span>
            </button>
          )}
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={onEditEvent}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#E07A5F]/20 hover:bg-[#E07A5F]/30 text-[#E07A5F] border border-[#E07A5F]/40 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Event</span>
          </button>
          {onDeleteEvent && (
            <button
              onClick={onDeleteEvent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
              title="Delete this celebration"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner + Side Card Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Venue Hero Photo */}
        <div className="lg:col-span-2 relative h-72 sm:h-84 rounded-3xl overflow-hidden border border-zinc-800 shadow-xl bg-gradient-to-br from-[#2a1b18] via-[#1a1724] to-[#12141f] group hero-banner-card">
          {!imgError && (event.bannerImage || event.heroImage) ? (
            <img
              src={event.bannerImage || event.heroImage}
              alt={event.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-r from-[#3e2723] via-[#211b2b] to-[#161a2b]">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#E07A5F_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="text-center p-6 relative z-10 hero-overlay">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/50 text-[#E07A5F] border border-[#E07A5F]/30 uppercase tracking-widest inline-block mb-2">
                  {event.tagline || 'Celebration Venue'}
                </span>
                <h4 className="text-2xl font-bold drop-shadow-md" style={{ color: '#FFFFFF' }}>
                  {event.venue}
                </h4>
                <p className="text-xs text-zinc-300 mt-1" style={{ color: '#E4E4E7' }}>
                  {event.city} • {event.displayDate}
                </p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 z-10 hero-overlay">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-[#E07A5F] border border-white/10 uppercase tracking-wider inline-block">
              {event.tagline || 'Grand Celebration'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold mt-2 drop-shadow-md" style={{ color: '#FFFFFF' }}>
              {event.venue}
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5" style={{ color: '#E4E4E7' }}>
              {event.city} • {event.displayDate}
            </p>
          </div>
        </div>

        {/* Right Side Progress & Countdown Card */}
        <div className="bg-[#181a24] border border-zinc-800/90 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle floral illustration accent */}
          <div className="absolute top-4 right-4 text-zinc-700/40 pointer-events-none">
            <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M50 10 Q65 30 50 50 Q35 30 50 10 Z" strokeWidth="1.5" />
              <path d="M50 50 Q75 60 90 50 Q75 40 50 50 Z" strokeWidth="1.5" />
              <path d="M50 50 Q60 75 50 90 Q40 75 50 50 Z" strokeWidth="1.5" />
              <path d="M50 50 Q25 40 10 50 Q25 60 50 50 Z" strokeWidth="1.5" />
            </svg>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tight">{daysLeft}</span>
              <span className="text-sm font-semibold text-zinc-400">Days Left</span>
            </div>

            {/* Event Progress */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Event Progress</span>
                <span className="font-bold text-[#E07A5F]">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-[#E07A5F] to-[#f4a261] rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Inspirational Quote */}
          <div className="pt-6 border-t border-zinc-800/80">
            <p className="font-editorial italic text-zinc-300 text-sm text-center">
              "{event.quote || 'Two hearts, one beautiful journey'}"
            </p>
            <div className="flex justify-center gap-1 mt-2 text-[#E07A5F]">
              <span>♥</span>
              <span>♥</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Bottom KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-[#E07A5F]/15 flex items-center justify-center text-[#E07A5F]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              {formatCurrencyINR(event.budget)}
            </h4>
            <p className="text-[11px] text-zinc-400">Total Budget</p>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              {tasksCompleted} / {totalTasks}
            </h4>
            <p className="text-[11px] text-zinc-400">Tasks Completed</p>
          </div>
        </div>

        {/* Vendors Confirmed */}
        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              {vendorsConfirmed} / {totalVendors}
            </h4>
            <p className="text-[11px] text-zinc-400">Vendors Confirmed</p>
          </div>
        </div>

        {/* Expected Guests */}
        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              {event.expectedGuests}
            </h4>
            <p className="text-[11px] text-zinc-400">Expected Guests</p>
          </div>
        </div>
      </div>
    </div>
  );
};
