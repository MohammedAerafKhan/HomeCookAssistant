import React, { useEffect, useMemo, useState } from "react";
import { fetchStoredMealPlan } from "../services/homeService";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

export default function Grocery() {
  const [grocery, setGrocery] = useState({});           // { Produce: [{item, quantity, completed}], ... }
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const stored = await fetchStoredMealPlan();
        const gl = stored?.groceryList || {};
        // normalize to include completed flag
        const normalized = Object.fromEntries(
          Object.entries(gl).map(([cat, items]) => [
            cat,
            (items || []).map((x) => ({ ...x, completed: !!x.completed })),
          ])
        );
        setGrocery(normalized);
      } catch (err) {
        console.error("Failed to load grocery list", err);
      }
    })();
  }, []);

  const categories = useMemo(() => Object.keys(grocery), [grocery]);
  const hasGrocery = categories.length > 0;

  const visibleItems = (items) => {
    if (filter === "active") return items.filter((i) => !i.completed);
    if (filter === "completed") return items.filter((i) => i.completed);
    return items;
    };

  const toggleCompleted = (category, idx) => {
    setGrocery((prev) => {
      const copy = { ...prev };
      copy[category] = copy[category].map((it, i) =>
        i === idx ? { ...it, completed: !it.completed } : it
      );
      return copy;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Grocery List</h1>
          <p className="mt-1 text-slate-500">Track your shopping needs</p>
        </div>

        {/* Filter chips */}
        <div className="mb-6 flex items-center gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={[
                  "rounded-full px-3 py-1.5 text-sm border transition",
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {!hasGrocery && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No grocery list generated yet.
          </div>
        )}

        {hasGrocery && (
          <div className="space-y-6">
            {categories.map((category) => {
              const items = grocery[category] || [];
              const visible = visibleItems(items);

              return (
                <section
                  key={category}
                  className="rounded-2xl bg-white border border-slate-200 shadow-sm"
                >
                  {/* Section header */}
                  <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                    <h3 className="text-slate-800 font-semibold">{category}</h3>
                    <span className="text-xs text-slate-500">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {visible.length === 0 ? (
                      <div className="px-4 py-6 sm:px-5 text-sm text-slate-500">
                        No items in this view.
                      </div>
                    ) : (
                      visible.map((entry, idxVisible) => {
                        // Need original index for toggle (since visible is filtered)
                        const idxOriginal = items.findIndex(
                          (_, j) =>
                            // match by reference and order; fallback to fields
                            _ === visible[idxVisible] ||
                            (_.item === visible[idxVisible].item &&
                              _.quantity === visible[idxVisible].quantity &&
                              _.completed === visible[idxVisible].completed)
                        );

                        const checked = entry.completed;

                        return (
                          <label
                            key={`${entry.item}-${idxVisible}`}
                            className="flex items-center gap-3 px-4 py-4 sm:px-5 cursor-pointer"
                          >
                            {/* Circle checkbox */}
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => toggleCompleted(category, idxOriginal)}
                            />
                            <span
                              onClick={() => toggleCompleted(category, idxOriginal)}
                              className={[
                                "h-5 w-5 rounded-full border flex items-center justify-center",
                                checked
                                  ? "border-slate-900 bg-slate-900"
                                  : "border-slate-300 bg-white",
                              ].join(" ")}
                              aria-hidden="true"
                            >
                              {checked && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="3"
                                  className="h-3.5 w-3.5"
                                >
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              )}
                            </span>

                            {/* Text */}
                            <div className="min-w-0">
                              <div
                                className={[
                                  "text-sm sm:text-base",
                                  checked ? "text-slate-400 line-through" : "text-slate-800",
                                ].join(" ")}
                              >
                                {entry.item}
                                {entry.quantity ? (
                                  <span className="text-slate-500">
                                    {" "}
                                    ({entry.quantity})
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
