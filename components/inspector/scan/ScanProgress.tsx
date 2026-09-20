"use client";

import { motion } from "framer-motion";

const PHASES = ["Capture", "Process", "Review", "Confirm"] as const;

export function ScanProgress({
  phase,
  batchLabel,
}: {
  phase: number; // 0-3, index into PHASES
  batchLabel?: string; // e.g. "Photo 2 of 5" — batch mode only
}) {
  return (
    <div className="mb-5">
      <div className="flex gap-1.5">
        {PHASES.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: i <= phase ? "100%" : "0%" }}
              transition={{ duration: i === phase ? 0.4 : 0.25, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      <p className="font-body mt-2 text-xs text-muted">
        {PHASES[phase]}
        {batchLabel ? ` · ${batchLabel}` : ""}
      </p>
    </div>
  );
}
