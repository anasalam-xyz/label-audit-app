"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, MotionConfig, type Variants } from "framer-motion";
import { AlertCircle, ChevronRight } from "lucide-react";
import { StatusChip } from "@/components/ui/statusChip";
import { DateStrip } from "@/components/inspector/history/DateStrip";
import { ScanModal, ScanThumb } from "@/components/inspector/ScanModal";
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

// Local YYYY-MM-DD — deliberately not toISOString(), which converts to UTC
// and can shift the date across a day boundary depending on timezone.
function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Answers the person's action (picking a day): the new day's list fades in.
const dayVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 340, damping: 28 } },
};

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [active, setActive] = useState<Scan | null>(null);
  const closeModal = useCallback(() => setActive(null), []);

  useEffect(() => {
    // `cancelled` stops a slow response for an old date from overwriting a newer one.
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchHistory(toDateParam(selectedDate))
      .then((data) => {
        if (!cancelled) setScans(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const grouped = useMemo(() => {
    const buckets = new Map<number, Scan[]>();
    for (const scan of scans) {
      const hour = parseHour(scan.time);
      if (!buckets.has(hour)) buckets.set(hour, []);
      buckets.get(hour)!.push(scan);
    }
    return [...buckets.entries()].sort((a, b) => b[0] - a[0]);
  }, [scans]);

  const total = scans.length;
  const passed = scans.filter((s) => s.status === "pass").length;
  const flagged = total - passed;

  const dayLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto min-h-screen w-full max-w-md bg-bg px-5 pt-6 pb-28 lg:max-w-6xl lg:px-10 lg:pt-10">
        <div className="lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-12">
          {/* Left: title, date picker, day summary */}
          <aside className="lg:sticky lg:top-8">
            <h1 className="mb-4 text-lg font-semibold text-ink lg:mb-6 lg:text-3xl">Scan History</h1>

            <DateStrip selected={selectedDate} onSelect={setSelectedDate} />

            <div className="mt-4 grid grid-cols-3 gap-2 lg:mt-6">
              {[
                { label: "Scans", value: total },
                { label: "Passed", value: passed },
                { label: "Flagged", value: flagged },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-card border border-border bg-surface px-3 py-3"
                >
                  <p className="text-xs text-muted">{stat.label}</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{isLoading ? "–" : stat.value}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* Right: timeline */}
          <section className="mt-5 lg:mt-0">
            <h2
              className="mb-4 hidden text-sm font-medium text-muted lg:block"
              suppressHydrationWarning
            >
              {dayLabel}
            </h2>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-card border border-violation/30 bg-violation-bg px-4 py-3">
                <AlertCircle size={16} className="text-violation" />
                <p className="text-sm text-violation">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[64px] animate-pulse rounded-card border border-border bg-surface"
                  />
                ))}
              </div>
            ) : grouped.length === 0 ? (
              <div className="rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
                <p className="text-sm font-medium text-ink">No scans on this day</p>
                <p className="mt-1 text-sm text-muted">Pick another date to see earlier scans.</p>
              </div>
            ) : (
              <motion.div
                key={toDateParam(selectedDate)}
                className="space-y-6 w-full"
                variants={dayVariants}
                initial="hidden"
                animate="show"
              >
                {grouped.map(([hour, entries]) => (
                  <div key={hour} className="w-full flex flex-col gap-4">
                    <div className="relative w-12 shrink-0 pt-3 text-xs text-muted">
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    <div className="w-full grid flex-1 gap-2 border-l border-border pl-4 md:grid-cols-2 lg:gap-3">
                      {entries.map((scan) => (
                        <motion.button
                          key={scan.id}
                          type="button"
                          variants={rowVariants}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setActive(scan)}
                          className="w-full group flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-2 md:px-4 py-3 text-left transition-[border-color,box-shadow] duration-200 hover:border-accent/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <ScanThumb scan={scan} className="h-9 w-9" iconSize={16} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-ink">{scan.product}</p>
                              <p className="text-xs text-muted">{scan.time}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <StatusChip status={scan.status} />
                            <ChevronRight
                              size={14}
                              className="-ml-1 w-0 text-muted opacity-0 transition-all duration-200 group-hover:ml-0 group-hover:w-3.5 group-hover:opacity-100"
                            />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </section>
        </div>

        <ScanModal scan={active} onClose={closeModal} />
      </main>
    </MotionConfig>
  );
}
