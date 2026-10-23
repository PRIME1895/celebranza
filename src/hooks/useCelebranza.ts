import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  INITIAL_EVENTS,
  INITIAL_VENDORS,
  INITIAL_EXPENSES,
  INITIAL_TIMELINE,
  INITIAL_INSPIRATIONS,
  INITIAL_GUESTS,
  INITIAL_TASKS,
} from '../data/initialData.ts';
import {
  EventItem,
  NavigationTab,
  Task,
  Vendor,
  VendorStatus,
  Expense,
  InspirationItem,
  Guest,
  RSVPStatus,
  TimelineMilestone,
} from '../types.ts';
import { calculateDaysLeft, calculateBudgetSummary } from '../utils/eventCalculations.ts';

const STORAGE_KEY = 'celebranza_events';

export function useCelebranza() {
  // Core Application State with persistent localStorage
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
      const saved = localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync theme with root HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Computed Counters
  const completedTasksCount = useMemo(() => {
    return (
      tasks.filter((t) => t.completed).length +
      milestones.reduce((acc, m) => acc + m.items.filter((i) => i.completed).length, 0)
    );
  }, [tasks, milestones]);

  const totalTasksCount = useMemo(() => {
    return tasks.length + milestones.reduce((acc, m) => acc + m.items.length, 0);
  }, [tasks, milestones]);

  const confirmedVendorsCount = useMemo(
    () => vendors.filter((v) => v.status === 'confirmed').length,
    [vendors]
  );
  const totalVendorsCount = vendors.length;

  // Dynamically computed event metrics for real-time dashboard and voice briefings
  const eventExpenses = useMemo(
    () => expenses.filter((e) => e.eventId === selectedEvent.id || !e.eventId),
    [expenses, selectedEvent.id]
  );

  const budgetSummary = useMemo(
    () => calculateBudgetSummary(selectedEvent.budget, eventExpenses),
    [selectedEvent.budget, eventExpenses]
  );

  const eventTasks = useMemo(
    () => tasks.filter((t) => t.eventId === selectedEvent.id || !t.eventId),
    [tasks, selectedEvent.id]
  );

  const upcomingTask = useMemo(() => {
    return (
      eventTasks.find((t) => !t.completed)?.title ||
      milestones.flatMap((m) => m.items).find((i) => !i.completed)?.title ||
      'Finalize decor theme and vendor confirmations'
    );
  }, [eventTasks, milestones]);

  const daysLeft = useMemo(() => calculateDaysLeft(selectedEvent.date), [selectedEvent.date]);

  // Handlers
  const handleCreateEvent = useCallback(
    (
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
    },
    []
  );

  const handleDeleteEvent = useCallback(
    (eventId: string) => {
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
    },
    [events, selectedEvent.id]
  );

  const handleToggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const handleAddTask = useCallback((newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: `tk-${Date.now()}`,
    };
    setTasks((prev) => [task, ...prev]);
  }, []);

  const handleToggleMilestoneItem = useCallback((milestoneId: string, itemId: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          items: m.items.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i)),
        };
      })
    );
  }, []);

  const handleAddExpense = useCallback((newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const handleUpdateExpenseStatus = useCallback(
    (expenseId: string, paymentStatus: 'paid' | 'partial' | 'pending') => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === expenseId ? { ...e, paymentStatus } : e))
      );
    },
    []
  );

  const handleUpdateVendorStatus = useCallback((vendorId: string, status: VendorStatus) => {
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, status } : v)));
  }, []);

  const handleAddVendor = useCallback((newVendor: Omit<Vendor, 'id'>) => {
    const vendor: Vendor = {
      ...newVendor,
      id: `v-${Date.now()}`,
    };
    setVendors((prev) => [vendor, ...prev]);
  }, []);

  const handleToggleFavoriteInspiration = useCallback((id: string) => {
    setInspirations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
  }, []);

  const handleAddGuest = useCallback((newGuest: Omit<Guest, 'id'>) => {
    const guest: Guest = {
      ...newGuest,
      id: `g-${Date.now()}`,
    };
    setGuests((prev) => [guest, ...prev]);
  }, []);

  const handleUpdateRSVP = useCallback((guestId: string, rsvpStatus: RSVPStatus) => {
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, rsvpStatus } : g)));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    events,
    selectedEvent,
    setSelectedEvent,
    currentTab,
    setCurrentTab,
    vendors,
    setVendors,
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
  };
}
