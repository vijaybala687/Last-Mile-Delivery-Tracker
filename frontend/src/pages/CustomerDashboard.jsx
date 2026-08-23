import { useState, useEffect } from "react";
import { useNavigate, NavLink, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, PlusSquare, ClipboardList, Search,
  User, LogOut, Package, Bell, ChevronDown, CalendarClock,
} from "lucide-react";
import axios from "../api/client";

const STATUS_STYLES = {
  DELIVERED:       "bg-emerald-100 text-emerald-700",
  IN_TRANSIT:      "bg-blue-100 text-blue-700",
  FAILED:          "bg-red-100 text-red-700",
  OUT_FOR_DELIVERY:"bg-orange-100 text-orange-700",
  PICKED_UP:       "bg-purple-100 text-purple-700",
  PENDING:         "bg-slate-100 text-slate-600",
};

const NAV = [
  { label: "Dashboard",   icon: LayoutDashboard, to: "/customer" },
  { label: "Create Order",icon: PlusSquare,       to: "/customer/create" },
  { label: "My Orders",   icon: ClipboardList,    to: "/customer/orders" },
  { label: "Track Order", icon: Search,           to: "/customer/track" },
  { label: "Profile",     icon: User,             to: "/customer/profile" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function Sidebar({ onLogout }) {
  return (
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
        {NAV.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/customer"}
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

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-5 py-4 text-sm text-slate-400 hover:text-red-500 border-t border-slate-100 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </aside>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600"}`}>
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
            transition={{ duration: 0.18 }}
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

function CustomerDashboardHome() {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const user = storedUser || {};

  const [form, setForm] = useState({
    pickup_address: "", drop_address: "",
    length: "", width: "", height: "",
    actual_weight: "", order_type: "", payment_type: "",
  });
  const [charge, setCharge] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [rescheduleId, setRescheduleId] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/orders/my-orders");
      setOrders(data);
    } catch (_) {}
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const calculateCharge = async () => {
    setLoadingCalc(true);
    try {
      const { data } = await axios.post("/orders/calculate-charge", {
        ...form,
        length: Number(form.length || 0),
        width: Number(form.width || 0),
        height: Number(form.height || 0),
        actual_weight: Number(form.actual_weight || 0),
      });
      setCharge(data.estimated_charge ?? data.charge ?? 0);
    } catch (_) { setCharge(null); }
    finally { setLoadingCalc(false); }
  };

  const confirmOrder = async () => {
    setLoadingOrder(true);
    setMsg("");
    try {
      await axios.post("/orders/create", {
        ...form,
        length: Number(form.length || 0),
        width: Number(form.width || 0),
        height: Number(form.height || 0),
        actual_weight: Number(form.actual_weight || 0),
      });
      setMsg("Order placed successfully!");
      setForm({ pickup_address:"", drop_address:"", length:"", width:"", height:"", actual_weight:"", order_type:"", payment_type:"" });
      setCharge(null);
      fetchOrders();
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Failed to place order.");
    } finally { setLoadingOrder(false); }
  };

  const rescheduleOrder = async () => {
    if (!rescheduleId) return;
    try {
      await axios.post(`/orders/${rescheduleId}/reschedule`, { new_date: rescheduleDate });
      setMsg("Order rescheduled!");
      fetchOrders();
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Reschedule failed.");
    }
  };

  const failedOrders = orders.filter((o) => o.status === "FAILED");

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome, {user.name || "Customer"} 👋</h1>
      <p className="text-slate-500 text-sm mb-8">Create a new delivery order and track your shipments.</p>

      {msg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            msg.includes("success") || msg.includes("rescheduled")
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {msg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-5">Create New Order</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Pickup Address</label>
              <input name="pickup_address" value={form.pickup_address} onChange={handleChange} placeholder="Enter pickup address" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Drop Address</label>
              <input name="drop_address" value={form.drop_address} onChange={handleChange} placeholder="Enter drop address" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["length","width","height"].map((field) => (
                <div key={field}>
                  <label className="block text-xs text-slate-500 mb-1 capitalize">{field} (cm)</label>
                  <input name={field} value={form[field]} onChange={handleChange} type="number" placeholder={field.charAt(0).toUpperCase()+field.slice(1)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Weight (kg)</label>
                <input name="actual_weight" value={form.actual_weight} onChange={handleChange} type="number" placeholder="Weight" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Order Type</label>
                <select name="order_type" value={form.order_type} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select type</option>
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Payment Type</label>
                <select name="payment_type" value={form.payment_type} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select type</option>
                  <option value="PREPAID">Prepaid</option>
                  <option value="COD">COD</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={calculateCharge} disabled={loadingCalc} className="flex-1 border border-emerald-600 text-emerald-600 rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-50 transition disabled:opacity-60">
                {loadingCalc ? "Calculating…" : "Calculate Charge"}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={confirmOrder} disabled={loadingOrder} className="flex-1 bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
                {loadingOrder ? "Placing…" : "Confirm Order"}
              </motion.button>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-0.5">Estimated Charge</p>
              <p className="text-xl font-bold text-slate-800">₹{charge !== null ? Number(charge).toFixed(2) : "0.00"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Order History</h2>
            <NavLink to="/customer/orders" className="text-xs text-emerald-600 font-medium hover:underline">View All</NavLink>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-3 text-left font-medium">Order ID</th>
                  <th className="pb-3 text-left font-medium">Date</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Total</th>
                  <th className="pb-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                <AnimatePresence>
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-xs">No orders yet. Create your first one!</td></tr>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <motion.tr key={order.id} variants={rowVariants} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-slate-700 font-medium text-xs">{order.order_id || order.id}</td>
                        <td className="py-3 text-slate-500 text-xs">{new Date(order.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</td>
                        <td className="py-3"><StatusPill status={order.status} /></td>
                        <td className="py-3 text-right text-slate-700 font-medium text-xs">₹{order.charge ?? "—"}</td>
                        <td className="py-3 text-right"><NavLink to="/customer/track" className="text-xs text-emerald-600 font-medium hover:underline">Track</NavLink></td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
          {orders.length > 0 && (<p className="text-xs text-slate-400 mt-3">Showing 1 to {Math.min(5, orders.length)} of {orders.length} results</p>)}
        </div>
      </div>

      {failedOrders.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-4 items-start">
          <div className="p-2 bg-blue-100 rounded-xl shrink-0"><CalendarClock className="w-5 h-5 text-blue-600" /></div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">Reschedule a Failed Order</h3>
            <p className="text-blue-600 text-xs mb-4">If your order failed, you can reschedule it for a new date and time.</p>
            <div className="flex gap-3 flex-wrap">
              <select value={rescheduleId} onChange={(e) => setRescheduleId(e.target.value)} className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select failed order</option>
                {failedOrders.map((o) => (<option key={o.id} value={o.id}>{o.order_id || o.id}</option>))}
              </select>
              <input type="datetime-local" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={rescheduleOrder} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-blue-700 transition">Reschedule</motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/orders/my-orders");
        setOrders(data);
      } catch (_) {
        setOrders([]);
      } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-slate-800">My Orders</h2>
        <NavLink to="/customer/create" className="text-xs text-emerald-600 font-medium hover:underline">Create new</NavLink>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-slate-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100 rounded-xl p-4">
              <div>
                <p className="font-medium text-slate-800 text-sm">{order.order_id || order.id}</p>
                <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={order.status} />
                <span className="text-sm font-medium text-slate-700">₹{Number(order.charge ?? 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookupTracking = async () => {
    const value = trackingNumber.trim();
    if (!value) {
      setError("Enter a tracking number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`/track/${value}`);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Tracking number not found.");
      setResult(null);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="font-semibold text-slate-800 mb-5">Track Order</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <button onClick={lookupTracking} disabled={loading} className="bg-emerald-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
          {loading ? "Loading..." : "Track"}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 border border-slate-100 rounded-xl p-4">
            <div>
              <p className="text-xs text-slate-400">Tracking Number</p>
              <p className="font-semibold text-slate-800">{result.tracking_number}</p>
            </div>
            <StatusPill status={result.current_status} />
          </div>

          <div className="space-y-3">
            {result.history?.length ? (
              result.history.map((item, index) => (
                <div key={`${item.status}-${index}`} className="border-l-2 border-emerald-200 pl-4 ml-2 pb-2">
                  <p className="text-sm font-medium text-slate-700">{item.status?.replace(/_/g, " ")}</p>
                  <p className="text-xs text-slate-400">{item.location}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.remarks}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No tracking history yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "customer",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/users/me");
        setProfile({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "customer",
        });
      } catch (_) {
        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          setProfile({
            name: storedUser.name || "",
            email: storedUser.email || "",
            role: storedUser.role || "customer",
          });
        } catch {
          setProfile({ name: "", email: "", role: "customer" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      await axios.patch("/users/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err?.response?.data?.detail || "Could not update password.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-6">Profile</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading profile...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400">Full Name</p>
              <p className="text-sm font-medium text-slate-700">{profile.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm font-medium text-slate-700">{profile.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Role</p>
              <p className="text-sm font-medium text-slate-700 capitalize">{profile.role || "customer"}</p>
            </div>
          </div>
        )}
        <button onClick={() => { localStorage.clear(); navigate("/"); }} className="mt-6 bg-red-50 text-red-600 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-100 transition">Logout</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Update Password</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          {passwordError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{passwordSuccess}</p>}
          <button type="submit" className="bg-emerald-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition">Save Password</button>
        </form>
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Delivery update", message: "Your order ORD-1042 has been picked up.", time: "2m ago", read: false },
    { id: 2, title: "Payment reminder", message: "COD payment for order ORD-1038 is due today.", time: "18m ago", read: true },
    { id: 3, title: "New offer", message: "Enjoy 10% off on your next inter-city delivery.", time: "1d ago", read: false },
  ]);
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userDisplayName = storedUser.name || "Customer";

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={logout} />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-3 flex items-center justify-between">
          <div />
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
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-slate-700 font-medium">{userDisplayName}</span>
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
                      onClick={() => { setUserMenuOpen(false); navigate("/customer/profile"); }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      View profile
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
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

        <div className="px-8 py-7">
          <Routes>
            <Route path="/" element={<CustomerDashboardHome />} />
            <Route path="/create" element={<CustomerDashboardHome />} />
            <Route path="/orders" element={<CustomerOrdersPage />} />
            <Route path="/track" element={<TrackOrderPage />} />
            <Route path="/profile" element={<CustomerProfilePage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
