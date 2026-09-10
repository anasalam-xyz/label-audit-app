"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { fetchHistory } from "@/lib/api/history";
import type { Scan } from "@/lib/mock-scans";

export default function InspectorDashboardPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory()
      .then(setScans)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setIsLoading(false));
  }, []);

  const total = scans.length;
  const violations = scans.filter((s) => s.status === "violation").length;
  const review = scans.filter((s) => s.status === "review").length;
  const passed = scans.filter((s) => s.status === "pass").length;
  const complianceRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-5 pt-6 pb-28">
      <h1 className="mb-4 text-lg font-semibold text-ink">My Dashboard</h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-card border border-violation/30 bg-violation-bg px-4 py-3">
          <AlertCircle size={16} className="text-violation" />
          <p className="text-sm text-violation">{error}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          <section className="mb-5 rounded-card bg-dark px-5 py-5 text-white">
            <p className="text-sm text-white/60">Compliance Rate</p>
            <p className="mt-1 text-2xl font-semibold">{complianceRate}%</p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
              <div>
                <p className="text-xs text-white/60">Scans</p>
                <p className="text-base font-semibold">{total}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Violations</p>
                <p className="text-base font-semibold text-violation">{violations}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Review</p>
                <p className="text-base font-semibold text-review">{review}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium text-muted">Breakdown</h2>
            <div className="space-y-3 rounded-card border border-border bg-surface p-4">
              <BreakdownRow label="Compliant" value={passed} total={total} colorClass="bg-pass" />
              <BreakdownRow label="Violation" value={violations} total={total} colorClass="bg-violation" />
              <BreakdownRow label="Needs Review" value={review} total={total} colorClass="bg-review" />
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  colorClass,
}: {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="text-ink">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
        <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
