const BASE = 'http://127.0.0.1:8000';

export async function getHistory() {
  const res = await fetch(`${BASE}/history/`);
  return res.json();
}

export async function getSessionDetail(id) {
  const res = await fetch(`${BASE}/history/${id}`);
  return res.json();
}

export async function getExercises() {
  const res = await fetch(`${BASE}/exercises`);
  return res.json();
}

export async function getProgress(exercise) {
  const res = await fetch(`${BASE}/progress/${encodeURIComponent(exercise)}`);
  return res.json();
}

export async function bulkPropose(lines, date, name) {
  const res = await fetch(`${BASE}/bulk/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines, date, name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function bulkConfirm(proposals, name) {
  const res = await fetch(`${BASE}/bulk/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposals, name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${BASE}/session/${sessionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateSessionName(sessionId, name) {
  const res = await fetch(`${BASE}/session/${sessionId}/name`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addSetsToSession(sessionId, lines, sessionDate, sessionName) {
  const res = await fetch(`${BASE}/bulk/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines, date: sessionDate, name: sessionName }),
  });
  if (!res.ok) throw new Error(await res.text());
  const proposed = await res.json();

  const confirm = await fetch(`${BASE}/bulk/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposals: proposed.proposals, name: sessionName }),
  });
  if (!confirm.ok) throw new Error(await confirm.text());
  return confirm.json();
}

export async function getDashboard() {
  const res = await fetch(`${BASE}/dashboard`);
  return res.json();
}

// --- Cardio ---

export async function logCardio(date, type, duration_min, distance_km) {
  const res = await fetch(`${BASE}/cardio/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, type, duration_min, distance_km }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAllCardio() {
  const res = await fetch(`${BASE}/cardio/`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCardio(cardioId) {
  const res = await fetch(`${BASE}/cardio/${cardioId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Kehonpaino ---

export async function logWeight(date, weight_kg) {
  const res = await fetch(`${BASE}/weight/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, weight_kg }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAllWeights() {
  const res = await fetch(`${BASE}/weight/`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getLatestWeight() {
  const res = await fetch(`${BASE}/weight/latest`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteWeight(weightId) {
  const res = await fetch(`${BASE}/weight/${weightId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}