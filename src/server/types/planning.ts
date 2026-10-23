/**
 * Strongly-typed request and response contracts for Celebranza Planning APIs
 */

export type EventKind = 'wedding' | 'birthday' | 'community';

export interface QuickSuggestRequest {
  eventType?: string;
  budget?: string;
  currentPhase?: string;
  prompt?: string;
}

export interface QuickSuggestResponse {
  success: boolean;
  source: 'gemini' | 'fallback';
  model?: string;
  data: {
    suggestion: string;
    tags: string[];
  };
}

export interface SearchVendorsRequest {
  query?: string;
  city?: string;
  category?: string;
}

export interface SearchVendorsResponse {
  success: boolean;
  source: 'gemini' | 'fallback';
  model?: string;
  summary: string;
  sources: Array<{ title: string; url: string }>;
}

export interface MapsVendorsRequest {
  location?: string;
  category?: string;
}

export interface MapsVendorsResponse {
  success: boolean;
  source: 'gemini' | 'fallback';
  model?: string;
  summary: string;
  places: Array<{ title: string; uri: string }>;
}

export interface TtsBriefingRequest {
  eventTitle?: string;
  daysLeft?: number | string;
  progress?: number | string;
  upcomingTask?: string;
  budgetSpent?: string;
}

export interface TtsBriefingResponse {
  success: boolean;
  source: 'gemini' | 'fallback';
  model?: string;
  audioDataUrl?: string;
  briefingText?: string;
  fallbackText?: string;
  error?: string;
}

export interface AiAssistantRequest {
  prompt?: string;
  eventContext?: Record<string, unknown>;
}

export interface AiAssistantResponse {
  success: boolean;
  source: 'gemini' | 'fallback';
  model?: string;
  reply: string;
  error?: string;
}

export interface ChatPlannerRequest {
  message?: string;
  history?: Array<{ role: string; content: string }>;
  activeEvent?: Record<string, unknown>;
}

export interface StructuredEventPlan {
  title: string;
  type: EventKind;
  date: string;
  displayDate: string;
  venue: string;
  city: string;
  budget: number;
  expectedGuests: number;
  tagline: string;
  quote: string;
  heroImage: string;
  logoImage?: string;
}

export interface ChatPlannerResponse {
  success: boolean;
  source: 'gemini' | 'fallback';
  model?: string;
  reply: string;
  eventPlan: StructuredEventPlan | null;
  logo: {
    name: string;
    theme?: string;
    svg: string;
    dataUrl: string;
  };
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

export interface OnePromptPlannerRequest {
  prompt: string;
  eventType?: EventKind;
}

export interface OnePromptPlannerData {
  title: string;
  type: EventKind;
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

export interface OnePromptPlannerResponse {
  success: boolean;
  source: 'gemini' | 'fallback';
  model?: string;
  data: OnePromptPlannerData;
  error?: string;
}
