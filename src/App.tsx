import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Sidebar, NavigationTab } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { DashboardHome } from './components/DashboardHome.tsx';
import { EventOverview } from './components/EventOverview.tsx';
import { BudgetView } from './components/BudgetView.tsx';
import { TimelineView } from './components/TimelineView.tsx';
import { VendorsView } from './components/VendorsView.tsx';
import { InspirationsView } from './components/InspirationsView.tsx';
import { GuestsView } from './components/GuestsView.tsx';
import { ChecklistView } from './components/ChecklistView.tsx';
import { CreateEventModal } from './components/CreateEventModal.tsx';
import { ExportSummaryModal } from './components/ExportSummaryModal.tsx';
import { AiPlannerChatbot } from './components/AiPlannerChatbot.tsx';
import { AiOnePromptPlannerModal } from './components/AiOnePromptPlannerModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

import {
  INITIAL_EVENTS,
  INITIAL_VENDORS,
  INITIAL_EXPENSES,
  INITIAL_TIMELINE,
  INITIAL_INSPIRATIONS,
  INITIAL_GUESTS,
  INITIAL_TASKS,
} from './data/initialData.ts';

import {
  EventItem,
  EventType,
  Task,
  Vendor,
  VendorStatus,
  Expense,
  InspirationItem,
  Guest,
  RSVPStatus,
  TimelineMilestone,
} from './types.ts';
import { calculateDaysLeft, calculateBudgetSummary } from './utils/eventCalculations.ts';

