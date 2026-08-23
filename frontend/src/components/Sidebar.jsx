import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  PackageSearch,
  Send,
  Boxes,
  Contact,
  BarChart3,
  LifeBuoy,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Track Package', icon: PackageSearch, to: '/' },
  { label: 'Ship Now', icon: Send, to: '/ship' },
  { label: 'My Shipments', icon: Boxes, to: '/shipments' },
  { label: 'Address Book', icon: Contact, to: '/address-book' },
  { label: 'Analytics', icon: BarChart3, to: '/analytics' },
  { label: 'Support Center', icon: LifeBuoy, to: '/support' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

const EASE = [0.16, 1, 0.3, 1];

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 pb-8 pt-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900">
          <Boxes className="h-5 w-5 text-emerald-400" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-neutral-900">ParcelFlow</p>
          <p className="text-[11px] font-medium text-neutral-400">Delivering Trust.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            onClick={onNavigate}
            end
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] ${
                    isActive ? 'text-emerald-600' : 'text-neutral-400 group-hover:text-neutral-600'
                  }`}
                  strokeWidth={2}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-4 mb-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4">
        <Sparkles className="h-5 w-5 text-emerald-400" strokeWidth={2} />
        <p className="mt-2 text-[13px] font-semibold text-white">Go Premium</p>
        <p className="mt-1 text-[11.5px] leading-snug text-neutral-400">
          Unlock faster support, advanced tracking and more.
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-white py-2 text-[12.5px] font-semibold text-neutral-900 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Desktop: fixed rail, always visible at lg breakpoint */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[264px] lg:flex-col lg:border-r lg:border-neutral-200/70 lg:bg-white/80 lg:backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile: slide-in drawer + backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.45, ease: EASE }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-xl lg:hidden"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}