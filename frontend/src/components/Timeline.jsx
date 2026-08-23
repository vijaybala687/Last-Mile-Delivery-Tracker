import { motion } from 'framer-motion';
import { PackageCheck, Truck, CircleCheck, XCircle, UserCheck, Circle } from 'lucide-react';

const STATUS_META = {
  PENDING: { icon: PackageCheck, label: 'Order Confirmed' },
  ASSIGNED: { icon: UserCheck, label: 'Picked Up' },
  IN_TRANSIT: { icon: Truck, label: 'In Transit' },
  DELIVERED: { icon: CircleCheck, label: 'Delivered' },
  CANCELLED: { icon: XCircle, label: 'Cancelled' },
};

const EASE = [0.16, 1, 0.3, 1];

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function Timeline({ history = [], currentStatus }) {
  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white/60 py-14 text-center">
        <Circle className="h-6 w-6 text-neutral-300" strokeWidth={1.5} />
        <p className="mt-3 max-w-[16rem] text-[13px] font-medium text-neutral-400">
          Search a tracking ID to see the delivery timeline
        </p>
      </div>
    );
  }

  return (
    <motion.ol variants={listVariants} initial="hidden" animate="visible" className="relative">
      {history.map((event, index) => {
        const isLast = index === history.length - 1;
        const isCancelled = event.status === 'CANCELLED';
        const isCurrent = isLast && event.status === currentStatus;
        const meta = STATUS_META[event.status] ?? { icon: Circle, label: event.status };
        const Icon = meta.icon;

        return (
          <motion.li
            key={`${event.status}-${index}`}
            variants={itemVariants}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-gradient-to-b from-emerald-300 to-neutral-200" />
            )}

            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              {isCurrent && !isCancelled && (
                <motion.span
                  className="absolute h-8 w-8 rounded-full bg-emerald-400/40"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                  isCancelled ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              >
                <Icon className="h-4 w-4 text-white" strokeWidth={2.4} />
              </span>
            </span>

            <div className="flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13.5px] font-semibold text-neutral-900">
                  {event.remarks || meta.label}
                </p>
                {isCurrent && !isCancelled && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                    Live
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[12px] text-neutral-400">{event.location}</p>
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}