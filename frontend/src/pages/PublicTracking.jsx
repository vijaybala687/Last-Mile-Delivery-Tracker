import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, PackageSearch } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TrackingSearch from '../components/TrackingSearch';
import Timeline from '../components/Timeline';

const EASE = [0.16, 1, 0.3, 1];

const STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-600',
  ASSIGNED: 'bg-blue-50 text-blue-600',
  IN_TRANSIT: 'bg-emerald-50 text-emerald-600',
  DELIVERED: 'bg-emerald-500 text-white',
  CANCELLED: 'bg-rose-50 text-rose-600',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold ${
        STATUS_STYLES[status] ?? 'bg-neutral-100 text-neutral-500'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replace('_', ' ')}
    </span>
  );
}

export default function PublicTracking() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-emerald-50/40">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-[264px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200/70 bg-white/70 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </button>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-neutral-900 sm:text-base">
                Track your packages
              </h1>
              <p className="hidden text-[12px] text-neutral-400 sm:block">Real-time delivery updates</p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-100"
          >
            <Bell className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </header>

        {/* Content */}
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-3 lg:py-8">
          <div className="space-y-6 lg:col-span-2">
            <TrackingSearch
              onResult={setTrackingData}
              onLoadingChange={setLoading}
              onError={setError}
            />

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-[13px] font-medium text-rose-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {trackingData && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
                className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-black/[0.04] backdrop-blur-xl sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                      <PackageSearch className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-neutral-400">Tracking Number</p>
                      <p className="text-[14.5px] font-semibold text-neutral-900">
                        {trackingData.tracking_number}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={trackingData.current_status} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Timeline panel */}
          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-black/[0.04] backdrop-blur-xl lg:col-span-1"
          >
            <h3 className="mb-6 text-[15px] font-semibold tracking-tight text-neutral-900">
              Delivery Timeline
            </h3>
            <Timeline history={trackingData?.history} currentStatus={trackingData?.current_status} />
          </motion.aside>
        </main>
      </div>
    </div>
  );
}