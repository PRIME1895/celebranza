import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  MapPin,
  MoreVertical,
  Plus,
  ExternalLink,
  Map,
  Globe,
  Loader2,
  CheckCircle,
  Phone,
} from 'lucide-react';
import { Vendor, VendorStatus } from '../types.ts';
import { formatCurrencyINR, filterVendors } from '../utils/eventCalculations.ts';

interface VendorsViewProps {
  vendors: Vendor[];
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onUpdateVendorStatus: (id: string, status: VendorStatus) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  onAddVendor,
  onUpdateVendorStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'discussion' | 'shortlisted'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Maps & Search Grounding state
  const [isSearchingMaps, setIsSearchingMaps] = useState(false);
  const [mapsResults, setMapsResults] = useState<{ summary: string; places: { title: string; uri: string }[] } | null>(null);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webResults, setWebResults] = useState<{ summary: string; sources: { title: string; url: string }[] } | null>(null);
  const [groundingTab, setGroundingTab] = useState<'none' | 'maps' | 'web'>('none');

  // New vendor form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Catering');
  const [formCost, setFormCost] = useState('');
  const [formLocation, setFormLocation] = useState('Bengaluru');
  const [formRating, setFormRating] = useState('4.8');
  const [formStatus, setFormStatus] = useState<VendorStatus>('discussion');
  const [formPhone, setFormPhone] = useState('+91 98450 00000');

  const filtered = filterVendors(vendors, statusFilter, searchQuery);

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    onAddVendor({
      eventId: 'ev-1',
      name: formName.trim(),
      category: formCategory,
      rating: parseFloat(formRating) || 4.8,
      reviewCount: 42,
      location: formLocation.trim() || 'Bengaluru',
      cost: parseFloat(formCost) || 100000,
      status: formStatus,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
      contact: formPhone.trim(),
    });
    setFormName('');
    setFormCost('');
    setShowAddModal(false);
  };

  const fetchMapsGrounding = async () => {
    setIsSearchingMaps(true);
    setGroundingTab('maps');
    try {
      const res = await fetch('/api/planning/maps-vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'Bengaluru, India',
          category: 'luxury wedding banquet halls and premium event caterers',
        }),
      });
      const data = await res.json();
      setMapsResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingMaps(false);
    }
  };

  const fetchWebSearchGrounding = async () => {
    setIsSearchingWeb(true);
    setGroundingTab('web');
    try {
      const res = await fetch('/api/planning/search-vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: 'Bengaluru',
          category: 'wedding photographers and floral mandap decor',
        }),
      });
      const data = await res.json();
      setWebResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingWeb(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Grounding Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Vendors</h2>
          <p className="text-xs text-zinc-400 mt-1">Contract management, ratings, and Google Grounded discovery</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Maps Grounding Button */}
          <button
            onClick={fetchMapsGrounding}
            disabled={isSearchingMaps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Discover real venues & vendors on Google Maps"
          >
            {isSearchingMaps ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Map className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Google Maps Grounding</span>
          </button>

          {/* Web Search Grounding Button */}
          <button
            onClick={fetchWebSearchGrounding}
            disabled={isSearchingWeb}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="Search latest live rates and trends"
          >
            {isSearchingWeb ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Search className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>Search Market Trends</span>
          </button>

          {/* Add Vendor Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#d66e53] text-white shadow-md shadow-[#E07A5F]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Google Maps Grounding Results Drawer */}
      {groundingTab === 'maps' && mapsResults && (
        <div className="p-5 rounded-2xl bg-[#141d1a] border border-emerald-900/40 text-xs space-y-3">
          <div className="flex items-center justify-between text-emerald-400 font-semibold text-xs">
            <span className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Verified Local Venues via Google Maps Grounding
            </span>
            <button onClick={() => setGroundingTab('none')} className="text-zinc-400 hover:text-white">✕</button>
          </div>
          <p className="text-zinc-300 leading-relaxed">{mapsResults.summary}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {mapsResults.places.map((place, idx) => (
              <a
                key={idx}
                href={place.uri}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-zinc-900/90 border border-emerald-800/30 hover:border-emerald-500/50 flex items-center justify-between text-xs text-white hover:text-emerald-300 transition-colors"
              >
                <div className="truncate pr-2">
                  <p className="font-semibold truncate">{place.title}</p>
                  <p className="text-[10px] text-zinc-400">View on Google Maps</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Google Search Grounding Results Drawer */}
      {groundingTab === 'web' && webResults && (
        <div className="p-5 rounded-2xl bg-[#161a29] border border-blue-900/40 text-xs space-y-3">
          <div className="flex items-center justify-between text-blue-400 font-semibold text-xs">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Live Market Rates & Verified Search Grounding
            </span>
            <button onClick={() => setGroundingTab('none')} className="text-zinc-400 hover:text-white">✕</button>
          </div>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{webResults.summary}</p>
          {webResults.sources?.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase">Search Sources & Citations:</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {webResults.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 hover:text-blue-400 flex items-center gap-1.5"
                  >
                    <span className="truncate max-w-[200px]">{s.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Input, Filter Button, and Status Tabs matching blueprint */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs: All, Confirmed, In Discussion, Shortlisted */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'discussion', label: 'In Discussion' },
              { id: 'shortlisted', label: 'Shortlisted' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar + Filter button */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F] w-48 sm:w-60"
            />
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            title="Reset filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vendor Cards List matching blueprint */}
      <div className="space-y-3">
        {filtered.map((vendor) => {
          return (
            <div
              key={vendor.id}
              className="group bg-[#161822] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:border-zinc-700 transition-all"
            >
              {/* Left: Thumbnail Image + Details */}
              <div className="flex items-center gap-4">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-800"
                />
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#E07A5F] transition-colors">
                    {vendor.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{vendor.category}</p>

                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {vendor.rating}
                      <span className="text-zinc-500 font-normal">({vendor.reviewCount} reviews)</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      {vendor.location}
                    </span>
                    {vendor.contact && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          {vendor.contact}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Cost, Status Pill Badge, and Action Menu */}
              <div className="flex items-center justify-between sm:justify-end gap-5">
                <span className="text-base font-bold text-white">
                  {formatCurrencyINR(vendor.cost)}
                </span>

                {/* Status Pill matching blueprint colors */}
                <div className="relative">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                      vendor.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : vendor.status === 'discussion'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {vendor.status === 'discussion'
                      ? 'In Discussion'
                      : vendor.status === 'confirmed'
                      ? 'Confirmed'
                      : 'Shortlisted'}
                  </span>
                </div>

                {/* 3-dots Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === vendor.id ? null : vendor.id)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === vendor.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1e212d] border border-zinc-700 rounded-xl shadow-xl py-1 z-30 text-xs">
                      <div className="px-3 py-1 text-[10px] uppercase font-semibold text-zinc-500">
                        Change Status
                      </div>
                      <button
                        onClick={() => {
                          onUpdateVendorStatus(vendor.id, 'confirmed');
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 text-emerald-400"
                      >
                        Set to Confirmed
                      </button>
                      <button
                        onClick={() => {
                          onUpdateVendorStatus(vendor.id, 'discussion');
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 text-amber-400"
                      >
                        Set to In Discussion
                      </button>
                      <button
                        onClick={() => {
                          onUpdateVendorStatus(vendor.id, 'shortlisted');
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 text-purple-300"
                      >
                        Set to Shortlisted
                      </button>
                      {vendor.mapsUrl && (
                        <a
                          href={vendor.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 text-zinc-300 flex items-center justify-between border-t border-zinc-700/60 mt-1"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181a24] border border-zinc-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New Vendor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Vendor / Studio Name</label>
                <input
                  type="text"
                  placeholder="e.g. Divine Flutes & Sitar Ensemble"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  >
                    <option value="Catering">Catering</option>
                    <option value="Decor">Decor</option>
                    <option value="Photography">Photography</option>
                    <option value="Makeup & Hair">Makeup & Hair</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Venue">Venue</option>
                    <option value="Invitations & Stationery">Invitations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as VendorStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#E07A5F]"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="discussion">In Discussion</option>
                    <option value="shortlisted">Shortlisted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">City / Neighborhood</label>
                  <input
                    type="text"
                    placeholder="Bengaluru"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98450 12345"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
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
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
