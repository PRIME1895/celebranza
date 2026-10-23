import React from 'react';
import {
  Calendar,
  Home,
  CalendarDays,
  Users,
  Lightbulb,
  Wallet,
  CheckSquare,
  Clock,
  UserCheck,
  Settings,
  Bot,
  Sparkles,
  LogIn,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

import { NavigationTab } from '../types.ts';
export type { NavigationTab };

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCreate: () => void;
  onOpenAiPlanner?: () => void;
  onOpenAiChatbot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  onOpenAiPlanner,
  onOpenAiChatbot,
}) => {
  const { user, setAuthModalOpen, signOutUser } = useAuth();

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'events', label: 'My Events', icon: CalendarDays },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'ideas', label: 'Ideas & Themes', icon: Lightbulb },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'guests', label: 'Guest Management', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-[#111319] border-r border-zinc-800/80 flex-col justify-between p-4 select-none shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#C85A3D] flex items-center justify-center text-white shadow-lg shadow-[#E07A5F]/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-serif-display">
              Celebranza
            </h1>
            <p className="text-xs text-zinc-400">Event OS</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#1e222d] text-white font-semibold shadow-inner border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#E07A5F]' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        {/* Bottom Promotion / AI Architect Card */}
        <div className="relative rounded-2xl p-4 overflow-hidden border border-zinc-800 bg-gradient-to-b from-[#1b1e28] to-[#14161f] shadow-lg">
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#E07A5F]/25 blur-2xl rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-[#E07A5F]">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                AI One-Prompt Planner
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Estimate budgets and real-time market data instantly with Gemini API.
            </p>
            <div className="space-y-1.5 pt-1">
              <button
                onClick={onOpenAiPlanner || onOpenCreate}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#E07A5F] hover:bg-[#d66e53] text-white shadow-md shadow-[#E07A5F]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>One-Prompt Estimator</span>
              </button>
              {onOpenAiChatbot && (
                <button
                  onClick={onOpenAiChatbot}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>Interactive Chatbot</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Auth Profile Footer */}
        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E07A5F] to-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {user.isDemo ? 'Demo Mode' : 'Firebase User'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Shield className="w-4 h-4 text-[#E07A5F]" />
              <span>Not logged in</span>
            </div>
          )}

          {user ? (
            <button
              onClick={() => signOutUser()}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E07A5F] text-white hover:bg-[#d66e53] transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

