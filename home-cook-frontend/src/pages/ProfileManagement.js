import React, { useEffect, useState } from "react";
import {
  fetchProfile,
  updateName,
  updateSubscription,
  updateQuizData,
} from "../services/profileService";

function ProfileManagement() {
  const [profile, setProfile] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const initialQuiz = {
    height: "",
    weight: "",
    age: "",
    reason: "",
    mealType: "",
    skillLevel: "",
    mealsPerDay: [],
    restrictions: [],
    cuisine: [],
  };
  const [quizForm, setQuizForm] = useState(initialQuiz);

  // NEW: tab state for the two sections
  const [tab, setTab] = useState("profile"); // "profile" | "quiz"

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
        setNameInput(data.name || "");
        setQuizForm(data.quizData || initialQuiz);
      } catch (err) {
        console.error("Profile fetch error:", err.message);
      }
    })();
  }, []);

  const handleSaveName = async () => {
    try {
      const res = await updateName(nameInput);
      setProfile((prev) => ({ ...prev, name: res.name }));
    } catch (err) {
      console.error("Name update error:", err.message);
    }
  };

  const handleSubscriptionChange = async (e) => {
    const sub = e.target.value;
    try {
      await updateSubscription(sub);
      setProfile((prev) => ({ ...prev, subscription: sub }));
    } catch (err) {
      console.error("Subscription update error:", err.message);
    }
  };

  const handleQuizChange = (e) => {
    setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  };

  const handleQuizCheckbox = (name, value) => {
    setQuizForm((prev) => {
      const set = new Set(prev[name]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [name]: [...set] };
    });
  };

  const handleSaveQuizData = async () => {
    try {
      const res = await updateQuizData(quizForm);
      setProfile((prev) => ({ ...prev, quizData: res.quizData }));
    } catch (err) {
      console.error("Quiz data update error:", err.message);
    }
  };

  if (!profile)
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl bg-white/80 shadow-xl ring-1 ring-black/5 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-8 border-b border-slate-200">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">
              Profile Management
            </h2>
            <p className="mt-2 text-slate-500">
              Update your profile information and preferences to get
              personalized recommendations.
            </p>
          </div>

          {/* Tabs */}
          <div className="px-6 sm:px-8 border-b border-slate-200 bg-white/60">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setTab("profile")}
                className={`relative -mb-px border-b-2 px-2 py-4 text-sm font-medium transition
                  ${
                    tab === "profile"
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                Profile Settings
              </button>

              <button
                type="button"
                onClick={() => setTab("quiz")}
                className={`relative -mb-px border-b-2 px-2 py-4 text-sm font-medium transition
                  ${
                    tab === "quiz"
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                Quiz Data
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            {tab === "profile" && (
              <div className="space-y-8">
                {/* Avatar + Plan (simple visual section) */}
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-indigo-100 grid place-items-center text-indigo-600 text-3xl font-semibold">
                    {nameInput?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-lg font-medium text-slate-800">
                      {nameInput || "Your Name"}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        {profile.subscription === "premium"
                          ? "Premium Plan"
                          : "Free Plan"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={handleSaveName}
                    placeholder="Enter your name"
                    className="w-full sm:max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* Subscription */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subscription Plan
                  </label>
                  <select
                    value={profile.subscription}
                    onChange={handleSubscriptionChange}
                    className="w-full sm:max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                  <p className="mt-2 text-xs text-slate-500">
                    Upgrade to Premium for personalized meal plans and more
                    features.
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleSaveName}
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-medium shadow hover:bg-indigo-700 active:scale-[0.99] transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {tab === "quiz" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-800">
                  Quiz Data
                </h3>

                {/* Personal Info */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={quizForm.height}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={quizForm.weight}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={quizForm.age}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reason / Goals
                  </label>
                  <textarea
                    name="reason"
                    value={quizForm.reason}
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* Meal Type */}
                <div className="max-w-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    name="mealType"
                    value={quizForm.mealType}
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  >
                    <option value="">--Choose--</option>
                    <option value="vegan">Vegan</option>
                    <option value="balanced">Balanced</option>
                    <option value="vegetarian">Vegetarian</option>
                  </select>
                </div>

                {/* Skill Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Skill Level
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {["basic", "intermediate", "expert"].map((level) => (
                      <label
                        key={level}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm"
                      >
                        <input
                          type="radio"
                          name="skillLevel"
                          value={level}
                          checked={quizForm.skillLevel === level}
                          onChange={handleQuizChange}
                        />
                        <span className="text-slate-700 capitalize">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Meals Per Day */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Meals Per Day
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                      <label
                        key={meal}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          value={meal}
                          checked={quizForm.mealsPerDay.includes(meal)}
                          onChange={() =>
                            handleQuizCheckbox("mealsPerDay", meal)
                          }
                        />
                        <span className="text-slate-700">{meal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Restrictions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Restrictions
                  </label>
                  <div className="grid gap-2 sm:grid-cols-5">
                    {["nuts", "gluten", "dairy", "soy", "eggs"].map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm capitalize"
                      >
                        <input
                          type="checkbox"
                          value={item}
                          checked={quizForm.restrictions.includes(item)}
                          onChange={() =>
                            handleQuizCheckbox("restrictions", item)
                          }
                        />
                        <span className="text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cuisine */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cuisine
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      "indian",
                      "italian",
                      "thai",
                      "mexican",
                      "japanese",
                      "mediterranean",
                      "chinese",
                    ].map((c) => (
                      <label
                        key={c}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm capitalize"
                      >
                        <input
                          type="checkbox"
                          value={c}
                          checked={quizForm.cuisine.includes(c)}
                          onChange={() => handleQuizCheckbox("cuisine", c)}
                        />
                        <span className="text-slate-700">
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveQuizData}
                  type="button"
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-medium shadow hover:bg-indigo-700 active:scale-[0.99] transition"
                >
                  Save Quiz Data
                </button>
              </div>
            )}
          </div>
          {/* end body */}
        </div>
        {/* end card */}
      </div>
      {/* end container */}
    </div>
  );
}

export default ProfileManagement;
