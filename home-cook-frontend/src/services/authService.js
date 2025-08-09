const API_BASE = process.env.REACT_APP_API_URL;

export async function registerUser(data) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    console.error("Backend error response (Registration failed):", result.message || result);
    throw new Error(result.message || "Registration failed");
  }
  return result;
}

export async function loginUser(data) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    console.error("Backend error response:", result);
    throw result;
  }
  return result;
}

export async function logoutUser() {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function submitQuiz(data) {
  const res = await fetch(`${API_BASE}/api/auth/submit-quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (!res.ok) {
    console.error("Backend error response (Error Submittign Quiz):", result.message || result);
    throw new Error(result.message || "Error Submitting quiz");
  }
  return result;
}

