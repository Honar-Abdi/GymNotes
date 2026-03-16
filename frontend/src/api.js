const BASE = 'http://127.0.0.1:8000';

export async function chatPropose(text) {
  const res = await fetch(`${BASE}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function confirmSet(proposal) {
  const res = await fetch(`${BASE}/confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposal }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

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

export async function deleteSet(setId) {
  const res = await fetch(`${BASE}/set/${setId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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