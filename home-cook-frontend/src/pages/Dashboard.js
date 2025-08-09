import React, { useEffect, useMemo, useState } from "react";
import {
  fetchUserSession,
  fetchStoredMealPlan,
  generateMealPlan,
  generateGroceryList,
  generateInstructions,
} from "../services/homeService";

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Normalize a date (or string) to ISO yyyy-mm-dd of the Monday that starts that week
const getWeekStart = (d) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date.toISOString().slice(0, 10);
};

const formatWeekRange = (weekStartISO) => {
  const start = new Date(weekStartISO);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = (dt) =>
    dt.toLocaleString(undefined, {
      month: "long",
      day: "numeric",
    });

  return `${fmt(start)} - ${fmt(end)}`;
};

/** Renders recipe details from either:
 *  - structured object { ingredients:[], instructions:[], cookTimeMinutes? }
 *  - plain string with \n and/or "1. 2. 3." style numbering
 */
function RecipeDetails({ details }) {
  if (!details) return null;

  // Structured object path
  if (typeof details === "object") {
    const { ingredients, instructions, cookTimeMinutes } = details;
    return (
      <div className="mt-2 space-y-4">
        {Array.isArray(ingredients) && ingredients.length > 0 && (
          <div>
            <h5 className="font-semibold text-slate-800 mb-1">Ingredients</h5>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              {ingredients.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(instructions) && instructions.length > 0 && (
          <div>
            <h5 className="font-semibold text-slate-800 mb-1">Instructions</h5>
            <ol className="list-decimal pl-6 text-slate-700 space-y-1">
              {instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {typeof cookTimeMinutes === "number" && (
          <div className="text-xs text-slate-500">~{cookTimeMinutes} min</div>
        )}
      </div>
    );
  }

  // Plain string path
  const text = String(details).trim();

  // Try to split on newlines first
  let steps = text.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean);

  // If model packed everything into one line, split on numbered steps too
  if (steps.length === 1) {
    steps = text
      .split(/\s*(?=\d+\s*[.)]\s+)/g) // split before "1. " "2) " etc.
      .map((s) => s.replace(/^\d+\s*[.)]\s*/, "").trim())
      .filter(Boolean);
  } else {
    // Strip any bullets or leading numbers from each line
    steps = steps.map((s) => s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, ""));
  }

  // If we still can’t confidently split, just preserve line breaks
  if (steps.length <= 1) {
    return (
      <div className="mt-2 text-sm text-slate-600 whitespace-pre-line">
        {text}
      </div>
    );
  }

  return (
    <ol className="mt-2 list-decimal pl-6 text-slate-700 space-y-1">
      {steps.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  );
}

function Dashboard() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mealHistory, setMealHistory] = useState([]);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0); // index in availableWeeks
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    // default to today's weekday (Mon=0..Sun=6)
    const d = new Date();
    return (d.getDay() + 6) % 7;
  });

  // Load user + stored plan history
  useEffect(() => {
    (async () => {
      try {
        const user = await fetchUserSession();
        setName(user.name || "Guest");

        const stored = await fetchStoredMealPlan();
        if (Array.isArray(stored.history)) {
          setMealHistory(stored.history);
        }
      } catch (err) {
        console.error("Session fetch error:", err);
        setName("Guest");
      }
    })();
  }, []);

  // Build a map of weekKey -> entry and a sorted list of available weeks
  const { plansByWeek, availableWeeks } = useMemo(() => {
    const map = {};
    for (const entry of mealHistory) {
      if (!entry?.startDate) continue;
      const key = getWeekStart(entry.startDate);
      map[key] = entry;
    }
    // Sort ascending by week start (oldest first)
    const weeks = Object.keys(map).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return { plansByWeek: map, availableWeeks: weeks };
  }, [mealHistory]);

  // If weeks change, snap selection intelligently
  useEffect(() => {
    if (availableWeeks.length === 0) return;
    // Find “today” week if present, else last
    const todayKey = getWeekStart(new Date());
    const idx = availableWeeks.findIndex((w) => w === todayKey);
    setSelectedWeekIdx(idx >= 0 ? idx : availableWeeks.length - 1);
  }, [availableWeeks]);

  const currentWeekKey =
    availableWeeks.length > 0 ? availableWeeks[selectedWeekIdx] : null;
  const currentWeek = currentWeekKey ? plansByWeek[currentWeekKey] : null;
  const currentPlan = currentWeek?.plan || []; // array of 7 days
  const currentInstr = currentWeek?.instructions || {}; // { "Day 1": { Breakfast: "...", ... } }

  const handleGenerate = async () => {
    const includeCurrent = window.confirm(
      "Generate meal plan for the remainder of this week as well? Click Cancel for next week only."
    );
    setLoading(true);
    try {
      if (includeCurrent) {
        await generateMealPlan(0);
        await generateInstructions();
        await generateGroceryList(0);
      }
      await generateMealPlan(1);
      await generateInstructions();
      await generateGroceryList(1);

      const updated = await fetchStoredMealPlan();
      if (Array.isArray(updated.history)) {
        setMealHistory(updated.history);
      }
    } catch (err) {
      console.error("Generation error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const goPrevWeek = () => {
    setSelectedWeekIdx((i) => Math.max(0, i - 1));
    setSelectedDayIdx(0);
  };
  const goNextWeek = () => {
    setSelectedWeekIdx((i) => Math.min(availableWeeks.length - 1, i + 1));
    setSelectedDayIdx(0);
  };

  // Meals for selected day (object with Breakfast/Lunch/Dinner…)
  const mealsForDay = currentPlan[selectedDayIdx] || {};
  const instrForDay = currentInstr[`Day ${selectedDayIdx + 1}`] || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16">
        {/* Header Card */}
        <div className="rounded-3xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Welcome, {name}
            </h1>
            <p className="mt-1 text-slate-500">Let’s get cookin’ 🍳</p>
          </div>

          {/* If no data yet, show generator */}
          {availableWeeks.length === 0 ? (
            <div className="p-6 sm:p-8">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-medium shadow hover:bg-indigo-700 active:scale-[0.99] transition"
              >
                Generate Meal Plan
              </button>
              {loading && (
                <p className="mt-3 text-sm text-slate-600">
                  Generating your meal plan... 🍽️
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Week nav row */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrevWeek}
                    disabled={selectedWeekIdx === 0}
                    className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-700 disabled:opacity-40"
                    title="Previous week"
                  >
                    ‹
                  </button>

                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-600/10 text-sky-800 px-3 py-1.5 text-sm font-medium">
                    Week of {formatWeekRange(currentWeekKey)}
                  </span>

                  <button
                    onClick={goNextWeek}
                    disabled={selectedWeekIdx === availableWeeks.length - 1}
                    className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-700 disabled:opacity-40"
                    title="Next week"
                  >
                    ›
                  </button>
                </div>

                {/* Optional: actions like grocery list later */}
                <div />
              </div>

              {/* Day pills */}
              <div className="px-6 sm:px-8 py-4">
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((label, idx) => {
                    const isActive = idx === selectedDayIdx;
                    return (
                      <button
                        key={label}
                        onClick={() => setSelectedDayIdx(idx)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                          isActive
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meals for selected day */}
              <div className="px-6 sm:px-8 pb-8">
                <div className="space-y-8">
                  {["Breakfast", "Lunch", "Dinner"].map((sectionKey) => {
                    const description = mealsForDay[sectionKey];
                    if (!description) return null;

                    return (
                      <div key={sectionKey} className="space-y-3">
                        {/* Section header */}
                        <div className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                          <h4 className="text-slate-800 font-semibold">
                            {sectionKey}
                          </h4>
                        </div>

                        {/* Meal card */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <div className="flex items-center justify-between gap-3 px-4 py-4">
                            <div className="min-w-0">
                              <div className="font-medium text-slate-800">
                                {description}
                              </div>

                              {/* 👇 Render instructions from Mongo, formatted nicely */}
                              {instrForDay?.[sectionKey] && (
                                <RecipeDetails details={instrForDay[sectionKey]} />
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Example time badge if you add times later */}
                              {/* <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600">
                                10 min
                              </span> */}
                              <button
                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                
                              >
                                Swap
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
