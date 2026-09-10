"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { fetchDashboard, type DashboardStats } from "@/lib/api/dashboard";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SupervisorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setIsLoading(false));
  }, []);

  const maxTrend = stats ? Math.max(...stats.weekly_trend, 1) : 1;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-5 pt-6 pb-28">
      <h1 className="mb-4 text-lg font-semibold text-ink">Regional Dashboard</h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-card border border-violation/30 bg-violation-bg px-4 py-3">
          <AlertCircle size={16} className="text-violation" />
          <p className="text-sm text-violation">{error}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : stats ? (
        <>
          <section className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-card bg-dark px-4 py-4 text-white">
              <p className="text-xs text-white/60">Total Scans</p>
              <p className="mt-1 text-2xl font-semibold">{stats.total_scans}</p>
            </div>
            <div className="rounded-card border border-border bg-surface px-4 py-4">
              <p className="text-xs text-muted">Violations</p>
              <p className="mt-1 text-2xl font-semibold text-violation">
                {stats.total_violations}
              </p>
            </div>
          </section>

          <section className="mb-5 rounded-card border border-border bg-surface px-4 py-4">
            <p className="mb-1 text-xs text-muted">Compliance Rate</p>
            <p className="text-2xl font-semibold text-pass">{stats.compliance_rate}%</p>
          </section>

          <section className="rounded-card border border-border bg-surface p-4">
            <p className="mb-4 text-sm font-medium text-ink">Weekly Trend</p>
            <div className="flex items-end justify-between gap-2" style={{ height: 96 }}>
              {stats.weekly_trend.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-sm bg-accent"
                    style={{ height: `${(val / maxTrend) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted">{DAY_LABELS[i] ?? ""}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
