import { getToken } from "../auth-storage";
import type { Scan } from "../mock-scans";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchHistory(): Promise<Scan[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/history`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Could not load history");
  }
  const data = await res.json();
  return data.scans;
}