function AppContent() {
  const { authModalOpen, setAuthModalOpen } = useAuth();

  // Core Application State with persistent localStorage
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem('celebranza_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading events:', e);
    }
    return INITIAL_EVENTS;
  });

  const [selectedEvent, setSelectedEvent] = useState<EventItem>(() => {
    try {
      const saved = localStorage.getItem('celebranza_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {}
    return INITIAL_EVENTS[0];
  });

  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');

  // Sync events changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('celebranza_events', JSON.stringify(events));
    } catch (e) {
      console.error('Error saving events to storage:', e);
    }
  }, [events]);

  // Entities
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [milestones, setMilestones] = useState<TimelineMilestone[]>(INITIAL_TIMELINE);
  const [inspirations, setInspirations] = useState<InspirationItem[]>(INITIAL_INSPIRATIONS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Modal & Assistant State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<EventType>('wedding');
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);
  const [aiPlannerInitialPrompt, setAiPlannerInitialPrompt] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [aiChatbotOpen, setAiChatbotOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync theme with root HTML data-theme attribute for warm cream light mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Computed Counters
  const completedTasksCount =
    tasks.filter((t) => t.completed).length +
    milestones.reduce((acc, m) => acc + m.items.filter((i) => i.completed).length, 0);
  const totalTasksCount =
    tasks.length + milestones.reduce((acc, m) => acc + m.items.length, 0);

  const confirmedVendorsCount = vendors.filter((v) => v.status === 'confirmed').length;
  const totalVendorsCount = vendors.length;

  // Dynamically computed event metrics for real-time dashboard and voice briefings
  const eventExpenses = expenses.filter(
    (e) => e.eventId === selectedEvent.id || !e.eventId
  );
  const budgetSummary = calculateBudgetSummary(selectedEvent.budget, eventExpenses);

  const eventTasks = tasks.filter(
    (t) => t.eventId === selectedEvent.id || !t.eventId
  );
  const upcomingTask =
    eventTasks.find((t) => !t.completed)?.title ||
    milestones.flatMap((m) => m.items).find((i) => !i.completed)?.title ||
    'Finalize decor theme and vendor confirmations';

  const daysLeft = calculateDaysLeft(selectedEvent.date);

  // Handlers
  const handleOpenCreate = (type: EventType = 'wedding') => {
    setCreateModalType(type);
    setCreateModalOpen(true);
  };

  const handleOpenAiPlanner = (initialPrompt?: string) => {
    setAiPlannerInitialPrompt(initialPrompt || '');
    setAiPlannerOpen(true);
  };

  const handleCreateEvent = (
    newEvent: EventItem,
    aiExpenses?: Expense[],
    aiMilestones?: TimelineMilestone[],
    aiVendors?: Vendor[]
  ) => {
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEvent(newEvent);

    if (aiExpenses && aiExpenses.length > 0) {
      setExpenses(aiExpenses);
    }
    if (aiMilestones && aiMilestones.length > 0) {
      setMilestones(aiMilestones);
    }
    if (aiVendors && aiVendors.length > 0) {
      setVendors((prev) => [...aiVendors, ...prev]);
    }

    setCurrentTab('events');
  };

  const handleDeleteEvent = (eventId: string) => {
    if (events.length <= 1) {
      alert('You must have at least one active celebration in Celebranza.');
      return;
    }
    const target = events.find((e) => e.id === eventId);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${target?.title || 'this celebration'}"? All associated budget and planning items will be removed.`
    );
    if (!confirmDelete) return;

    const remaining = events.filter((e) => e.id !== eventId);
    setEvents(remaining);
    if (selectedEvent.id === eventId) {
      setSelectedEvent(remaining[0]);
    }
    setExpenses((prev) => prev.filter((exp) => exp.eventId !== eventId));
    setVendors((prev) => prev.filter((v) => v.eventId !== eventId));
    setMilestones((prev) => prev.filter((m) => m.eventId !== eventId));
    setGuests((prev) => prev.filter((g) => g.eventId !== eventId));
    setTasks((prev) => prev.filter((t) => t.eventId !== eventId));
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: `tk-${Date.now()}`,
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleToggleMilestoneItem = (milestoneId: string, itemId: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          items: m.items.map((i) =>
            i.id === itemId ? { ...i, completed: !i.completed } : i
          ),
        };
      })
    );
  };

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleUpdateExpenseStatus = (
    expenseId: string,
    paymentStatus: 'paid' | 'partial' | 'pending'
  ) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expenseId ? { ...e, paymentStatus } : e))
    );
  };

  const handleUpdateVendorStatus = (vendorId: string, status: VendorStatus) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status } : v))
    );
  };

  const handleAddVendor = (newVendor: Omit<Vendor, 'id'>) => {
    const vendor: Vendor = {
      ...newVendor,
      id: `v-${Date.now()}`,
    };
    setVendors((prev) => [vendor, ...prev]);
  };

  const handleToggleFavoriteInspiration = (id: string) => {
    setInspirations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
  };

  const handleAddGuest = (newGuest: Omit<Guest, 'id'>) => {
    const guest: Guest = {
      ...newGuest,
      id: `g-${Date.now()}`,
    };
    setGuests((prev) => [guest, ...prev]);
  };

  const handleUpdateRSVP = (guestId: string, rsvpStatus: RSVPStatus) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, rsvpStatus } : g))
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-[#E07A5F]/30 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCreate={() => handleOpenCreate('wedding')}
        onOpenAiPlanner={() => handleOpenAiPlanner()}
        onOpenAiChatbot={() => setAiChatbotOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <TopBar
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          onDeleteEvent={handleDeleteEvent}
          onOpenCreate={() => handleOpenCreate('wedding')}
          onOpenExport={() => setExportModalOpen(true)}
          onOpenAiChatbot={() => setAiChatbotOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          tasksCompleted={completedTasksCount}
          totalTasks={totalTasksCount}
          daysLeft={daysLeft}
          budgetSpentPercent={budgetSummary.percentSpent}
          upcomingTaskTitle={upcomingTask}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-7 max-w-7xl w-full mx-auto">
          {currentTab === 'home' && (
            <DashboardHome
              events={events}
              guests={guests}
              selectedEvent={selectedEvent}
              onSelectEvent={(ev) => {
                setSelectedEvent(ev);
                setCurrentTab('events');
              }}
              onOpenCreate={(type) => handleOpenCreate(type)}
              onOpenAiPlanner={(p) => handleOpenAiPlanner(p)}
              onViewAllEvents={() => setCurrentTab('events')}
              onNavigateGuests={() => setCurrentTab('guests')}
            />
          )}

          {currentTab === 'events' && (
            <EventOverview
              event={selectedEvent}
              tasksCompleted={completedTasksCount}
              totalTasks={totalTasksCount}
              vendorsConfirmed={confirmedVendorsCount}
              totalVendors={totalVendorsCount}
              daysLeft={daysLeft}
              onEditEvent={() => setCurrentTab('settings')}
              onDeleteEvent={() => handleDeleteEvent(selectedEvent.id)}
              onExportSummary={() => setExportModalOpen(true)}
              onShare={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'budget' && (
            <BudgetView
              totalBudget={selectedEvent.budget}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onUpdateExpenseStatus={handleUpdateExpenseStatus}
            />
          )}

          {currentTab === 'timeline' && (
            <TimelineView
              milestones={milestones}
              onToggleTask={handleToggleMilestoneItem}
              onAddTask={(milestoneId, title) => {
                setMilestones((prev) =>
                  prev.map((m) =>
                    m.id === milestoneId
                      ? {
                          ...m,
                          items: [...m.items, { id: `item-${Date.now()}`, title, completed: false }],
                        }
                      : m
                  )
                );
              }}
            />
          )}

          {currentTab === 'vendors' && (
            <VendorsView
              vendors={vendors}
              onUpdateVendorStatus={handleUpdateVendorStatus}
              onAddVendor={handleAddVendor}
            />
          )}

          {currentTab === 'ideas' && (
            <InspirationsView
              inspirations={inspirations}
              onToggleFavorite={handleToggleFavoriteInspiration}
              onAddInspiration={(item) =>
                setInspirations((prev) => [{ ...item, id: `insp-${Date.now()}` }, ...prev])
              }
            />
          )}

          {currentTab === 'guests' && (
            <GuestsView
              guests={guests}
              onAddGuest={handleAddGuest}
              onUpdateRSVP={handleUpdateRSVP}
            />
          )}

          {currentTab === 'checklist' && (
            <ChecklistView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
            />
          )}

          {currentTab === 'settings' && (
            <div className="max-w-2xl bg-[#161822] border border-zinc-800 rounded-3xl p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold font-serif-display text-white">Event Settings</h2>
                <p className="text-xs text-zinc-400">
                  Update core information for {selectedEvent.title}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Event Name</label>
                  <input
                    type="text"
                    value={selectedEvent.title}
                    onChange={(e) =>
                      setSelectedEvent({ ...selectedEvent, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Venue Location</label>
                  <input
                    type="text"
                    value={selectedEvent.venue}
                    onChange={(e) =>
                      setSelectedEvent({ ...selectedEvent, venue: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Target Budget (₹)</label>
                  <input
                    type="number"
                    value={selectedEvent.budget}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        budget: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs space-y-2 text-zinc-400">
                  <p className="font-semibold text-white">System Features &amp; Real-time Integrations</p>
                  <p>• Gemini API Grounding: Real-time market rates and venue estimates from a single prompt</p>
                  <p>• Dynamic Branding: Synthesizes custom vector logos on the fly</p>
                  <p>• Firebase Authentication: Secure Google, email/password &amp; demo planner accounts</p>
                  <p>• Financial Optimizer: Real-time category allocation &amp; 80% budget cap warning</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Quick-Action AI One-Prompt Estimator Trigger */}
      <button
        onClick={() => handleOpenAiPlanner()}
        className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#C85A3D] text-white font-semibold text-xs shadow-xl shadow-[#E07A5F]/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        title="Open AI One-Prompt Planner & Budget Architect"
      >
        <Sparkles className="w-4 h-4" />
        <span>AI One-Prompt Planner</span>
      </button>

      {/* Create Event Modal with AI One-Prompt Architect */}
      <CreateEventModal
        initialType={createModalType}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateEvent}
        initialPrompt={aiPlannerInitialPrompt}
      />

      {/* Dedicated AI One-Prompt Planner Modal */}
      <AiOnePromptPlannerModal
        isOpen={aiPlannerOpen}
        onClose={() => setAiPlannerOpen(false)}
        onApplyEvent={handleCreateEvent}
        initialPrompt={aiPlannerInitialPrompt}
        theme={theme}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        theme={theme}
      />

      {/* Export Event Summary Modal */}
      <ExportSummaryModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        event={selectedEvent}
        expenses={expenses}
        guests={guests}
        vendors={vendors}
        tasks={tasks}
        milestones={milestones}
      />

      {/* Interactive AI Planning Studio Chatbot */}
      <AiPlannerChatbot
        isOpen={aiChatbotOpen}
        onClose={() => setAiChatbotOpen(false)}
        activeEvent={selectedEvent}
        theme={theme}
        onApplyNewEvent={(newEvent) => {
          setEvents((prev) => [newEvent, ...prev]);
          setSelectedEvent(newEvent);
          setCurrentTab('events');
          setAiChatbotOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
