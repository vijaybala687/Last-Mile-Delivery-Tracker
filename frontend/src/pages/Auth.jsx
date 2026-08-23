import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Package, MapPin } from "lucide-react";
import axios from "../api/client";

const TAB = { LOGIN: "login", REGISTER: "register" };

function decodeTokenPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(TAB.LOGIN);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
    name: "",
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === TAB.LOGIN) {
        const params = new URLSearchParams();
        params.append("username", form.email);
        params.append("password", form.password);
        const { data } = await axios.post("/users/login", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const token = data.access_token;
        const decoded = decodeTokenPayload(token);
        const role = (decoded.role || "customer").toLowerCase();
        const userProfile = {
          id: decoded.sub || null,
          email: form.email,
          name: decoded.name || form.email,
          role,
        };

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify(userProfile));

        if (role === "admin") navigate("/admin");
        else if (role === "agent") navigate("/agent");
        else navigate("/customer");
      } else {
        const normalizedRole = String(form.role || "customer").toUpperCase();
        await axios.post("/users/register", {
          email: form.email,
          password: form.password,
          role: normalizedRole,
          name: form.name,
        });
        setTab(TAB.LOGIN);
        setError("Registered! Please log in.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-stretch bg-slate-50">
      {/* ── Left Hero ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-slate-50 px-10 xl:px-16 py-10 relative overflow-hidden"
      >
        {/* decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-50" />
        <div className="absolute top-20 -right-20 w-64 h-64 rounded-full bg-emerald-100/50" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-800 leading-none">Last-Mile</div>
              <div className="text-xs text-slate-500">Delivery Tracker</div>
            </div>
          </div>

          {/* Hero illustration placeholder */}
          <div className="mb-10 flex justify-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="relative"
            >
              {/* Truck SVG */}
              <svg width="280" height="160" viewBox="0 0 280 160" fill="none">
                {/* road */}
                <rect x="0" y="130" width="280" height="6" rx="3" fill="#e2e8f0" />
                {/* truck body */}
                <rect x="40" y="70" width="140" height="65" rx="8" fill="#334155" />
                {/* truck cab */}
                <rect x="170" y="85" width="65" height="50" rx="6" fill="#475569" />
                {/* windshield */}
                <rect x="178" y="92" width="40" height="28" rx="4" fill="#7dd3fc" opacity="0.7" />
                {/* wheels */}
                <circle cx="80" cy="135" r="16" fill="#1e293b" />
                <circle cx="80" cy="135" r="8" fill="#64748b" />
                <circle cx="190" cy="135" r="16" fill="#1e293b" />
                <circle cx="190" cy="135" r="8" fill="#64748b" />
                {/* stripe */}
                <rect x="40" y="100" width="130" height="6" rx="3" fill="#10b981" />
              </svg>
              {/* pin */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-4 right-6"
              >
                <MapPin className="w-10 h-10 text-emerald-500 drop-shadow-md" />
              </motion.div>
            </motion.div>
          </div>

          <h1 className="text-4xl font-black text-slate-800 leading-tight mb-3">
            Smart Delivery.<br />
            <span className="text-emerald-600">Every Mile.</span>
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-xs">
            Track, manage, and deliver with confidence. Built for speed,
            reliability, and transparency.
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          © 2024 Last-Mile Delivery Tracker. All rights reserved.
        </p>
      </motion.div>

      {/* ── Right Form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-5 sm:px-8 lg:px-10 xl:px-14 py-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-lg"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-800 leading-none">Last-Mile</div>
              <div className="text-xs text-slate-500">Delivery Tracker</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-8">
            {[TAB.LOGIN, TAB.REGISTER].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 pb-3 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? "border-b-2 border-emerald-600 text-emerald-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {tab === TAB.REGISTER && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm text-slate-600 mb-1">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {tab === TAB.REGISTER && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm text-slate-600 mb-1">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white appearance-none"
                    required={tab === TAB.REGISTER}
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm px-3 py-2 rounded-lg ${
                  error.startsWith("Registered")
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 font-semibold text-sm mt-2 hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {loading ? "Please wait…" : tab === TAB.LOGIN ? "Login" : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {tab === TAB.LOGIN ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setTab(TAB.REGISTER)}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setTab(TAB.LOGIN)}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}