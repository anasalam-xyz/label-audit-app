import { getToken } from "../auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type DashboardStats = {
  total_scans: number;
  total_violations: number;
  compliance_rate: number;
  weekly_trend: number[];
};

export async function fetchDashboard(): Promise<DashboardStats> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Could not load dashboard");
  }
  return res.json();
}
