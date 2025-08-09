// src/pages/Layout.js
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { fetchUserSession } from "../services/homeService";
import { logoutUser } from "../services/authService";

export default function Layout() {
  const [name, setName] = useState("Loading…");
  const [plan, setPlan] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const user = await fetchUserSession();
        setName(user?.name || "Guest");

        // Always default to "Free Plan" if no plan is provided from backend
        setPlan(user?.plan || "Free Plan");

        setPhotoUrl(user?.photoUrl || "");
      } catch {
        setName("Guest");
        setPlan("Free Plan");
        setPhotoUrl("");
      }
    })();
  }, []);


  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    try {
      await logoutUser();
    } finally {
      navigate("/auth");
    }
  };


  const initial = String(name || "G").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="md:h-screen md:sticky md:top-0 border-r border-slate-200 bg-white">
            {/* Brand bar — Home Cook Assistant */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
              <div className="h-9 w-9 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold shadow-sm">
                H
              </div>
              <div className="leading-tight">
                <div className="text-[18px] font-extrabold tracking-tight text-slate-900">
                  Home Cook
                </div>
                <div className="text-[18px] font-extrabold tracking-tight text-slate-900">
                  Assistant
                </div>
              </div>
              <button
                className="ml-auto md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => window.history.back()}
                aria-label="Back"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>

            {/* Profile blurb — avatar navigates to Profile Management */}
            <div className="flex items-center gap-3 px-5 py-4">
              <button
                type="button"
                title="Open Profile Management"
                onClick={() => navigate("/profileManagement")}
                className="h-12 w-12 rounded-full ring-1 ring-slate-200 hover:ring-indigo-400 hover:shadow overflow-hidden grid place-items-center text-slate-700 font-semibold transition"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </button>
              <div className="min-w-0">
                <div className="font-medium text-slate-900 truncate">{name}</div>
                {plan && <div className="text-xs text-slate-500">{plan}</div>}
                <button
                  onClick={() => navigate("/profileManagement")}
                  className="mt-0.5 text-xs text-indigo-600 hover:underline"
                >
                  Manage profile
                </button>
              </div>
            </div>

            {/* Nav */}
            <nav className="px-2 pb-4">
              <ul className="space-y-1">
                <NavItem to="/profileManagement" label="Profile Management" icon={IconUser} />
                <NavItem to="/dashboard" label="Dashboard" icon={IconGrid} />
                <NavItem to="/grocery" label="Grocery" icon={IconCart} />
                <NavItem to="/feedback" label="Feedback" icon={IconChat} />
                <li className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 hover:bg-slate-50"
                  >
                    <IconLogout className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main */}
          <main className="min-h-screen">
            <div className="p-4 md:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- Nav item ---------- */
function NavItem({ to, label, icon: Icon }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            "flex items-center gap-3 rounded-xl px-4 py-2.5 transition",
            isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50",
          ].join(" ")
        }
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

/* ---------- Icons (inline, no deps) ---------- */
function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconCart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.6a2 2 0 002-1.6L21 8H7" />
    </svg>
  );
}
function IconChat(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z" />
    </svg>
  );
}
function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
