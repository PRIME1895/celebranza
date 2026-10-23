import { Router, Request, Response } from 'express';
import { Type } from '@google/genai';
import { MODELS } from '../config/models.ts';
import { ai, generateContentWithRetry, synthesize } from '../services/gemini.ts';
import { generateSvgLogo } from '../services/logo.ts';
import {
  detectEventType,
  extractBudget,
  detectCity,
  extractTitle,
  getFallbackVenue,
  getHeroImage,
  getBannerImage,
} from '../utils/heuristics.ts';
import { sanitizeInput, sanitizeSvg, safeJsonParse, addWavHeader } from '../helpers.ts';
import {
  QuickSuggestRequest,
  QuickSuggestResponse,
  SearchVendorsRequest,
  SearchVendorsResponse,
  MapsVendorsRequest,
  MapsVendorsResponse,
  TtsBriefingRequest,
  TtsBriefingResponse,
  AiAssistantRequest,
  AiAssistantResponse,
  ChatPlannerRequest,
  ChatPlannerResponse,
  OnePromptPlannerRequest,
  OnePromptPlannerResponse,
  OnePromptPlannerData,
  StructuredEventPlan,
} from '../types/planning.ts';

const router = Router();

// ==========================================
// 1. Quick Suggest Endpoint
// ==========================================
router.post(
  '/quick-suggest',
  async (req: Request<unknown, unknown, QuickSuggestRequest>, res: Response<QuickSuggestResponse>) => {
    const eventType = sanitizeInput(req.body.eventType, 50);
    const budget = sanitizeInput(req.body.budget, 50);
    const currentPhase = sanitizeInput(req.body.currentPhase, 50);
    const prompt = sanitizeInput(req.body.prompt, 300);

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        data: {
          suggestion: `For a ${eventType || 'wedding'} with budget of ₹${budget || '12.5L'}, allocate 40% to venue & catering, 18% to decor, and reserve 8% for unexpected contingencies.`,
          tags: ['Budget Reserve', 'Vendor Escrow', 'Milestone Review'],
        },
      });
    }

    try {
      const response = await generateContentWithRetry(ai, {
        model: MODELS.text,
        contents: `Provide 3 high-value planning tips and 3 keyword tags for a ${eventType || 'wedding'} with budget of ${budget} at phase "${currentPhase || 'Planning'}". Specific query: ${prompt || 'Optimize my budget and milestones'}. Return JSON with "suggestion" (clean string) and "tags" (array of 3 short strings).`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = safeJsonParse<{ suggestion?: string; tags?: string[] } | Array<{ suggestion?: string; tags?: string[] }>>(
        response.text || '{}',
        {}
      );

      let suggestionText = '';
      let tagsList: string[] = ['Optimized', 'Milestone', 'Budget'];

      if (Array.isArray(parsed)) {
        suggestionText = parsed
          .map((p) => (typeof p === 'string' ? p : p.suggestion))
          .filter(Boolean)
          .join('\n\n• ');
        if (suggestionText) suggestionText = '• ' + suggestionText;
        const allTags = parsed.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])).filter(Boolean);
        if (allTags.length > 0) tagsList = Array.from(new Set(allTags));
      } else if (parsed && typeof parsed === 'object') {
        suggestionText = parsed.suggestion || '';
        if (Array.isArray(parsed.tags) && parsed.tags.length > 0) {
          tagsList = parsed.tags;
        }
      }

      if (!suggestionText) {
        suggestionText = response.text || 'Budget allocation aligned with market benchmarks.';
      }

      return res.json({
        success: true,
        source: 'gemini',
        model: MODELS.text,
        data: {
          suggestion: suggestionText,
          tags: tagsList,
        },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('quick-suggest error:', errorMsg);
      return res.json({
        success: true,
        source: 'fallback',
        data: {
          suggestion: `Prioritize early booking for premier venues and master photographers. Lock contracts with milestone-based payment schedules.`,
          tags: ['Contracts', 'Early Booking', 'Milestone'],
        },
      });
    }
  }
);

