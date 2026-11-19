'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, ActiveTab } from '../components/Navbar';
import { MoviesView } from '../components/MoviesView';
import { RewatchPlanView } from '../components/RewatchPlanView';
import { BookingView } from '../components/BookingView';
import { Movie, Cinema } from '../types';
import { getMovies, getCinemas } from '../lib/api';
import { Shield, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rewatch');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedMovieForPlan, setSelectedMovieForPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setConnectionError(null);
      const [moviesData, cinemasData] = await Promise.all([getMovies(), getCinemas()]);
      setMovies(moviesData);
      setCinemas(cinemasData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setConnectionError(
        'Unable to connect to the Doomsday Ready API server at /api. Please ensure the backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectForPlan = (movieId: string) => {
    setSelectedMovieForPlan(movieId);
    setActiveTab('rewatch');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        moviesCount={movies.length}
        cinemasCount={cinemas.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Doomsday Mission Hero Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-amber-950/30 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Avengers: Doomsday Rewatch Hub
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-cinematic text-slate-100 tracking-wide">
                AVENGERS: DOOMSDAY READY
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Doctor Doom approaches. Catch up on every required MCU prerequisite movie in optimal chronological order, check off what you&apos;ve watched, and book opening-night group bundles with zero wasted seats.
              </p>
            </div>

            {/* Quick summary stats pill */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Catalog
                </span>
                <span className="text-lg font-black text-emerald-400 font-cinematic">
                  {movies.length} Movies
                </span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Cinemas
                </span>
                <span className="text-lg font-black text-amber-400 font-cinematic">
                  {cinemas.length} Venues
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Connection Error Alert */}
        {connectionError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/60 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{connectionError}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-100 text-xs font-bold transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Content Views with Framer Motion AnimatePresence */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800 animate-pulse">
            Connecting to Doomsday Ready API...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'movies' && (
              <motion.div
                key="movies"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <MoviesView
                  movies={movies}
                  onRefresh={fetchData}
                  onSelectForPlan={handleSelectForPlan}
                />
              </motion.div>
            )}

            {activeTab === 'rewatch' && (
              <motion.div
                key="rewatch"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <RewatchPlanView
                  movies={movies}
                  selectedMovieId={selectedMovieForPlan}
                  onSelectMovie={setSelectedMovieForPlan}
                  onRefreshMovies={fetchData}
                />
              </motion.div>
            )}

            {activeTab === 'booking' && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <BookingView cinemas={cinemas} onRefreshCinemas={fetchData} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-16 text-center text-xs text-slate-500">
        <p>
          Doomsday Ready — MCU Rewatch Planner &amp; Opening Night Watch Party Optimizer.
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Built with Next.js 15, TypeScript, Tailwind CSS &amp; Framer Motion. Zero external algorithm libraries.
        </p>
      </footer>
    </div>
  );
}
