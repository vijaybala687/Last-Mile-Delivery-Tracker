import { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, User, LogOut, Package, Bell, ChevronDown,
  MapPin, Circle,
} from "lucide-react";
import axios from "../api/client";

const STATUS_TABS = ["ALL", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"];

const STATUS_STYLES = {
  PICKED_UP:       { pill: "bg-purple-100 text-purple-700",   dot: "bg-purple-500" },
  IN_TRANSIT:      { pill: "bg-blue-100 text-blue-700",       dot: "bg-blue-500"   },
  OUT_FOR_DELIVERY:{ pill: "bg-orange-100 text-orange-700",   dot: "bg-orange-500" },
  DELIVERED:       { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500"},
  FAILED:          { pill: "bg-red-100 text-red-700",         dot: "bg-red-500"    },
  PENDING:         { pill: "bg-slate-100 text-slate-600",     dot: "bg-slate-400"  },
};

const NAV_LINKS = [
  { label: "My Deliveries", icon: Truck, to: "/agent" },
  { label: "Profile",       icon: User,  to: "/agent/profile" },
];

const STATUS_GUIDE = [
  { status: "PICKED_UP",        label: "Order has been picked up" },
  { status: "IN_TRANSIT",       label: "Order is in transit" },
  { status: "OUT_FOR_DELIVERY", label: "Out for final delivery" },
  { status: "DELIVERED",        label: "Order has been delivered" },
  { status: "FAILED",           label: "Delivery attempt failed" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.pill}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function NotificationCenter({ notifications, isOpen, onToggle, onMarkAllRead }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="relative p-2 rounded-full hover:bg-slate-100 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {notifications.some((n) => !n.read) && (
          <span className="absolute top-1 right-1.5 block w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-20"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Notifications</p>
              <button onClick={onMarkAllRead} className="text-[11px] text-emerald-600 font-medium">Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">No new updates.</p>
              ) : (
                notifications.map((item) => (
                  <div key={item.id} className={`px-4 py-3 border-b border-slate-50 last:border-0 ${item.read ? "bg-white" : "bg-emerald-50/40"}`}>
                    <p className="text-sm text-slate-700 font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.message}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mt-2">{item.time}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      await axios.patch("/users/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not update password.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Confirm Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>}
      <button type="submit" className="bg-emerald-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition">Save Password</button>
    </form>
  );
}

function OrderCard({ order, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.patch(`/orders/${order.id}/status`, { status: selectedStatus });
      onUpdate();
    } catch (_) {}
    finally { setLoading(false); }
  };

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-slate-800 text-sm">{order.order_id || `ORD-${order.id}`}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString("en-IN", {
                  month: "short", day: "numeric", year: "numeric",
                }) + " · " + new Date(order.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit", minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
        <StatusPill status={order.status} />
      </div>

      {/* Route */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
          <div>
            <p className="text-xs text-slate-400">Pickup</p>
            <p className="text-sm text-slate-700 font-medium leading-tight">
              {order.pickup_city || order.pickup_address || "—"}
            </p>
          </div>
        </div>
        {/* connector line */}
        <div className="ml-[4px] h-4 border-l-2 border-dashed border-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-red-400" />
          <div>
            <p className="text-xs text-slate-400">Drop</p>
            <p className="text-sm text-slate-700 font-medium leading-tight">
              {order.drop_city || order.drop_address || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Customer & Amount */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
        <div>
          <p className="text-xs text-slate-400">Customer</p>
          <p className="text-sm text-slate-700">{order.customer_email || order.customer || "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Amount</p>
          <p className="font-bold text-slate-800">₹{order.charge ?? "—"}</p>
        </div>
      </div>

      {/* Status update */}
      <div className="flex items-center gap-2 pt-1">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {STATUS_TABS.filter(s => s !== "ALL").map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleUpdate}
          disabled={loading || selectedStatus === order.status}
          className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "…" : "Update"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function AgentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders]       = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading]     = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Route update", message: "An assigned delivery has moved to out for delivery.", time: "6m ago", read: false },
    { id: 2, title: "Delivery alert", message: "3 orders need status updates before noon.", time: "24m ago", read: true },
    { id: 3, title: "Shift summary", message: "Your current shift is performing well.", time: "1d ago", read: false },
  ]);
  const [profile, setProfile] = useState({ name: "", email: "", role: "AGENT" });
  const isProfilePage = location.pathname === "/agent/profile" || location.pathname.endsWith("/profile");

  useEffect(() => {
    fetchOrders();

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/users/me");
        setProfile({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "AGENT",
        });
      } catch (_) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setProfile({
          name: stored.name || "",
          email: stored.email || "",
          role: stored.role || "AGENT",
        });
      }
    };

    fetchProfile();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/orders/agent-orders");
      setOrders(data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const filtered = activeTab === "ALL"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-slate-100 bg-white h-screen sticky top-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-100">
          <div className="p-1.5 bg-emerald-600 rounded-lg">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm leading-none">Last-Mile</div>
            <div className="text-xs text-slate-400">Delivery Tracker</div>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV_LINKS.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/agent"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Status Guide */}
        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Status Guide</p>
          <div className="space-y-2">
            {STATUS_GUIDE.map(({ status, label }) => {
              const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
              return (
                <div key={status} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${s.dot}`} />
                  <div>
                    <p className="text-xs text-slate-600 leading-tight">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-sm text-slate-400 hover:text-red-500 border-t border-slate-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-800">{isProfilePage ? "Agent Profile" : "My Deliveries"}</h1>
            <p className="text-xs text-slate-400">{isProfilePage ? "Manage your account details" : "Orders assigned to you"}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter
              notifications={notifications}
              isOpen={notificationsOpen}
              onToggle={() => setNotificationsOpen((open) => !open)}
              onMarkAllRead={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))}
            />
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex items-center gap-2 cursor-pointer rounded-full px-2 py-1 hover:bg-slate-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-sm font-bold">
                  {(profile.name || "Agent").charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-slate-700 font-medium">{profile.name || "Agent"}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20"
                  >
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate("/agent/profile"); }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      View profile
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); localStorage.clear(); navigate("/"); }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {isProfilePage ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-8 py-7"
          >
            <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] max-w-5xl">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                    {profile.name ? profile.name[0].toUpperCase() : "A"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{profile.name || "Agent Profile"}</h2>
                    <p className="text-sm text-slate-500">Delivery operations specialist</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span>Name</span>
                    <span className="font-medium text-slate-800">{profile.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span>Email</span>
                    <span className="font-medium text-slate-800">{profile.email || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span>Role</span>
                    <span className="font-medium text-slate-800">{(profile.role || "AGENT").toLowerCase()}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span>Assigned Orders</span>
                    <span className="font-medium text-slate-800">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span>Status</span>
                    <span className="font-medium text-emerald-600">Online</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Update Password</h3>
                <PasswordForm />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-8 py-7"
          >
            {/* Status filter tabs */}
            <div className="flex gap-2 flex-wrap mb-7">
              {STATUS_TABS.map((tab) => {
                const s = STATUS_STYLES[tab];
                const isActive = activeTab === tab;
                return (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      tab === "ALL"
                        ? isActive
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : isActive
                          ? s.pill + " ring-2 ring-offset-1 ring-current"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {tab.replace(/_/g, " ")}
                  </motion.button>
                );
              })}
            </div>

            {/* Cards grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-6" />
                    <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4 mb-6" />
                    <div className="h-8 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-slate-400"
              >
                <Truck className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium">No deliveries here</p>
                <p className="text-sm">
                  {activeTab === "ALL"
                    ? "You have no assigned orders yet."
                    : `No orders with status "${activeTab.replace(/_/g, " ")}".`}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((order) => (
                    <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}