'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Plus,
  RotateCcw,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  Sparkles,
} from 'lucide-react';
import { Movie } from '../types';
import { MovieModal } from './MovieModal';
import { createMovie, updateMovie, deleteMovie, seedMovies } from '../lib/api';

interface MoviesViewProps {
  movies: Movie[];
  onRefresh: () => Promise<void>;
  onSelectForPlan?: (movieId: string) => void;
}

export function MoviesView({ movies, onRefresh, onSelectForPlan }: MoviesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper to format minutes as "2h 23m"
  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleToggleWatched = async (movie: Movie) => {
    try {
      await updateMovie(movie.id, { watched: !movie.watched });
      await onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update watched status' });
    }
  };

  const handleDelete = async (movie: Movie) => {
    if (!confirm(`Are you sure you want to delete "${movie.title}"?`)) return;
    try {
      await deleteMovie(movie.id);
      await onRefresh();
      setMessage({ type: 'success', text: `Deleted "${movie.title}"` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete movie' });
    }
  };

  const handleResetCatalog = async () => {
    if (!confirm('Reset MCU catalog to the official canonical 8 sample movies?')) return;
    try {
      setLoading(true);
      await seedMovies();
      await onRefresh();
      setMessage({ type: 'success', text: 'MCU sample catalog restored!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reset catalog' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMovie = async (data: {
    title: string;
    releaseYear: number;
    runtime: number;
    prerequisites: string[];
    watched: boolean;
  }) => {
    if (editingMovie) {
      await updateMovie(editingMovie.id, data);
      setMessage({ type: 'success', text: `Updated "${data.title}"` });
    } else {
      await createMovie(data);
      setMessage({ type: 'success', text: `Created "${data.title}"` });
    }
    await onRefresh();
    setTimeout(() => setMessage(null), 3000);
  };

  // Filtered movies
  const filteredMovies = movies.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'watched') return m.watched;
    if (filter === 'unwatched') return !m.watched;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinematic text-slate-100 flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-400" />
            Marvel Cinematic Universe Movies
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage movies, toggle watched status, and link prerequisite dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetCatalog}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors"
            title="Reset to challenge sample movies"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reset MCU Catalog
          </button>
          <button
            onClick={() => {
              setEditingMovie(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-doom-glow transition-all"
          >
            <Plus className="w-4 h-4" /> Add Movie
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movie..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 self-stretch sm:self-auto justify-center">
          {(['all', 'unwatched', 'watched'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === mode
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 space-y-3">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No movies found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search filter or click &quot;Reset MCU Catalog&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMovies.map((movie) => {
            const prereqMovies = movies.filter((m) => movie.prerequisites.includes(m.id));

            return (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl glass-card transition-all relative group flex flex-col justify-between ${
                  movie.watched
                    ? 'border-emerald-900/50 bg-emerald-950/10'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Header: Watched Checkbox & Title */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleWatched(movie)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        title={movie.watched ? 'Mark as unwatched' : 'Mark as watched'}
                      >
                        {movie.watched ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400" />
                        )}
                      </button>

                      <div>
                        <h3 className="font-bold text-slate-100 text-base leading-snug group-hover:text-emerald-300 transition-colors">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {movie.releaseYear}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatRuntime(movie.runtime)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              movie.watched
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {movie.watched ? 'Watched' : 'Unwatched'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingMovie(movie);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Edit movie"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete movie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Prerequisites section */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Prerequisites ({prereqMovies.length})
                    </span>
                    {prereqMovies.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">None (Stand-alone start)</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {prereqMovies.map((pr) => (
                          <span
                            key={pr.id}
                            className={`text-[11px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                              pr.watched
                                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {pr.watched && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                            {pr.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom plan CTA button */}
                {onSelectForPlan && (
                  <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-end">
                    <button
                      onClick={() => onSelectForPlan(movie.id)}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" /> Plan Rewatch for this
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Circular dependency explanation card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">
            Graph Dependency Rules &amp; Cycle Protection:
          </span>
          <p className="mt-0.5">
            A movie can never depend on itself either directly or through intermediate links. If you attempt to make{' '}
            <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">Avengers: Endgame</code> a prerequisite of{' '}
            <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">Iron Man</code>, the system rejects it with{' '}
            <code className="text-rose-400 bg-slate-950 px-1 py-0.5 rounded">409 CIRCULAR_DEPENDENCY</code>.
          </p>
        </div>
      </div>

      {/* Modal */}
      <MovieModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMovie(null);
        }}
        onSubmit={handleSaveMovie}
        initialMovie={editingMovie}
        existingMovies={movies}
      />
    </div>
  );
}
