'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Users,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Building2,
  Trash2,
} from 'lucide-react';
import { Cinema, BookingQuoteResult } from '../types';
import { getBookingQuote, createCinema, deleteCinema } from '../lib/api';
import { CinemaModal } from './CinemaModal';

interface BookingViewProps {
  cinemas: Cinema[];
  onRefreshCinemas: () => Promise<void>;
}

export function BookingView({ cinemas, onRefreshCinemas }: BookingViewProps) {
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>(
    cinemas[0]?.id || ''
  );
  const [groupSize, setGroupSize] = useState<number>(44);
  const [quote, setQuote] = useState<BookingQuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync selected cinema if list updates
  useEffect(() => {
    if (!selectedCinemaId && cinemas.length > 0) {
      setSelectedCinemaId(cinemas[0].id);
    }
  }, [cinemas, selectedCinemaId]);

  // Fetch booking quote when cinema or groupSize changes
  useEffect(() => {
    if (!selectedCinemaId || groupSize < 1 || groupSize > 10000) return;

    let isMounted = true;
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getBookingQuote(selectedCinemaId, groupSize);
        if (isMounted) {
          setQuote(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch booking quote');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [selectedCinemaId, groupSize]);

  const handleCreateCinema = async (data: { name: string; bundleSizes: number[] }) => {
    const created = await createCinema(data);
    await onRefreshCinemas();
    setSelectedCinemaId(created.id);
  };

  const handleDeleteCinema = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteCinema(id);
      await onRefreshCinemas();
    } catch (err: any) {
      setError(err.message || 'Failed to delete cinema');
    }
  };

  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  // Preset test cases from specification
  const presets = [
    { label: 'Stark IMAX (44)', cinemaName: 'Stark Tower IMAX', size: 44, note: '4 bundles: 20×1, 9×2, 6×1' },
    { label: 'Avengers Campus (11)', cinemaName: 'Avengers Campus', size: 11, note: '4 bundles: 5×1, 2×3' },
    { label: 'Wakanda (6)', cinemaName: 'Wakanda Grand Royal', size: 6, note: '2 bundles: 3×2' },
    { label: 'Baxter (7)', cinemaName: 'Baxter Plaza', size: 7, note: 'Not possible' },
    { label: 'Mega IMAX (10,000)', cinemaName: 'Stark Tower IMAX', size: 10000, note: 'Stress test 10k' },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    const targetCinema = cinemas.find((c) =>
      c.name.toLowerCase().includes(preset.cinemaName.toLowerCase())
    );
    if (targetCinema) {
      setSelectedCinemaId(targetCinema.id);
    }
    setGroupSize(preset.size);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/60">
              Feature 2
            </span>
            <span className="text-xs text-slate-400">Exact Change DP Fewest Bundles Solver</span>
          </div>
          <h2 className="text-xl font-bold font-cinematic text-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" />
            Watch-Party Bundle Booking Optimizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cinemas sell opening night seats only in bundle sizes. Find the fewest bundles that seat your group exactly with zero empty seats!
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-gold-glow transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Cinema
        </button>
      </div>

      {/* Preset Test Case Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
        </span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-800 hover:border-amber-600/40 shrink-0 transition-all flex items-center gap-1.5"
            title={p.note}
          >
            <span>{p.label}</span>
            <span className="text-[10px] text-slate-500">({p.note})</span>
          </button>
        ))}
      </div>

      {/* Cinema Selector Grid */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Select Opening-Night Cinema Venue
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cinemas.map((cinema) => {
            const isSelected = selectedCinemaId === cinema.id;
            return (
              <div
                key={cinema.id}
                onClick={() => setSelectedCinemaId(cinema.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-950/20 border-amber-500/80 shadow-gold-glow'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                      <h4 className="text-sm font-bold text-slate-100">{cinema.name}</h4>
                    </div>

                    {cinemas.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCinema(cinema.id, cinema.name);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete cinema"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Bundle Sizes Sold:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cinema.bundleSizes.map((size) => (
                        <span
                          key={size}
                          className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                            isSelected
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {size} seats
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group Size Input Card */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Watch Party Group Size (1–10,000 fans)
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter exact headcount. The optimizer calculates the fewest bundles to seat everyone exactly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={10000}
              value={groupSize}
              onChange={(e) => setGroupSize(Math.max(1, Math.min(10000, Number(e.target.value))))}
              className="w-28 px-3 py-2 rounded-xl bg-slate-950 text-center font-cinematic font-black text-lg text-amber-300 border border-slate-700 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => setGroupSize(Math.min(10000, groupSize + 1))}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick step buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Quick adjust:</span>
          {[6, 11, 20, 44, 50, 100, 250, 500].map((num) => (
            <button
              key={num}
              onClick={() => setGroupSize(num)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                groupSize === num
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Quote Result Display */}
      {loading ? (
        <div className="p-10 rounded-2xl glass-card text-center text-slate-400 animate-pulse border border-slate-800">
          Calculating fewest bundles with dynamic programming...
        </div>
      ) : quote ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden ${
            quote.possible
              ? 'bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border-amber-500/50 shadow-gold-glow'
              : 'bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 border-rose-800/80 shadow-crimson-glow'
          }`}
        >
          {quote.possible ? (
            <div className="space-y-6">
              {/* Header: Success & Total Bundles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Optimal Bundle Solution Found
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-cinematic text-slate-100">
                      {quote.formatted}
                    </h3>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 self-start sm:self-auto text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Group Size / Seats
                  </span>
                  <span className="text-xl font-black text-amber-300 font-cinematic">
                    {quote.groupSize} seats
                  </span>
                </div>
              </div>

              {/* Bundle Ticket Stubs Breakdown */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 block flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Bundle Purchase Breakdown:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quote.bundles?.map((bundle, idx) => (
                    <motion.div
                      key={bundle.size}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-xl bg-slate-950/80 border border-amber-600/30 relative flex flex-col justify-between"
                    >
                      {/* Ticket notch styling */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold">
                          Bundle Size: {bundle.size} seats
                        </span>
                        <span className="text-xs font-cinematic font-bold text-slate-400">
                          {bundle.totalSeats} seats total
                        </span>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-slate-400">Quantity to buy:</span>
                          <div className="text-2xl font-black font-cinematic text-amber-300">
                            {bundle.quantity} ×
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          ({bundle.size} × {bundle.quantity})
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Guarantee footer */}
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Zero wasted seats:</strong> All {quote.groupSize} seats are completely filled across {quote.totalBundles} bundles. Nobody pays for an empty seat!
                </span>
              </div>
            </div>
          ) : (
            /* Not Possible State */
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
                <XCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Exact Match Unavailable
                </span>
                <h3 className="text-2xl font-black font-cinematic text-rose-200 mt-1">
                  Not possible
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                No combination of bundle sizes ({selectedCinema?.bundleSizes.join(', ')}) can add up to exactly{' '}
                <span className="text-rose-300 font-bold">{quote.groupSize} seats</span> without leaving empty paid seats.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setGroupSize(quote.groupSize + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  Try Group Size {quote.groupSize + 1}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : null}

      {/* Modal */}
      <CinemaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateCinema}
      />
    </div>
  );
}
