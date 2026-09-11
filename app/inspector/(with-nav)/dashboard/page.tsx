"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Layers, ChevronRight, AlertCircle } from "lucide-react";
import { IconPlaceholder } from "@/components/ui/icon-placeholder";
import { StatusChip } from "@/components/ui/statusChip";
import { RingProgress } from "@/components/ui/RingProgress";
import { fetchHistory } from "@/lib/api/history";
import type { Scan } from "@/lib/mock-scans";

export default function InspectorHomePage() {
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
  const passed = scans.filter((s) => s.status === "pass").length;
  const complianceRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const preview = scans.slice(0, 3);
  const remaining = Math.max(scans.length - 3, 0);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-5 pb-28">
      <h1 className="mb-5 text-2xl font-semibold leading-snug text-ink">
        Let&apos;s check some <span className="text-accent">Labels</span>
      </h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-card border border-violation/30 bg-violation-bg px-4 py-3">
          <AlertCircle size={16} className="text-violation" />
          <p className="text-sm text-violation">{error}</p>
        </div>
      )}

      <section className="mb-6 flex items-center justify-between rounded-card bg-dark px-5 py-5 text-white">
        <div>
          <p className="text-sm text-white/60">
            {isLoading ? "Loading…" : `${total} scans logged`}
          </p>
          <p className="mt-1 text-lg font-semibold">{complianceRate}% compliant</p>
          <Link
            href="/inspector/scan"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-ink"
          >
            <Camera size={14} />
            Scan Now
          </Link>
        </div>

        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <RingProgress percentage={complianceRate} />
          <span className="absolute text-base font-semibold">{complianceRate}%</span>
        </div>
      </section>

      <section className="mb-6 flex gap-3">
        <Link
          href="/inspector/scan"
          className="flex flex-1 items-center justify-center gap-2 rounded-card border border-border bg-surface py-3 text-sm font-medium text-ink"
        >
          <Camera size={16} />
          Scan
        </Link>
        <Link
          href="/inspector/scan?batch=true"
          className="flex flex-1 items-center justify-center gap-2 rounded-card border border-border bg-surface py-3 text-sm font-medium text-ink"
        >
          <Layers size={16} />
          Batch Mode
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Recent Scans</h2>
          <Link href="/inspector/history" className="text-sm text-muted">
            See all
          </Link>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {preview.map((scan) => (
              <div key={scan.id} className="rounded-card border border-border bg-surface p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-muted">
                  <IconPlaceholder size={14} />
                </span>
                <p className="mt-3 text-sm font-medium text-ink">{scan.product}</p>
                <p className="mt-0.5 text-xs text-muted">{scan.time}</p>
                <div className="mt-3">
                  <StatusChip status={scan.status} />
                </div>
              </div>
            ))}

            <Link
              href="/inspector/history"
              className="flex flex-col items-center justify-center gap-1 rounded-card bg-muted p-4 text-center text-white"
            >
              <ChevronRight size={18} />
              <span className="text-xs font-medium">
                {remaining > 0 ? `+${remaining} more` : "View log"}
              </span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
