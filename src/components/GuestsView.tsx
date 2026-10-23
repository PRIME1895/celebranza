import React, { useState } from 'react';
import { Plus, Search, UserCheck, UserX, Clock, Users, Filter, Mail, Phone } from 'lucide-react';
import { Guest, RSVPStatus, DietaryOption } from '../types.ts';

interface GuestsViewProps {
  guests: Guest[];
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
  onUpdateRSVP: (guestId: string, status: RSVPStatus) => void;
}

export const GuestsView: React.FC<GuestsViewProps> = ({
  guests,
  onAddGuest,
  onUpdateRSVP,
}) => {
  const [search, setSearch] = useState('');
  const [filterRsvp, setFilterRsvp] = useState<'all' | RSVPStatus>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('pending');
  const [plusOnes, setPlusOnes] = useState(0);
  const [dietary, setDietary] = useState<DietaryOption>('none');
  const [tableNumber, setTableNumber] = useState('');

  // Calculations
  const attendingCount = 168 + guests.filter((g) => g.rsvpStatus === 'attending').length;
  const declinedCount = 18 + guests.filter((g) => g.rsvpStatus === 'declined').length;
  const pendingCount = 34 + guests.filter((g) => g.rsvpStatus === 'pending').length;
  const totalCount = attendingCount + declinedCount + pendingCount;

  const filteredGuests = guests.filter((g) => {
    const matchesFilter = filterRsvp === 'all' || g.rsvpStatus === filterRsvp;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      g.name.toLowerCase().includes(query) ||
      (g.email && g.email.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddGuest({
      eventId: 'ev-1',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      rsvpStatus,
      plusOnes,
      dietary,
      tableNumber: tableNumber.trim() || 'Unassigned',
    });
    setName('');
    setEmail('');
    setPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Guest Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time RSVP tracking, dietary restrictions, and seating coordination
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#d66e53] text-white shadow-md shadow-[#E07A5F]/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Guest</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <Users className="w-4 h-4 text-zinc-400" />
            <span>Total Expected</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">220</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Invited guests</p>
        </div>

        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Attending</span>
          </div>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{attendingCount}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Confirmed headcount</p>
        </div>

        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Awaiting reply</p>
        </div>

        <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <UserX className="w-4 h-4 text-rose-400" />
            <span>Declined</span>
          </div>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">{declinedCount}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Regrets received</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Guests' },
            { id: 'attending', label: 'Attending' },
            { id: 'pending', label: 'Pending' },
            { id: 'declined', label: 'Declined' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRsvp(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterRsvp === tab.id
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by guest name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F] w-full sm:w-72"
          />
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-[#161822] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold border-b border-zinc-800/80">
              <tr>
                <th className="p-4">Guest Name</th>
                <th className="p-4">RSVP Status</th>
                <th className="p-4">Plus-Ones</th>
                <th className="p-4">Dietary Preference</th>
                <th className="p-4">Seating Table</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-white text-sm">{guest.name}</p>
                    {guest.email && <p className="text-[11px] text-zinc-400">{guest.email}</p>}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${
                        guest.rsvpStatus === 'attending'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : guest.rsvpStatus === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {guest.rsvpStatus}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300 font-medium">
                    +{guest.plusOnes} guest{guest.plusOnes > 0 ? 's' : ''}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 uppercase font-medium">
                      {guest.dietary === 'none' ? 'Standard' : guest.dietary.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300 font-medium">
                    {guest.tableNumber || 'Unassigned'}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() =>
                        onUpdateRSVP(
                          guest.id,
                          guest.rsvpStatus === 'attending'
                            ? 'declined'
                            : guest.rsvpStatus === 'declined'
                            ? 'pending'
                            : 'attending'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-[11px] text-zinc-300"
                      title="Cycle RSVP status"
                    >
                      Cycle RSVP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181a24] border border-zinc-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New Guest</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Guest / Family Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anand & Kavita Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 99880 11223"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">RSVP Status</label>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  >
                    <option value="attending">Attending</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Plus Ones</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Dietary</label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value as DietaryOption)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  >
                    <option value="none">Standard</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain</option>
                    <option value="gluten_free">Gluten Free</option>
                    <option value="halal">Halal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Table Number</label>
                <input
                  type="text"
                  placeholder="e.g. Table 5 (High School Friends)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                />
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
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
