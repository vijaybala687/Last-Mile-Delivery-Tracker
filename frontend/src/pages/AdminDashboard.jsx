import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MapPin, CreditCard, ClipboardList,
  User, LogOut, Package, Bell, ChevronDown,
  Download, Filter, RefreshCw,
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
  { label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
  { label: "Zones",     icon: MapPin,          section: "zones" },
  { label: "Rate Cards",icon: CreditCard,      section: "ratecards" },
  { label: "All Orders",icon: ClipboardList,   section: "orders" },
  { label: "Profile",   icon: User,            section: "profile" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New order assigned", message: "3 shipments require agent attention today.", time: "5m ago", read: false },
    { id: 2, title: "Rate card changed", message: "B2C intra-city tariff was updated.", time: "1h ago", read: true },
    { id: 3, title: "Zone created", message: "North Hub zone has been added successfully.", time: "Today", read: false },
  ]);
  const [profile, setProfile] = useState({ name: "", email: "", role: "ADMIN" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/users/me");
        setProfile({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "ADMIN",
        });
      } catch (_) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setProfile({
          name: storedUser.name || "",
          email: storedUser.email || "",
          role: storedUser.role || "ADMIN",
        });
      }
    };

    fetchProfile();
  }, []);

  // ── Zone form ──
  const [zoneForm, setZoneForm] = useState({ zone_name: "", zone_type: "", base_city: "" });
  const [zoneMsg, setZoneMsg] = useState("");

  // ── Rate card form ──
  const [rcForm, setRcForm] = useState({
    zone: "", rate_type: "", customer_type: "",
    base_charge: "", per_kg_charge: "", cod_surcharge: "",
  });
  const [zones, setZones]   = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [editingRateCard, setEditingRateCard] = useState(null);
  const [rcMsg, setRcMsg]   = useState("");

  // ── All Orders ──
  const [orders, setOrders]         = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [zoneFilter, setZoneFilter]   = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => { fetchZones(); fetchRateCards(); fetchOrders(); }, []);

  const fetchZones = async () => {
    try {
      const { data } = await axios.get("/admin/zones");
      const normalized = (data || []).map((z) => ({
        ...z,
        id: z.id,
        zone_name: z.zone_name ?? z.name,
        zone_type: z.zone_type ?? "",
        base_city: z.base_city ?? "",
      }));
      setZones(normalized);
    } catch (err) {
      try {
        const { data } = await axios.get("/zones");
        const normalized = (data || []).map((z) => ({
          ...z,
          id: z.id,
          zone_name: z.zone_name ?? z.name,
          zone_type: z.zone_type ?? "",
          base_city: z.base_city ?? "",
        }));
        setZones(normalized);
      } catch (_) {}
    }
  };

  const fetchRateCards = async () => {
    try {
      const { data } = await axios.get("/admin/rate-cards");
      setRateCards(data || []);
    } catch (_) {
      setRateCards([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (zoneFilter)   params.zone   = zoneFilter;
      const { data } = await axios.get("/orders", { params });
      setOrders(data);
    } catch (_) {}
  };

  const handleZoneChange  = (e) => setZoneForm((f)  => ({ ...f, [e.target.name]: e.target.value }));
  const handleRcChange    = (e) => setRcForm((f)    => ({ ...f, [e.target.name]: e.target.value }));

  const createZone = async () => {
    setZoneMsg("");
    const name = zoneForm.zone_name?.trim();
    if (!name) {
      setZoneMsg("Zone name is required.");
      return;
    }

    try {
      const payload = {
        name,
        areas: zoneForm.base_city ? [{ name: zoneForm.base_city.trim() }] : [],
      };
      await axios.post("/admin/zones", payload);
      setZoneMsg("Zone created!");
      setZoneForm({ zone_name:"", zone_type:"", base_city:"" });
      fetchZones();
    } catch (err) {
      try {
        const fallbackPayload = {
          name,
          areas: zoneForm.base_city ? [{ name: zoneForm.base_city.trim() }] : [],
        };
        await axios.post("/zones", fallbackPayload);
        setZoneMsg("Zone created!");
        setZoneForm({ zone_name:"", zone_type:"", base_city:"" });
        fetchZones();
      } catch (fallbackErr) {
        setZoneMsg(fallbackErr?.response?.data?.detail || err?.response?.data?.detail || "Failed to create zone.");
      }
    }
  };

  const createRateCard = async () => {
    setRcMsg("");
    const payload = {
      order_type: rcForm.customer_type || "B2C",
      intra_zone_rate: Number(rcForm.base_charge || 0),
      inter_zone_rate: Number(rcForm.per_kg_charge || 0),
      cod_surcharge: Number(rcForm.cod_surcharge || 0),
    };

    try {
      if (editingRateCard) {
        await axios.put(`/admin/rate-cards/${editingRateCard}`, {
          intra_zone_rate: payload.intra_zone_rate,
          inter_zone_rate: payload.inter_zone_rate,
          cod_surcharge: payload.cod_surcharge,
        });
        setRcMsg("Rate card updated!");
      } else {
        await axios.post("/admin/rate-cards", payload);
        setRcMsg("Rate card created!");
      }
      setEditingRateCard(null);
      setRcForm({ zone:"", rate_type:"", customer_type:"", base_charge:"", per_kg_charge:"", cod_surcharge:"" });
      fetchRateCards();
    } catch (err) {
      try {
        if (editingRateCard) {
          await axios.put(`/rate-cards/${editingRateCard}`, {
            intra_zone_rate: payload.intra_zone_rate,
            inter_zone_rate: payload.inter_zone_rate,
            cod_surcharge: payload.cod_surcharge,
          });
          setRcMsg("Rate card updated!");
        } else {
          await axios.post("/rate-cards", payload);
          setRcMsg("Rate card created!");
        }
        setEditingRateCard(null);
        setRcForm({ zone:"", rate_type:"", customer_type:"", base_charge:"", per_kg_charge:"", cod_surcharge:"" });
        fetchRateCards();
      } catch (fallbackErr) {
        setRcMsg(fallbackErr?.response?.data?.detail || err?.response?.data?.detail || "Failed to create rate card.");
      }
    }
  };

  const startEditRateCard = (card) => {
    const orderType = card.order_type ?? card.customer_type ?? "B2C";
    setEditingRateCard(orderType);
    setRcForm({
      zone: "",
      rate_type: "",
      customer_type: orderType,
      base_charge: String(card.intra_zone_rate ?? 0),
      per_kg_charge: String(card.inter_zone_rate ?? 0),
      cod_surcharge: String(card.cod_surcharge ?? 0),
    });
    setRcMsg("Editing rate card for " + orderType);
  };

  const updateOrderStatus = async (orderId, status) => {
    setStatusMsg("");
    try {
      await axios.patch(`/orders/${orderId}/status`, {
        status,
        location: "Admin",
        remarks: `Status updated to ${status} by admin.`,
      });
      setStatusMsg(`Status updated to ${status}.`);
      fetchOrders();
    } catch (err) {
      try {
        await axios.put(`/orders/${orderId}/status`, {
          status,
          location: "Admin",
          remarks: `Status updated to ${status} by admin.`,
        });
        setStatusMsg(`Status updated to ${status}.`);
        fetchOrders();
      } catch (fallbackErr) {
        setStatusMsg(fallbackErr?.response?.data?.detail || err?.response?.data?.detail || "Could not update order status.");
      }
    }
  };

  const autoAssign = async (orderId) => {
    try { await axios.post(`/orders/${orderId}/auto-assign`); fetchOrders(); }
    catch (_) {}
  };

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Dark Sidebar ── */}
      <aside className="w-56 shrink-0 flex flex-col bg-slate-900 h-screen sticky top-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
          <div className="p-1.5 bg-emerald-500 rounded-lg">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-none">Last-Mile</div>
            <div className="text-xs text-slate-400">Delivery Tracker</div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          <p className="text-xs text-slate-500 font-medium px-3 mb-3 uppercase tracking-wider">Manage</p>
          {NAV.filter(n => ["Dashboard","Zones","Rate Cards","All Orders"].includes(n.label)).map(({ label, icon: Icon, section }) => (
            <button
              key={label}
              onClick={() => section && setActiveSection(section)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeSection === section
                  ? "bg-emerald-600 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          <p className="text-xs text-slate-500 font-medium px-3 mb-3 mt-6 uppercase tracking-wider">Account</p>
          {NAV.filter(n => ["Profile"].includes(n.label)).map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveSection("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                activeSection === "profile"
                  ? "bg-emerald-600 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-sm text-slate-400 hover:text-red-400 border-t border-slate-800 transition-colors"
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
            <h1 className="font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Manage zones, rate cards and monitor all orders.</p>
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
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
                  {(profile.name || "Admin").charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-slate-700 font-medium">{profile.name || "Admin"}</span>
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
                      onClick={() => { setUserMenuOpen(false); setActiveSection("profile"); }}
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

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="px-8 py-7"
        >
          {/* ── Section Tabs ── */}
          <div className="flex gap-1 mb-8 border-b border-slate-200">
            {[ ["dashboard","Dashboard"],["zones","Zones"],["ratecards","Rate Cards"],["orders","All Orders"],["profile","Profile"] ].map(([s, label]) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === s
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeSection === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: "Total Orders", value: orders.length, tone: "bg-emerald-50 text-emerald-700" },
                    { label: "Pending", value: orders.filter((o) => (o.status || "").toUpperCase() === "PENDING").length, tone: "bg-amber-50 text-amber-700" },
                    { label: "Delivered", value: orders.filter((o) => (o.status || "").toUpperCase() === "DELIVERED").length, tone: "bg-blue-50 text-blue-700" },
                    { label: "Zones", value: zones.length, tone: "bg-violet-50 text-violet-700" },
                  ].map((card) => (
                    <div key={card.label} className={`${card.tone} rounded-2xl border border-slate-100 p-5`}>
                      <p className="text-xs uppercase tracking-wide font-semibold opacity-75">{card.label}</p>
                      <p className="mt-3 text-3xl font-bold text-slate-800">{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-semibold text-slate-800 mb-4">System Overview</h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Rate cards</span>
                        <span className="font-medium text-slate-800">{rateCards.length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">In transit</span>
                        <span className="font-medium text-slate-800">{orders.filter((o) => (o.status || "").toUpperCase() === "IN_TRANSIT").length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Out for delivery</span>
                        <span className="font-medium text-slate-800">{orders.filter((o) => (o.status || "").toUpperCase() === "OUT_FOR_DELIVERY").length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-500">Failed</span>
                        <span className="font-medium text-slate-800">{orders.filter((o) => (o.status || "").toUpperCase() === "FAILED").length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                      <button onClick={() => setActiveSection("zones")} className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">Create a new delivery zone</button>
                      <button onClick={() => setActiveSection("ratecards")} className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">Manage rate cards</button>
                      <button onClick={() => setActiveSection("orders")} className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">Review incoming orders</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Zones Section ── */}
            {activeSection === "zones" && (
              <motion.div key="zones" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-md">
                  <h2 className="font-semibold text-slate-800 mb-5">Create Zone</h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Zone Name</label>
                        <input name="zone_name" value={zoneForm.zone_name} onChange={handleZoneChange}
                          placeholder="Enter zone name"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Zone Type</label>
                        <select name="zone_type" value={zoneForm.zone_type} onChange={handleZoneChange}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          <option value="">Select type</option>
                          <option value="Intra City">Intra City</option>
                          <option value="Inter City">Inter City</option>
                          <option value="North">North</option>
                          <option value="South">South</option>
                          <option value="East">East</option>
                          <option value="West">West</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Base City</label>
                      <input name="base_city" value={zoneForm.base_city} onChange={handleZoneChange}
                        placeholder="Enter base city"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    {zoneMsg && (
                      <p className={`text-xs px-3 py-2 rounded-lg ${zoneMsg.includes("!") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{zoneMsg}</p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={createZone}
                      className="w-full bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-emerald-700 transition"
                    >
                      Create Zone
                    </motion.button>
                  </div>
                </div>

                {zones.length > 0 && (
                  <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-semibold text-slate-800 mb-4">Existing Zones</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {zones.map((z) => (
                        <div key={z.id} className="border border-slate-100 rounded-xl px-4 py-3 bg-slate-50">
                          <p className="font-medium text-slate-800 text-sm">{z.zone_name}</p>
                          <p className="text-xs text-slate-400">{z.zone_type} · {z.base_city}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Rate Cards Section ── */}
            {activeSection === "ratecards" && (
              <motion.div key="rc" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-xl">
                  <h2 className="font-semibold text-slate-800 mb-5">{editingRateCard ? "Update Rate Card" : "Create Rate Card"}</h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Zone</label>
                        <select name="zone" value={rcForm.zone} onChange={handleRcChange}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          <option value="">Select zone</option>
                          {zones.map((z) => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Rate Type</label>
                        <select name="rate_type" value={rcForm.rate_type} onChange={handleRcChange}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          <option value="">Intra City</option>
                          <option value="Intra City">Intra City</option>
                          <option value="Inter City">Inter City</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Customer Type</label>
                        <select name="customer_type" value={rcForm.customer_type} onChange={handleRcChange}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          <option value="">B2C</option>
                          <option value="B2C">B2C</option>
                          <option value="B2B">B2B</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ["base_charge",    "Base Charge (₹)"],
                        ["per_kg_charge",  "Per Kg Charge (₹)"],
                        ["cod_surcharge",  "COD Surcharge (₹)"],
                      ].map(([name, label]) => (
                        <div key={name}>
                          <label className="block text-xs text-slate-500 mb-1">{label}</label>
                          <input name={name} value={rcForm[name]} onChange={handleRcChange} type="number" placeholder="0.00"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                      ))}
                    </div>
                    {rcMsg && (
                      <p className={`text-xs px-3 py-2 rounded-lg ${rcMsg.includes("!") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{rcMsg}</p>
                    )}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={createRateCard}
                        className="flex-1 bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-emerald-700 transition"
                      >
                        {editingRateCard ? "Update Rate Card" : "Create Rate Card"}
                      </motion.button>
                      {editingRateCard && (
                        <button
                          onClick={() => {
                            setEditingRateCard(null);
                            setRcForm({ zone:"", rate_type:"", customer_type:"", base_charge:"", per_kg_charge:"", cod_surcharge:"" });
                            setRcMsg("");
                          }}
                          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {rateCards.length > 0 && (
                  <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="font-semibold text-slate-800 mb-4">Existing Rate Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rateCards.map((card) => (
                        <div key={card.order_type} className="border border-slate-100 rounded-xl px-4 py-3 bg-slate-50 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{card.order_type}</p>
                            <p className="text-xs text-slate-500">Base {card.intra_zone_rate} · Per Kg {card.inter_zone_rate} · COD {card.cod_surcharge}</p>
                          </div>
                          <button
                            onClick={() => startEditRateCard(card)}
                            className="text-xs text-emerald-600 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── All Orders Section ── */}
            {activeSection === "orders" && (
              <motion.div key="orders" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                  {/* Filters */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
                    {statusMsg && (
                      <div className="w-full rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2">
                        {statusMsg}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>Status</span>
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">All Status</option>
                        {["PENDING","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED","FAILED"].map(s => (
                          <option key={s} value={s}>{s.replace(/_/g," ")}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>Zone</span>
                      <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">All Zones</option>
                        {zones.map((z) => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
                      </select>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={fetchOrders}
                      className="flex items-center gap-2 bg-emerald-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-emerald-700 transition">
                      <Filter className="w-3.5 h-3.5" />Filter
                    </motion.button>
                    <button onClick={() => { setStatusFilter(""); setZoneFilter(""); fetchOrders(); }}
                      className="text-sm text-slate-400 hover:text-slate-600 transition">Reset</button>
                    <div className="ml-auto">
                      <button className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition">
                        <Download className="w-3.5 h-3.5" />Export
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-400 border-b border-slate-100">
                          {["Order ID","Customer","Pickup","Drop","Zone","Status","Amount (₹)","Actions"].map(h => (
                            <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-xs">
                              No orders found. Adjust filters or check back later.
                            </td>
                          </tr>
                        ) : (
                          orders.map((o) => (
                            <motion.tr key={o.id} variants={rowVariants}
                              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-3 font-medium text-slate-800 text-xs">{o.order_id || o.id}</td>
                              <td className="px-6 py-3 text-slate-500 text-xs">{o.customer_email || o.customer}</td>
                              <td className="px-6 py-3 text-slate-500 text-xs max-w-[120px] truncate">{o.pickup_address}</td>
                              <td className="px-6 py-3 text-slate-500 text-xs max-w-[120px] truncate">{o.drop_address}</td>
                              <td className="px-6 py-3 text-slate-500 text-xs">{o.zone || "—"}</td>
                              <td className="px-6 py-3"><StatusPill status={o.status} /></td>
                              <td className="px-6 py-3 text-slate-700 font-medium text-xs">{o.charge ?? "—"}</td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={o.status}
                                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                    className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  >
                                    {[
                                      "PENDING",
                                      "PICKED_UP",
                                      "IN_TRANSIT",
                                      "OUT_FOR_DELIVERY",
                                      "DELIVERED",
                                      "FAILED",
                                    ].map((status) => (
                                      <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                                    ))}
                                  </select>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => autoAssign(o.id)}
                                    className="text-xs text-emerald-600 border border-emerald-200 rounded-lg px-2.5 py-1 hover:bg-emerald-50 transition font-medium"
                                  >
                                    Auto-Assign
                                  </motion.button>
                                  <button className="text-xs text-slate-500 hover:text-slate-700 transition font-medium">View</button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </motion.tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === "profile" && (
              <motion.div key="profile" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-semibold text-slate-800 mb-6">Admin Profile</h2>
                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span>Full Name</span>
                      <span className="font-medium text-slate-800">{profile.name || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span>Email</span>
                      <span className="font-medium text-slate-800">{profile.email || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span>Role</span>
                      <span className="font-medium text-slate-800 capitalize">{(profile.role || "ADMIN").toLowerCase()}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span>Status</span>
                      <span className="font-medium text-emerald-600">Online</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Update Password</h3>
                  <PasswordForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}