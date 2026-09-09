"use client";

import { CheckCircle2, AlertOctagon } from "lucide-react";
import type { Violation } from "@/lib/scan-types";

export function ResultStep({
  violations,
  onSave,
}: {
  violations: Violation[];
  onSave: () => void;
}) {
  const passed = violations.length === 0;

  return (
    <div>
      <div
        className={`mb-5 flex flex-col items-center rounded-card px-5 py-8 text-center ${
          passed ? "bg-pass-bg" : "bg-violation-bg"
        }`}
      >
        {passed ? (
          <CheckCircle2 size={40} className="mb-2 text-pass" />
        ) : (
          <AlertOctagon size={40} className="mb-2 text-violation" />
        )}
        <p className={`text-lg font-semibold ${passed ? "text-pass" : "text-violation"}`}>
          {passed
            ? "Compliant"
            : `${violations.length} Violation${violations.length > 1 ? "s" : ""} Found`}
        </p>
        <p className="mt-1 text-sm text-muted">
          {passed ? "All mandatory declarations check out" : "Review the issues below"}
        </p>
      </div>

      {!passed && (
        <div className="mb-5 space-y-3">
          {violations.map((v, i) => (
            <div key={i} className="rounded-card border border-violation/30 bg-surface p-3">
              <p className="text-xs font-medium text-violation">{v.ruleCode}</p>
              <p className="mt-1 text-sm text-ink">{v.explanation}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onSave}
        className="flex w-full items-center justify-center rounded-card bg-dark px-4 py-3 text-sm font-semibold text-white"
      >
        Save Report
      </button>
    </div>
  );
}
