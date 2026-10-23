export type EventType = 'wedding' | 'birthday' | 'community';

export type NavigationTab =
  | 'home'
  | 'events'
  | 'budget'
  | 'checklist'
  | 'timeline'
  | 'vendors'
  | 'guests'
  | 'ideas'
  | 'inspirations'
  | 'settings';

export type TabType = NavigationTab;

export type VendorStatus = 'confirmed' | 'discussion' | 'shortlisted';


export type RSVPStatus = 'attending' | 'declined' | 'pending';

export type DietaryOption = 'none' | 'vegetarian' | 'vegan' | 'gluten_free' | 'halal' | 'jain';

export interface EventItem {
  id: string;
  title: string;
  type: EventType;
  date: string;
  displayDate: string;
  venue: string;
  city: string;
  heroImage: string;
  bannerImage: string;
  budget: number;
  expectedGuests: number;
  tagline: string;
  quote?: string;
  logoImage?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  category: string;
  phase: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
}

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  cost: number;
  status: VendorStatus;
  image: string;
  contact?: string;
  notes?: string;
  mapsUrl?: string;
  searchCitations?: { title: string; url: string }[];
}

export interface ExpenseCategoryItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Expense {
  id: string;
  eventId: string;
  title: string;
  category: string;
  budgetedAmount: number;
  actualSpent: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  date?: string;
}

export interface InspirationItem {
  id: string;
  title: string;
  category: 'wedding' | 'birthday' | 'community' | 'decor' | 'themes';
  image: string;
  isFavorite: boolean;
  tag: string;
}

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: RSVPStatus;
  plusOnes: number;
  dietary: DietaryOption;
  tableNumber?: string;
}

export interface TimelineMilestone {
  id: string;
  eventId: string;
  phaseTitle: string;
  dateBadge: string;
  isSpecialDay?: boolean;
  items: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface CategoryAllocationItem {
  category: string;
  amount: number;
  percentage: number;
  note: string;
}

export interface ItemizedExpenseItem {
  title: string;
  category: string;
  amount: number;
  vendorName: string;
  status: 'paid' | 'pending';
}

export interface TimelineMilestoneItem {
  title: string;
  targetDate: string;
  tasks: string[];
}

export interface RecommendedVendorItem {
  name: string;
  category: string;
  estimatedCost: number;
  rating: number;
  city: string;
}

export interface OnePromptPlannerData {
  title: string;
  type: EventType;
  city: string;
  venue: string;
  date: string;
  displayDate: string;
  expectedGuests: number;
  budget: number;
  budgetPerGuest: number;
  marketBenchmarkNotes: string;
  tagline: string;
  quote: string;
  categoryBreakdown: CategoryAllocationItem[];
  itemizedExpenses: ItemizedExpenseItem[];
  milestones: TimelineMilestoneItem[];
  recommendedVendors: RecommendedVendorItem[];
  logoSvg?: string;
  logoDataUrl?: string;
  heroImage: string;
  bannerImage: string;
}
