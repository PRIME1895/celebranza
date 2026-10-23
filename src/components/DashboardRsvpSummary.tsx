import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ArrowRight,
  Utensils,
  CheckCircle2,
} from 'lucide-react';
import { Guest } from '../types.ts';

interface DashboardRsvpSummaryProps {
  guests: Guest[];
  onManageGuests?: () => void;
  eventTitle?: string;
}

export const DashboardRsvpSummary: React.FC<DashboardRsvpSummaryProps> = ({
  guests,
  onManageGuests,
  eventTitle,
}) => {
  // Aggregate RSVP counts from guests state
  const acceptedCount = guests.filter((g) => g.rsvpStatus === 'attending').length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === 'pending').length;
  const totalCount = guests.length;

  // Additional counts: plus-ones and total attending heads
  const totalAttendingPlusOnes = guests
    .filter((g) => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + (g.plusOnes || 0), 0);
  const totalAttendingSeats = acceptedCount + totalAttendingPlusOnes;

  // Percentages
  const acceptedPct = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;
  const declinedPct = totalCount > 0 ? Math.round((declinedCount / totalCount) * 100) : 0;
  const pendingPct = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;
  const responseRatePct = totalCount > 0 ? Math.round(((acceptedCount + declinedCount) / totalCount) * 100) : 0;

  // Dietary counts for attending guests
  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'attending');
  const dietaryCounts = attendingGuests.reduce<Record<string, number>>((acc, g) => {
    if (g.dietary && g.dietary !== 'none') {
      acc[g.dietary] = (acc[g.dietary] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="bg-[#161822] border border-zinc-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xl font-bold font-serif-display text-white tracking-tight">
              Guest RSVP Summary
            </h3>
            {eventTitle && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium">
                {eventTitle}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time confirmation tracking across invitations and guest parties
          </p>
        </div>

        {onManageGuests && (
          <button
            onClick={onManageGuests}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#E07A5F] hover:text-white bg-[#E07A5F]/10 hover:bg-[#E07A5F]/20 border border-[#E07A5F]/30 transition-all cursor-pointer"
          >
            <span>Manage Guest List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3 RSVP Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Accepted / Attending */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <UserCheck className="w-4 h-4" />
              <span>Accepted</span>
              <span className="text-[11px] font-normal text-emerald-300/80">({acceptedPct}%)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight font-serif-display">
                {acceptedCount}
              </span>
              <span className="text-[11px] text-zinc-400">
                parties ({totalAttendingSeats} seats)
              </span>
            </div>
            <p className="text-[10px] text-emerald-400/90 font-medium">Confirmed attendance</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Declined */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
              <UserX className="w-4 h-4" />
              <span>Declined</span>
              <span className="text-[11px] font-normal text-rose-300/80">({declinedPct}%)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight font-serif-display">
                {declinedCount}
              </span>
              <span className="text-[11px] text-zinc-400">parties</span>
            </div>
            <p className="text-[10px] text-rose-400/90 font-medium">Regretfully declined</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              <span>Pending</span>
              <span className="text-[11px] font-normal text-amber-300/80">({pendingPct}%)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight font-serif-display">
                {pendingCount}
              </span>
              <span className="text-[11px] text-zinc-400">awaiting reply</span>
            </div>
            <p className="text-[10px] text-amber-400/90 font-medium">Follow-up reminder</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">
            Response Status: <span className="text-white font-semibold">{responseRatePct}% responded</span>
          </span>
          <span>{totalCount} total invitations sent</span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
          {acceptedPct > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${acceptedPct}%` }}
              title={`Accepted: ${acceptedCount} (${acceptedPct}%)`}
            />
          )}
          {declinedPct > 0 && (
            <div
              className="h-full bg-rose-500 transition-all duration-700"
              style={{ width: `${declinedPct}%` }}
              title={`Declined: ${declinedCount} (${declinedPct}%)`}
            />
          )}
          {pendingPct > 0 && (
            <div
              className="h-full bg-amber-500 transition-all duration-700"
              style={{ width: `${pendingPct}%` }}
              title={`Pending: ${pendingCount} (${pendingPct}%)`}
            />
          )}
        </div>
      </div>

      {/* Attending Dietary & Party Quick Highlights */}
      {Object.keys(dietaryCounts).length > 0 && (
        <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
            <Utensils className="w-3.5 h-3.5 text-[#E07A5F]" />
            Attending Dietaries:
          </span>
          {Object.entries(dietaryCounts).map(([diet, count]) => (
            <span
              key={diet}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 capitalize text-[11px]"
            >
              <strong className="text-white">{count}</strong> {diet.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