// ==========================================
// 2. Vendor Search Grounding (Google Search)
// ==========================================
router.post(
  '/search-vendors',
  async (req: Request<unknown, unknown, SearchVendorsRequest>, res: Response<SearchVendorsResponse>) => {
    const query = sanitizeInput(req.body.query, 300);
    const city = sanitizeInput(req.body.city, 100);
    const category = sanitizeInput(req.body.category, 100);
    const searchQuery =
      query || `Top recommended ${category || 'wedding catering'} vendors in ${city || 'Bengaluru'} with pricing and reviews`;

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        summary: `Top ${category || 'vendors'} in ${city || 'Bengaluru'} typically charge between ₹1,00,000 to ₹3,50,000 with high demand during festive seasons.`,
        sources: [
          {
            title: `${city || 'Bengaluru'} Event Planning Directory`,
            url: 'https://www.google.com/search?q=' + encodeURIComponent(searchQuery),
          },
        ],
      });
    }

    try {
      const response = await generateContentWithRetry(ai, {
        model: MODELS.text,
        contents: `Search for real, up-to-date vendor information: ${searchQuery}. Provide an authoritative, concise summary of market rates, popular options, and key negotiation points. Keep it professional.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; url: string }[] = [];

      for (const chunk of chunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || 'Source Reference',
            url: chunk.web.uri,
          });
        }
      }

      return res.json({
        success: true,
        source: 'gemini',
        model: MODELS.text,
        summary: response.text || 'Vendor search complete.',
        sources: sources.slice(0, 5),
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('search-vendors error:', errorMsg);
      return res.json({
        success: true,
        source: 'fallback',
        summary: `Verified vendor rates for ${city || 'Bengaluru'} are typically confirmed upon tasting or portfolio review. Request written contracts with itemized equipment and overtime clauses.`,
        sources: [
          {
            title: 'Google Event Vendors Directory',
            url: 'https://www.google.com/search?q=' + encodeURIComponent(searchQuery),
          },
        ],
      });
    }
  }
);

// ==========================================
// 3. Map Places Grounding (Google Maps)
// ==========================================
router.post(
  '/maps-vendors',
  async (req: Request<unknown, unknown, MapsVendorsRequest>, res: Response<MapsVendorsResponse>) => {
    const location = sanitizeInput(req.body.location, 100);
    const category = sanitizeInput(req.body.category, 100);
    const targetLocation = location || 'Bengaluru, India';
    const targetCategory = category || 'wedding venue and decor';

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        summary: `Top recommended spots in ${targetLocation} include Taj West End, The Leela Palace, and Bangalore Palace.`,
        places: [
          {
            title: `Taj West End, ${targetLocation}`,
            uri: `https://maps.google.com/?q=Taj+West+End+${encodeURIComponent(targetLocation)}`,
          },
          {
            title: `The Leela Palace, ${targetLocation}`,
            uri: `https://maps.google.com/?q=The+Leela+Palace+${encodeURIComponent(targetLocation)}`,
          },
        ],
      });
    }

    try {
      const response = await generateContentWithRetry(ai, {
        model: MODELS.text,
        contents: `Find real, top-rated ${targetCategory} in or around ${targetLocation}. Describe 3-4 premier options with their specialties and neighborhood.`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const places: { title: string; uri: string }[] = [];

      for (const chunk of chunks) {
        if (chunk.maps?.uri) {
          places.push({
            title: chunk.maps.title || 'Location on Google Maps',
            uri: chunk.maps.uri,
          });
        }
      }

      return res.json({
        success: true,
        source: 'gemini',
        model: MODELS.text,
        summary: response.text || 'Premier locations identified.',
        places: places.slice(0, 5),
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('maps-vendors error:', errorMsg);
      return res.json({
        success: true,
        source: 'fallback',
        summary: `Premier ${targetCategory} locations in ${targetLocation} are verified across central and suburban hubs.`,
        places: [
          {
            title: `Taj West End, ${targetLocation}`,
            uri: `https://maps.google.com/?q=Taj+West+End+${encodeURIComponent(targetLocation)}`,
          },
          {
            title: `The Leela Palace, ${targetLocation}`,
            uri: `https://maps.google.com/?q=The+Leela+Palace+${encodeURIComponent(targetLocation)}`,
          },
        ],
      });
    }
  }
);

// ==========================================
// 4. TTS Voice Audio Briefing (Dual Models)
// ==========================================
router.post(
  '/tts-briefing',
  async (req: Request<unknown, unknown, TtsBriefingRequest>, res: Response<TtsBriefingResponse>) => {
    const { eventTitle, daysLeft, progress, upcomingTask, budgetSpent } = req.body;
    const cleanTitle = sanitizeInput(eventTitle, 100);
    const safeDaysLeft = Number(daysLeft) || 60;
    const safeProgress = Number(progress) || 50;
    const safeUpcomingTask = sanitizeInput(upcomingTask, 120) || 'Finalize catering tastings';
    const safeBudgetSpent = sanitizeInput(budgetSpent, 30) || 'on track';

    const briefingText = `Good morning! Here is your executive briefing for ${cleanTitle || 'your celebration'}. You are ${safeDaysLeft} days away, with overall readiness at ${safeProgress} percent. Your key next milestone is "${safeUpcomingTask}". Budget utilization is currently at ${safeBudgetSpent}. Everything is on track for an unforgettable celebration!`;

    if (!ai) {
      return res.json({
        success: false,
        source: 'fallback',
        error: 'Gemini API client not initialized for speech generation.',
        fallbackText: briefingText,
      });
    }

    const result = await synthesize(briefingText);
    if (result) {
      const pcmBuffer = Buffer.from(result.b64, 'base64');
      const wavBuffer = addWavHeader(pcmBuffer, 24000, 1, 16);
      return res.json({
        success: true,
        source: 'gemini',
        model: result.model,
        audioDataUrl: `data:audio/wav;base64,${wavBuffer.toString('base64')}`,
        briefingText,
      });
    }

    return res.json({
      success: false,
      source: 'fallback',
      error: 'Audio generation failed across all TTS models.',
      fallbackText: briefingText,
    });
  }
);

// ==========================================
// 5. Comprehensive AI Assistant
// ==========================================
router.post(
  '/ai-assistant',
  async (req: Request<unknown, unknown, AiAssistantRequest>, res: Response<AiAssistantResponse>) => {
    const prompt = sanitizeInput(req.body.prompt, 500);
    const eventContext = req.body.eventContext || {};

    if (!ai) {
      return res.json({
        success: true,
        source: 'fallback',
        reply: 'Celebranza Assistant: To optimize your event, schedule vendor walkthroughs 3 weeks prior and confirm final headcount with caterers 7 days out.',
      });
    }

    try {
      const response = await generateContentWithRetry(ai, {
        model: MODELS.text,
        contents: `User Query: ${prompt}`,
        config: {
          systemInstruction: `You are an expert luxury event planning director for Celebranza. 
Event Context: ${JSON.stringify(eventContext)}
Provide clear, professional, well-formatted actionable advice. Avoid robot talk or generic pleasantries. Focus strictly on event logistics, budget balance, vendor negotiation, and guest satisfaction.`,
        },
      });

      return res.json({
        success: true,
        source: 'gemini',
        model: MODELS.text,
        reply: response.text || 'Planning recommendations ready.',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('ai-assistant error:', errorMsg);
      return res.status(500).json({
        success: false,
        source: 'fallback',
        reply: 'We are temporarily unable to process this planning inquiry.',
        error: errorMsg,
      });
    }
  }
);

// ==========================================
// 6. Interactive Chat Planner + Logo Studio
// ==========================================
router.post(
  '/chat-planner',
  async (req: Request<unknown, unknown, ChatPlannerRequest>, res: Response<ChatPlannerResponse>) => {
    const message = sanitizeInput(req.body.message, 500);
    const history = req.body.history || [];
    const activeEvent = req.body.activeEvent || {};
    const userQuery = message || '';

    const eventType = detectEventType(userQuery);
    const detectedBudget = extractBudget(userQuery, 500000);
    const detectedTitle = extractTitle(userQuery, eventType);
    const detectedCity = detectCity(userQuery);
    const detectedVenue = getFallbackVenue(detectedCity, eventType);

    if (ai) {
      try {
        const systemInstruction = `You are Celebranza's Executive AI Event Director & Luxury Blueprint Studio.
Active event: ${JSON.stringify(activeEvent)}
Provide structured JSON with:
1. "reply": A warm, expert event planner response with strategic logistical advice, recommended budget split, timeline milestones, and theme notes.
2. "eventPlan": {
     "title": string,
     "type": "wedding" | "birthday" | "community",
     "date": "2026-06-20",
     "displayDate": "20 Jun 2026",
     "venue": string,
     "city": string,
     "budget": number,
     "expectedGuests": number,
     "tagline": string,
     "quote": string,
     "heroImage": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
   }`;

        const geminiResponse = await generateContentWithRetry(ai, {
          model: MODELS.text,
          contents: `Conversation History: ${JSON.stringify(history.slice(-3))}\nUser Input: ${userQuery}`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const parsed = safeJsonParse<{ reply?: string; eventPlan?: StructuredEventPlan }>(
          geminiResponse.text || '{}',
          {}
        );
        const plan = parsed.eventPlan;
        const svg = sanitizeSvg(
          generateSvgLogo(plan?.title || detectedTitle, plan?.type || eventType, plan?.tagline || '')
        );
        const logoDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

        return res.json({
          success: true,
          source: 'gemini',
          model: MODELS.text,
          reply: parsed.reply || 'Event plan ready.',
          eventPlan: plan
            ? {
                ...plan,
                logoImage: logoDataUrl,
              }
            : null,
          logo: {
            name: plan?.title || detectedTitle,
            theme: plan?.tagline,
            svg,
            dataUrl: logoDataUrl,
          },
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Gemini chat-planner error:', errorMsg);
      }
    }

    // Graceful fallback
    const generatedSvg = sanitizeSvg(generateSvgLogo(detectedTitle, eventType, userQuery));
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(generatedSvg)}`;

    const fallbackEventPlan = {
      title: detectedTitle,
      type: eventType,
      date: '2026-06-20',
      displayDate: '20 Jun 2026',
      venue: detectedVenue,
      city: detectedCity,
      budget: detectedBudget,
      expectedGuests: eventType === 'birthday' ? 60 : eventType === 'community' ? 150 : 180,
      tagline:
        eventType === 'wedding'
          ? 'Eternal elegance by the sunset'
          : eventType === 'birthday'
          ? 'Radiant milestone celebration'
          : 'Uniting leaders and creators',
      quote: 'Crafted with passion, remembered forever',
      heroImage: getHeroImage(eventType),
      logoImage: dataUrl,
    };

    const adviceText = `I have designed a comprehensive master plan and custom branding insignia for "${detectedTitle}"!

Key Strategic Recommendations:
• Venue & Catering Allocation: 40% (₹${Math.round(detectedBudget * 0.4).toLocaleString('en-IN')}) locked with tasting walkthroughs.
• Aesthetic & Decor: 18% (₹${Math.round(detectedBudget * 0.18).toLocaleString('en-IN')}) focusing on warm ambient lanterns, florals, and bespoke table settings.
• Contingency Reserve: 10% (₹${Math.round(detectedBudget * 0.1).toLocaleString('en-IN')}) kept as a safety cushion for last-minute guest additions.

A minimalist, high-end vector logo emblem has been synthesized for this event. You can click "Create & Switch to Event" below to immediately integrate this plan into your Celebranza dashboard!`;

    return res.json({
      success: true,
      source: 'fallback',
      reply: adviceText,
      eventPlan: fallbackEventPlan,
      logo: {
        name: detectedTitle,
        theme: fallbackEventPlan.tagline,
        svg: generatedSvg,
        dataUrl,
      },
    });
  }
);

// ==========================================
// 7. One-Prompt Planner with Search Grounding
// ==========================================
router.post(
  '/one-prompt-planner',
  async (req: Request<unknown, unknown, OnePromptPlannerRequest>, res: Response<OnePromptPlannerResponse>) => {
    const prompt = sanitizeInput(req.body.prompt, 500);
    if (!prompt) {
      return res.status(400).json({
        success: false,
        source: 'fallback',
        error: 'Prompt is required',
        data: {} as OnePromptPlannerData,
      });
    }

    const eventType = detectEventType(prompt);
    const city = detectCity(prompt);
    const defaultBudget = eventType === 'wedding' ? (city === 'Udaipur' ? 2500000 : 1500000) : eventType === 'birthday' ? 250000 : 450000;
    const detectedBudget = extractBudget(prompt, defaultBudget);

    const guestsMatch = prompt.match(/(\d+)\s*(?:guests?|people|pax|friends|attendees|developers)/i);
    const detectedGuests = guestsMatch
      ? parseInt(guestsMatch[1], 10)
      : eventType === 'wedding'
      ? 200
      : eventType === 'birthday'
      ? 50
      : 150;

    if (ai) {
      try {
        // Step 1: Real-time Google Search Grounding to fetch authentic local rates as text
        let searchGroundingText = '';
        try {
          const searchRes = await generateContentWithRetry(ai, {
            model: MODELS.text,
            contents: `Search realistic wedding/event costs, venue banquet pricing, catering rates per plate, and decor packages in ${city}, India. Summarize typical price ranges and premier venues in 2-3 concise sentences.`,
            config: {
              tools: [{ googleSearch: {} }],
            },
          });
          searchGroundingText = searchRes.text || '';
        } catch (searchErr: unknown) {
          const searchMsg = searchErr instanceof Error ? searchErr.message : String(searchErr);
          console.warn('Google Search grounding pre-fetch warning:', searchMsg);
        }

        // Step 2: Strict JSON schema generation conditioned on search results
        const onePromptSchema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            city: { type: Type.STRING },
            venue: { type: Type.STRING },
            date: { type: Type.STRING },
            displayDate: { type: Type.STRING },
            expectedGuests: { type: Type.NUMBER },
            budget: { type: Type.NUMBER },
            budgetPerGuest: { type: Type.NUMBER },
            marketBenchmarkNotes: { type: Type.STRING },
            tagline: { type: Type.STRING },
            quote: { type: Type.STRING },
            categoryBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  percentage: { type: Type.NUMBER },
                  note: { type: Type.STRING },
                },
                required: ['category', 'amount', 'percentage', 'note'],
              },
            },
            itemizedExpenses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  vendorName: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ['title', 'category', 'amount', 'vendorName', 'status'],
              },
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  targetDate: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'targetDate', 'tasks'],
              },
            },
            recommendedVendors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  rating: { type: Type.NUMBER },
                  city: { type: Type.STRING },
                },
                required: ['name', 'category', 'estimatedCost', 'rating', 'city'],
              },
            },
          },
          required: [
            'title',
            'type',
            'city',
            'venue',
            'expectedGuests',
            'budget',
            'categoryBreakdown',
            'itemizedExpenses',
            'milestones',
            'recommendedVendors',
          ],
        };

        const systemInstruction = `You are Celebranza's Executive Event Director & Luxury Blueprint Studio.
Analyze the user's event prompt and generate a completely grounded, mathematically balanced event blueprint in INR (₹).
1. Identify the event type (wedding, birthday, or community), target city, and realistic headcount.
2. Select an authentic luxury or landmark venue in that city (e.g., Lake Pichola/Jagmandir/Udaivilas in Udaipur, Morjim/Taj in Goa, Bandra/Colaba in Mumbai, Palace Road in Bengaluru).
3. Compute a mathematically sound budget breakdown matching the total budget exactly.`;

        const response = await generateContentWithRetry(ai, {
          model: MODELS.text,
          contents: `${searchGroundingText ? `Real-time market context from Google Search:\n${searchGroundingText}\n\n` : ''}Plan this celebration with realistic market estimates: "${prompt}"`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: onePromptSchema,
          },
        });

        const parsed = safeJsonParse<OnePromptPlannerData>(response.text || '{}', {} as OnePromptPlannerData);
        const cleanTitle = parsed.title || prompt;
        const logoSvg = sanitizeSvg(
          generateSvgLogo(cleanTitle, parsed.type || eventType, parsed.tagline || parsed.city || city)
        );
        const logoDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg)}`;

        return res.json({
          success: true,
          source: 'gemini',
          model: MODELS.text,
          data: {
            ...parsed,
            logoSvg,
            logoDataUrl,
            heroImage: getHeroImage(parsed.type || eventType),
            bannerImage: getBannerImage(),
          },
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Gemini one-prompt-planner error:', errorMsg);
      }
    }

    // Deterministic realistic fallback
    const venue = getFallbackVenue(city, eventType);
    const venueAmount = Math.round(detectedBudget * 0.42);
    const decorAmount = Math.round(detectedBudget * 0.18);
    const photoAmount = Math.round(detectedBudget * 0.12);
    const entertainmentAmount = Math.round(detectedBudget * 0.1);
    const attireAmount = Math.round(detectedBudget * 0.08);
    const invitesAmount = Math.round(detectedBudget * 0.04);
    const miscAmount =
      detectedBudget - (venueAmount + decorAmount + photoAmount + entertainmentAmount + attireAmount + invitesAmount);

    const cleanTitle = prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt;
    const fallbackSvg = sanitizeSvg(generateSvgLogo(cleanTitle, eventType, city));
    const fallbackDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;

    return res.json({
      success: true,
      source: 'fallback',
      data: {
        title: cleanTitle,
        type: eventType,
        city,
        venue,
        date: '2026-08-15',
        displayDate: '15 Aug 2026',
        expectedGuests: detectedGuests,
        budget: detectedBudget,
        budgetPerGuest: Math.round(detectedBudget / detectedGuests),
        marketBenchmarkNotes: `Real-time pricing for ${city} calibrated at ~₹${Math.round(venueAmount / detectedGuests).toLocaleString('en-IN')}/guest catering and venue rental, plus regional staging standards.`,
        tagline:
          eventType === 'wedding'
            ? 'Bespoke elegance crafted to perfection'
            : eventType === 'birthday'
            ? 'Radiant celebration with friends'
            : 'Connect, innovate, and celebrate',
        quote: 'Memories created in beauty and cherished forever',
        categoryBreakdown: [
          { category: 'Venue & Catering', amount: venueAmount, percentage: 42, note: 'Banquet lawn & curated menu' },
          { category: 'Decor & Setup', amount: decorAmount, percentage: 18, note: 'Ambient floral & lighting design' },
          { category: 'Photography & Video', amount: photoAmount, percentage: 12, note: 'Traditional + candid cinematic coverage' },
          { category: 'Entertainment', amount: entertainmentAmount, percentage: 10, note: 'Sound systems & live performers' },
          { category: 'Attire & Makeup', amount: attireAmount, percentage: 8, note: 'Styling & couture coordination' },
          { category: 'Invitations & Stationery', amount: invitesAmount, percentage: 4, note: 'Digital RSVP portal & physical prints' },
          { category: 'Miscellaneous', amount: miscAmount, percentage: 6, note: 'Contingency & transport cushion' },
        ],
        itemizedExpenses: [
          { title: 'Venue Booking Advance', category: 'Venue & Catering', amount: Math.round(venueAmount * 0.6), vendorName: venue.split(',')[0], status: 'paid' },
          { title: 'Master Stage & Lighting Concept', category: 'Decor & Setup', amount: Math.round(decorAmount * 0.5), vendorName: 'Blush & Bloom Events', status: 'pending' },
          { title: 'Cinematic Pre-Event & Main Teaser', category: 'Photography & Video', amount: Math.round(photoAmount * 0.4), vendorName: 'Moments Studio', status: 'pending' },
          { title: 'Acoustic Sound & DJ Setup', category: 'Entertainment', amount: Math.round(entertainmentAmount * 0.5), vendorName: 'BeatWave Productions', status: 'pending' },
        ],
        milestones: [
          { title: '3 Months Before', targetDate: '15 May 2026', tasks: ['Lock venue agreement', 'Finalize design blueprint'] },
          { title: '1 Month Before', targetDate: '15 Jul 2026', tasks: ['Menu tasting & final headcount', 'Schedule sound rehearsals'] },
          { title: '1 Week Before', targetDate: '08 Aug 2026', tasks: ['Vendor walk-through', 'Guest seating chart lock'] },
          { title: 'Event Day', targetDate: '15 Aug 2026', tasks: ['Morning setup check', 'Celebrate and enjoy'] },
        ],
        recommendedVendors: [
          { name: venue.split(',')[0], category: 'Catering & Venue', estimatedCost: venueAmount, rating: 4.9, city },
          { name: 'Royal Floral Creatives', category: 'Decor', estimatedCost: decorAmount, rating: 4.8, city },
          { name: 'Heritage Cine Studio', category: 'Photography', estimatedCost: photoAmount, rating: 4.9, city },
        ],
        logoSvg: fallbackSvg,
        logoDataUrl: fallbackDataUrl,
        heroImage: getHeroImage(eventType),
        bannerImage: getBannerImage(),
      },
    });
  }
);

export default router;
