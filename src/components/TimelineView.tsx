import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  PartyPopper,
  Loader2,
} from 'lucide-react';
import { TimelineMilestone } from '../types.ts';

interface TimelineViewProps {
  milestones: TimelineMilestone[];
  onToggleTask: (milestoneId: string, itemId: string) => void;
  onAddTask: (milestoneId: string, title: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  milestones,
  onToggleTask,
  onAddTask,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [addingToMilestone, setAddingToMilestone] = useState<string | null>(null);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const handleCreateTask = (milestoneId: string) => {
    if (!newActionTitle.trim()) return;
    onAddTask(milestoneId, newActionTitle.trim());
    setNewActionTitle('');
    setAddingToMilestone(null);
  };

  const handleQuickTimelineAi = async () => {
    setIsAiSuggesting(true);
    setAiTip(null);
    try {
      const response = await fetch('/api/planning/quick-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'wedding',
          currentPhase: '1 Month Before',
          prompt: 'Suggest critical final-month rehearsal and coordination checkpoints for wedding timeline',
        }),
      });
      const data = await response.json();
      setAiTip(data.data?.suggestion || 'Schedule rehearsal walkthrough 5 days prior.');
    } catch {
      setAiTip('Finalize music cues for bride/groom entry and confirm caterer delivery window 24h prior.');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Event Timeline
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Milestone journey roadmap from planning to the grand finale
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickTimelineAi}
            disabled={isAiSuggesting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            {isAiSuggesting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E07A5F]" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-[#E07A5F]" />
            )}
            <span>{isAiSuggesting ? 'Analyzing...' : 'Schedule Insights'}</span>
          </button>

          {/* Toggle View as List / Calendar matching blueprint */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>View as List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>View as Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Optimization Banner */}
      {aiTip && (
        <div className="p-4 rounded-2xl bg-[#191e2b] border border-[#E07A5F]/30 text-xs text-zinc-300 flex items-start gap-3">
          <div className="p-1 rounded bg-[#E07A5F]/20 text-[#E07A5F] shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-white mb-0.5">Timeline Optimization</h5>
            <p className="leading-relaxed">{aiTip}</p>
          </div>
          <button onClick={() => setAiTip(null)} className="text-zinc-500 hover:text-white">✕</button>
        </div>
      )}

      {viewMode === 'list' ? (
        /* Vertical Milestone Roadmap matching blueprint */
        <div className="bg-[#161822] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl">
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-[#E07A5F] before:via-zinc-700 before:to-[#E07A5F]/40">
            {milestones.map((m) => (
              <div key={m.id} className="relative group">
                {/* Milestone Node on timeline */}
                <div
                  className={`absolute -left-[30px] sm:-left-[32px] top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    m.isSpecialDay
                      ? 'bg-[#E07A5F] border-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/40 animate-bounce'
                      : 'bg-[#161822] border-[#E07A5F] text-[#E07A5F]'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      m.isSpecialDay ? 'bg-white' : 'bg-[#E07A5F]'
                    }`}
                  />
                </div>

                {/* Milestone Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-3">
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    {m.phaseTitle}
                  </h4>
                  <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-800/80">
                    {m.dateBadge}
                  </span>
                </div>

                {/* Milestone Task Checklist */}
                <div className="space-y-2.5">
                  {m.items.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(m.id, task.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer group/item text-sm"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-500 group-hover/item:text-zinc-300 shrink-0" />
                      )}
                      <span
                        className={`font-medium transition-colors ${
                          task.completed
                            ? 'line-through text-zinc-500'
                            : 'text-zinc-200 group-hover/item:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}

                  {/* Add action row */}
                  {addingToMilestone === m.id ? (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add checkpoint or task..."
                        value={newActionTitle}
                        onChange={(e) => setNewActionTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(m.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F] flex-1"
                      />
                      <button
                        onClick={() => handleCreateTask(m.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#E07A5F] text-xs font-semibold text-white hover:bg-[#d66e53]"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setAddingToMilestone(null)}
                        className="px-2 py-1.5 text-zinc-500 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    !m.isSpecialDay && (
                      <button
                        onClick={() => {
                          setAddingToMilestone(m.id);
                          setNewActionTitle('');
                        }}
                        className="text-xs font-medium text-zinc-500 hover:text-[#E07A5F] flex items-center gap-1.5 pt-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add item</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-[#161822] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-white">Event Milestone Calendar (2025 - 2026)</h4>
            <span className="text-xs text-zinc-400">Target Wedding: 15 Dec 2025</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#1d202c] border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E07A5F]">{m.phaseTitle}</span>
                  <span className="text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full">
                    {m.dateBadge}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {m.items.map((i) => (
                    <div key={i.id} className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${i.completed ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      <span className={i.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}>
                        {i.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
