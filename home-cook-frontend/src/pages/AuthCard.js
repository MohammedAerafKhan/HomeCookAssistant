import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";
import { fetchUserSession } from "../services/homeService";

export default function AuthCard() {
  const navigate = useNavigate();

  // modal + flip state
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState("signup"); // 'signup' | 'signin'
  const [isFlipped, setIsFlipped] = useState(false);      // true => show Sign Up
  const [dest, setDest] = useState("/dashboard");

  // form
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // make the flip reflect the requested tab whenever modal opens
  useEffect(() => {
    setIsFlipped(initialTab === "signup");
  }, [initialTab, modalOpen]);

  const openModal = (tab = "signup", where = "/dashboard") => {
    setInitialTab(tab);
    setDest(where);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      if (isFlipped) {
        // Sign Up
        await registerUser(form);
      } else {
        // Sign In
        await loginUser({ email: form.email, password: form.password });
      }
      closeModal();
      const target = isFlipped ? "/quiz" : dest; // sign-up -> quiz, sign-in -> dest
      navigate(target);
    } catch (err) {
      switch (err?.code) {
        case "USER_NOT_FOUND":
          setError("User not found. Please sign up using the link below.");
          break;
        case "INVALID_PASSWORD":
          setError("Incorrect password. Please try again.");
          break;
        default:
          setError(err?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = async () => {
    try {
      const user = await fetchUserSession();
      if (user && (user.email || user.id)) {
        navigate("/quiz");
        return;
      }
    } catch {}
    openModal("signup", "/quiz");
  };

  const scrollToFeatures = () =>
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-50 to-white overflow-hidden">
      {/* shiny background */}
      <div aria-hidden className="pointer-events-none absolute -right-[15%] -top-10 h-[70vh] w-[80vw]
        bg-[radial-gradient(ellipse_at_center,theme(colors.indigo.300/.55),transparent_60%)]
        blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute right-1/4 top-32 h-[45vh] w-[50vw]
        bg-[radial-gradient(ellipse_at_center,theme(colors.sky.300/.45),transparent_60%)]
        blur-2xl" />

      {/* Nav */}
      <header className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold">H</div>
          <div className="text-lg font-semibold text-slate-900">Home Cook Assistant</div>
        </div>
        <nav className="ml-auto hidden md:flex items-center gap-6 text-slate-700">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-slate-900">Home</button>
          <button onClick={scrollToFeatures} className="hover:text-slate-900">Features</button>
          <a href="#contact" className="hover:text-slate-900">Contact</a>
          <button onClick={() => openModal("signin", "/dashboard")} className="px-3 py-1.5 rounded-xl hover:bg-slate-100">Sign In</button>
          <button onClick={() => openModal("signup","/quiz")} className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700">Sign Up</button>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100/60 px-3 py-1 text-sm text-indigo-700">
          <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block" /> Launching Soon
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Personalized <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">Meal Plans</span>
        </h1>
        <p className="mt-5 max-w-2xl text-xl text-slate-600">
          Discover delicious, nutritious, and personalized meal plans designed to fit your lifestyle, dietary needs, and cooking preferences.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <button onClick={handleTakeQuiz} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white font-medium shadow hover:bg-indigo-700">
            Take the Quiz
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
          <button onClick={scrollToFeatures} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-slate-800 hover:bg-slate-50">
            Learn More
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-4xl font-extrabold text-slate-900 text-center">Why Choose Home Cook Assistant?</h2>
        <p className="text-slate-600 text-center mt-2">Our personalized approach takes the guesswork out of meal planning</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card title="Personalized Plans" icon="ψ" color="indigo" desc="Suggestions tailored to your dietary preferences, restrictions, and goals." />
          <Card title="Diverse Recipes" icon="🍳" color="purple" desc="Explore cuisines and recipes that match your cooking skill level." />
          <Card title="Health‑Focused" icon="✓" color="emerald" desc="Balanced meals designed to support your overall wellness goals." />
        </div>
        <div className="mt-10 text-center">
          <button onClick={handleTakeQuiz} className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow hover:bg-indigo-700">
            Start Your Meal Plan
          </button>
        </div>
      </section>

      <div id="contact" className="h-10" />

      {/* ---- FLIP-CARD AUTH MODAL ---- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md relative">
              {/* Close */}
              <button onClick={closeModal} aria-label="Close"
                className="absolute -top-3 -right-3 z-10 rounded-full bg-white text-slate-700 shadow p-2 hover:bg-slate-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* 3D Flip container */}
              <div className="perspective h-[520px] w-full">
                <div className={`card-container ${isFlipped ? "is-flipped" : ""}`}>
                  {/* Sign In face */}
                  <div className="card-face">
                    <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-8 w-full h-full flex flex-col justify-center">
                      <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">Sign In</h2>
                      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                          type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required
                          className="p-3 rounded-md bg-white/95 border border-gray-300 placeholder-gray-500"
                        />
                        <input
                          type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required
                          className="p-3 rounded-md bg-white/95 border border-gray-300 placeholder-gray-500"
                        />
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        <button type="submit" disabled={loading}
                          className={`text-white py-3 rounded-md font-semibold transition shadow-md ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                          {loading ? "Signing in…" : "Login"}
                        </button>
                      </form>
                      <p className="mt-6 text-sm text-center text-slate-700">
                        Don&apos;t have an account?{" "}
                        <button className="text-indigo-700 font-semibold hover:underline" onClick={() => setIsFlipped(true)}>
                          Sign up
                        </button>
                      </p>
                    </div>
                  </div>

                  {/* Sign Up face */}
                  <div className="card-face card-back">
                    <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-8 w-full h-full flex flex-col justify-center">
                      <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">Sign Up</h2>
                      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                          name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required
                          className="p-3 rounded-md bg-white/95 border border-gray-300 placeholder-gray-500"
                        />
                        <input
                          name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required
                          className="p-3 rounded-md bg-white/95 border border-gray-300 placeholder-gray-500"
                        />
                        <input
                          name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required
                          className="p-3 rounded-md bg-white/95 border border-gray-300 placeholder-gray-500"
                        />
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        <button type="submit" disabled={loading}
                          className={`text-white py-3 rounded-md font-semibold transition ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                          {loading ? "Creating…" : "Create Account"}
                        </button>
                      </form>
                      <p className="mt-6 text-sm text-center text-slate-700">
                        Already have an account?{" "}
                        <button className="text-indigo-700 hover:underline" onClick={() => setIsFlipped(false)}>
                          Sign in
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* /flip */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* tiny presentational card */
function Card({ title, icon, color = "indigo", desc }) {
  const bg = {
    indigo: "bg-indigo-100 text-indigo-600",
    purple: "bg-purple-100 text-purple-600",
    emerald: "bg-emerald-100 text-emerald-600",
  }[color] || "bg-slate-100 text-slate-600";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`h-10 w-10 rounded-full grid place-items-center font-semibold mb-3 ${bg}`}>{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{desc}</p>
    </div>
  );
}
