"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { SegmentedScoreRing } from "@/components/ui/SegmentedScoreRing";
import { RULE_ASPECTS } from "@/lib/rule-aspects";
import type { Violation } from "@/lib/scan-types";

export function ResultStep({
  violations,
  onSave,
}: {
  violations: Violation[];
  onSave: () => void;
}) {
  const checkedAspects = RULE_ASPECTS.map((aspect) => {
    const violation = violations.find((v) => v.ruleCode === aspect.ruleCode);
    return { ...aspect, passed: !violation, explanation: violation?.explanation };
  });

  const passedCount = checkedAspects.filter((a) => a.passed).length;
  const allPassed = passedCount === checkedAspects.length;

  return (
    <div>
      <div className="mb-6 flex flex-col items-center">
        <SegmentedScoreRing segments={checkedAspects} />
        <p
          className={`mt-4 font-display text-xl font-semibold ${
            allPassed ? "text-pass" : "text-violation"
          }`}
        >
          {allPassed ? "Fully Compliant" : `${checkedAspects.length - passedCount} Issue${
            checkedAspects.length - passedCount > 1 ? "s" : ""
          } Found`}
        </p>
        <p className="font-body mt-1 text-sm text-muted">
          Legal Metrology (Packaged Commodities) Rules, 2011
        </p>
      </div>

      <div className="mb-5 space-y-2">
        {checkedAspects.map((aspect) => (
          <div
            key={aspect.ruleCode}
            className={`rounded-card border p-3 ${
              aspect.passed ? "border-border bg-surface" : "border-violation/30 bg-violation-bg"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {aspect.passed ? (
                  <CheckCircle2 size={18} className="shrink-0 text-pass" />
                ) : (
                  <XCircle size={18} className="shrink-0 text-violation" />
                )}
                <div>
                  <p className="font-body text-sm font-medium text-ink">{aspect.label}</p>
                  <p className="font-body text-xs text-muted">{aspect.ruleCode}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  aspect.passed ? "bg-pass-bg text-pass" : "bg-violation text-white"
                }`}
              >
                {aspect.passed ? "Compliant" : "Violation"}
              </span>
            </div>

            {aspect.explanation && (
              <p className="font-body mt-2 pl-[26px] text-xs text-violation">
                {aspect.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onSave}
        className="font-body flex w-full items-center justify-center rounded-card bg-dark px-4 py-3 text-sm font-semibold text-white"
      >
        Save Report
      </button>
    </div>
  );
}
