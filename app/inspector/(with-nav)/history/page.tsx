"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { IconPlaceholder } from "@/components/ui/icon-placeholder";
import { StatusChip } from "@/components/ui/statusChip";
import { DateStrip } from "@/components/inspector/history/DateStrip";
import { fetchHistory } from "@/lib/api/history";
import type { Scan } from "@/lib/mock-scans";

function parseHour(time: string): number {
  const match = time.match(/(\d+):\d+\s*(AM|PM)/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const isPM = match[2].toUpperCase() === "PM";
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  return hour;
}

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchHistory()
      .then(setScans)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setIsLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const buckets = new Map<number, Scan[]>();
    for (const scan of scans) {
      const hour = parseHour(scan.time);
      if (!buckets.has(hour)) buckets.set(hour, []);
      buckets.get(hour)!.push(scan);
    }
    return [...buckets.entries()].sort((a, b) => b[0] - a[0]);
  }, [scans]);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-5 pt-6 pb-28">
      <h1 className="mb-4 text-lg font-semibold text-ink">Scan History</h1>

      <DateStrip selected={selectedDate} onSelect={setSelectedDate} />

      {error && (
        <div className="my-4 flex items-center gap-2 rounded-card border border-violation/30 bg-violation-bg px-4 py-3">
          <AlertCircle size={16} className="text-violation" />
          <p className="text-sm text-violation">{error}</p>
        </div>
      )}

      <div className="mt-5">
        {isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : grouped.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted">No scans yet.</p>
        ) : (
          <div className="space-y-5">
            {grouped.map(([hour, entries]) => (
              <div key={hour} className="flex gap-3">
                <div className="w-12 shrink-0 pt-3 text-xs text-muted">
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div className="flex-1 space-y-2">
                  {entries.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-muted">
                          <IconPlaceholder size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink">{scan.product}</p>
                          <p className="text-xs text-muted">{scan.time}</p>
                        </div>
                      </div>
                      <StatusChip status={scan.status} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
