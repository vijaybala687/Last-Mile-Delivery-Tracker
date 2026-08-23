import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Loader2, ArrowRight, ScanLine, Mic, History } from 'lucide-react';
import apiClient from '../api/client';

const EASE = [0.16, 1, 0.3, 1];

const QUICK_ACTIONS = [
  { label: 'Scan Barcode', icon: ScanLine },
  { label: 'Voice Search', icon: Mic },
  { label: 'Recent Tracks', icon: History },
];

export default function TrackingSearch({ onResult, onLoadingChange, onError }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trackingNumber = value.trim();
    if (!trackingNumber || loading) return;

    setLoading(true);
    onLoadingChange?.(true);
    onError?.(null);

    try {
      const { data } = await apiClient.get(`/track/${encodeURIComponent(trackingNumber)}`);
      onResult?.(data);
    } catch (err) {
      const message =
        err.response?.status === 404
          ? `No package found for "${trackingNumber}"`
          : 'Something went wrong while fetching this package.';
      onError?.(message);
      onResult?.(null);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-black/[0.04] backdrop-blur-xl sm:p-8"
    >
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Track Your Package</h2>
      <p className="mt-1 text-[13px] text-neutral-400">
        Enter your tracking ID or order number to get the latest updates
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 transition-colors duration-200 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10">
          <Package className="h-[18px] w-[18px] shrink-0 text-emerald-500" strokeWidth={2} />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter tracking ID or order number"
            className="w-full bg-transparent text-[13.5px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-[13.5px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-transform duration-200 hover:scale-[1.02] hover:bg-emerald-600 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
          ) : (
            <>
              Track Now
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-[12.5px] font-medium text-neutral-500 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}