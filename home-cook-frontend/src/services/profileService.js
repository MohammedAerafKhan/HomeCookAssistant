const API_BASE = process.env.REACT_APP_API_URL;

export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function updateName(name) {
  const res = await fetch(`${API_BASE}/api/auth/profile/name`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to update name');
  return res.json();
}

export async function updateSubscription(subscription) {
  const res = await fetch(`${API_BASE}/api/auth/profile/subscription`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subscription }),
  });
  if (!res.ok) throw new Error('Failed to update subscription');
  return res.json();
}

export async function updateQuizData(quizData) {
  const res = await fetch(`${API_BASE}/api/auth/profile/quiz`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ quizData }),
  });
  if (!res.ok) throw new Error('Failed to update quiz data');
  return res.json();
}
