'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; bundleSizes: number[] }) => Promise<void>;
}

export function CinemaModal({ isOpen, onClose, onSubmit }: CinemaModalProps) {
  const [name, setName] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [bundleSizes, setBundleSizes] = useState<number[]>([2, 5]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addSize = () => {
    setError(null);
    const size = parseInt(sizeInput.trim(), 10);
    if (isNaN(size) || size < 1 || size > 500) {
      setError('Bundle size must be between 1 and 500 seats');
      return;
    }
    if (bundleSizes.includes(size)) {
      setError('Bundle size already added');
      return;
    }
    if (bundleSizes.length >= 10) {
      setError('Cinema can have at most 10 bundle sizes');
      return;
    }
    setBundleSizes([...bundleSizes, size].sort((a, b) => a - b));
    setSizeInput('');
  };

  const removeSize = (sizeToRemove: number) => {
    setBundleSizes(bundleSizes.filter((s) => s !== sizeToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Cinema name is required');
      return;
    }
    if (bundleSizes.length === 0) {
      setError('Add at least one bundle size (1 to 10)');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        bundleSizes,
      });
      setName('');
      setBundleSizes([2, 5]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create cinema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-slate-100 font-cinematic tracking-wide">
                  Add Opening-Night Cinema
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Cinema Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Stark Tower IMAX"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Opening Night Bundle Sizes (1 to 10 sizes, 1–500 seats each)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="e.g. 6"
                    min={1}
                    max={500}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSize();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {/* Bundle tags */}
                <div className="flex flex-wrap gap-2 mt-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800 min-h-[50px] items-center">
                  {bundleSizes.length === 0 ? (
                    <span className="text-xs text-slate-500">No bundle sizes added yet</span>
                  ) : (
                    bundleSizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-600/40 text-xs font-bold"
                      >
                        {size} seats
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

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
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-gold-glow transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Cinema'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
