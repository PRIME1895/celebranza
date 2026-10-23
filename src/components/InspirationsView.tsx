import React, { useState } from 'react';
import { Heart, Palette, Plus, Loader2 } from 'lucide-react';
import { InspirationItem } from '../types.ts';

interface InspirationsViewProps {
  inspirations: InspirationItem[];
  onToggleFavorite: (id: string) => void;
  onAddInspiration: (item: Omit<InspirationItem, 'id'>) => void;
}

export const InspirationsView: React.FC<InspirationsViewProps> = ({
  inspirations,
  onToggleFavorite,
  onAddInspiration,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wedding' | 'birthday' | 'community' | 'decor' | 'themes'>('all');
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [generatedMoodboard, setGeneratedMoodboard] = useState<{
    palette: string[];
    concept: string;
    decorCues: string[];
  } | null>(null);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'community', label: 'Community' },
    { id: 'decor', label: 'Decor' },
    { id: 'themes', label: 'Themes' },
  ];

  const filteredItems = inspirations.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleGenerateAiTheme = async () => {
    setIsGeneratingIdea(true);
    setGeneratedMoodboard(null);
    try {
      const res = await fetch('/api/planning/quick-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'wedding',
          currentPhase: 'Creative Vision & Styling',
          prompt: 'Generate an exclusive royal terracotta & blush floral theme concept with 4 hex palette colors and decor cues',
        }),
      });
      const data = await res.json();
      setGeneratedMoodboard({
        concept: data.data?.suggestion || 'A timeless sunset palette featuring dusky terracotta, champagne silk, and fragrant tuberose florals.',
        palette: ['#E07A5F', '#F4A261', '#E76F51', '#264653'],
        decorCues: ['Handcrafted Clay Lanterns', 'Cascading Peach Florals', 'Warm Amber Pillar Candles'],
      });
    } catch {
      setGeneratedMoodboard({
        concept: 'Royal Terracotta & Sunset Amber: Handcrafted terracotta urns, marigold garlands, and ambient warm string canopies.',
        palette: ['#E07A5F', '#F4A261', '#E9C46A', '#2A9D8F'],
        decorCues: ['Marigold Floral Arch', 'Boho Woven Cane Chairs', 'Fairy Light Canopy'],
      });
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ideas & Inspiration
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Curated visual moodboards, floral concepts, and architectural styling
          </p>
        </div>

        <button
          onClick={handleGenerateAiTheme}
          disabled={isGeneratingIdea}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#d66e53] text-white shadow-md shadow-[#E07A5F]/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          {isGeneratingIdea ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Palette className="w-3.5 h-3.5" />
          )}
          <span>{isGeneratingIdea ? 'Curating Palette...' : 'Theme Palette Stylist'}</span>
        </button>
      </div>

      {/* Filter Pills matching blueprint */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === f.id
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Theme Palette Concept Card */}
      {generatedMoodboard && (
        <div className="p-5 rounded-3xl bg-[#191b26] border border-zinc-700/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Curated Theme Palette
            </span>
            <button
              onClick={() => setGeneratedMoodboard(null)}
              className="text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-editorial italic text-base">
            "{generatedMoodboard.concept}"
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {generatedMoodboard.palette.map((color, idx) => (
              <div key={idx} className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="w-6 h-6 rounded-lg shadow-sm" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-mono text-zinc-300 font-medium pr-1">{color}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
            {generatedMoodboard.decorCues.map((cue, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-800">
                ✨ {cue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Photo Moodboard Grid matching blueprint (2x3 or 3x2 cards with hearts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative h-64 rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-xl cursor-pointer hover:border-zinc-700 transition-all hover:scale-[1.01]"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-95"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            {/* Favorite Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform"
              title="Save to favorites"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  item.isFavorite
                    ? 'fill-[#E07A5F] text-[#E07A5F]'
                    : 'text-white/80 group-hover:text-white'
                }`}
              />
            </button>

            {/* Title & Tag */}
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E07A5F] bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                {item.tag}
              </span>
              <h4 className="text-base font-bold text-white mt-1.5 drop-shadow">
                {item.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
