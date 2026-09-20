"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, FileDown, Loader2 } from "lucide-react";
import { StatusChip } from "@/components/ui/statusChip";
import { generateBatchComplianceReportPdf } from "@/lib/pdf-report";
import type { ExtractedField, Violation } from "@/lib/scan-types";

export type BatchResultEntry =
  | {
      status: "pass" | "violation" | "review";
      scanId: string;
      scannedAt: string;
      photo: File;
      fields: ExtractedField[];
      violations: Violation[];
    }
  | { status: "failed" };

export function BatchDoneStep({
  results,
  onScanAnother,
  onGoHome,
}: {
  results: BatchResultEntry[];
  onScanAnother: () => void;
  onGoHome: () => void;
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const succeeded = results.filter((r) => r.status !== "failed");
  const failed = results.length - succeeded.length;

  async function handleDownloadPdf() {
    setIsGeneratingPdf(true);
    try {
      await generateBatchComplianceReportPdf(
        succeeded.map((r) => {
          const item = r as Extract<BatchResultEntry, { status: "pass" | "violation" | "review" }>;
          return {
            photo: item.photo,
            fields: item.fields,
            violations: item.violations,
            scanId: item.scanId,
            scannedAt: item.scannedAt,
          };
        })
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="flex flex-col items-center py-10 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <CheckCircle2 size={40} className="mb-3 text-pass" />
      </motion.div>
      <p className="font-display text-lg font-semibold text-ink">Batch Complete</p>
      <p className="font-body mt-1 text-sm text-muted">
        {succeeded.length} of {results.length} saved{failed > 0 ? ` · ${failed} failed` : ""}
      </p>

      <div className="mt-6 w-full space-y-2 text-left">
        <AnimatePresence>
          {results.map((r, i) =>
            r.status === "failed" ? (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-3 rounded-card border border-violation/30 bg-violation-bg px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <XCircle size={18} className="shrink-0 text-violation" />
                  <p className="font-body text-sm font-medium text-ink">Item {i + 1}</p>
                </div>
                <span className="font-body rounded-full bg-violation px-2.5 py-1 text-xs font-medium text-white">
                  Failed
                </span>
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3"
              >
                <p className="font-body text-sm font-medium text-ink">Item {i + 1}</p>
                <StatusChip status={r.status} />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        {succeeded.length > 0 && (
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
            {isGeneratingPdf ? "Generating…" : `Download Batch Report (${succeeded.length})`}
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onScanAnother}
          className="font-body rounded-card bg-dark px-4 py-3 text-sm font-semibold text-white"
        >
          Scan New Batch
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
