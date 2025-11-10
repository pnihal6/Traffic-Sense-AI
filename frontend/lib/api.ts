export const API_BASE = "http://localhost:5000";

/* -------------------- MODELS -------------------- */

export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json(); // [{file,name}]
}

export type ModelChoice = { file: string; name: string };

/* -------------------- STREAMS -------------------- */

export async function uploadVideo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/streams/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.path as string; // local path returned by backend
}

export async function startStream(payload: {
  sid: number;
  model_file: string;
  source: string;
  conf: number;
  imgsz: number;
  interval: number;
}) {
  const res = await fetch(`${API_BASE}/streams/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.message || "Start failed");
  return data;
}

export async function stopStream(sid: number) {
  const res = await fetch(`${API_BASE}/streams/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sid }),
  });
  if (!res.ok) throw new Error("Stop failed");
  return res.json();
}

export async function fetchStats(sid: number) {
  const res = await fetch(`${API_BASE}/streams/stats?sid=${sid}`);
  if (!res.ok) throw new Error("Stats not available");
  return res.json();
}

/* -------------------- SESSIONS (DB) -------------------- */

// Save a new session to DB
export async function saveSession(payload: {
  model: string;
  source: string;
  total: number;
  breakdown: { car: number; van: number; truck: number; bus: number };
  avg_fps: number;
}) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to save session");
  return data;
}

// Fetch all sessions from DB
export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json(); // { sessions: [...] }
}

// Delete a session by ID
export async function deleteSession(id: number) {
  const res = await fetch(`${API_BASE}/sessions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
}
