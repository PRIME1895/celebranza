import React, { useState } from 'react';
import {
  Plus,
  Volume2,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Download,
  Sun,
  Moon,
  Bot,
  User as UserIcon,
  LogIn,
  LogOut,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { EventItem } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { calculateDaysLeft } from '../utils/eventCalculations.ts';

interface TopBarProps {
  events: EventItem[];
  selectedEvent: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onDeleteEvent?: (eventId: string) => void;
  onOpenCreate: () => void;
  onOpenExport?: () => void;
  onOpenAiChatbot?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  tasksCompleted: number;
  totalTasks: number;
  daysLeft?: number;
  budgetSpentPercent?: number;
  upcomingTaskTitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onDeleteEvent,
  onOpenCreate,
  onOpenExport,
  onOpenAiChatbot,
  theme,
  onToggleTheme,
  tasksCompleted,
  totalTasks,
  daysLeft,
  budgetSpentPercent,
  upcomingTaskTitle,
}) => {
  const { user, setAuthModalOpen, signOutUser, isFirebaseConfigured } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioBriefingText, setAudioBriefingText] = useState<string | null>(null);
  const [speakingModel, setSpeakingModel] = useState<string | null>(null);

  const handlePlayBriefing = async () => {
    setIsPlayingAudio(true);
    setAudioError(null);
    try {
      const activeDays = daysLeft ?? calculateDaysLeft(selectedEvent.date);
      const activeProgress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 50;
      const activeBudget = budgetSpentPercent != null ? `${budgetSpentPercent}%` : 'on track';
      const activeTask = upcomingTaskTitle || 'Finalize decor theme and vendor confirmations';

      const response = await fetch('/api/planning/tts-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: selectedEvent.title,
          daysLeft: activeDays,
          progress: activeProgress,
          upcomingTask: activeTask,
          budgetSpent: activeBudget,
        }),
      });

      const data = await response.json();
      if (data.model) {
        setSpeakingModel(data.model);
      } else {
        setSpeakingModel(null);
      }

      if (data.audioDataUrl) {
        setAudioBriefingText(data.briefingText || null);
        const audio = new Audio(data.audioDataUrl);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
          if ('speechSynthesis' in window && data.briefingText) {
            const utterance = new SpeechSynthesisUtterance(data.briefingText);
            utterance.rate = 1.05;
            utterance.onend = () => setIsPlayingAudio(false);
            window.speechSynthesis.speak(utterance);
          } else {
            setIsPlayingAudio(false);
            setAudioError('Playback failed.');
          }
        };
        await audio.play();
      } else {
        setAudioBriefingText(data.fallbackText || 'Audio briefing generated.');
        if ('speechSynthesis' in window && data.fallbackText) {
          const utterance = new SpeechSynthesisUtterance(data.fallbackText);
          utterance.rate = 1.05;
          utterance.onend = () => setIsPlayingAudio(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlayingAudio(false);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setIsPlayingAudio(false);
      setAudioError('Could not generate speech.');
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#111319]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">

      {/* Event Selector */}
      <div className="flex items-center gap-3">
        {/* Event Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Switch active celebration"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-white transition-all shadow-sm cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">{selectedEvent.title}</span>
            <span className="text-zinc-500 font-normal text-xs hidden sm:inline">
              ({selectedEvent.displayDate})
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-[#1a1c24] border border-zinc-700/80 rounded-2xl shadow-2xl py-2 z-50">
              <div className="px-3.5 py-1 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                Switch Active Event
              </div>
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-zinc-800/60 transition-colors ${
                    ev.id === selectedEvent.id ? 'text-[#E07A5F] font-semibold bg-[#E07A5F]/10' : 'text-zinc-300'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectEvent(ev);
                      setDropdownOpen(false);
                    }}
                    aria-label={`Select ${ev.title}`}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30 flex items-center justify-center font-bold text-xs shrink-0">
                      {ev.title.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{ev.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{ev.tagline}</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {ev.id === selectedEvent.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#E07A5F]" />
                    )}
                    {onDeleteEvent && events.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(ev.id);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title={`Delete ${ev.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* AI Planning & Logo Studio CTA */}
        {onOpenAiChatbot && (
          <button
            onClick={onOpenAiChatbot}
            aria-label="Open Celebranza AI Event Planner & Logo Studio"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E07A5F]/15 hover:bg-[#E07A5F]/25 text-[#E07A5F] border border-[#E07A5F]/35 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            title="Open Celebranza AI Event Planner & Logo Studio"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Studio</span>
            <span className="sm:hidden">AI</span>
          </button>
        )}

        {/* Theme Toggle (Dark vs Light Warm Cream) */}
        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Warm Editorial Cream Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all hover:text-white flex items-center gap-1.5 cursor-pointer"
          title={theme === 'dark' ? 'Switch to Warm Editorial Cream Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px] text-zinc-400">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline text-[11px] text-zinc-600">Dark</span>
            </>
          )}
        </button>

        {/* Export Event Summary Button */}
        {onOpenExport && (
          <button
            onClick={onOpenExport}
            aria-label="Export full event summary"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-all cursor-pointer"
            title="Export full event summary (PDF, Markdown, CSV)"
          >
            <Download className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </button>
        )}

        {/* Audio Briefing button (TTS) */}
        <button
          onClick={handlePlayBriefing}
          disabled={isPlayingAudio}
          aria-label="Play AI voice audio briefing for this event"
          title="Play voice audio briefing for this event"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all hover:text-white cursor-pointer"
        >
          {isPlayingAudio ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E07A5F]" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-[#E07A5F]" />
          )}
          <span className="hidden md:inline">{isPlayingAudio ? 'Speaking...' : 'Audio Briefing'}</span>
        </button>

        {/* Firebase Authentication & User Profile */}
        <div className="relative">
          {user ? (
            <div>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label={`User account menu for ${user.displayName || user.email}`}
                aria-expanded={userDropdownOpen}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-all cursor-pointer"
                title={`Signed in as ${user.displayName || user.email}`}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E07A5F] to-amber-500 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden md:inline font-medium max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#161822] border border-zinc-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-xs font-bold text-white truncate">{user.displayName || 'Planner'}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email || 'No email attached'}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#E07A5F]/20 text-[#E07A5F]">
                        {user.isDemo ? 'Demo Mode' : 'Firebase Auth'}
                      </span>
                      {isFirebaseConfigured && (
                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                          ● Online
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setAuthModalOpen(true);
                      }}
                      aria-label="Switch account or authentication mode"
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#E07A5F]" />
                      <span>Switch Account / Auth</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOutUser();
                      }}
                      aria-label="Sign out of account"
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              aria-label="Sign in to Celebranza account"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Create Event CTA */}
        <button
          onClick={onOpenCreate}
          aria-label="Create a new celebration"
          className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#d66e53] text-white shadow-md shadow-[#E07A5F]/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Create Event</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Audio briefing subtitle toast if audio played or error */}
      {audioBriefingText && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-[#1c1f2b] border border-zinc-700 p-3.5 rounded-2xl shadow-2xl z-50 text-xs text-zinc-300 space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-zinc-400 font-semibold text-[11px] gap-2">
            <span className="flex items-center gap-1.5 text-[#E07A5F] shrink-0">
              <Volume2 className="w-3.5 h-3.5" />
              Voice Briefing
            </span>
            {speakingModel && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800/90 text-emerald-400 border border-zinc-700/80 truncate">
                {speakingModel}
              </span>
            )}
            <button
              onClick={() => {
                setAudioBriefingText(null);
                setSpeakingModel(null);
              }}
              aria-label="Dismiss audio briefing toast"
              className="text-zinc-500 hover:text-white ml-auto"
            >
              ✕
            </button>
          </div>
          <p className="line-clamp-3 italic text-zinc-300">{audioBriefingText}</p>
        </div>
      )}
    </header>
  );
};
