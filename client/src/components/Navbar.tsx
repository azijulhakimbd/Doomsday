'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Film, ListOrdered, Ticket, ShieldAlert } from 'lucide-react';

export type ActiveTab = 'movies' | 'rewatch' | 'booking';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  moviesCount: number;
  cinemasCount: number;
}

export function Navbar({ activeTab, setActiveTab, moviesCount, cinemasCount }: NavbarProps) {
  const tabs = [
    {
      id: 'movies' as ActiveTab,
      label: 'Movies Catalog',
      icon: Film,
      count: moviesCount,
      desc: 'Catalog & Prerequisites',
    },
    {
      id: 'rewatch' as ActiveTab,
      label: 'Rewatch Plan',
      icon: ListOrdered,
      desc: 'Topological Order & Progress',
    },
    {
      id: 'booking' as ActiveTab,
      label: 'Watch-Party Booking',
      icon: Ticket,
      count: cinemasCount,
      desc: 'Fewest Bundles Optimizer',
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-doom-dark/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-700 to-slate-900 shadow-doom-glow border border-emerald-400/30">
              <ShieldAlert className="w-6 h-6 text-emerald-100" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinematic font-black tracking-widest text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                  DOOMSDAY READY
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                  MCU Catch-up
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Prepare for Avengers: Doomsday Premiere
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isActive ? 'text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-950/90 to-slate-800 border border-emerald-500/40 shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">
                      {tab.id === 'movies' ? 'Movies' : tab.id === 'rewatch' ? 'Plan' : 'Booking'}
                    </span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
