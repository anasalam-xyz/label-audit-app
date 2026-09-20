"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Cloud, CloudOff, FileDown, Loader2 } from "lucide-react";
import { generateComplianceReportPdf } from "@/lib/pdf-report";
import type { ExtractedField, Violation } from "@/lib/scan-types";

export function DoneStep({
  passed,
  isOnline,
  onScanAnother,
  onGoHome,
  fields,
  violations,
  photo,
  scanId,
  scannedAt,
}: {
  passed: boolean;
  isOnline: boolean;
  onScanAnother: () => void;
  onGoHome: () => void;
  fields: ExtractedField[];
  violations: Violation[];
  photo: File | null;
  scanId?: string;
  scannedAt?: string;
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  async function handleDownloadPdf() {
    setIsGeneratingPdf(true);
    try {
      await generateComplianceReportPdf({ photo, fields, violations, scanId, scannedAt });
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <CheckCircle2 size={40} className="mb-3 text-pass" />
      </motion.div>
      <p className="font-display text-lg font-semibold text-ink">Report Saved</p>
      <p className="font-body mt-1 text-sm text-muted">
        {passed ? "Marked compliant" : "Violations logged"} · added to history
      </p>

      <div className="font-body mt-4 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs text-muted">
        {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
        {isOnline ? "Synced to server" : "Queued offline — will sync automatically"}
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        {photo && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="font-body flex items-center justify-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {isGeneratingPdf ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            {isGeneratingPdf ? "Generating…" : "Download PDF Report"}
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onScanAnother}
          className="font-body rounded-card bg-dark px-4 py-3 text-sm font-semibold text-white"
        >
          Scan Another
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onGoHome}
          className="font-body rounded-card border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink"
        >
          Back to Home
        </motion.button>
      </div>
    </div>
  );
}
