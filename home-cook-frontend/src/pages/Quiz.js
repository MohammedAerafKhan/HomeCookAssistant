// src/pages/Quiz.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitQuiz, logoutUser } from "../services/authService";

/* ---------- right column content that changes by step ---------- */
function SidePanel({ step }) {
  const content = {
    1: {
      tag: "Step 1",
      icon: "🧍",
      title: "Let’s get to know you",
      body:
        "Use the sliders and quick picks. Your answers help us set calories and portion sizes that fit your lifestyle.",
      tips: ["Height, weight & age", "Why you’re joining", "Gender"],
      blobFrom: "from-indigo-300/40",
      blobTo: "to-sky-300/30",
    },
    2: {
      tag: "Step 2",
      icon: "🥗",
      title: "Choose your meal style",
      body:
        "Vegan, vegetarian, or balanced — pick what matches your preference. You can always change it later.",
      tips: ["Pick one primary style", "You’ll still get variety"],
      blobFrom: "from-emerald-300/40",
      blobTo: "to-teal-300/30",
    },
    3: {
      tag: "Step 3",
      icon: "👩‍🍳",
      title: "Match to your skill level",
      body:
        "We’ll send recipes that feel easy, not stressful. From basics to chef‑level — you decide.",
      tips: ["Basic / Intermediate / Expert", "Meals per day"],
      blobFrom: "from-fuchsia-300/40",
      blobTo: "to-purple-300/30",
    },
    4: {
      tag: "Step 4",
      icon: "⚠️",
      title: "Dietary restrictions",
      body:
        "Tell us any allergies or ingredients to avoid so your plan stays safe and on‑track.",
      tips: ["Nuts, gluten, dairy, soy, eggs…"],
      blobFrom: "from-amber-300/40",
      blobTo: "to-rose-300/30",
    },
    5: {
      tag: "Step 5",
      icon: "✅",
      title: "Almost done!",
      body:
        "Pick your favorite cuisines and hit Submit — we’ll generate your personalized plan.",
      tips: ["Indian, Italian, Thai…", "You can edit later"],
      blobFrom: "from-indigo-300/40",
      blobTo: "to-blue-300/30",
    },
  }[step];

  return (
    <aside className="hidden lg:block lg:sticky lg:top-24">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div
          aria-hidden
          className={`absolute -right-10 -top-10 h-56 w-56 blur-2xl rounded-full bg-gradient-to-br ${content.blobFrom} ${content.blobTo}`}
        />
        <div className="p-8 relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-100/70 px-3 py-1 rounded-full">
            {content.tag}
          </span>

          <div className="mt-5 mb-2 text-5xl leading-none">{content.icon}</div>
          <h3 className="text-2xl font-bold text-slate-900">{content.title}</h3>
          <p className="mt-3 text-slate-600">{content.body}</p>

          <ul className="mt-6 space-y-2">
            {content.tips?.map((t) => (
              <li key={t} className="flex items-start gap-2 text-slate-700">
                <svg
                  className="mt-1 h-4 w-4 text-emerald-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

/* =============================== MAIN PAGE =============================== */
export default function Quiz() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } finally {
      navigate("/auth");
    }
  };

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    gender: "",
    height: 165,
    weight: 60,
    age: 25,
    reason: "",
    mealType: "",
    skillLevel: "",
    mealsPerDay: [],
    restrictions: [],
    cuisine: [],
  });

  // Reason presets (single-select)
  const PRESET_REASONS = [
    "Lose weight",
    "Gain muscle",
    "Eat healthier",
    "Save time with planning",
    "Learn cooking basics",
    "Reduce food waste",
    "Manage budget",
    "Other",
  ];

  // free-text for "Other" restriction
  const [otherRestriction, setOtherRestriction] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" || type === "range" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (name, value) => {
    setForm((prev) => {
      const next = new Set(prev[name]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [name]: [...next] };
    });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      const reasonString = String(form.reason ?? "").trim();

      // Merge "__other__" with its text; keep contract: restrictions: string[]
      const base = form.restrictions.filter((r) => r !== "__other__");
      const cleanedOther = (otherRestriction || "").trim();
      const restrictions = cleanedOther ? [...base, `other:${cleanedOther}`] : base;

      const payload = { quizData: { ...form, reason: reasonString, restrictions } };
      await submitQuiz(payload);
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Quiz submission error:", err?.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center">
          <div className="flex items-center gap-3 select-none">
            <div className="h-9 w-9 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold shadow-sm">
              H
            </div>
            <div className="text-base sm:text-lg font-semibold text-slate-900">
              Home Cook Assistant
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <a
              href="mailto:support@homecookassistant.com"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Need help?
            </a>
            <button
              onClick={handleSignOut}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* soft decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-24 h-[40vh] w-[45vw]
                   bg-[radial-gradient(ellipse_at_center,theme(colors.indigo.300/.28),transparent_60%)]
                   blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-[45vh] w-[50vw]
                   bg-[radial-gradient(ellipse_at_center,theme(colors.sky.300/.25),transparent_60%)]
                   blur-2xl"
      />

      {/* =================== TWO-COLUMN LAYOUT =================== */}
      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* LEFT: Quiz card */}
        <div className="order-2 lg:order-1">
          <div
            className="bg-white shadow-2xl rounded-3xl w-full max-w-lg
                       transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                       h-[760px] flex flex-col overflow-hidden relative z-10"
          >
            {/* Card header */}
            <div className="p-8 pb-4 flex-none h-[180px]">
              <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
                Personalized Meal Plan
                <br />
                Quiz
              </h2>

              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                    STEP {step} OF 5
                  </span>
                  <span className="text-xs font-bold text-indigo-700">
                    {step * 20}%
                  </span>
                </div>

                <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${step * 20}%` }}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-semibold ${
                        s === step
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "text-gray-400 border-gray-300"
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="px-8 pt-14 pb-4 flex-1 min-h-0 overflow-y-auto">
              {/* --- STEP 1 --- */}
              {step === 1 && (
                <>
                  <h3 className="text-lg font-semibold mb-6">Personal Details</h3>

                  {/* Height */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-1 text-sm font-medium text-gray-800">
                      <span>📏 Height (cm)</span>
                      <span className="text-indigo-600 font-semibold">
                        {form.height} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      name="height"
                      min={50}
                      max={250}
                      value={form.height}
                      onChange={handleChange}
                      className="w-full h-2 bg-indigo-200 rounded-lg cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Weight */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-1 text-sm font-medium text-gray-800">
                      <span>🏋️‍♀️ Weight (kg)</span>
                      <span className="text-indigo-600 font-semibold">
                        {form.weight} kg
                      </span>
                    </div>
                    <input
                      type="range"
                      name="weight"
                      min={20}
                      max={200}
                      value={form.weight}
                      onChange={handleChange}
                      className="w-full h-2 bg-indigo-200 rounded-lg cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Age */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-1 text-sm font-medium text-gray-800">
                      <span>📅 Age</span>
                      <span className="text-indigo-600 font-semibold">
                        {form.age} years
                      </span>
                    </div>
                    <input
                      type="range"
                      name="age"
                      min={5}
                      max={90}
                      value={form.age}
                      onChange={handleChange}
                      className="w-full h-2 bg-indigo-200 rounded-lg cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Gender */}
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <div className="flex gap-4">
                      {["male", "female"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, gender: g })}
                          className={`flex-1 border rounded-2xl p-2 text-center text-md font-medium transition-all ${
                            form.gender === g
                              ? g === "male"
                                ? "bg-blue-100 border-blue-500 scale-105"
                                : "bg-pink-100 border-pink-500 scale-105"
                              : "bg-white border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason chips */}
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Why are you joining?
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PRESET_REASONS.map((label) => {
                        const isCustomText =
                          form.reason && !PRESET_REASONS.includes(form.reason);
                        const active =
                          form.reason === label || (label === "Other" && isCustomText);

                        const theme = {
                          "Lose weight":             { bg: "bg-rose-50",    border: "border-rose-200",    ring: "ring-2 ring-rose-400",    activeBorder: "border-rose-400" },
                          "Gain muscle":             { bg: "bg-green-50",   border: "border-green-200",   ring: "ring-2 ring-green-400",   activeBorder: "border-green-400" },
                          "Eat healthier":           { bg: "bg-yellow-50",  border: "border-yellow-200",  ring: "ring-2 ring-yellow-400",  activeBorder: "border-yellow-400" },
                          "Save time with planning": { bg: "bg-blue-50",    border: "border-blue-200",    ring: "ring-2 ring-blue-400",    activeBorder: "border-blue-400" },
                          "Learn cooking basics":    { bg: "bg-purple-50",  border: "border-purple-200",  ring: "ring-2 ring-purple-400",  activeBorder: "border-purple-400" },
                          "Reduce food waste":       { bg: "bg-amber-50",   border: "border-amber-200",   ring: "ring-2 ring-amber-400",   activeBorder: "border-amber-400" },
                          "Manage budget":           { bg: "bg-teal-50",    border: "border-teal-200",    ring: "ring-2 ring-teal-400",    activeBorder: "border-teal-400" },
                          "Other":                   { bg: "bg-gray-50",    border: "border-gray-200",    ring: "ring-2 ring-gray-400",    activeBorder: "border-gray-400" },
                        }[label];

                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                reason: label === "Other" ? "Other" : label,
                              }))
                            }
                            className={[
                              "p-3 rounded-xl text-left select-none transition-all",
                              "focus:outline-none focus:ring-0 ring-offset-0",
                              active
                                ? `bg-white ${theme.ring} ${theme.activeBorder} border shadow-sm scale-[1.02]`
                                : `${theme.bg} ${theme.border} border hover:bg-white hover:scale-[1.01]`,
                            ].join(" ")}
                          >
                            <span className="font-medium">{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {(form.reason === "Other" ||
                      (form.reason && !PRESET_REASONS.includes(form.reason))) && (
                      <div className="mt-3">
                        <label className="block mb-2 text-sm text-gray-600">
                          Tell us a bit more (optional)
                        </label>
                        <textarea
                          name="reason"
                          placeholder="Enter your reason..."
                          value={["Other"].includes(form.reason) ? "" : form.reason}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, reason: e.target.value }))
                          }
                          className="w-full p-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-indigo-400"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* --- STEP 2: Meal Preferences (more options, same styling) --- */}
              {step === 2 && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Meal Preferences</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Select your preferred meal type:
                  </p>

                  {[
                    { label: "Vegan",          value: "vegan",          description: "Plant-based foods only, no animal products",    color: "bg-green-50 border-green-200",       ring: "ring-2 ring-green-400" },
                    { label: "Vegetarian",     value: "vegetarian",     description: "Plant foods with dairy and eggs, no meat",      color: "bg-teal-50 border-teal-200",         ring: "ring-2 ring-teal-400" },
                    { label: "Balanced",       value: "balanced",       description: "A mix of all food groups in moderation",        color: "bg-indigo-50 border-indigo-200",     ring: "ring-2 ring-indigo-400" },
                    { label: "Mediterranean",  value: "mediterranean",  description: "Veggies, legumes, whole grains, olive oil",     color: "bg-purple-50 border-purple-200",     ring: "ring-2 ring-purple-400" },
                    { label: "Low‑carb",       value: "low-carb",       description: "Lower carbs, higher protein & fats",            color: "bg-amber-50 border-amber-200",       ring: "ring-2 ring-amber-400" },
                    { label: "High‑protein",   value: "high-protein",   description: "Protein-forward meals for muscle/fitness",      color: "bg-blue-50 border-blue-200",         ring: "ring-2 ring-blue-400" },
                    { label: "Keto",           value: "keto",           description: "Very low carb, high fat, moderate protein",     color: "bg-rose-50 border-rose-200",         ring: "ring-2 ring-rose-400" },
                    { label: "Paleo",          value: "paleo",          description: "Whole foods, no grains, legumes, or dairy",     color: "bg-lime-50 border-lime-200",         ring: "ring-2 ring-lime-400" },
                  ].map((option) => {
                    const active = form.mealType === option.value;
                    return (
                      <div
                        key={option.value}
                        role="button"
                        tabIndex={0}
                        onClick={() => setForm({ ...form, mealType: option.value })}
                        onKeyDown={(e) =>
                          (e.key === "Enter" || e.key === " ") &&
                          setForm({ ...form, mealType: option.value })
                        }
                        className={`mb-4 p-4 border rounded-xl cursor-pointer transition-all select-none ${
                          active
                            ? `${option.ring} bg-white scale-[1.02]`
                            : `${option.color} hover:bg-white hover:scale-[1.01]`
                        }`}
                      >
                        <h4 className="font-semibold text-gray-800">{option.label}</h4>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    );
                  })}
                </>
              )}

              {/* --- STEP 3 --- */}
              {step === 3 && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Cooking Experience</h3>

                  <p className="text-sm text-gray-600 mb-3">Cooking Skill Level:</p>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "Basic",        value: "basic",        color: "bg-green-50 border-green-200",  ring: "ring-2 ring-green-400" },
                      { label: "Intermediate", value: "intermediate", color: "bg-yellow-50 border-yellow-200", ring: "ring-2 ring-yellow-400" },
                      { label: "Expert",       value: "expert",       color: "bg-red-50 border-red-200",       ring: "ring-2 ring-red-400" },
                    ].map(({ label, value, color, ring }) => {
                      const active = form.skillLevel === value;
                      return (
                        <div
                          key={value}
                          role="button"
                          tabIndex={0}
                          onClick={() => setForm({ ...form, skillLevel: value })}
                          onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") &&
                            setForm({ ...form, skillLevel: value })
                          }
                          className={`p-3 border rounded-xl text-center cursor-pointer font-medium transition-all select-none ${
                            active ? `bg-white ${ring} scale-[1.03]` : `${color} hover:bg-white hover:scale-[1.02]`
                          }`}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>

                  <label className="block text-sm text-gray-600 mb-2">
                    Meals per Day:
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "Breakfast", color: "bg-green-50 border-green-200", ring: "ring-2 ring-green-400" },
                      { label: "Lunch",     color: "bg-yellow-50 border-yellow-200", ring: "ring-2 ring-yellow-400" },
                      { label: "Dinner",    color: "bg-red-50 border-red-200",    ring: "ring-2 ring-red-400" },
                    ].map(({ label, color, ring }) => {
                      const active = form.mealsPerDay.includes(label);
                      return (
                        <div
                          key={label}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleCheckboxChange("mealsPerDay", label)}
                          onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") &&
                            handleCheckboxChange("mealsPerDay", label)
                          }
                          className={`p-3 border rounded-xl text-center cursor-pointer font-medium transition-all select-none ${
                            active ? `bg-white ${ring} scale-[1.03]` : `${color} hover:bg-white hover:scale-[1.02]`
                          }`}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* --- STEP 4: Dietary Preferences (more + Other) --- */}
              {step === 4 && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Dietary Preferences</h3>
                  <label className="block text-sm text-gray-600 mb-2">
                    Select any dietary restrictions or allergens:
                  </label>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: "nuts",          color: "bg-red-50 border-red-200",         ring: "ring-2 ring-red-400" },
                      { label: "gluten",        color: "bg-yellow-50 border-yellow-200",   ring: "ring-2 ring-yellow-400" },
                      { label: "dairy",         color: "bg-blue-50 border-blue-200",       ring: "ring-2 ring-blue-400" },
                      { label: "soy",           color: "bg-indigo-50 border-indigo-200",   ring: "ring-2 ring-indigo-400" },
                      { label: "eggs",          color: "bg-green-50 border-green-200",     ring: "ring-2 ring-green-400" },
                      { label: "shellfish",     color: "bg-teal-50 border-teal-200",       ring: "ring-2 ring-teal-400" },
                      { label: "fish",          color: "bg-cyan-50 border-cyan-200",       ring: "ring-2 ring-cyan-400" },
                      { label: "sesame",        color: "bg-amber-50 border-amber-200",     ring: "ring-2 ring-amber-400" },
                      { label: "peanuts",       color: "bg-rose-50 border-rose-200",       ring: "ring-2 ring-rose-400" },
                      { label: "mustard",       color: "bg-lime-50 border-lime-200",       ring: "ring-2 ring-lime-400" },
                      { label: "celery",        color: "bg-emerald-50 border-emerald-200", ring: "ring-2 ring-emerald-400" },
                      { label: "sulfites",      color: "bg-fuchsia-50 border-fuchsia-200", ring: "ring-2 ring-fuchsia-400" },
                      // style/avoidance preferences
                      { label: "pork-free",     color: "bg-orange-50 border-orange-200",   ring: "ring-2 ring-orange-400" },
                      { label: "beef-free",     color: "bg-red-50 border-red-200",         ring: "ring-2 ring-red-400" },
                      { label: "alcohol-free",  color: "bg-purple-50 border-purple-200",   ring: "ring-2 ring-purple-400" },
                      { label: "low-sodium",    color: "bg-sky-50 border-sky-200",         ring: "ring-2 ring-sky-400" },
                      { label: "spicy‑sensitive",color:"bg-pink-50 border-pink-200",       ring: "ring-2 ring-pink-400" },
                      // sentinel for "Other"
                      { label: "__other__",     color: "bg-gray-50 border-gray-200",       ring: "ring-2 ring-gray-400" },
                    ].map(({ label, color, ring }) => {
                      const isOther = label === "__other__";
                      const active = isOther
                        ? form.restrictions.includes("__other__")
                        : form.restrictions.includes(label);

                      return (
                        <div key={label} className="col-span-1">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              isOther
                                ? handleCheckboxChange("restrictions", "__other__")
                                : handleCheckboxChange("restrictions", label)
                            }
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") &&
                              (isOther
                                ? handleCheckboxChange("restrictions", "__other__")
                                : handleCheckboxChange("restrictions", label))
                            }
                            className={`p-3 border rounded-xl text-center cursor-pointer font-medium transition-all select-none
                              focus:outline-none focus:ring-0 ring-offset-0
                              ${active ? `bg-white ${ring} scale-[1.03]` : `${color} hover:bg-white hover:scale-[1.02]`}`}
                          >
                            {isOther ? "Other" : label.charAt(0).toUpperCase() + label.slice(1)}
                          </div>

                          {isOther && active && (
                            <input
                              type="text"
                              value={otherRestriction}
                              onChange={(e) => setOtherRestriction(e.target.value)}
                              placeholder="Type your restriction…"
                              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* --- STEP 5 --- */}
              {step === 5 && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Cuisine Preferences</h3>
                  <label className="block text-sm text-gray-600 mb-2">
                    Select preferred cuisines:
                  </label>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: "indian",         color: "bg-orange-50 border-orange-200",    ring: "ring-2 ring-orange-400" },
                      { label: "italian",        color: "bg-red-50 border-red-200",          ring: "ring-2 ring-red-400" },
                      { label: "thai",           color: "bg-green-50 border-green-200",      ring: "ring-2 ring-green-400" },
                      { label: "mexican",        color: "bg-yellow-50 border-yellow-200",    ring: "ring-2 ring-yellow-400" },
                      { label: "japanese",       color: "bg-blue-50 border-blue-200",        ring: "ring-2 ring-blue-400" },
                      { label: "mediterranean",  color: "bg-purple-50 border-purple-200",    ring: "ring-2 ring-purple-400" },
                      { label: "chinese",        color: "bg-indigo-50 border-indigo-200",    ring: "ring-2 ring-indigo-400" },
                    ].map(({ label, color, ring }) => {
                      const active = form.cuisine.includes(label);
                      return (
                        <div
                          key={label}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleCheckboxChange("cuisine", label)}
                          onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") &&
                            handleCheckboxChange("cuisine", label)
                          }
                          className={`p-3 border rounded-xl text-center cursor-pointer font-medium transition-all select-none ${
                            active ? `bg-white ${ring} scale-[1.03]` : `${color} hover:bg-white hover:scale-[1.02]`
                          }`}
                        >
                          {label.charAt(0).toUpperCase() + label.slice(1)}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex-none p-8 pt-4">
              <div className="flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Back
                  </button>
                )}
                {step < 5 && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 hover:scale-105 transition-all"
                  >
                    Next
                  </button>
                )}
                {step === 5 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 hover:scale-105 transition-all"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: dynamic side info */}
        <div className="order-1 lg:order-2">
          <SidePanel step={step} />
        </div>
      </div>
    </div>
  );
}
