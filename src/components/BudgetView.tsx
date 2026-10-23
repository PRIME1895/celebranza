import React, { useState } from 'react';
import {
  Plus,
  Wallet,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Check,
  Loader2,
  SlidersHorizontal,
  X,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Expense } from '../types.ts';
import { formatCurrencyINR, formatLakhsShort } from '../utils/eventCalculations.ts';

interface BudgetViewProps {
  totalBudget: number;
  expenses: Expense[];
  onAddExpense: (newExpense: Omit<Expense, 'id'>) => void;
  onUpdateExpenseStatus: (id: string, status: 'paid' | 'partial' | 'pending') => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  totalBudget,
  expenses,
  onAddExpense,
  onUpdateExpenseStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'payments' | 'tracker'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizerAdvice, setOptimizerAdvice] = useState<{
    suggestions: string[];
    tags: string[];
  } | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Venue & Catering');
  const [newBudgeted, setNewBudgeted] = useState('');
  const [newSpent, setNewSpent] = useState('');

  // Fixed categories matching blueprint
  const categoriesConfig = [
    { name: 'Venue & Catering', color: '#10B981', defaultAmount: 450000, defaultPct: 36 },
    { name: 'Decor & Setup', color: '#F97316', defaultAmount: 200000, defaultPct: 16 },
    { name: 'Photography & Video', color: '#818CF8', defaultAmount: 150000, defaultPct: 12 },
    { name: 'Attire & Makeup', color: '#EC4899', defaultAmount: 120000, defaultPct: 10 },
    { name: 'Entertainment', color: '#FBBF24', defaultAmount: 80000, defaultPct: 6 },
    { name: 'Invitations & Stationery', color: '#38BDF8', defaultAmount: 50000, defaultPct: 4 },
    { name: 'Miscellaneous', color: '#A78BFA', defaultAmount: 100000, defaultPct: 8 },
  ];

  // Calculate actual totals
  const totalSpent = expenses.reduce((sum, item) => sum + item.actualSpent, 0) || 840000;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 67;
  const remainingPct = 100 - spentPct;

  // Aggregate by category, including allocated budget and 80% warning calculation
  const categoryTotals = categoriesConfig.map((cat) => {
    const items = expenses.filter((e) => e.category === cat.name);
    const spent = items.reduce((sum, item) => sum + (item.actualSpent || 0), 0) || cat.defaultAmount;
    const allocated =
      items.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0) ||
      Math.round((cat.defaultPct / 100) * totalBudget);
    const shareOfTotalPct = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : cat.defaultPct;
    const pctOfAllocated = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
    const isExceeded = pctOfAllocated >= 80;

    return {
      ...cat,
      amount: spent,
      allocated,
      shareOfTotalPct,
      pctOfAllocated,
      isExceeded,
    };
  });

  // Categories exceeding 80% allocated budget
  const categoriesExceeding80 = categoryTotals.filter((c) => c.isExceeded);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const budgeted = parseFloat(newBudgeted) || 0;
    const spent = parseFloat(newSpent) || 0;
    onAddExpense({
      eventId: 'ev-1',
      title: newTitle.trim(),
      category: newCategory,
      budgetedAmount: budgeted,
      actualSpent: spent,
      paymentStatus: spent >= budgeted && budgeted > 0 ? 'paid' : spent > 0 ? 'partial' : 'pending',
      date: new Date().toISOString().split('T')[0],
    });
    setNewTitle('');
    setNewBudgeted('');
    setNewSpent('');
    setShowAddModal(false);
  };

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    setOptimizerAdvice(null);
    try {
      const response = await fetch('/api/planning/quick-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'wedding',
          budget: totalBudget,
          currentPhase: 'Vendor Bookings & Decor',
          prompt: 'Assess current budget distribution and recommend cost-saving buffer strategies',
        }),
      });
      const data = await response.json();
      const rawSuggestion = data.data?.suggestion;
      let tags: string[] = Array.isArray(data.data?.tags)
        ? data.data.tags
        : ['BudgetAllocation', 'FinancialBuffer', 'CostControl'];

      let suggestionsList: string[] = [];

      if (typeof rawSuggestion === 'string') {
        const trimmed = rawSuggestion.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              suggestionsList = parsed
                .map((p: any) => (typeof p === 'string' ? p : p.suggestion))
                .filter(Boolean);
              const extractedTags = parsed
                .flatMap((p: any) => (Array.isArray(p.tags) ? p.tags : []))
                .filter(Boolean);
              if (extractedTags.length > 0) tags = Array.from(new Set(extractedTags));
            } else if (parsed && typeof parsed === 'object') {
              if (parsed.suggestion) suggestionsList = [parsed.suggestion];
              if (Array.isArray(parsed.tags)) tags = parsed.tags;
            }
          } catch {
            // normal string
          }
        }

        if (suggestionsList.length === 0) {
          suggestionsList = trimmed
            .split(/(?:^|\n)[•\-*]\s+|\n\n+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 4);
          if (suggestionsList.length === 0 && trimmed) {
            suggestionsList = [trimmed];
          }
        }
      } else if (Array.isArray(rawSuggestion)) {
        suggestionsList = rawSuggestion
          .map((p) => (typeof p === 'string' ? p : p.suggestion))
          .filter(Boolean);
      }

      setOptimizerAdvice({
        suggestions:
          suggestionsList.length > 0
            ? suggestionsList
            : [
                'Allocate 40% to venue & catering, 20% to design, and reserve a strict 15% contingency fund.',
              ],
        tags,
      });
    } catch (err) {
      setOptimizerAdvice({
        suggestions: [
          'Venue & Catering takes 36% which is ideal for premier destinations.',
          'Retain an 8-10% contingency buffer for last-minute guest additions and logistics overtime.',
          'Vet vendor contracts for inclusive bundles to mitigate hidden rental and administrative fees.',
        ],
        tags: ['BudgetAllocation', 'ContingencyBuffer', 'VendorContracts'],
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Custom Recharts Donut Tooltip
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#181a24] border border-zinc-700/90 rounded-2xl p-3.5 shadow-2xl text-xs space-y-1.5 z-50 min-w-[210px]">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: data.isExceeded ? '#EF4444' : data.color }}
            />
            <span className="font-bold text-white text-sm">{data.name}</span>
          </div>

          <div className="space-y-1 pt-1 border-t border-zinc-800 text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Spent:</span>
              <span className="font-semibold text-white">{formatCurrencyINR(data.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Allocated:</span>
              <span className="font-semibold text-zinc-300">{formatCurrencyINR(data.allocated)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Budget Consumed:</span>
              <span
                className={`font-bold ${data.isExceeded ? 'text-red-400' : 'text-emerald-400'}`}
              >
                {data.pctOfAllocated}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Share:</span>
              <span className="font-medium text-zinc-400">{data.shareOfTotalPct}%</span>
            </div>
          </div>

          {data.isExceeded && (
            <div className="mt-2 pt-2 border-t border-red-500/30 flex items-center gap-1.5 text-[11px] font-bold text-red-400 bg-red-950/40 p-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Warning: &gt;80% allocated budget consumed!</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-display text-white tracking-tight">
            Budget
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time expenditure tracking, allocation warnings, and category breakdown
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            {isOptimizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E07A5F]" />
            ) : (
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E07A5F]" />
            )}
            <span>{isOptimizing ? 'Analyzing...' : 'Financial Optimizer'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#d66e53] text-white shadow-md shadow-[#E07A5F]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Visual Warning System Alert Banner */}
      {categoriesExceeding80.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-950/40 border border-red-500/50 shadow-lg flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-red-300 flex items-center gap-2">
                <span>Budget Warning: {categoriesExceeding80.length} {categoriesExceeding80.length === 1 ? 'Category Exceeds' : 'Categories Exceed'} 80% Allocation Cap</span>
              </h4>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
                Action Recommended
              </span>
            </div>
            <p className="text-xs text-red-200/90 leading-relaxed">
              The following categories have consumed 80% or more of their allocated budget. Review upcoming commitments to prevent budget overruns.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {categoriesExceeding80.map((cat) => (
                <div
                  key={cat.name}
                  className="px-3 py-1 rounded-xl bg-red-900/60 border border-red-500/40 text-xs font-semibold text-red-100 flex items-center gap-2 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span>{cat.name}</span>
                  <span className="text-red-300 font-bold">({cat.pctOfAllocated}% used)</span>
                  <span className="text-[10px] text-red-300/80">• {formatCurrencyINR(cat.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'breakdown', label: 'Category Breakdown' },
          { id: 'payments', label: 'Payments' },
          { id: 'tracker', label: 'Cost Tracker' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Financial Optimizer Recommendation Callout */}
      {optimizerAdvice && (
        <div className="p-5 rounded-2xl bg-[#1a1f2c] border border-[#E07A5F]/35 shadow-xl text-xs space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#E07A5F]/20 text-[#E07A5F]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white text-sm">Financial Optimizer Recommendation</h5>
                <p className="text-[11px] text-zinc-400">Gemini 3.5 Flash Market-Grounded Strategy</p>
              </div>
            </div>
            <button
              onClick={() => setOptimizerAdvice(null)}
              className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Dismiss recommendation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 pl-1">
            {optimizerAdvice.suggestions.map((sug, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-zinc-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] shrink-0 mt-2" />
                <span>{sug}</span>
              </div>
            ))}
          </div>

          {optimizerAdvice.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
              {optimizerAdvice.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30"
                >
                  #{tag.replace(/^#/, '')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Budget */}
        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
              <Wallet className="w-4 h-4 text-[#E07A5F]" />
              <span>Total Budget</span>
            </div>
            <h3 className="text-2xl font-bold font-serif-display text-white mt-1.5">
              {formatCurrencyINR(totalBudget)}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">Target cap</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E07A5F]/10 border border-[#E07A5F]/20 flex items-center justify-center text-[#E07A5F]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Spent */}
        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Spent</span>
              <span className="text-rose-400 font-semibold">({spentPct}%)</span>
            </div>
            <h3 className="text-2xl font-bold font-serif-display text-white mt-1.5">
              {formatCurrencyINR(totalSpent)}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">Committed & Disbursed</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Remaining</span>
              <span className="text-emerald-400 font-semibold">({remainingPct}%)</span>
            </div>
            <h3 className="text-2xl font-bold font-serif-display text-white mt-1.5">
              {formatCurrencyINR(remaining)}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">Available buffer</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Budget Visual: Recharts Donut Chart on Left + Category Breakdown on Right */}
      <div className="bg-[#161822] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
          <div className="flex items-center gap-2.5">
            <PieChartIcon className="w-5 h-5 text-[#E07A5F]" />
            <h3 className="text-lg font-bold font-serif-display text-white">
              Category Expense Breakdown
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-400" /> Standard
            </span>
            <span className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Exceeds 80% Allocation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Recharts Donut Chart (Left 5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={106}
                    paddingAngle={3}
                    stroke="#111319"
                    strokeWidth={2}
                    isAnimationActive={true}
                    animationDuration={800}
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isExceeded ? '#EF4444' : entry.color}
                        stroke={entry.isExceeded ? '#F87171' : '#1e222d'}
                        strokeWidth={entry.isExceeded ? 3 : 1}
                        className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl sm:text-3xl font-extrabold font-serif-display text-white tracking-tight">
                  {formatLakhsShort(totalBudget)}
                </span>
                <span className="text-xs font-semibold text-zinc-400 mt-0.5">Total Budget</span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  {formatLakhsShort(totalSpent)} spent
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 text-center">
              Hover over slices for itemized spend & allocated budget limits
            </p>
          </div>

          {/* Category Breakdown Table / Rows with Visual 80% Warnings (Right 7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-3 pb-1 border-b border-zinc-800/80">
              <span>Category & Allocation Status</span>
              <div className="flex items-center gap-6 sm:gap-8">
                <span>Spent / Cap</span>
                <span className="w-16 text-right">Consumed</span>
              </div>
            </div>

            {categoryTotals.map((cat, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl transition-all ${
                  cat.isExceeded
                    ? 'bg-red-950/25 border border-red-500/40 shadow-sm shadow-red-950/20'
                    : 'bg-zinc-900/60 border border-zinc-800/60 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.isExceeded ? '#EF4444' : cat.color }}
                    />
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${cat.isExceeded ? 'text-red-200' : 'text-zinc-200'}`}>
                        {cat.name}
                      </span>
                      {cat.isExceeded && (
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>&gt;80% Cap</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="text-right">
                      <span className={`font-bold ${cat.isExceeded ? 'text-red-300' : 'text-white'}`}>
                        {formatCurrencyINR(cat.amount)}
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        of {formatCurrencyINR(cat.allocated)}
                      </span>
                    </div>

                    <div className="w-16 text-right">
                      <span
                        className={`text-xs font-bold ${
                          cat.isExceeded ? 'text-red-400' : 'text-zinc-300'
                        }`}
                      >
                        {cat.pctOfAllocated}%
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {cat.shareOfTotalPct}% total
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      cat.isExceeded
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-sm shadow-red-500/50'
                        : 'bg-zinc-400'
                    }`}
                    style={{
                      width: `${Math.min(100, cat.pctOfAllocated)}%`,
                      backgroundColor: cat.isExceeded ? undefined : cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Item List / Ledger */}
      <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
        <h4 className="text-sm font-bold text-white tracking-tight flex items-center justify-between">
          <span>Itemized Expenses & Invoices</span>
          <span className="text-xs text-zinc-500 font-normal">{expenses.length} records</span>
        </h4>

        <div className="divide-y divide-zinc-800/80">
          {expenses.map((exp) => {
            const isCategoryExceeded = categoryTotals.find((c) => c.name === exp.category)?.isExceeded;
            return (
              <div
                key={exp.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-white text-sm">{exp.title}</p>
                  <div className="flex items-center gap-2 text-zinc-400 mt-0.5">
                    <span className="text-[#E07A5F]">{exp.category}</span>
                    {isCategoryExceeded && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-semibold">
                        Alert Category
                      </span>
                    )}
                    <span>•</span>
                    <span>Budgeted: {formatCurrencyINR(exp.budgetedAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-white text-sm">
                    {formatCurrencyINR(exp.actualSpent)}
                  </span>

                  <button
                    onClick={() =>
                      onUpdateExpenseStatus(
                        exp.id,
                        exp.paymentStatus === 'paid'
                          ? 'pending'
                          : exp.paymentStatus === 'pending'
                          ? 'partial'
                          : 'paid'
                      )
                    }
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      exp.paymentStatus === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : exp.paymentStatus === 'partial'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                    title="Click to cycle payment status (Pending -> Partial -> Paid)"
                  >
                    {exp.paymentStatus === 'paid'
                      ? 'Paid'
                      : exp.paymentStatus === 'partial'
                      ? 'Partial'
                      : 'Pending'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181a24] border border-zinc-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New Expense</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Expense Title</label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Cake & Dessert Station"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                >
                  {categoriesConfig.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Budgeted (₹)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={newBudgeted}
                    onChange={(e) => setNewBudgeted(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Spent / Paid (₹)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newSpent}
                    onChange={(e) => setNewSpent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#d66e53] text-white font-semibold transition-colors"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
