import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Calendar,
  MapPin,
  Wallet,
  Users,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { EventItem, Expense, Guest, Vendor, Task, TimelineMilestone } from '../types.ts';
import { formatCurrencyINR, formatLakhsShort } from '../utils/eventCalculations.ts';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  expenses: Expense[];
  guests: Guest[];
  vendors: Vendor[];
  tasks: Task[];
  milestones: TimelineMilestone[];
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  event,
  expenses,
  guests,
  vendors,
  tasks,
  milestones,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Budget calculations
  const totalBudget = event.budget;
  const totalSpent = expenses.reduce((sum, e) => sum + e.actualSpent, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const spentPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Categories & 80% warning
  const categoriesConfig = [
    { name: 'Venue & Catering', defaultPct: 36 },
    { name: 'Decor & Setup', defaultPct: 16 },
    { name: 'Photography & Video', defaultPct: 12 },
    { name: 'Attire & Makeup', defaultPct: 10 },
    { name: 'Entertainment', defaultPct: 6 },
    { name: 'Invitations & Stationery', defaultPct: 4 },
    { name: 'Miscellaneous', defaultPct: 8 },
  ];

  const categoryBreakdown = categoriesConfig.map((cat) => {
    const items = expenses.filter((e) => e.category === cat.name);
    const spent = items.reduce((sum, e) => sum + (e.actualSpent || 0), 0);
    const allocated = items.reduce((sum, e) => sum + (e.budgetedAmount || 0), 0) || Math.round((cat.defaultPct / 100) * totalBudget);
    const pctOfAllocated = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
    const isExceeded = pctOfAllocated >= 80;
    return {
      category: cat.name,
      allocated,
      spent,
      pctOfAllocated,
      isExceeded,
    };
  });

  const categoriesExceeding80 = categoryBreakdown.filter((c) => c.isExceeded);

  // RSVP stats
  const acceptedGuests = guests.filter((g) => g.rsvpStatus === 'attending');
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined');
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending');
  const totalAcceptedHeads = acceptedGuests.reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);

  // Tasks & Vendors stats
  const completedTasks = tasks.filter((t) => t.completed).length +
    milestones.reduce((acc, m) => acc + m.items.filter((i) => i.completed).length, 0);
  const totalTasksCount = tasks.length + milestones.reduce((acc, m) => acc + m.items.length, 0);
  const confirmedVendors = vendors.filter((v) => v.status === 'confirmed');

  // Markdown Summary text
  const generateMarkdownSummary = () => {
    return `# EVENT SUMMARY: ${event.title.toUpperCase()}
Type: ${event.type.toUpperCase()}
Date: ${event.displayDate}
Venue: ${event.venue}, ${event.city}
Theme / Tagline: "${event.tagline}"
Quote: "${event.quote || 'Two hearts, one beautiful journey'}"
Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}

--------------------------------------------------------------------------------
1. FINANCIAL & BUDGET SUMMARY
--------------------------------------------------------------------------------
Total Allocated Budget: ${formatCurrencyINR(totalBudget)}
Committed & Spent:      ${formatCurrencyINR(totalSpent)} (${spentPercent}%)
Remaining Buffer:       ${formatCurrencyINR(remainingBudget)}

Category Breakdown:
${categoryBreakdown
  .map(
    (c) =>
      `- ${c.category}: Spent ${formatCurrencyINR(c.spent)} of ${formatCurrencyINR(c.allocated)} (${c.pctOfAllocated}% used)${
        c.isExceeded ? ' [WARNING: EXCEEDS 80% ALLOCATION]' : ''
      }`
  )
  .join('\n')}

${
  categoriesExceeding80.length > 0
    ? `⚠️ CATEGORIES EXCEEDING 80% CAP:\n` +
      categoriesExceeding80
        .map((c) => `  * ${c.category} - ${c.pctOfAllocated}% of allocated budget utilized!`)
        .join('\n')
    : 'All categories remain within comfortable budget thresholds.'
}

--------------------------------------------------------------------------------
2. GUEST RSVP EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
Total Expected: ${event.expectedGuests}
- Attending / Accepted: ${acceptedGuests.length} party invitations (${totalAcceptedHeads} total attending with +1s)
- Declined:             ${declinedGuests.length}
- Pending Response:     ${pendingGuests.length}

Attending Guests:
${acceptedGuests.map((g) => `  * ${g.name} (+${g.plusOnes} guest) - Dietary: ${g.dietary} - Table: ${g.tableNumber || 'Unassigned'}`).join('\n')}

--------------------------------------------------------------------------------
3. VENDOR ROSTER
--------------------------------------------------------------------------------
Confirmed Vendors (${confirmedVendors.length} of ${vendors.length}):
${confirmedVendors
  .map((v) => `  * ${v.name} (${v.category}) - ${formatCurrencyINR(v.cost)} - Contact: ${v.contact || 'N/A'}`)
  .join('\n')}

--------------------------------------------------------------------------------
4. CHECKLIST & TIMELINE STATUS
--------------------------------------------------------------------------------
Tasks Completed: ${completedTasks} / ${totalTasksCount} (${totalTasksCount > 0 ? Math.round((completedTasks / totalTasksCount) * 100) : 0}%)
`;
  };

  const handleCopy = () => {
    const text = generateMarkdownSummary();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadMarkdown = () => {
    const text = generateMarkdownSummary();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-summary.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    let csv = `Event,Date,Venue,Total Budget,Total Spent,Remaining\n`;
    csv += `"${event.title}","${event.displayDate}","${event.venue}",${totalBudget},${totalSpent},${remainingBudget}\n\n`;

    csv += `Category,Allocated,Spent,Percentage Used,Over 80% Warning\n`;
    categoryBreakdown.forEach((c) => {
      csv += `"${c.category}",${c.allocated},${c.spent},${c.pctOfAllocated}%,${c.isExceeded ? 'YES' : 'NO'}\n`;
    });

    csv += `\nRSVP Status,Count\n`;
    csv += `Attending,${acceptedGuests.length}\n`;
    csv += `Declined,${declinedGuests.length}\n`;
    csv += `Pending,${pendingGuests.length}\n`;

    csv += `\nGuest Name,RSVP Status,Plus Ones,Dietary,Table\n`;
    guests.forEach((g) => {
      csv += `"${g.name}","${g.rsvpStatus}",${g.plusOnes},"${g.dietary}","${g.tableNumber || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-budget-rsvps.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-summary-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#14161f] border border-zinc-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E07A5F]/15 border border-[#E07A5F]/35 text-[#E07A5F] flex items-center justify-center font-bold text-sm shrink-0">
              {event.title.charAt(0)}
            </div>
            <div>
              <h3 id="export-summary-title" className="text-xl font-bold font-serif-display text-white tracking-tight">
                Export Event Summary
              </h3>
              <p className="text-xs text-zinc-400">
                {event.title} • {event.displayDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close export summary dialog"
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content / Preview */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 text-[11px] block">Total Budget</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {formatCurrencyINR(totalBudget)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 text-[11px] block">Committed</span>
              <span className="text-sm font-bold text-rose-400 mt-0.5 block">
                {formatCurrencyINR(totalSpent)} ({spentPercent}%)
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 text-[11px] block">Attending RSVPs</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                {acceptedGuests.length} ({totalAcceptedHeads} heads)
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-500 text-[11px] block">Tasks Completed</span>
              <span className="text-sm font-bold text-[#E07A5F] mt-0.5 block">
                {completedTasks}/{totalTasksCount}
              </span>
            </div>
          </div>

          {/* Budget Warnings if any */}
          {categoriesExceeding80.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-300">
                  {categoriesExceeding80.length} Budget Categories Exceeding 80% Allocation
                </p>
                <p className="text-red-200/90 text-[11px] mt-0.5">
                  {categoriesExceeding80.map((c) => `${c.category} (${c.pctOfAllocated}%)`).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Preview Box */}
          <div className="bg-[#0f1118] border border-zinc-800 rounded-2xl p-4 font-mono text-[11px] text-zinc-300 space-y-2 overflow-x-auto max-h-56">
            <pre className="whitespace-pre-wrap leading-relaxed">{generateMarkdownSummary()}</pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#d66e53] text-white shadow-md shadow-[#E07A5F]/20 transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Markdown</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
