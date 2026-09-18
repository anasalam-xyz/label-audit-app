import { getToken } from "../auth-storage";
import type { Scan } from "../mock-scans";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// `date` is optional (YYYY-MM-DD) — whenever DateStrip's onSelect gets
// wired to a real fetch, pass the selected day here. Omitting it returns
// full history, unchanged from current behavior.
export async function fetchHistory(date?: string): Promise<Scan[]> {
  const token = getToken();
  const query = date ? `?date=${date}` : "";
  const res = await fetch(`${API_BASE}/history${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Could not load history");
  }
  const data = await res.json();
  return data.scans;
}
