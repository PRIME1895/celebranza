import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Loader2,
  Calendar,
  MapPin,
  Users,
  Wallet,
  Download,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Globe,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { EventItem, EventType, Expense, TimelineMilestone, Vendor } from '../types.ts';
import { formatCurrencyINR } from '../utils/eventCalculations.ts';
import {
  OnePromptPlannerData,
  CategoryAllocationItem,
  ItemizedExpenseItem,
  TimelineMilestoneItem,
  RecommendedVendorItem,
} from '../server/types/planning.ts';

interface AiOnePromptPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEvent: (
    event: EventItem,
    expenses?: Expense[],
    milestones?: TimelineMilestone[],
    vendors?: Vendor[]
  ) => void;
  onSwitchToManual?: () => void;
  initialPrompt?: string;
  theme?: 'dark' | 'light';
}

export const AiOnePromptPlannerModal: React.FC<AiOnePromptPlannerModalProps> = ({
  isOpen,
  onClose,
  onApplyEvent,
  onSwitchToManual,
  initialPrompt = '',
  theme = 'dark',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<OnePromptPlannerData | null>(null);
  const [aiSource, setAiSource] = useState<'gemini' | 'fallback' | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickInspirations = [
    '🏰 3-day royal Rajasthani wedding in Udaipur for 200 guests with lakeside sangeet',
    '🎂 Modern rooftop 30th birthday cocktail bash in Indiranagar Bengaluru for 45 friends',
    '🌴 Sunset beach ceremony in North Goa with 100 guests and seafood live counters',
    '⚡ 2-day AI Founders Hackathon & Gala at KTPO Bengaluru with 300 developers',
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || prompt.trim();
    if (!textToSubmit || isGenerating) return;

    setError(null);
    setIsGenerating(true);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 2600);

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

      setGeneratedData(resJson.data as OnePromptPlannerData);
      setAiSource(resJson.source || 'gemini');
      setAiModel(resJson.model || 'gemini-3.5-flash');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to connect to Gemini API. Please check network.';
      console.error(err);
      setError(errorMsg);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
      setLoadingStep(0);
    }
  };

  const handleApply = () => {
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

    // Map itemized expenses
    const mappedExpenses: Expense[] = (generatedData.itemizedExpenses || []).map(
      (exp: ItemizedExpenseItem, index: number) => ({
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

    // Map milestones
    const mappedMilestones: TimelineMilestone[] = (generatedData.milestones || []).map(
      (m: TimelineMilestoneItem, index: number) => ({
        id: `ms-ai-${newId}-${index}`,
        eventId: newId,
        phaseTitle: m.title || `Phase ${index + 1}`,
        dateBadge: m.targetDate || 'Upcoming',
        items: (m.tasks || []).map((t: string, ti: number) => ({
          id: `task-ai-${newId}-${index}-${ti}`,
          title: t,
          completed: index === 0 && ti === 0, // mark first initial task done
        })),
      })
    );

    // Map recommended vendors
    const mappedVendors: Vendor[] = (generatedData.recommendedVendors || []).map(
      (v: RecommendedVendorItem, index: number) => ({
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

    onApplyEvent(newEvent, mappedExpenses, mappedMilestones, mappedVendors);
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
      aria-labelledby="ai-planner-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
    >
      <div className="w-full max-w-2xl bg-[#161822] border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#C85A3D] flex items-center justify-center text-white shadow-lg shadow-[#E07A5F]/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="ai-planner-modal-title" className="text-lg font-bold text-white font-serif-display">
                AI One-Prompt Event &amp; Budget Architect
              </h2>
              <p className="text-xs text-zinc-400">
                Powered by Gemini API with Real-Time Market Grounding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI One-Prompt Architect modal"
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!generatedData ? (
            /* Prompt Input View */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Describe Your Event in Plain English
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Plan a 3-day royal Rajasthani wedding in Udaipur with 200 guests, lakeside sangeet, and luxury catering..."
                    className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] leading-relaxed transition-all"
                  />
                  {prompt && (
                    <button
                      onClick={() => setPrompt('')}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Inspiration Chips */}
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Try One-Click Inspiration Ideas:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickInspirations.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(chip.replace(/^[^\s]+\s*/, ''));
                      }}
                      className="text-left p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer leading-snug"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                  {error}
                </div>
              )}

              {/* Live Loading Progress */}
              {isGenerating && (
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-[#E07A5F]/30 space-y-2 animate-pulse">
                  <div className="flex items-center gap-2.5 text-xs text-[#E07A5F] font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {loadingStep === 1
                        ? 'Connecting to Gemini 2.5 Flash...'
                        : loadingStep === 2
                        ? 'Grounding market rates & real venues via Google Search...'
                        : 'Calculating itemized budget & synthesizing vector logo...'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#E07A5F] to-amber-400 h-full transition-all duration-700"
                      style={{
                        width:
                          loadingStep === 1 ? '30%' : loadingStep === 2 ? '70%' : '95%',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {onSwitchToManual ? (
                  <button
                    type="button"
                    onClick={onSwitchToManual}
                    className="text-xs text-zinc-400 hover:text-zinc-200 underline transition-colors"
                  >
                    Use standard manual form
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim() || isGenerating}
                  className="py-3 px-6 rounded-2xl bg-[#E07A5F] hover:bg-[#d56d52] disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-[#E07A5F]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Estimating Real-Time Data...</span>
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
            /* Generated Event Blueprint View */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Event Header Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start gap-4">
                {/* Luxury Monogram Badge */}
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

                  <h3 className="text-lg font-bold text-white font-serif-display truncate mt-1">
                    {generatedData.title}
                  </h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
                    <span>{generatedData.venue}</span>
                  </p>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-[#E07A5F]" />
                    Estimated Budget
                  </p>
                  <p className="text-base font-bold text-white font-serif-display mt-0.5">
                    {formatCurrencyINR(generatedData.budget || 0)}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Headcount
                  </p>
                  <p className="text-base font-bold text-white font-serif-display mt-0.5">
                    {generatedData.expectedGuests || 150} Guests
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Est. Per Guest
                  </p>
                  <p className="text-base font-bold text-white font-serif-display mt-0.5">
                    ₹{(generatedData.budgetPerGuest || Math.round((generatedData.budget || 1500000) / (generatedData.expectedGuests || 150))).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Grounded Market Notes */}
              {generatedData.marketBenchmarkNotes && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-indigo-300 flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-white">Real-Time Search Grounding:</strong>{' '}
                    {generatedData.marketBenchmarkNotes}
                  </p>
                </div>
              )}

              {/* Category Budget Breakdown */}
              {generatedData.categoryBreakdown && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Category Budget Breakdown</span>
                    <span className="text-zinc-500 text-[11px]">100% Allocated</span>
                  </h4>

                  <div className="space-y-2">
                    {generatedData.categoryBreakdown.map((item: CategoryAllocationItem, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-white">{item.category}</p>
                          {item.note && <p className="text-[11px] text-zinc-500">{item.note}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#E07A5F]">
                            {formatCurrencyINR(item.amount)}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-medium">
                            {item.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setGeneratedData(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Edit Prompt
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="py-3 px-6 rounded-2xl bg-[#E07A5F] hover:bg-[#d56d52] text-white font-semibold text-xs shadow-xl shadow-[#E07A5F]/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Event &amp; Launch Live Budget</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
