import { getToken } from "../auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type InspectorSummary = {
  id: string;
  name: string;
  region: string;
  scans_this_week: number;
  violations_flagged: number;
};

export async function fetchInspectors(): Promise<InspectorSummary[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/inspectors`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Could not load inspectors");
  }
  const data = await res.json();
  return data.inspectors;
}
