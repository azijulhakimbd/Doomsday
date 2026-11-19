'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListOrdered,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Movie, RewatchOrderResult } from '../types';
import { getRewatchOrder, updateMovie } from '../lib/api';

interface RewatchPlanViewProps {
  movies: Movie[];
  selectedMovieId: string | null;
  onSelectMovie: (id: string) => void;
  onRefreshMovies: () => Promise<void>;
}

export function RewatchPlanView({
  movies,
  selectedMovieId,
  onSelectMovie,
  onRefreshMovies,
}: RewatchPlanViewProps) {
  const [targetId, setTargetId] = useState<string>(selectedMovieId || '');
  const [planResult, setPlanResult] = useState<RewatchOrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to Avengers: Doomsday if available and nothing selected
  useEffect(() => {
    if (!targetId && movies.length > 0) {
      const doomsday = movies.find((m) => m.id === 'doomsday' || m.title.toLowerCase().includes('doomsday'));
      if (doomsday) {
        setTargetId(doomsday.id);
      } else {
        setTargetId(movies[0].id);
      }
    } else if (selectedMovieId) {
      setTargetId(selectedMovieId);
    }
  }, [movies, selectedMovieId]);

  // Fetch rewatch order when targetId changes
  useEffect(() => {
    if (!targetId) return;

    let isMounted = true;
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getRewatchOrder(targetId);
        if (isMounted) {
          setPlanResult(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to calculate rewatch plan');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlan();
    return () => {
      isMounted = false;
    };
  }, [targetId]);

  // Trigger celebration confetti when 100% completed
  useEffect(() => {
    if (
      planResult &&
      planResult.totalMovies > 0 &&
      planResult.watchedCount === planResult.totalMovies
    ) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#f59e0b', '#38bdf8'],
      });
    }
  }, [planResult?.watchedCount, planResult?.totalMovies]);

  const handleToggleWatched = async (movie: Movie) => {
    try {
      await updateMovie(movie.id, { watched: !movie.watched });
      // Refresh both full list and rewatch order
      await onRefreshMovies();
      const updated = await getRewatchOrder(targetId);
      setPlanResult(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update watched status');
    }
  };

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const targetMovie = movies.find((m) => m.id === targetId);
  const percentComplete =
    planResult && planResult.totalMovies > 0
      ? Math.round((planResult.watchedCount / planResult.totalMovies) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Target Selector Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              Feature 1
            </span>
            <span className="text-xs text-slate-400">Custom DAG Topological Sort</span>
          </div>
          <h2 className="text-xl font-bold font-cinematic text-slate-100 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-emerald-400" />
            Rewatch Order Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your target Marvel movie to calculate every prerequisite movie in valid chronological order.
          </p>
        </div>

        {/* Target Movie Select Dropdown */}
        <div className="w-full md:w-80">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Target Destination Movie
          </label>
          <select
            value={targetId}
            onChange={(e) => {
              setTargetId(e.target.value);
              onSelectMovie(e.target.value);
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
          >
            {movies.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100 py-1">
                {m.title} ({m.releaseYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Movie Quick Switch Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">
          Quick Pick:
        </span>
        {movies.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setTargetId(m.id);
              onSelectMovie(m.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
              targetId === m.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-doom-glow border border-emerald-400/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress & Metrics Card */}
      {planResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass-card border border-emerald-900/40 shadow-doom-glow relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Target info & Progress bar */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100">
                    Preparing for: <span className="text-emerald-400 font-cinematic">{targetMovie?.title}</span>
                  </h3>
                  <span className="text-xs text-slate-400">({targetMovie?.releaseYear})</span>
                </div>

                <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  {planResult.totalMovies === 0
                    ? 'No prerequisites required!'
                    : `${planResult.watchedCount} of ${planResult.totalMovies} watched (${percentComplete}%)`}
                </div>
              </div>

              {/* Progress bar container */}
              {planResult.totalMovies > 0 && (
                <div className="w-full h-3 rounded-full bg-slate-950/80 border border-slate-800 overflow-hidden p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentComplete}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Prerequisites
                </span>
                <span className="text-xl font-black text-slate-100 font-cinematic mt-0.5 block">
                  {planResult.totalMovies}
                </span>
                <span className="text-[10px] text-slate-500">Movies to catch up</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block">
                  Watched
                </span>
                <span className="text-xl font-black text-emerald-300 font-cinematic mt-0.5 block">
                  {planResult.watchedCount}
                </span>
                <span className="text-[10px] text-emerald-500/80">Already completed</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                  Remaining
                </span>
                <span className="text-xl font-black text-amber-300 font-cinematic mt-0.5 block">
                  {planResult.unwatchedCount}
                </span>
                <span className="text-[10px] text-amber-500/80">Left to watch</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 block">
                  Watch Time Left
                </span>
                <span className="text-xl font-black text-sky-300 font-cinematic mt-0.5 block">
                  {formatRuntime(planResult.unwatchedRuntime)}
                </span>
                <span className="text-[10px] text-sky-500/80">
                  {planResult.unwatchedRuntime} minutes
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ordered Timeline / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-200 font-cinematic flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-emerald-400" />
            Topological Rewatch Order
          </h3>
          <span className="text-xs text-slate-400">
            Every movie is positioned after its prerequisites
          </span>
        </div>

        {loading ? (
          <div className="p-10 rounded-2xl glass-card text-center text-slate-400 animate-pulse">
            Calculating optimal rewatch graph...
          </div>
        ) : !planResult || planResult.totalMovies === 0 ? (
          <div className="p-10 rounded-2xl glass-card text-center space-y-2 border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-semibold text-slate-200">
              No Prerequisites Needed!
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              <span className="text-emerald-300 font-semibold">{targetMovie?.title}</span> has no prerequisites or has an empty dependency list. You can watch it directly without watching any prior movies!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {planResult.rewatchOrder.map((movie, index) => {
              const isWatched = movie.watched;
              const prereqTitles = movie.prerequisites
                .map((pid) => movies.find((m) => m.id === pid)?.title)
                .filter(Boolean);

              return (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl glass-card border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isWatched
                      ? 'border-emerald-900/60 bg-emerald-950/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                  }`}
                >
                  {/* Left: Step badge + Watched button + Movie info */}
                  <div className="flex items-center gap-3.5">
                    {/* Step number badge */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg font-cinematic font-black text-xs shrink-0 ${
                        isWatched
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Interactive watched check toggle */}
                    <button
                      onClick={() => handleToggleWatched(movie)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                      title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                    >
                      {isWatched ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 hover:text-emerald-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-sm sm:text-base ${
                            isWatched ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {movie.title}
                        </span>
                        <span className="text-xs text-slate-500">({movie.releaseYear})</span>
                      </div>

                      {/* Prerequisites hint */}
                      {prereqTitles.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Requires:{' '}
                          <span className="text-slate-300">{prereqTitles.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Runtime + Status Pill */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {formatRuntime(movie.runtime)}
                    </span>

                    <button
                      onClick={() => handleToggleWatched(movie)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isWatched
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/80'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isWatched ? 'Watched ✓' : 'Mark Watched'}
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {/* Destination Target Finale Item */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-doom-glow">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-black font-cinematic font-black text-xs">
                  ★
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                      Target Premiere Goal
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-100 font-cinematic">
                    {targetMovie?.title} ({targetMovie?.releaseYear})
                  </h4>
                </div>
              </div>

              <div className="text-xs text-slate-400 hidden sm:block">
                Runtime: {formatRuntime(targetMovie?.runtime || 180)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
