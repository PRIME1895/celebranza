import { EventKind } from '../types/planning.ts';

/**
 * Natural language event type classification
 */
export function detectEventType(query: string): EventKind {
  if (/birthday|bday|turning|anniversary/i.test(query)) {
    return 'birthday';
  }
  if (/conference|alumni|meetup|summit|community|gala|fair|hackathon|expo|launch/i.test(query)) {
    return 'community';
  }
  return 'wedding';
}

/**
 * Robust Indian Rupee budget parser supporting Lakhs, Crores, and thousands
 */
export function extractBudget(query: string, defaultAmount: number = 500000): number {
  const match = query.match(
    /(?:budget|cost|around|approx)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:[.,]\d+)?)\s*(lakh|lakhs|lac|l|cr|k)?/i
  );
  if (!match) return defaultAmount;

  const num = parseFloat(match[1].replace(/,/g, ''));
  if (isNaN(num) || num <= 0) return defaultAmount;

  const unit = (match[2] || '').toLowerCase();
  if (unit.startsWith('cr')) return num * 10000000;
  if (unit.startsWith('l')) return num * 100000;
  if (unit.startsWith('k')) return num * 1000;
  return num < 100 ? num * 100000 : num;
}

/**
 * Target city identifier for authentic regional venue lookup
 */
export function detectCity(query: string): string {
  if (/udaipur|rajasthan/i.test(query)) return 'Udaipur';
  if (/goa|beach/i.test(query)) return 'Goa';
  if (/mumbai|bombay/i.test(query)) return 'Mumbai';
  if (/delhi|ncr|gurgaon|noida/i.test(query)) return 'New Delhi';
  return 'Bengaluru';
}

/**
 * Clean celebration title extraction heuristic
 */
export function extractTitle(query: string, fallbackType: EventKind): string {
  const titleMatch = query.match(/planning (?:a|an)?\s*([A-Za-z0-9\s'&]+?)(?:\s+(?:in|at|for|with|on)\s+|$)/i);
  if (titleMatch && titleMatch[1].trim().length > 3) {
    return titleMatch[1].trim();
  }
  if (fallbackType === 'wedding') return 'Aria & Neil Wedding';
  if (fallbackType === 'birthday') return "Kabir's 21st Birthday";
  return 'Global Tech Founders Gala';
}

/**
 * Authentic regional landmark venue assignment
 */
export function getFallbackVenue(city: string, eventType: EventKind): string {
  if (city === 'Udaipur') return 'Jagmandir Island Palace, Lake Pichola, Udaipur';
  if (city === 'Goa') return 'Marbela Beach Resort, Morjim, Goa';
  if (city === 'Mumbai') return 'Taj Lands End, Bandra, Mumbai';
  if (city === 'New Delhi') return 'The Claridges, Central Delhi';
  if (eventType === 'community') return 'KTPO Convention Center, Whitefield, Bengaluru';
  return 'The Leela Palace, Old Airport Road, Bengaluru';
}

/**
 * Editorial curated hero imagery
 */
export function getHeroImage(type: EventKind): string {
  switch (type) {
    case 'wedding':
      return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
    case 'birthday':
      return 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80';
    case 'community':
    default:
      return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80';
  }
}

export function getBannerImage(): string {
  return 'https://images.unsplash.com/photo-1519225429402-98b64e56993a?auto=format&fit=crop&w=1200&q=80';
}
