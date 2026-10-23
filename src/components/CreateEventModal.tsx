import React, { useState } from 'react';
import { Sparkles, Calendar, Wand2, ArrowRight, Loader2, Globe, MapPin, Wallet, Users, TrendingUp, CheckCircle2, Download } from 'lucide-react';
import { EventItem, EventType, Expense, TimelineMilestone, Vendor } from '../types.ts';
import { validateEventInput, formatCurrencyINR } from '../utils/eventCalculations.ts';

interface CreateEventModalProps {
  initialType?: EventType;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    event: EventItem,
    expenses?: Expense[],
    milestones?: TimelineMilestone[],
    vendors?: Vendor[]
  ) => void;
  initialPrompt?: string;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  initialType = 'wedding',
  isOpen,
  onClose,
  onCreate,
  initialPrompt = '',
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  // AI Prompt State
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<any | null>(null);
  const [aiSource, setAiSource] = useState<'gemini' | 'fallback' | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);

  // Manual Form State
  const [eventType, setEventType] = useState<EventType>(initialType);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-03-20');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [budget, setBudget] = useState('1000000');
  const [guests, setGuests] = useState('150');
  const [quote, setQuote] = useState('');
  const [manualErrors, setManualErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const quickInspirations = [
    '🏰 3-day royal Rajasthani wedding in Udaipur for 200 guests with lakeside sangeet',
    '🎂 Modern rooftop 30th birthday cocktail bash in Indiranagar Bengaluru for 45 friends',
    '🌴 Sunset beach ceremony in North Goa with 100 guests and live seafood counter',
    '⚡ 2-day AI Founders Hackathon & Gala at KTPO Bengaluru with 300 developers',
  ];

  const handleAiGenerate = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || prompt.trim();
    if (!textToSubmit || isGenerating) return;

    setAiError(null);
    setIsGenerating(true);
    setLoadingStep(1);

    const step1 = setTimeout(() => setLoadingStep(2), 1200);
    const step2 = setTimeout(() => setLoadingStep(3), 2600);

    try {
      const response = await fetch('/api/planning/one-prompt-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSubmit }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const resJson = await response.json();
      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || 'Failed to estimate event blueprint');
      }

      setGeneratedData(resJson.data);
      setAiSource(resJson.source || 'gemini');
      setAiModel(resJson.model || 'gemini-3.5-flash');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Unable to connect to Gemini API. Please check your network.');
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      setIsGenerating(false);
      setLoadingStep(0);
    }
  };

  const handleApplyAiData = () => {
    if (!generatedData) return;

    const newId = `ev-${Date.now()}`;
    const newEvent: EventItem = {
      id: newId,
      title: generatedData.title || 'AI Planned Event',
      type: (generatedData.type as EventType) || 'wedding',
      date: generatedData.date || '2026-08-15',
      displayDate: generatedData.displayDate || '15 Aug 2026',
      venue: generatedData.venue || 'Luxury Venue, Bengaluru',
      city: generatedData.city || 'Bengaluru',
      heroImage:
        generatedData.heroImage ||
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      bannerImage:
        generatedData.bannerImage ||
        'https://images.unsplash.com/photo-1519225429402-98b64e56993a?auto=format&fit=crop&w=1200&q=80',
      budget: generatedData.budget || 1500000,
      expectedGuests: generatedData.expectedGuests || 150,
      tagline: generatedData.tagline || 'Bespoke event planning',
      quote: generatedData.quote || 'Crafted with passion, remembered forever',
      logoImage: generatedData.logoDataUrl || '/logos/ananya-rohan.jpg',
      createdAt: new Date().toISOString(),
    };

    const mappedExpenses: Expense[] = (generatedData.itemizedExpenses || []).map(
      (exp: any, index: number) => ({
        id: `exp-ai-${newId}-${index}`,
        eventId: newId,
        title: exp.title || 'Estimated Item',
        category: exp.category || 'Venue & Catering',
        budgetedAmount: exp.amount || 50000,
        actualSpent: exp.status === 'paid' ? exp.amount : 0,
        paymentStatus: exp.status || 'pending',
        date: generatedData.date || '2026-08-15',
      })
    );

    const mappedMilestones: TimelineMilestone[] = (generatedData.milestones || []).map(
      (m: any, index: number) => ({
        id: `ms-ai-${newId}-${index}`,
        eventId: newId,
        phaseTitle: m.title || `Phase ${index + 1}`,
        dateBadge: m.targetDate || 'Upcoming',
        items: (m.tasks || []).map((t: string, ti: number) => ({
          id: `task-ai-${newId}-${index}-${ti}`,
          title: t,
          completed: index === 0 && ti === 0,
        })),
      })
    );

    const mappedVendors: Vendor[] = (generatedData.recommendedVendors || []).map(
      (v: any, index: number) => ({
        id: `ven-ai-${newId}-${index}`,
        eventId: newId,
        name: v.name || 'Premier Vendor',
        category: v.category || 'Catering',
        rating: v.rating || 4.9,
        reviewCount: 45 + index * 18,
        location: v.city || generatedData.city || 'Bengaluru',
        cost: v.estimatedCost || 100000,
        status: index === 0 ? 'confirmed' : 'discussion',
        image:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      })
    );

    onCreate(newEvent, mappedExpenses, mappedMilestones, mappedVendors);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budget) || 0;
    const guestsNum = parseInt(guests, 10) || 50;

    const validation = validateEventInput({
      title,
      budget: budgetNum,
      date,
      venue,
    });

    if (!validation.valid) {
      setManualErrors(validation.errors);
      return;
    }

    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

    const newEvent: EventItem = {
      id: `ev-${Date.now()}`,
      title: title.trim(),
      type: eventType,
      date,
      displayDate,
      venue: venue.trim() || 'Grand Heritage Lawn, Bengaluru',
      city: city.trim() || 'Bengaluru',
      heroImage:
        eventType === 'wedding'
          ? 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
          : eventType === 'birthday'
          ? 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80'
          : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
      bannerImage:
        eventType === 'wedding'
          ? 'https://images.unsplash.com/photo-1519225429402-98b64e56993a?auto=format&fit=crop&w=1200&q=80'
          : 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
      budget: budgetNum,
      expectedGuests: guestsNum,
      tagline: eventType === 'wedding' ? 'From vows to forever' : eventType === 'birthday' ? 'Celebrate every age in style' : 'Bring people together',
      quote: quote.trim() || 'Creating extraordinary moments with loved ones',
      createdAt: new Date().toISOString(),
    };

    onCreate(newEvent);
    onClose();
  };

  const handleDownloadSvg = () => {
    if (!generatedData?.logoSvg) return;
    const blob = new Blob([generatedData.logoSvg], { type: 'image/svg+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(generatedData.title || 'event-logo').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-logo.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-event-modal-title"
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
    >
      <div className="bg-[#181a24] border border-zinc-700/90 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#C85A3D] flex items-center justify-center text-white shadow-lg shadow-[#E07A5F]/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="create-event-modal-title" className="text-xl font-bold text-white tracking-tight font-serif-display">
                Create New Event
              </h3>
              <p className="text-xs text-zinc-400">
                AI One-Prompt Budget &amp; Blueprint Generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close event creation dialog"
            className="text-zinc-400 hover:text-white text-base p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-[#E07A5F] text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI One-Prompt (Recommended)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Manual Form</span>
          </button>
        </div>

        <div className="overflow-y-auto space-y-5 flex-1 pr-1">
          {activeTab === 'ai' ? (
            /* AI ONE-PROMPT ARCHITECT */
            !generatedData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    Enter a Single Prompt — Gemini Estimates Budget, Venue &amp; Real Market Data:
                  </label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A 3-day royal Rajasthani wedding in Udaipur with 200 guests and lakeside sangeet..."
                    className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#E07A5F] leading-relaxed"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Instant Inspirations:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickInspirations.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(chip.replace(/^[^\s]+\s*/, ''))}
                        className="text-left p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {aiError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                    {aiError}
                  </div>
                )}

                {isGenerating && (
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-[#E07A5F]/30 space-y-2 animate-pulse">
                    <div className="flex items-center gap-2.5 text-xs text-[#E07A5F] font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {loadingStep === 1
                          ? 'Consulting Gemini 3.8 Flash...'
                          : loadingStep === 2
                          ? 'Grounding market rates via Google Search...'
                          : 'Synthesizing custom vector logo & category allocations...'}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#E07A5F] to-amber-400 h-full transition-all duration-700"
                        style={{
                          width: loadingStep === 1 ? '30%' : loadingStep === 2 ? '70%' : '95%',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleAiGenerate()}
                    disabled={!prompt.trim() || isGenerating}
                    className="py-3 px-6 rounded-2xl bg-[#E07A5F] hover:bg-[#d56d52] disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-[#E07A5F]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Estimating with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Event &amp; Budget Blueprint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* AI Blueprint Preview */
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#E07A5F]/15 border border-[#E07A5F]/35 text-[#E07A5F] overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg font-serif-display">
                    {generatedData.title ? generatedData.title.charAt(0) : 'C'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E07A5F]/20 text-[#E07A5F]">
                        {generatedData.type}
                      </span>
                      {aiSource === 'gemini' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          Live {aiModel || 'Gemini 3.5 Flash'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-amber-400" />
                          Demo Mode / Local Baseline
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white font-serif-display truncate mt-1">
                      {generatedData.title}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
                      <span>{generatedData.venue}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-[#E07A5F]" />
                      Estimated Budget
                    </p>
                    <p className="text-sm font-bold text-white font-serif-display mt-0.5">
                      {formatCurrencyINR(generatedData.budget || 0)}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Headcount
                    </p>
                    <p className="text-sm font-bold text-white font-serif-display mt-0.5">
                      {generatedData.expectedGuests || 150} Guests
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Est. / Guest
                    </p>
                    <p className="text-sm font-bold text-white font-serif-display mt-0.5">
                      ₹{(generatedData.budgetPerGuest || Math.round((generatedData.budget || 1500000) / (generatedData.expectedGuests || 150))).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {generatedData.marketBenchmarkNotes && (
                  <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-indigo-300 flex items-start gap-2">
                    <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-white">Grounding Reference:</strong> {generatedData.marketBenchmarkNotes}
                    </p>
                  </div>
                )}

                {generatedData.categoryBreakdown && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Estimated Category Allocations (100% Total)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {generatedData.categoryBreakdown.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-white">{item.category}</p>
                            <p className="text-[10px] text-zinc-500">{item.percentage}% of total</p>
                          </div>
                          <p className="font-bold text-[#E07A5F]">{formatCurrencyINR(item.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setGeneratedData(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    ← Edit Prompt
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyAiData}
                    className="py-2.5 px-6 rounded-2xl bg-[#E07A5F] hover:bg-[#d56d52] text-white font-semibold text-xs shadow-xl shadow-[#E07A5F]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Event &amp; Launch Live Budget</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            /* MANUAL FORM */
            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              {manualErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                  {manualErrors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-zinc-300 font-semibold mb-2">Event Category</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'wedding', label: 'Wedding' },
                    { id: 'birthday', label: 'Birthday' },
                    { id: 'community', label: 'Community' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEventType(t.id as EventType)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                        eventType === t.id
                          ? 'bg-[#E07A5F]/20 text-[#E07A5F] border-[#E07A5F]'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder={eventType === 'wedding' ? 'e.g. Diya & Kabir' : eventType === 'birthday' ? "e.g. Maya's Sweet 16" : 'e.g. Global Tech Summit'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Target Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. The Leela Palace, Bengaluru"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Total Budget (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Expected Guests</label>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Inspirational Quote or Motto</label>
                <input
                  type="text"
                  placeholder="e.g. Two souls, one timeless celebration"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#d66e53] text-white font-semibold shadow-lg shadow-[#E07A5F]/20 transition-colors"
                >
                  Create Event Plan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
