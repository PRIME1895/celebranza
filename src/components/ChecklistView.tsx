import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, AlertCircle, ListPlus, Filter, Loader2 } from 'lucide-react';
import { Task } from '../types.ts';

interface ChecklistViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Decor');
  const [phase, setPhase] = useState('2 Months Before');
  const [dueDate, setDueDate] = useState('2025-10-30');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignee, setAssignee] = useState('Ananya');

  const categories = ['all', 'Venue', 'Catering', 'Invitations', 'Decor', 'Guests', 'Attire', 'Finance', 'Entertainment'];

  const filteredTasks = tasks.filter((t) => {
    if (filterCategory === 'all') return true;
    return t.category.toLowerCase() === filterCategory.toLowerCase();
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      eventId: 'ev-1',
      title: title.trim(),
      category,
      phase,
      dueDate,
      completed: false,
      priority,
      assignee,
    });
    setTitle('');
    setShowAddModal(false);
  };

  const handleAiChecklistGenerator = async () => {
    setIsGeneratingChecklist(true);
    try {
      const res = await fetch('/api/planning/quick-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'wedding',
          currentPhase: '1 Month Before',
          prompt: 'Generate 3 essential wedding day emergency kit checklist tasks',
        }),
      });
      const data = await res.json();
      const tags: string[] = data.data?.tags || ['Safety Pins & Stitch Kit', 'Extra Phone Powerbanks', 'Bottled Hydration'];
      tags.forEach((tag, idx) => {
        onAddTask({
          eventId: 'ev-1',
          title: `Kit Preparation: ${tag}`,
          category: 'Admin',
          phase: '1 Week Before',
          dueDate: '2025-12-08',
          completed: false,
          priority: 'high',
          assignee: 'Both',
        });
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingChecklist(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Checklist</h2>
          <p className="text-xs text-zinc-400 mt-1">
            {completedCount} of {tasks.length} tasks completed ({progressPercent}%)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAiChecklistGenerator}
            disabled={isGeneratingChecklist}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            {isGeneratingChecklist ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E07A5F]" />
            ) : (
              <ListPlus className="w-3.5 h-3.5 text-[#E07A5F]" />
            )}
            <span>{isGeneratingChecklist ? 'Generating...' : 'Suggest Tasks'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#d66e53] text-white shadow-md shadow-[#E07A5F]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-[#E07A5F] to-[#f4a261] rounded-full transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {cat === 'all' ? 'All Tasks' : cat}
          </button>
        ))}
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onToggleTask(task.id)}
            className="group bg-[#161822] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-zinc-700 transition-all shadow-md"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold truncate transition-colors ${
                    task.completed ? 'line-through text-zinc-500' : 'text-white'
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span className="text-[#E07A5F] font-medium">{task.category}</span>
                  <span>•</span>
                  <span>Due: {task.dueDate}</span>
                  {task.assignee && (
                    <>
                      <span>•</span>
                      <span>Assignee: {task.assignee}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  task.priority === 'high'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : task.priority === 'medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181a24] border border-zinc-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Checklist Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Task Description</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule final soundcheck with orchestra"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor">Decor</option>
                    <option value="Attire">Attire</option>
                    <option value="Invitations">Invitations</option>
                    <option value="Guests">Guests</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Assignee</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#d66e53] text-white font-semibold transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
