const API_BASE = process.env.REACT_APP_API_URL;

export async function fetchUserSession() {
  const res = await fetch(`${API_BASE}/api/auth/session`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Unauthorized");
  return await res.json();
}

export async function fetchStoredMealPlan() {
  const res = await fetch(`${API_BASE}/api/meal/stored`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to load meal plan");
  return await res.json();
}

export async function generateMealPlan(offset = 0) {
  const url = `${API_BASE}/api/meal/generateMeal?offset=${offset}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to generate meal plan");
  return await res.json();
}

export async function generateGroceryList(offset = 0) {
  const res = await fetch(`${API_BASE}/api/meal/generateGroceryList?offset=${offset}`, {
    method: "GET",
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to generate grocery list");
  return await res.json();
}

export async function generateInstructions() {
  const res = await fetch(`${API_BASE}/api/meal/generateInstructions`, {
    method: "GET",
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to generate instructions");
  return await res.json();
}

