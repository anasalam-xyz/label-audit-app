"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, ImageOff, X } from "lucide-react";
import { IconPlaceholder } from "@/components/ui/icon-placeholder";
import { StatusChip } from "@/components/ui/statusChip";
import type { Scan } from "@/lib/mock-scans";

/* ------------------------------------------------------------------ */
/* Image resolution                                                    */
/* ------------------------------------------------------------------ */

// The Scan type isn't visible from here, so we look for the image under the
// usual field names. If yours is named differently, add it to this list —
// or, if fetchHistory only returns a storage *path*, convert it to a public /
// signed URL inside fetchHistory (see notes) and this will just work.
const IMAGE_KEYS = [
  "imageUrl",
  "image_url",
  "image",
  "photo",
  "photoUrl",
  "photo_url",
  "imagePath",
  "image_path",
];

const CORE_KEYS = new Set(["id", "product", "time", "status", "scanned_at", "scannedAt", ...IMAGE_KEYS]);

type Bag = Record<string, unknown>;

export function getScanImage(scan: Scan): string | null {
  const bag = scan as unknown as Bag;
  for (const key of IMAGE_KEYS) {
    const value = bag[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Extra details (anything on the scan besides the core fields)        */
/* ------------------------------------------------------------------ */

function labelize(key: string): string {
  const spaced = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

type DetailRow = { label: string; value: string | string[] };

function extraDetails(scan: Scan): DetailRow[] {
  const rows: DetailRow[] = [];
  for (const [key, raw] of Object.entries(scan as unknown as Bag)) {
    if (CORE_KEYS.has(key) || raw == null || raw === "") continue;
    if (/(^|_)id$|Id$/.test(key)) continue; // hide foreign keys like user_id
    if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
      rows.push({ label: labelize(key), value: String(raw) });
    } else if (Array.isArray(raw) && raw.length > 0 && raw.every((v) => typeof v === "string")) {
      rows.push({ label: labelize(key), value: raw as string[] });
    }
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Thumbnail used inside list items / tiles                            */
/* ------------------------------------------------------------------ */

export function ScanThumb({
  scan,
  className = "h-9 w-9",
  iconSize = 16,
}: {
  scan: Scan;
  className?: string;
  iconSize?: number;
}) {
  const src = getScanImage(scan);
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg text-muted ${className}`}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <IconPlaceholder size={iconSize} />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

function ModalContent({ scan, onClose }: { scan: Scan; onClose: () => void }) {
  const src = getScanImage(scan);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const details = extraDetails(scan);

  // Prefer the full ISO timestamp from the API (date + time); fall back to "10:42 AM".
  const bag = scan as unknown as Bag;
  const rawTs = bag.scanned_at ?? bag.scannedAt;
  const scannedAt =
    typeof rawTs === "string" && !Number.isNaN(Date.parse(rawTs))
      ? new Date(rawTs).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : scan.time;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:rounded-card md:max-w-4xl md:flex-row"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/90 text-ink shadow-sm transition hover:scale-105 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X size={16} />
        </button>

        {/* Image pane */}
        <div className="relative aspect-[4/3] w-full shrink-0 bg-black md:aspect-auto md:min-h-[440px] md:w-1/2">
          {src && !failed ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Label photo for ${scan.product}`}
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
              {!loaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/80"
              >
                <ExternalLink size={12} />
                Open full size
              </a>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/50">
              <ImageOff size={28} />
              <p className="text-sm">
                {failed ? "The image couldn't be loaded" : "No image saved for this scan"}
              </p>
            </div>
          )}
        </div>

        {/* Info pane */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 md:w-1/2">
          <div className="pr-10">
            <h2 id="scan-modal-title" className="text-lg font-semibold leading-snug text-ink">
              {scan.product}
            </h2>
            <p className="mt-1 text-sm text-muted">{scan.time}</p>
            <div className="mt-3">
              <StatusChip status={scan.status} />
            </div>
          </div>

          <dl className="mt-6 divide-y divide-border rounded-card border border-border text-sm">
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Scan ID</dt>
              <dd className="break-all text-right font-medium text-ink">{String(scan.id)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Scanned at</dt>
              <dd className="text-right font-medium text-ink">{scannedAt}</dd>
            </div>
            {details.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="shrink-0 text-muted">{row.label}</dt>
                <dd className="text-right font-medium text-ink">
                  {Array.isArray(row.value) ? (
                    <ul className="space-y-1">
                      {row.value.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-card border border-border bg-bg py-3 text-sm font-medium text-ink transition hover:border-accent hover:bg-surface"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ScanModal({ scan, onClose }: { scan: Scan | null; onClose: () => void }) {
  useEffect(() => {
    if (!scan) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [scan, onClose]);

  return (
    <AnimatePresence>
      {scan && <ModalContent key={String(scan.id)} scan={scan} onClose={onClose} />}
    </AnimatePresence>
  );
}
