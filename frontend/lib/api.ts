// frontend/lib/api.ts
export const API_BASE = "http://localhost:5000";

export interface ModelChoice {
  file: string;
  name: string;
}

export async function fetchModels(): Promise<ModelChoice[]> {
  const res = await fetch(`${API_BASE}/streams/model-list`);
  const data = await res.json();
  return data.models || [];
}

export async function uploadVideo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/streams/upload-video`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.path; // absolute path for backend to open
}

export async function startStream(params: {
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
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "Failed to start stream");
  }
  return res.json();
}

export async function stopStream(sid: number) {
  const res = await fetch(`${API_BASE}/streams/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sid }),
  });
  if (!res.ok) throw new Error("Failed to stop stream");
  return res.json();
}

export async function fetchStats(sid: number) {
  const res = await fetch(`${API_BASE}/streams/stats?sid=${sid}`);
  if (!res.ok) throw new Error("No stats yet");
  return res.json();
}
