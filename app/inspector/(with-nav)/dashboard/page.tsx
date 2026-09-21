"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, MotionConfig, type Variants } from "framer-motion";
import { Camera, Layers, ChevronRight, AlertCircle } from "lucide-react";
import { StatusChip } from "@/components/ui/statusChip";
import { RingProgress } from "@/components/ui/RingProgress";
import { ScanModal, ScanThumb } from "@/components/inspector/ScanModal";
import { fetchHistory } from "@/lib/api/history";
import type { Scan } from "@/lib/mock-scans";

// One orchestrated moment: the recent-scan tiles stagger in once data lands.
const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } },
};

export default function InspectorHomePage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Scan | null>(null);
  const closeModal = useCallback(() => setActive(null), []);

  useEffect(() => {
    fetchHistory()
      .then(setScans)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setIsLoading(false));
  }, []);

  const total = scans.length;
  const passed = scans.filter((s) => s.status === "pass").length;
  const flagged = total - passed;
  const complianceRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  // Mobile shows 3 tiles + "more"; desktop shows 5 tiles + "more" (3x2 grid).
  const preview = scans.slice(0, 5);
  const remainingMobile = Math.max(total - 3, 0);
  const remainingDesktop = Math.max(total - 5, 0);

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto min-h-screen w-full max-w-md bg-bg px-5 pb-28 lg:max-w-6xl lg:px-10 lg:pt-10">
        <h1 className="mb-5 text-2xl font-semibold leading-snug text-ink lg:mb-8 lg:text-4xl">
          Let&apos;s check some <span className="text-accent">Labels</span>
        </h1>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-card border border-violation/30 bg-violation-bg px-4 py-3">
            <AlertCircle size={16} className="text-violation" />
            <p className="text-sm text-violation">{error}</p>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
          {/* Left column: summary + actions (sticks on desktop) */}
          <div className="lg:sticky lg:top-8 lg:col-span-5">
            <section className="mb-3 flex items-center justify-between rounded-card bg-dark px-5 py-5 text-white lg:px-7 lg:py-7">
              <div>
                <p className="text-sm text-white/60">
                  {isLoading ? "Loading…" : `${total} scans logged`}
                </p>
                <p className="mt-1 text-lg font-semibold lg:text-xl">{complianceRate}% compliant</p>
                <motion.div
                  className="mt-4 inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Link
                    href="/inspector/scan"
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-ink"
                  >
                    <Camera size={14} />
                    Scan Now
                  </Link>
                </motion.div>
              </div>

              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                <RingProgress percentage={complianceRate} />
                <span className="absolute text-base font-semibold">{complianceRate}%</span>
              </div>
            </section>

            <section className="mb-3 grid grid-cols-2 gap-3">
              <div className="rounded-card border border-border bg-surface px-4 py-3">
                <p className="text-xs text-muted">Passed</p>
                <p className="mt-1 text-xl font-semibold text-ink">{isLoading ? "–" : passed}</p>
              </div>
              <div className="rounded-card border border-border bg-surface px-4 py-3">
                <p className="text-xs text-muted">Flagged</p>
                <p className="mt-1 text-xl font-semibold text-ink">{isLoading ? "–" : flagged}</p>
              </div>
            </section>

            <section className="mb-6 flex gap-3 lg:mb-0">
              <Link
                href="/inspector/scan"
                className="flex flex-1 items-center justify-center gap-2 rounded-card border border-border bg-surface py-3 text-sm font-medium text-ink transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md active:translate-y-0"
              >
                <Camera size={16} />
                Scan
              </Link>
              <Link
                href="/inspector/scan?batch=true"
                className="flex flex-1 items-center justify-center gap-2 rounded-card border border-border bg-surface py-3 text-sm font-medium text-ink transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md active:translate-y-0"
              >
                <Layers size={16} />
                Batch Mode
              </Link>
            </section>
          </div>

          {/* Right column: recent scans */}
          <section className="lg:col-span-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Recent Scans</h2>
              <Link
                href="/inspector/history"
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                See all
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-[150px] animate-pulse rounded-card border border-border bg-surface ${
                      i >= 4 ? "hidden lg:block" : ""
                    }`}
                  />
                ))}
              </div>
            ) : total === 0 ? (
              <div className="rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center">
                <p className="text-sm font-medium text-ink">No scans yet</p>
                <p className="mt-1 text-sm text-muted">Scan a label and it will show up here.</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-2 gap-3 lg:grid-cols-3"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                {preview.map((scan, i) => (
                  <motion.button
                    key={scan.id}
                    type="button"
                    variants={tileVariants}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActive(scan)}
                    className={`group flex-col items-start rounded-card border border-border bg-surface p-4 text-left transition-[border-color,box-shadow] duration-200 hover:border-accent/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      i >= 3 ? "hidden lg:flex" : "flex"
                    }`}
                  >
                    <ScanThumb scan={scan} className="h-10 w-10 lg:h-12 lg:w-12" iconSize={16} />
                    <p className="mt-3 text-sm font-medium text-ink">{scan.product}</p>
                    <p className="mt-0.5 text-xs text-muted">{scan.time}</p>
                    <div className="mt-3">
                      <StatusChip status={scan.status} />
                    </div>
                  </motion.button>
                ))}

                <motion.div variants={tileVariants} className="h-full">
                  <Link
                    href="/inspector/history"
                    className="flex h-full min-h-[120px] flex-col items-center justify-center gap-1 rounded-card bg-muted p-4 text-center text-white transition-colors duration-200 hover:bg-dark"
                  >
                    <ChevronRight size={18} />
                    <span className="text-xs font-medium">
                      <span className="lg:hidden">
                        {remainingMobile > 0 ? `+${remainingMobile} more` : "View log"}
                      </span>
                      <span className="hidden lg:inline">
                        {remainingDesktop > 0 ? `+${remainingDesktop} more` : "View log"}
                      </span>
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </section>
        </div>

        <ScanModal scan={active} onClose={closeModal} />
      </main>
    </MotionConfig>
  );
}
