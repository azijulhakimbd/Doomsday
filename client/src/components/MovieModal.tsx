'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Clock, Calendar, CheckSquare, AlertCircle, ShieldAlert } from 'lucide-react';
import { Movie } from '../types';

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    releaseYear: number;
    runtime: number;
    prerequisites: string[];
    watched: boolean;
  }) => Promise<void>;
  initialMovie?: Movie | null;
  existingMovies: Movie[];
}

export function MovieModal({
  isOpen,
  onClose,
  onSubmit,
  initialMovie,
  existingMovies,
}: MovieModalProps) {
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [runtime, setRuntime] = useState<number>(120);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [watched, setWatched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMovie) {
      setTitle(initialMovie.title);
      setReleaseYear(initialMovie.releaseYear);
      setRuntime(initialMovie.runtime);
      setPrerequisites([...initialMovie.prerequisites]);
      setWatched(initialMovie.watched);
    } else {
      setTitle('');
      setReleaseYear(2025);
      setRuntime(120);
      setPrerequisites([]);
      setWatched(false);
    }
    setError(null);
  }, [initialMovie, isOpen]);

  const togglePrerequisite = (id: string) => {
    setPrerequisites((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (runtime < 1 || runtime > 300) {
      setError('Runtime must be between 1 and 300 minutes');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        releaseYear: Number(releaseYear),
        runtime: Number(runtime),
        prerequisites,
        watched,
      });
      onClose();
    } catch (err: any) {
      if (err.code === 'CIRCULAR_DEPENDENCY' || err.statusCode === 409) {
        setError(
          '409 CIRCULAR_DEPENDENCY: A movie can never depend on itself, either directly or through other movies!'
        );
      } else {
        setError(err.message || 'Failed to save movie');
      }
    } finally {
      setLoading(false);
    }
  };

  // Movies available to pick as prerequisites (exclude self)
  const selectableMovies = existingMovies.filter((m) => !initialMovie || m.id !== initialMovie.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-100 font-cinematic tracking-wide">
                  {initialMovie ? 'Edit MCU Movie' : 'Add New Movie'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-2 text-rose-300 text-xs sm:text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Movie Title <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Iron Man 3"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Grid: Release Year & Runtime */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    min={1900}
                    max={2100}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Runtime (1–300 min)
                  </label>
                  <input
                    type="number"
                    value={runtime}
                    onChange={(e) => setRuntime(Number(e.target.value))}
                    min={1}
                    max={300}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Watched Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckSquare className={`w-4 h-4 ${watched ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-sm font-medium text-slate-200">Watched Status</span>
                    <p className="text-xs text-slate-400">Mark if already seen</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWatched(!watched)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    watched ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      watched ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Prerequisites Multi-select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Prerequisites (Movies to watch first)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                  {selectableMovies.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-3">
                      No other movies in catalog yet.
                    </p>
                  ) : (
                    selectableMovies.map((movie) => {
                      const isSelected = prerequisites.includes(movie.id);
                      return (
                        <div
                          key={movie.id}
                          onClick={() => togglePrerequisite(movie.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm ${
                            isSelected
                              ? 'bg-emerald-950/60 border border-emerald-600/40 text-emerald-200'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="font-medium">{movie.title}</span>
                          </div>
                          <span className="text-slate-500 text-xs">({movie.releaseYear})</span>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-500" />
                  Cyclic dependencies (e.g. A depends on B and B depends on A) are automatically rejected.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-doom-glow transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : initialMovie ? 'Update Movie' : 'Create Movie'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
