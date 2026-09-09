"use client";

import { CheckCircle2, Cloud, CloudOff } from "lucide-react";

export function DoneStep({
  passed,
  isOnline,
  onScanAnother,
  onGoHome,
}: {
  passed: boolean;
  isOnline: boolean;
  onScanAnother: () => void;
  onGoHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <CheckCircle2 size={40} className="mb-3 text-pass" />
      <p className="text-lg font-semibold text-ink">Report Saved</p>
      <p className="mt-1 text-sm text-muted">
        {passed ? "Marked compliant" : "Violations logged"} · added to history
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs text-muted">
        {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
        {isOnline ? "Synced to server" : "Queued offline — will sync automatically"}
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        <button
          onClick={onScanAnother}
          className="rounded-card bg-dark px-4 py-3 text-sm font-semibold text-white"
        >
          Scan Another
        </button>
        <button
          onClick={onGoHome}
          className="rounded-card border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
