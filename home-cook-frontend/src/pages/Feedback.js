import React, { useState } from "react";

const CATEGORIES = [
  "General Feedback",
  "Bug Report",
  "Feature Request",
  "Design / UI",
  "Performance",
];

export default function Feedback() {
  const [rating, setRating] = useState(0);         // 0..5
  const [hover, setHover] = useState(0);           // for star hover
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const chars = feedback.trim().length;
  const canSubmit = chars > 0;                     // keep simple for now

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // If you later wire a backend, call it here.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Feedback</h1>
          <p className="mt-1 text-slate-500">We value your thoughts!</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-7">
          {submitted ? (
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
                {/* check icon */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div>
                <h3 className="text-slate-900 font-semibold">Thanks! Your feedback was recorded.</h3>
                <p className="text-slate-600 text-sm mt-1">
                  We appreciate you taking the time to help us improve.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  How would you rate your experience?
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = (hover || rating) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(n)}
                        className="p-1 rounded-md transition focus:outline-none focus:ring-2 focus:ring-slate-400"
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      >
                        <Star filled={active} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-9 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Feedback textarea */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[140px] resize-y"
                  placeholder="Please share your thoughts, suggestions, or concerns..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="mt-1 text-xs text-slate-500">{chars} characters</div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-medium text-white shadow
                    ${canSubmit ? "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]" : "bg-indigo-300 cursor-not-allowed"}
                  `}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Submit Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/** Simple star icon that can be outlined or filled */
function Star({ filled }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-amber-500" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
