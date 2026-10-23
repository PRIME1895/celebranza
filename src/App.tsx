import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Sidebar } from './components/Sidebar.tsx';
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
import { useCelebranza } from './hooks/useCelebranza.ts';
import { EventType } from './types.ts';

function AppContent() {
  const { authModalOpen, setAuthModalOpen } = useAuth();
  const {
    events,
    selectedEvent,
    setSelectedEvent,
    currentTab,
    setCurrentTab,
    vendors,
    expenses,
    milestones,
    setMilestones,
    inspirations,
    setInspirations,
    guests,
    tasks,
    theme,
    toggleTheme,
    completedTasksCount,
    totalTasksCount,
    confirmedVendorsCount,
    totalVendorsCount,
    budgetSummary,
    upcomingTask,
    daysLeft,
    handleCreateEvent,
    handleDeleteEvent,
    handleToggleTask,
    handleAddTask,
    handleToggleMilestoneItem,
    handleAddExpense,
    handleUpdateExpenseStatus,
    handleUpdateVendorStatus,
    handleAddVendor,
    handleToggleFavoriteInspiration,
    handleAddGuest,
    handleUpdateRSVP,
  } = useCelebranza();

  // Modal & Assistant State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<EventType>('wedding');
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);
  const [aiPlannerInitialPrompt, setAiPlannerInitialPrompt] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [aiChatbotOpen, setAiChatbotOpen] = useState(false);

  const handleOpenCreate = (type: EventType = 'wedding') => {
    setCreateModalType(type);
    setCreateModalOpen(true);
  };

  const handleOpenAiPlanner = (initialPrompt?: string) => {
    setAiPlannerInitialPrompt(initialPrompt || '');
    setAiPlannerOpen(true);
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
          onToggleTheme={toggleTheme}
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
          handleCreateEvent(newEvent);
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
