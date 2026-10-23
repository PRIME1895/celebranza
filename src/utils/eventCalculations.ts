/**
 * Pure calculation and data formatting utilities for Celebranza event planning platform
 */

export interface BudgetSummary {
  budget: number;
  spent: number;
  remaining: number;
  percentSpent: number;
  isOverBudget: boolean;
}

/**
 * Format numbers according to Indian numbering system (Lakhs, Crores)
 * e.g., 1250000 -> "₹12,50,000"
 */
export function formatCurrencyINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const isNegative = amount < 0;
  const absVal = Math.round(Math.abs(amount));
  const s = absVal.toString();
  
  if (s.length <= 3) {
    return (isNegative ? '-₹' : '₹') + s;
  }
  
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (isNegative ? '-₹' : '₹') + formattedRest + ',' + last3;
}

/**
 * Formats short lakh notation, e.g. 1250000 -> "₹12.5L"
 */
export function formatLakhsShort(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return formatCurrencyINR(amount);
}

/**
 * Calculate days remaining between two ISO date strings
 */
export function calculateDaysLeft(targetDateStr: string, currentDateStr: string = '2025-10-12'): number {
  const target = new Date(targetDateStr).getTime();
  const current = new Date(currentDateStr).getTime();
  const diffTime = target - current;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate overall completion percentage from task counts
 */
export function calculateEventProgress(completedTasks: number, totalTasks: number): number {
  if (!totalTasks || totalTasks <= 0) return 0;
  const pct = Math.round((completedTasks / totalTasks) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * Calculate spent, remaining, and percentage
 */
export function calculateBudgetSummary(
  totalBudget: number,
  expenses: { actualSpent: number }[]
): BudgetSummary {
  const spent = expenses.reduce((acc, curr) => acc + (curr.actualSpent || 0), 0);
  const remaining = Math.max(0, totalBudget - spent);
  const percentSpent = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
  return {
    budget: totalBudget,
    spent,
    remaining,
    percentSpent,
    isOverBudget: spent > totalBudget,
  };
}

/**
 * Filter vendors by search keyword and status pill
 */
export function filterVendors<T extends { name: string; category: string; location: string; status: string }>(
  vendors: T[],
  statusFilter: string,
  searchQuery: string
): T[] {
  return vendors.filter((v) => {
    const matchesStatus =
      statusFilter === 'all' || v.status.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      v.name.toLowerCase().includes(query) ||
      v.category.toLowerCase().includes(query) ||
      v.location.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
}

/**
 * Validates event creation input
 */
export function validateEventInput(data: {
  title?: string;
  budget?: number;
  date?: string;
  venue?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length < 2) {
    errors.push('Event title must be at least 2 characters.');
  }
  if (data.budget === undefined || data.budget === null || isNaN(data.budget) || data.budget <= 0) {
    errors.push('Please enter a valid positive budget amount.');
  }
  if (!data.date || isNaN(new Date(data.date).getTime())) {
    errors.push('Please enter a valid event date.');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates RSVP counts from guests array
 */
export function calculateRSVPSummary(guests: { rsvpStatus: string; plusOnes?: number }[]) {
  const accepted = guests.filter((g) => g.rsvpStatus === 'attending').length;
  const declined = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const pending = guests.filter((g) => g.rsvpStatus === 'pending').length;
  const total = guests.length;
  const acceptedPlusOnes = guests
    .filter((g) => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + (g.plusOnes || 0), 0);
  const totalAttendingSeats = accepted + acceptedPlusOnes;
  const responseRate = total > 0 ? Math.round(((accepted + declined) / total) * 100) : 0;

  return {
    accepted,
    declined,
    pending,
    total,
    totalAttendingSeats,
    responseRate,
  };
}

/**
 * Checks if a category's expenditure exceeds the allocated budget threshold (e.g. 80%)
 */
export function checkCategoryBudgetWarning(
  allocated: number,
  spent: number,
  thresholdPercent: number = 80
): { percentUsed: number; isWarning: boolean } {
  if (!allocated || allocated <= 0) {
    return { percentUsed: 0, isWarning: false };
  }
  const percentUsed = Math.round((spent / allocated) * 100);
  return {
    percentUsed,
    isWarning: percentUsed >= thresholdPercent,
  };
}

